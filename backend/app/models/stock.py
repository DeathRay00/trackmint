from sqlalchemy import Column, String, Integer, Numeric, Text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import BaseModel

class StockMove(BaseModel):
    __tablename__ = "stock_moves"
    
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id", onupdate="CASCADE"), nullable=False)
    move_type_id = Column(UUID(as_uuid=True), ForeignKey("stock_move_types.id", onupdate="CASCADE"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_cost = Column(Numeric(10, 2), nullable=False)
    reference_id = Column(UUID(as_uuid=True), nullable=True)
    reference_type = Column(String(10), CheckConstraint("reference_type IN ('MO', 'WO')"), nullable=True)
    location_id = Column(UUID(as_uuid=True), ForeignKey("locations.id", onupdate="CASCADE"), nullable=False)
    notes = Column(Text, nullable=True)
    
    # Relationships
    product = relationship("Product", back_populates="stock_moves")
    move_type = relationship("StockMoveType", back_populates="stock_moves")
    location = relationship("Location", back_populates="stock_moves")