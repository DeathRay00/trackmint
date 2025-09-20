from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel

class User(BaseModel):
    __tablename__ = "users"
    
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role_id = Column(UUID(as_uuid=True), ForeignKey("user_roles.id", onupdate="CASCADE"), nullable=False)
    avatar = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    role = relationship("UserRole", back_populates="users", foreign_keys=[role_id])
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="assigned_to", foreign_keys="ManufacturingOrder.assigned_to_id")
    work_orders = relationship("WorkOrder", back_populates="assigned_operator", foreign_keys="WorkOrder.assigned_operator_id")
    
    # Note: Relationships for created/updated items will be defined in individual models
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"