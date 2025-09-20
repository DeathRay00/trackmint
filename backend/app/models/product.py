from sqlalchemy import Column, String, Integer, Numeric, Boolean, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from app.db.database import Base

class Product(Base):
    __tablename__ = "products"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=lambda: uuid.uuid4())
    name = Column(String(255), nullable=False)
    sku = Column(String(100), unique=True, nullable=False, index=True)
    category = Column(String(100), nullable=False)
    unit_of_measure = Column(String(50), nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False, default=0)
    stock_quantity = Column(Integer, nullable=False, default=0)
    reorder_level = Column(Integer, nullable=False, default=0)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Relationships
    boms = relationship("BOM", back_populates="product")
    manufacturing_orders = relationship("ManufacturingOrder", back_populates="product")
    bom_components = relationship("BOMComponent", back_populates="product")
    stock_moves = relationship("StockMove", back_populates="product")