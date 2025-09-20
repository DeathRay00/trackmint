import uuid
from datetime import datetime
from sqlalchemy import Column, DateTime, Boolean, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.database import Base

class BaseModel(Base):
    __abstract__ = True
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=lambda: uuid.uuid4())
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)
    
    # Common fields for models with user tracking
    created_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", onupdate="CASCADE", ondelete="SET NULL"), nullable=True)
    updated_by_id = Column(UUID(as_uuid=True), ForeignKey("users.id", onupdate="CASCADE", ondelete="SET NULL"), nullable=True)