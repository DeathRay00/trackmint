from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel

class WorkCenter(BaseModel):
    __tablename__ = "work_centers"
    
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False)
    capacity = Column(Numeric(5, 2), nullable=False)  # hours per day
    cost_per_hour = Column(Numeric(10, 2), nullable=False)
    efficiency = Column(Numeric(5, 2), nullable=False, default=100)  # percentage
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    bom_operations = relationship("BOMOperation", back_populates="work_center")

class BOM(BaseModel):
    __tablename__ = "boms"
    
    name = Column(String(255), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", onupdate="CASCADE"), nullable=False)
    version = Column(String(50), nullable=False)
    is_active = Column(Boolean, default=True)
    total_cost = Column(Numeric(10, 2), nullable=False, default=0)
    
    # Relationships
    product = relationship("Product", back_populates="boms")
    components = relationship("BOMComponent", back_populates="bom")
    operations = relationship("BOMOperation", back_populates="bom")
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="bom")

class BOMComponent(BaseModel):
    __tablename__ = "bom_components"
    
    bom_id = Column(UUID(as_uuid=True), ForeignKey("boms.id", onupdate="CASCADE"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", onupdate="CASCADE"), nullable=False)
    quantity = Column(Numeric(10, 3), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    bom = relationship("BOM", back_populates="components")
    product = relationship("Product", back_populates="bom_components")

class BOMOperation(BaseModel):
    __tablename__ = "bom_operations"
    
    bom_id = Column(UUID(as_uuid=True), ForeignKey("boms.id", onupdate="CASCADE"), nullable=False)
    work_center_id = Column(UUID(as_uuid=True), ForeignKey("work_centers.id", onupdate="CASCADE"), nullable=False)
    sequence = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    duration = Column(Integer, nullable=False)  # in minutes
    setup_time = Column(Integer, nullable=False, default=0)  # in minutes
    cost_per_hour = Column(Numeric(10, 2), nullable=False)
    
    # Relationships
    bom = relationship("BOM", back_populates="operations")
    work_center = relationship("WorkCenter", back_populates="bom_operations")
    work_orders = relationship("WorkOrder", back_populates="bom_operation")

class ManufacturingOrder(BaseModel):
    __tablename__ = "manufacturing_orders"
    
    order_number = Column(String(100), unique=True, nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", onupdate="CASCADE"), nullable=False)
    bom_id = Column(UUID(as_uuid=True), ForeignKey("boms.id", onupdate="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("order_statuses.id", onupdate="CASCADE"), nullable=False)
    priority_id = Column(UUID(as_uuid=True), ForeignKey("priority_levels.id", onupdate="CASCADE"), nullable=False)
    planned_start_date = Column(DateTime, nullable=False)
    planned_end_date = Column(DateTime, nullable=False)
    actual_start_date = Column(DateTime, nullable=True)
    actual_end_date = Column(DateTime, nullable=True)
    assigned_to_id = Column(UUID(as_uuid=True), ForeignKey("users.id", onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    notes = Column(Text, nullable=True)
    
    # Relationships
    product = relationship("Product", back_populates="manufacturing_orders")
    bom = relationship("BOM", back_populates="manufacturing_orders")
    status = relationship("OrderStatus", back_populates="manufacturing_orders")
    priority = relationship("PriorityLevel", back_populates="manufacturing_orders")
    assigned_to = relationship("User", back_populates="manufacturing_orders", foreign_keys=[assigned_to_id])
    work_orders = relationship("WorkOrder", back_populates="manufacturing_order")

class WorkOrder(BaseModel):
    __tablename__ = "work_orders"
    
    work_order_number = Column(String(100), unique=True, nullable=False)
    manufacturing_order_id = Column(UUID(as_uuid=True), ForeignKey("manufacturing_orders.id", onupdate="CASCADE"), nullable=False)
    bom_operation_id = Column(UUID(as_uuid=True), ForeignKey("bom_operations.id", onupdate="CASCADE"), nullable=False)
    status_id = Column(UUID(as_uuid=True), ForeignKey("order_statuses.id", onupdate="CASCADE"), nullable=False)
    assigned_operator_id = Column(UUID(as_uuid=True), ForeignKey("users.id", onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    planned_duration = Column(Integer, nullable=False)  # in minutes
    actual_duration = Column(Integer, nullable=True)  # in minutes
    start_time = Column(DateTime, nullable=True)
    end_time = Column(DateTime, nullable=True)
    comments = Column(Text, nullable=True)
    issues = Column(Text, nullable=True)
    
    # Relationships
    manufacturing_order = relationship("ManufacturingOrder", back_populates="work_orders")
    bom_operation = relationship("BOMOperation", back_populates="work_orders")
    status = relationship("OrderStatus", back_populates="work_orders")
    assigned_operator = relationship("User", back_populates="work_orders", foreign_keys=[assigned_operator_id])