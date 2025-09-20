from sqlalchemy import Column, String, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel

class UserRole(BaseModel):
    __tablename__ = "user_roles"
    
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    users = relationship("User", back_populates="role", foreign_keys="User.role_id")

class OrderStatus(BaseModel):
    __tablename__ = "order_statuses"
    
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="status")
    work_orders = relationship("WorkOrder", back_populates="status")

class PriorityLevel(BaseModel):
    __tablename__ = "priority_levels"
    
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="priority")

class StockMoveType(BaseModel):
    __tablename__ = "stock_move_types"
    
    name = Column(String(50), unique=True, nullable=False)
    description = Column(Text, nullable=True)
    
    # Relationships
    stock_moves = relationship("StockMove", back_populates="move_type")

class Location(BaseModel):
    __tablename__ = "locations"
    
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True)
    parent_location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id", onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    
    # Relationships
    parent_location = relationship("Location", remote_side="Location.id", back_populates="child_locations")
    child_locations = relationship("Location", back_populates="parent_location")
    stock_moves = relationship("StockMove", back_populates="location")