from typing import List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, Field
from decimal import Decimal

# BOM Schemas
class BOMBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    product_id: UUID
    version: str = Field(..., min_length=1, max_length=50)
    is_active: bool = True
    total_cost: Decimal = Field(default=0, decimal_places=2)

class BOMCreate(BOMBase):
    pass

class BOMUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    version: Optional[str] = Field(None, min_length=1, max_length=50)
    is_active: Optional[bool] = None
    total_cost: Optional[Decimal] = Field(None, decimal_places=2)

class BOMInDB(BOMBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[UUID] = None
    updated_by_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class BOMDetail(BOMInDB):
    product: Optional[dict] = None
    components: List['BOMComponentInDB'] = []
    operations: List['BOMOperationInDB'] = []

# BOM Component Schemas
class BOMComponentBase(BaseModel):
    product_id: UUID
    quantity: Decimal = Field(..., decimal_places=3, gt=0)
    unit_cost: Decimal = Field(..., decimal_places=2, ge=0)

class BOMComponentCreate(BOMComponentBase):
    pass

class BOMComponentUpdate(BaseModel):
    product_id: Optional[UUID] = None
    quantity: Optional[Decimal] = Field(None, decimal_places=3, gt=0)
    unit_cost: Optional[Decimal] = Field(None, decimal_places=2, ge=0)

class BOMComponentInDB(BOMComponentBase):
    id: UUID
    bom_id: UUID
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[UUID] = None
    updated_by_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class BOMComponentDetail(BOMComponentInDB):
    product: Optional[dict] = None

# BOM Operation Schemas
class BOMOperationBase(BaseModel):
    work_center_id: UUID
    sequence: int = Field(..., ge=1)
    description: str = Field(..., min_length=1)
    duration: int = Field(..., gt=0)  # in minutes
    setup_time: int = Field(default=0, ge=0)  # in minutes
    cost_per_hour: Decimal = Field(..., decimal_places=2, ge=0)

class BOMOperationCreate(BOMOperationBase):
    pass

class BOMOperationUpdate(BaseModel):
    work_center_id: Optional[UUID] = None
    sequence: Optional[int] = Field(None, ge=1)
    description: Optional[str] = Field(None, min_length=1)
    duration: Optional[int] = Field(None, gt=0)
    setup_time: Optional[int] = Field(None, ge=0)
    cost_per_hour: Optional[Decimal] = Field(None, decimal_places=2, ge=0)

class BOMOperationInDB(BOMOperationBase):
    id: UUID
    bom_id: UUID
    created_at: datetime
    updated_at: datetime
    created_by_id: Optional[UUID] = None
    updated_by_id: Optional[UUID] = None

    class Config:
        from_attributes = True

class BOMOperationDetail(BOMOperationInDB):
    work_center: Optional[dict] = None

# BOM Cost Calculation
class BOMCostCalculation(BaseModel):
    bom_id: UUID
    material_cost: Decimal
    labor_cost: Decimal
    total_cost: Decimal
    component_count: int
    operation_count: int

# Update forward references
BOMDetail.model_rebuild()
BOMComponentDetail.model_rebuild()
BOMOperationDetail.model_rebuild()

