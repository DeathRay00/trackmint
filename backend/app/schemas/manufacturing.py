from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field

# Manufacturing Order Schemas
class ManufacturingOrderBase(BaseModel):
    product_id: UUID
    bom_id: UUID
    quantity: int
    status_id: UUID
    priority_id: UUID
    planned_start_date: datetime
    planned_end_date: datetime
    assigned_to_id: Optional[UUID] = None
    notes: Optional[str] = None

class ManufacturingOrderCreate(ManufacturingOrderBase):
    pass

class ManufacturingOrderUpdate(BaseModel):
    product_id: Optional[UUID] = None
    bom_id: Optional[UUID] = None
    quantity: Optional[int] = None
    status_id: Optional[UUID] = None
    priority_id: Optional[UUID] = None
    planned_start_date: Optional[datetime] = None
    planned_end_date: Optional[datetime] = None
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    assigned_to_id: Optional[UUID] = None
    notes: Optional[str] = None

class ManufacturingOrderInDB(ManufacturingOrderBase):
    id: UUID
    order_number: str
    actual_start_date: Optional[datetime] = None
    actual_end_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class ManufacturingOrderDetail(ManufacturingOrderInDB):
    product: dict
    bom: dict
    status: dict
    priority: dict
    assigned_to: Optional[dict] = None
    work_orders: List[dict] = []
    
    class Config:
        from_attributes = True

# Dashboard Schemas
class ManufacturingOrderStats(BaseModel):
    total: int
    planned: int
    in_progress: int
    done: int
    canceled: int

class DashboardData(BaseModel):
    stats: ManufacturingOrderStats
    recent_orders: List[ManufacturingOrderInDB]
    upcoming_deadlines: List[ManufacturingOrderInDB]