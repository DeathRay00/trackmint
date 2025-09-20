from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.manufacturing import ManufacturingOrder
from app.models.lookup_tables import OrderStatus
from app.schemas.manufacturing import (
    ManufacturingOrderCreate, 
    ManufacturingOrderUpdate, 
    ManufacturingOrderInDB,
    ManufacturingOrderDetail,
    ManufacturingOrderStats,
    DashboardData
)
from app.utils.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/manufacturing-orders", tags=["Manufacturing Orders"])

@router.post("", response_model=ManufacturingOrderInDB)
async def create_manufacturing_order(
    order_data: ManufacturingOrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new manufacturing order."""
    # Generate order number (format: MO-YYYYMMDD-XXXX)
    today = datetime.now().strftime("%Y%m%d")
    last_order = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.order_number.like(f"MO-{today}-%")
    ).order_by(ManufacturingOrder.order_number.desc()).first()
    
    if last_order:
        last_number = int(last_order.order_number.split("-")[-1])
        new_number = f"{last_number + 1:04d}"
    else:
        new_number = "0001"
    
    order_number = f"MO-{today}-{new_number}"
    
    # Create new manufacturing order
    new_order = ManufacturingOrder(
        order_number=order_number,
        product_id=order_data.product_id,
        bom_id=order_data.bom_id,
        quantity=order_data.quantity,
        status_id=order_data.status_id,
        priority_id=order_data.priority_id,
        planned_start_date=order_data.planned_start_date,
        planned_end_date=order_data.planned_end_date,
        assigned_to_id=order_data.assigned_to_id,
        notes=order_data.notes,
        created_by_id=current_user.id
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return new_order

@router.get("", response_model=List[ManufacturingOrderInDB])
async def read_manufacturing_orders(
    skip: int = 0,
    limit: int = 100,
    status_id: Optional[UUID] = None,
    priority_id: Optional[UUID] = None,
    assigned_to_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all manufacturing orders with optional filters."""
    query = db.query(ManufacturingOrder).filter(ManufacturingOrder.deleted_at == None)
    
    # Apply filters
    if status_id:
        query = query.filter(ManufacturingOrder.status_id == status_id)
    
    if priority_id:
        query = query.filter(ManufacturingOrder.priority_id == priority_id)
    
    if assigned_to_id:
        query = query.filter(ManufacturingOrder.assigned_to_id == assigned_to_id)
    
    # Apply pagination
    orders = query.order_by(ManufacturingOrder.created_at.desc()).offset(skip).limit(limit).all()
    
    return orders

@router.get("/dashboard", response_model=DashboardData)
async def get_dashboard_data(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get dashboard data with statistics and recent orders."""
    # Get order statuses
    planned_status = db.query(OrderStatus).filter(OrderStatus.name == "Planned").first()
    in_progress_status = db.query(OrderStatus).filter(OrderStatus.name == "In Progress").first()
    done_status = db.query(OrderStatus).filter(OrderStatus.name == "Done").first()
    canceled_status = db.query(OrderStatus).filter(OrderStatus.name == "Canceled").first()
    
    # Count orders by status
    total_count = db.query(ManufacturingOrder).filter(ManufacturingOrder.deleted_at == None).count()
    planned_count = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.status_id == planned_status.id,
        ManufacturingOrder.deleted_at == None
    ).count() if planned_status else 0
    in_progress_count = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.status_id == in_progress_status.id,
        ManufacturingOrder.deleted_at == None
    ).count() if in_progress_status else 0
    done_count = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.status_id == done_status.id,
        ManufacturingOrder.deleted_at == None
    ).count() if done_status else 0
    canceled_count = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.status_id == canceled_status.id,
        ManufacturingOrder.deleted_at == None
    ).count() if canceled_status else 0
    
    # Get recent orders
    recent_orders = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.deleted_at == None
    ).order_by(ManufacturingOrder.created_at.desc()).limit(5).all()
    
    # Get upcoming deadlines
    upcoming_deadlines = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.deleted_at == None,
        ManufacturingOrder.status_id != done_status.id if done_status else True,
        ManufacturingOrder.status_id != canceled_status.id if canceled_status else True
    ).order_by(ManufacturingOrder.planned_end_date.asc()).limit(5).all()
    
    # Create response
    stats = ManufacturingOrderStats(
        total=total_count,
        planned=planned_count,
        in_progress=in_progress_count,
        done=done_count,
        canceled=canceled_count
    )
    
    return DashboardData(
        stats=stats,
        recent_orders=recent_orders,
        upcoming_deadlines=upcoming_deadlines
    )

@router.get("/{order_id}", response_model=ManufacturingOrderDetail)
async def read_manufacturing_order(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific manufacturing order by ID."""
    order = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.id == order_id,
        ManufacturingOrder.deleted_at == None
    ).options(
        joinedload(ManufacturingOrder.product),
        joinedload(ManufacturingOrder.bom),
        joinedload(ManufacturingOrder.status),
        joinedload(ManufacturingOrder.priority),
        joinedload(ManufacturingOrder.assigned_to),
        joinedload(ManufacturingOrder.work_orders)
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manufacturing order not found"
        )
    
    return order

@router.put("/{order_id}", response_model=ManufacturingOrderInDB)
async def update_manufacturing_order(
    order_id: UUID,
    order_update: ManufacturingOrderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a specific manufacturing order by ID."""
    order = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.id == order_id,
        ManufacturingOrder.deleted_at == None
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manufacturing order not found"
        )
    
    # Update order fields
    for field, value in order_update.dict(exclude_unset=True).items():
        setattr(order, field, value)
    
    # Update updated_by field
    order.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(order)
    
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_manufacturing_order(
    order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a specific manufacturing order by ID (soft delete)."""
    order = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.id == order_id,
        ManufacturingOrder.deleted_at == None
    ).first()
    
    if order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Manufacturing order not found"
        )
    
    # Soft delete
    order.deleted_at = datetime.utcnow()
    order.updated_by_id = current_user.id
    
    db.commit()
    
    return None