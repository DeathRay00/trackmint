#!/usr/bin/env python3
"""
Database initialization script for Trackmint Manufacturing Management System
"""

from sqlalchemy import create_engine
from app.db.database import Base
from app.core.config import settings
from app.models import user, product, stock, manufacturing, lookup_tables

def init_db():
    """Initialize the database with all tables"""
    print("Creating database engine...")
    engine = create_engine(settings.DATABASE_URL)
    
    print("Creating all tables...")
    Base.metadata.create_all(bind=engine)
    
    print("Database initialized successfully!")
    print(f"Database URL: {settings.DATABASE_URL}")

if __name__ == "__main__":
    init_db()
