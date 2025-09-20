from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, validator

# Location Schemas
class LocationBase(BaseModel):
    name: str
    code: str
    description: Optional[str] = None
    is_active: bool = True

class LocationCreate(LocationBase):
    pass

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None

class LocationInDB(LocationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Stock Move Schemas
class StockMoveBase(BaseModel):
    product_id: UUID
    move_type_id: UUID
    quantity: float
    unit_cost: float
    reference_id: Optional[UUID] = None
    reference_type: Optional[str] = None
    location_id: UUID
    notes: Optional[str] = None

class StockMoveCreate(StockMoveBase):
    pass

class StockMoveUpdate(BaseModel):
    product_id: Optional[UUID] = None
    move_type_id: Optional[UUID] = None
    quantity: Optional[float] = None
    unit_cost: Optional[float] = None
    reference_id: Optional[UUID] = None
    reference_type: Optional[str] = None
    location_id: Optional[UUID] = None
    notes: Optional[str] = None

class StockMoveInDB(StockMoveBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StockMoveDetail(StockMoveInDB):
    product: dict
    move_type: dict
    location: dict
    
    class Config:
        from_attributes = True

# Product Stock Schemas
class ProductStock(BaseModel):
    product_id: UUID
    product_name: str
    product_sku: str
    stock_quantity: float
    unit_of_measure: str
    unit_cost: float
    total_value: float
    reorder_level: Optional[float] = None
    
    @validator('total_value')
    def calculate_total_value(cls, v, values):
        if 'stock_quantity' in values and 'unit_cost' in values:
            return round(values['stock_quantity'] * values['unit_cost'], 2)
        return v

# Stock Movement Summary
class StockMovementSummary(BaseModel):
    product_id: UUID
    product_name: str
    product_sku: str
    opening_balance: float
    receipts: float
    issues: float
    adjustments: float
    closing_balance: float
    unit_of_measure: str
    
    @validator('closing_balance')
    def calculate_closing_balance(cls, v, values):
        if all(k in values for k in ['opening_balance', 'receipts', 'issues', 'adjustments']):
            return values['opening_balance'] + values['receipts'] - values['issues'] + values['adjustments']
        return v