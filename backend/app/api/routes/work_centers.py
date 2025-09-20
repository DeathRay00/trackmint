from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.manufacturing import WorkCenter, WorkOrder
from app.schemas.work import (
    WorkCenterCreate,
    WorkCenterUpdate,
    WorkCenterInDB,
    WorkCenterUtilization
)
from app.utils.security import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/work-centers", tags=["Work Centers"])

@router.post("", response_model=WorkCenterInDB)
async def create_work_center(
    work_center_data: WorkCenterCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new work center (admin only)."""
    # Check if code already exists
    existing_work_center = db.query(WorkCenter).filter(
        WorkCenter.code == work_center_data.code,
        WorkCenter.deleted_at == None
    ).first()
    
    if existing_work_center:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Work center with code '{work_center_data.code}' already exists"
        )
    
    # Create new work center
    new_work_center = WorkCenter(
        name=work_center_data.name,
        code=work_center_data.code,
        hourly_rate=work_center_data.hourly_rate,
        capacity=work_center_data.capacity,
        description=work_center_data.description,
        is_active=work_center_data.is_active,
        created_by_id=current_user.id
    )
    
    db.add(new_work_center)
    db.commit()
    db.refresh(new_work_center)
    
    return new_work_center

@router.get("", response_model=List[WorkCenterInDB])
async def read_work_centers(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all work centers with optional filters."""
    query = db.query(WorkCenter).filter(WorkCenter.deleted_at == None)
    
    # Apply filters
    if is_active is not None:
        query = query.filter(WorkCenter.is_active == is_active)
    
    # Apply pagination
    work_centers = query.order_by(WorkCenter.name).offset(skip).limit(limit).all()
    
    return work_centers

@router.get("/utilization", response_model=List[WorkCenterUtilization])
async def get_work_center_utilization(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get utilization statistics for all work centers."""
    # Get all active work centers
    work_centers = db.query(WorkCenter).filter(
        WorkCenter.is_active == True,
        WorkCenter.deleted_at == None
    ).all()
    
    utilization_data = []
    
    for wc in work_centers:
        # Calculate total capacity in hours (capacity * 8 hours per day * 5 days per week * 4 weeks)
        total_capacity_hours = wc.capacity * 8 * 5 * 4
        
        # Get all work orders for this work center
        work_orders = db.query(WorkOrder).filter(
            WorkOrder.work_center_id == wc.id,
            WorkOrder.deleted_at == None
        ).all()
        
        # Calculate planned and actual hours
        planned_hours = sum(wo.planned_duration for wo in work_orders if wo.planned_duration)
        actual_hours = sum(wo.actual_duration for wo in work_orders if wo.actual_duration)
        
        # Calculate utilization percentage
        utilization_percentage = (actual_hours / total_capacity_hours) * 100 if total_capacity_hours > 0 else 0
        
        utilization_data.append(
            WorkCenterUtilization(
                work_center_id=wc.id,
                work_center_name=wc.name,
                total_capacity_hours=total_capacity_hours,
                planned_hours=planned_hours,
                actual_hours=actual_hours,
                utilization_percentage=utilization_percentage
            )
        )
    
    return utilization_data

@router.get("/{work_center_id}", response_model=WorkCenterInDB)
async def read_work_center(
    work_center_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific work center by ID."""
    work_center = db.query(WorkCenter).filter(
        WorkCenter.id == work_center_id,
        WorkCenter.deleted_at == None
    ).first()
    
    if work_center is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work center not found"
        )
    
    return work_center

@router.put("/{work_center_id}", response_model=WorkCenterInDB)
async def update_work_center(
    work_center_id: UUID,
    work_center_update: WorkCenterUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a specific work center by ID (admin only)."""
    work_center = db.query(WorkCenter).filter(
        WorkCenter.id == work_center_id,
        WorkCenter.deleted_at == None
    ).first()
    
    if work_center is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work center not found"
        )
    
    # Check if code is being updated and already exists
    if work_center_update.code and work_center_update.code != work_center.code:
        existing_work_center = db.query(WorkCenter).filter(
            WorkCenter.code == work_center_update.code,
            WorkCenter.id != work_center_id,
            WorkCenter.deleted_at == None
        ).first()
        
        if existing_work_center:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Work center with code '{work_center_update.code}' already exists"
            )
    
    # Update work center fields
    for field, value in work_center_update.dict(exclude_unset=True).items():
        setattr(work_center, field, value)
    
    # Update updated_by field
    work_center.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(work_center)
    
    return work_center

@router.delete("/{work_center_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_center(
    work_center_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a specific work center by ID (soft delete, admin only)."""
    work_center = db.query(WorkCenter).filter(
        WorkCenter.id == work_center_id,
        WorkCenter.deleted_at == None
    ).first()
    
    if work_center is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work center not found"
        )
    
    # Check if work center is used in any work orders
    work_orders = db.query(WorkOrder).filter(
        WorkOrder.work_center_id == work_center_id,
        WorkOrder.deleted_at == None
    ).first()
    
    if work_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete work center that is used in work orders"
        )
    
    # Soft delete
    work_center.deleted_at = datetime.utcnow()
    work_center.updated_by_id = current_user.id
    
    db.commit()
    
    return None