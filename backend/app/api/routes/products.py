from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.db.database import get_db
from app.models.product import Product
from app.schemas.product import (
    ProductCreate,
    ProductUpdate,
    ProductInDB,
    ProductDetail
)
from app.utils.security import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/products", tags=["Product Management"])

@router.get("/test")
async def test_products():
    """Test endpoint to check if products route is working"""
    return {"message": "Products route is working"}

@router.get("/simple")
async def get_products_simple(db: Session = Depends(get_db)):
    """Simple products endpoint without relationships"""
    try:
        # Very simple query
        products = db.query(Product).limit(5).all()
        return {"products": len(products), "message": "Success"}
    except Exception as e:
        return {"error": str(e)}

@router.post("/", response_model=ProductInDB)
async def create_product(
    product_data: ProductCreate,
    db: Session = Depends(get_db)
):
    """Create a new product."""
    # Check if SKU already exists
    existing_product = db.query(Product).filter(
        Product.sku == product_data.sku
    ).first()
    
    if existing_product:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product with SKU '{product_data.sku}' already exists"
        )
    
    # Create new product
    new_product = Product(
        name=product_data.name,
        sku=product_data.sku,
        category=product_data.category,
        unit_of_measure=product_data.unit_of_measure,
        unit_cost=product_data.unit_cost,
        stock_quantity=product_data.stock_quantity,
        reorder_level=product_data.reorder_level,
        description=product_data.description,
        is_active=product_data.is_active
    )
    
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    
    return new_product

@router.get("/", response_model=List[ProductInDB])
async def read_products(
    skip: int = 0,
    limit: int = 100,
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get all products with optional filters."""
    try:
        # Simple query without deleted_at filter since it doesn't exist in the schema
        query = db.query(Product)
        
        # Apply filters
        if category:
            query = query.filter(Product.category == category)
        
        if is_active is not None:
            query = query.filter(Product.is_active == is_active)
        
        if search:
            search_filter = f"%{search}%"
            query = query.filter(
                (Product.name.ilike(search_filter) | 
                 Product.sku.ilike(search_filter) | 
                 Product.description.ilike(search_filter))
            )
        
        # Apply pagination
        products = query.order_by(Product.name).offset(skip).limit(limit).all()
        
        return products
    except Exception as e:
        print(f"Error in read_products: {e}")
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

@router.get("/{product_id}", response_model=ProductDetail)
async def read_product(
    product_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific product by ID."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.deleted_at == None
    ).first()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    return product

@router.put("/{product_id}", response_model=ProductInDB)
async def update_product(
    product_id: UUID,
    product_update: ProductUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a specific product by ID (admin only)."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.deleted_at == None
    ).first()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if SKU is being updated and already exists
    if product_update.sku and product_update.sku != product.sku:
        existing_product = db.query(Product).filter(
            Product.sku == product_update.sku,
            Product.id != product_id,
            Product.deleted_at == None
        ).first()
        
        if existing_product:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product with SKU '{product_update.sku}' already exists"
            )
    
    # Update product fields
    for field, value in product_update.dict(exclude_unset=True).items():
        setattr(product, field, value)
    
    # Update updated_by field
    product.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(product)
    
    return product

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_product(
    product_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a specific product by ID (soft delete, admin only)."""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.deleted_at == None
    ).first()
    
    if product is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if product is used in any BOMs
    from app.models.manufacturing import BOM, BOMComponent
    bom_usage = db.query(BOM).filter(
        BOM.product_id == product_id,
        BOM.deleted_at == None
    ).first()
    
    if bom_usage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product that is used in BOMs"
        )
    
    # Check if product is used in any BOM components
    component_usage = db.query(BOMComponent).filter(
        BOMComponent.product_id == product_id,
        BOMComponent.deleted_at == None
    ).first()
    
    if component_usage:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete product that is used as a BOM component"
        )
    
    # Soft delete
    from datetime import datetime
    product.deleted_at = datetime.utcnow()
    product.updated_by_id = current_user.id
    
    db.commit()
    
    return None
