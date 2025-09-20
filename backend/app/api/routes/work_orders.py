from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload

from app.db.database import get_db
from app.models.manufacturing import WorkOrder, ManufacturingOrder
from app.models.lookup_tables import OrderStatus
from app.schemas.work import (
    WorkOrderCreate,
    WorkOrderUpdate,
    WorkOrderInDB,
    WorkOrderDetail,
    WorkOrderStatusUpdate
)
from app.utils.security import get_current_active_user
from app.models.user import User

router = APIRouter(prefix="/work-orders", tags=["Work Orders"])

@router.post("", response_model=WorkOrderInDB)
async def create_work_order(
    work_order_data: WorkOrderCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new work order."""
    # Generate order number (format: WO-YYYYMMDD-XXXX)
    today = datetime.now().strftime("%Y%m%d")
    last_order = db.query(WorkOrder).filter(
        WorkOrder.order_number.like(f"WO-{today}-%")
    ).order_by(WorkOrder.order_number.desc()).first()
    
    if last_order:
        last_number = int(last_order.order_number.split("-")[-1])
        new_number = f"{last_number + 1:04d}"
    else:
        new_number = "0001"
    
    order_number = f"WO-{today}-{new_number}"
    
    # Create new work order
    new_order = WorkOrder(
        order_number=order_number,
        manufacturing_order_id=work_order_data.manufacturing_order_id,
        operation_id=work_order_data.operation_id,
        work_center_id=work_order_data.work_center_id,
        status_id=work_order_data.status_id,
        planned_duration=work_order_data.planned_duration,
        planned_start_date=work_order_data.planned_start_date,
        planned_end_date=work_order_data.planned_end_date,
        assigned_to_id=work_order_data.assigned_to_id,
        notes=work_order_data.notes,
        created_by_id=current_user.id
    )
    
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    
    return new_order

@router.get("", response_model=List[WorkOrderInDB])
async def read_work_orders(
    skip: int = 0,
    limit: int = 100,
    manufacturing_order_id: Optional[UUID] = None,
    status_id: Optional[UUID] = None,
    work_center_id: Optional[UUID] = None,
    assigned_to_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all work orders with optional filters."""
    query = db.query(WorkOrder).filter(WorkOrder.deleted_at == None)
    
    # Apply filters
    if manufacturing_order_id:
        query = query.filter(WorkOrder.manufacturing_order_id == manufacturing_order_id)
    
    if status_id:
        query = query.filter(WorkOrder.status_id == status_id)
    
    if work_center_id:
        query = query.filter(WorkOrder.work_center_id == work_center_id)
    
    if assigned_to_id:
        query = query.filter(WorkOrder.assigned_to_id == assigned_to_id)
    
    # Apply pagination
    work_orders = query.order_by(WorkOrder.planned_start_date).offset(skip).limit(limit).all()
    
    return work_orders

@router.get("/my-tasks", response_model=List[WorkOrderInDB])
async def read_my_work_orders(
    skip: int = 0,
    limit: int = 100,
    status_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get work orders assigned to the current user."""
    query = db.query(WorkOrder).filter(
        WorkOrder.assigned_to_id == current_user.id,
        WorkOrder.deleted_at == None
    )
    
    # Apply status filter if provided
    if status_id:
        query = query.filter(WorkOrder.status_id == status_id)
    
    # Apply pagination
    work_orders = query.order_by(WorkOrder.planned_start_date).offset(skip).limit(limit).all()
    
    return work_orders

@router.get("/{work_order_id}", response_model=WorkOrderDetail)
async def read_work_order(
    work_order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific work order by ID."""
    work_order = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.deleted_at == None
    ).options(
        joinedload(WorkOrder.manufacturing_order),
        joinedload(WorkOrder.operation),
        joinedload(WorkOrder.work_center),
        joinedload(WorkOrder.status),
        joinedload(WorkOrder.assigned_to)
    ).first()
    
    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found"
        )
    
    return work_order

@router.put("/{work_order_id}", response_model=WorkOrderInDB)
async def update_work_order(
    work_order_id: UUID,
    work_order_update: WorkOrderUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a specific work order by ID."""
    work_order = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.deleted_at == None
    ).first()
    
    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found"
        )
    
    # Update work order fields
    for field, value in work_order_update.dict(exclude_unset=True).items():
        setattr(work_order, field, value)
    
    # Update updated_by field
    work_order.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(work_order)
    
    return work_order

@router.put("/{work_order_id}/status", response_model=WorkOrderInDB)
async def update_work_order_status(
    work_order_id: UUID,
    status_update: WorkOrderStatusUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update the status of a work order (for operators)."""
    work_order = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.deleted_at == None
    ).first()
    
    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found"
        )
    
    # Check if user is assigned to this work order or is an admin
    if work_order.assigned_to_id != current_user.id and current_user.role.name != "Admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to update this work order's status"
        )
    
    # Update status and related fields
    work_order.status_id = status_update.status_id
    
    if status_update.actual_start_date:
        work_order.actual_start_date = status_update.actual_start_date
    
    if status_update.actual_end_date:
        work_order.actual_end_date = status_update.actual_end_date
    
    if status_update.actual_duration:
        work_order.actual_duration = status_update.actual_duration
    
    if status_update.notes:
        if work_order.notes:
            work_order.notes += f"\n\n{datetime.now().strftime('%Y-%m-%d %H:%M')} - {status_update.notes}"
        else:
            work_order.notes = f"{datetime.now().strftime('%Y-%m-%d %H:%M')} - {status_update.notes}"
    
    # Update updated_by field
    work_order.updated_by_id = current_user.id
    
    # Check if this is the last work order for the manufacturing order
    # If all work orders are completed, update the manufacturing order status
    status_done = db.query(OrderStatus).filter(OrderStatus.name == "Done").first()
    if status_done and status_update.status_id == status_done.id:
        manufacturing_order = db.query(ManufacturingOrder).filter(
            ManufacturingOrder.id == work_order.manufacturing_order_id
        ).first()
        
        if manufacturing_order:
            # Check if all work orders for this manufacturing order are done
            pending_work_orders = db.query(WorkOrder).filter(
                WorkOrder.manufacturing_order_id == manufacturing_order.id,
                WorkOrder.status_id != status_done.id,
                WorkOrder.deleted_at == None
            ).count()
            
            if pending_work_orders == 0:
                # All work orders are done, update manufacturing order status
                manufacturing_order.status_id = status_done.id
                manufacturing_order.actual_end_date = datetime.utcnow()
                manufacturing_order.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(work_order)
    
    return work_order

@router.delete("/{work_order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(
    work_order_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a specific work order by ID (soft delete)."""
    work_order = db.query(WorkOrder).filter(
        WorkOrder.id == work_order_id,
        WorkOrder.deleted_at == None
    ).first()
    
    if work_order is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work order not found"
        )
    
    # Soft delete
    work_order.deleted_at = datetime.utcnow()
    work_order.updated_by_id = current_user.id
    
    db.commit()
    
    return None