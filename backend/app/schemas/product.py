from typing import Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field, validator

# Product Schemas
class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    category: str = Field(..., min_length=1, max_length=100)
    unit_of_measure: str = Field(..., min_length=1, max_length=50)
    unit_cost: float = Field(..., ge=0)
    stock_quantity: int = Field(..., ge=0)
    reorder_level: int = Field(..., ge=0)
    description: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    sku: Optional[str] = Field(None, min_length=1, max_length=100)
    category: Optional[str] = Field(None, min_length=1, max_length=100)
    unit_of_measure: Optional[str] = Field(None, min_length=1, max_length=50)
    unit_cost: Optional[float] = Field(None, ge=0)
    stock_quantity: Optional[int] = Field(None, ge=0)
    reorder_level: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    is_active: Optional[bool] = None

class ProductInDB(ProductBase):
    id: UUID
    
    class Config:
        from_attributes = True

class ProductDetail(ProductInDB):
    # Add any additional fields for detailed view
    pass
