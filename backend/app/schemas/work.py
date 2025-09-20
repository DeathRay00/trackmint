from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, validator

# Work Center Schemas
class WorkCenterBase(BaseModel):
    name: str
    code: str
    hourly_rate: float
    capacity: int
    description: Optional[str] = None
    is_active: bool = True

class WorkCenterCreate(WorkCenterBase):
    pass

class WorkCenterUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    hourly_rate: Optional[float] = None
    capacity: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class WorkCenterInDB(WorkCenterBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Work Order Schemas
class WorkOrderBase(BaseModel):
    manufacturing_order_id: UUID
    operation_id: UUID
    work_center_id: UUID
    status_id: UUID
    planned_duration: float  # in hours
    planned_start_date: datetime
    planned_end_date: datetime
    assigned_to_id: Optional[UUID] = None
    notes: Optional[str] = None

class WorkOrderCreate(WorkOrderBase):
    pass

class WorkOrderUpdate(BaseModel):
    manufacturing_order_id: Optional[UUID] = None
    operation_id: Optional[UUID] = None
    work_center_id: Optional[UUID] = None
    status_id: Optional[UUID] = None
    planned_duration: Optional[float] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    actual_duration: Optional[float] = None
    assigned_to_id: Optional[UUID] = None
    notes: Optional[str] = None

class WorkOrderInDB(WorkOrderBase):
    id: UUID
    order_number: str
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    actual_duration: Optional[float] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class WorkOrderDetail(WorkOrderInDB):
    manufacturing_order: dict
    operation: dict
    work_center: dict
    status: dict
    assigned_to: Optional[dict] = None
    
    class Config:
        from_attributes = True

# Work Order Status Update Schema
class WorkOrderStatusUpdate(BaseModel):
    status_id: UUID
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    actual_duration: Optional[float] = None
    notes: Optional[str] = None

# Work Center Utilization Schema
class WorkCenterUtilization(BaseModel):
    work_center_id: UUID
    work_center_name: str
    total_capacity_hours: float
    planned_hours: float
    actual_hours: float
    utilization_percentage: float
    
    @validator('utilization_percentage')
    def round_percentage(cls, v):
        return round(v, 2)