from typing import List, Optional
from uuid import UUID
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_, or_

from app.db.database import get_db
from app.models.stock import StockMove
from app.models.product import Product
from app.models.lookup_tables import StockMoveType, Location
from app.schemas.stock import (
    StockMoveCreate,
    StockMoveUpdate,
    StockMoveInDB,
    StockMoveDetail,
    LocationCreate,
    LocationUpdate,
    LocationInDB,
    ProductStock,
    StockMovementSummary
)
from app.utils.security import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/stock", tags=["Stock Management"])

# Stock Move Endpoints
@router.post("/moves", response_model=StockMoveInDB)
async def create_stock_move(
    stock_move_data: StockMoveCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new stock movement."""
    # Validate product exists
    product = db.query(Product).filter(
        Product.id == stock_move_data.product_id,
        Product.deleted_at == None
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Validate move type exists
    move_type = db.query(StockMoveType).filter(
        StockMoveType.id == stock_move_data.move_type_id
    ).first()
    
    if not move_type:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock move type not found"
        )
    
    # Validate location exists
    location = db.query(Location).filter(
        Location.id == stock_move_data.location_id,
        Location.deleted_at == None
    ).first()
    
    if not location:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Create new stock move
    new_stock_move = StockMove(
        product_id=stock_move_data.product_id,
        move_type_id=stock_move_data.move_type_id,
        quantity=stock_move_data.quantity,
        unit_cost=stock_move_data.unit_cost,
        reference_id=stock_move_data.reference_id,
        reference_type=stock_move_data.reference_type,
        location_id=stock_move_data.location_id,
        notes=stock_move_data.notes,
        created_by_id=current_user.id
    )
    
    db.add(new_stock_move)
    
    # Update product stock quantity based on move type
    if move_type.name == "Receipt":
        product.stock_quantity += stock_move_data.quantity
        # Update product cost if it's a receipt
        if product.stock_quantity > 0:
            product.unit_cost = ((product.stock_quantity - stock_move_data.quantity) * product.unit_cost + 
                               stock_move_data.quantity * stock_move_data.unit_cost) / product.stock_quantity
    elif move_type.name == "Issue":
        if product.stock_quantity < stock_move_data.quantity:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Insufficient stock for product {product.name}. Available: {product.stock_quantity}"
            )
        product.stock_quantity -= stock_move_data.quantity
    elif move_type.name == "Adjustment":
        product.stock_quantity += stock_move_data.quantity  # Can be positive or negative
    
    db.commit()
    db.refresh(new_stock_move)
    
    return new_stock_move

@router.get("/moves", response_model=List[StockMoveInDB])
async def read_stock_moves(
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[UUID] = None,
    move_type_id: Optional[UUID] = None,
    location_id: Optional[UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all stock movements with optional filters."""
    query = db.query(StockMove).filter(StockMove.deleted_at == None)
    
    # Apply filters
    if product_id:
        query = query.filter(StockMove.product_id == product_id)
    
    if move_type_id:
        query = query.filter(StockMove.move_type_id == move_type_id)
    
    if location_id:
        query = query.filter(StockMove.location_id == location_id)
    
    if start_date:
        query = query.filter(StockMove.created_at >= start_date)
    
    if end_date:
        query = query.filter(StockMove.created_at <= end_date)
    
    # Apply pagination
    stock_moves = query.order_by(StockMove.created_at.desc()).offset(skip).limit(limit).all()
    
    return stock_moves

@router.get("/moves/{stock_move_id}", response_model=StockMoveDetail)
async def read_stock_move(
    stock_move_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific stock movement by ID."""
    stock_move = db.query(StockMove).filter(
        StockMove.id == stock_move_id,
        StockMove.deleted_at == None
    ).options(
        joinedload(StockMove.product),
        joinedload(StockMove.move_type),
        joinedload(StockMove.location)
    ).first()
    
    if stock_move is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock move not found"
        )
    
    return stock_move

@router.put("/moves/{stock_move_id}", response_model=StockMoveInDB)
async def update_stock_move(
    stock_move_id: UUID,
    stock_move_update: StockMoveUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a specific stock movement by ID (admin only)."""
    stock_move = db.query(StockMove).filter(
        StockMove.id == stock_move_id,
        StockMove.deleted_at == None
    ).first()
    
    if stock_move is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock move not found"
        )
    
    # For simplicity, we'll only allow updating notes
    # Changing quantities would require complex stock adjustments
    if stock_move_update.notes is not None:
        stock_move.notes = stock_move_update.notes
        stock_move.updated_by_id = current_user.id
        
        db.commit()
        db.refresh(stock_move)
    
    return stock_move

@router.delete("/moves/{stock_move_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_stock_move(
    stock_move_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a specific stock movement by ID (soft delete, admin only)."""
    stock_move = db.query(StockMove).filter(
        StockMove.id == stock_move_id,
        StockMove.deleted_at == None
    ).first()
    
    if stock_move is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Stock move not found"
        )
    
    # Soft delete
    stock_move.deleted_at = datetime.utcnow()
    stock_move.updated_by_id = current_user.id
    
    db.commit()
    
    return None

# Location Endpoints
@router.post("/locations", response_model=LocationInDB)
async def create_location(
    location_data: LocationCreate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Create a new location (admin only)."""
    # Check if code already exists
    existing_location = db.query(Location).filter(
        Location.code == location_data.code,
        Location.deleted_at == None
    ).first()
    
    if existing_location:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Location with code '{location_data.code}' already exists"
        )
    
    # Create new location
    new_location = Location(
        name=location_data.name,
        code=location_data.code,
        description=location_data.description,
        is_active=location_data.is_active,
        created_by_id=current_user.id
    )
    
    db.add(new_location)
    db.commit()
    db.refresh(new_location)
    
    return new_location

@router.get("/locations", response_model=List[LocationInDB])
async def read_locations(
    skip: int = 0,
    limit: int = 100,
    is_active: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all locations with optional filters."""
    query = db.query(Location).filter(Location.deleted_at == None)
    
    # Apply filters
    if is_active is not None:
        query = query.filter(Location.is_active == is_active)
    
    # Apply pagination
    locations = query.order_by(Location.name).offset(skip).limit(limit).all()
    
    return locations

@router.get("/locations/{location_id}", response_model=LocationInDB)
async def read_location(
    location_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific location by ID."""
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.deleted_at == None
    ).first()
    
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    return location

@router.put("/locations/{location_id}", response_model=LocationInDB)
async def update_location(
    location_id: UUID,
    location_update: LocationUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Update a specific location by ID (admin only)."""
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.deleted_at == None
    ).first()
    
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Check if code is being updated and already exists
    if location_update.code and location_update.code != location.code:
        existing_location = db.query(Location).filter(
            Location.code == location_update.code,
            Location.id != location_id,
            Location.deleted_at == None
        ).first()
        
        if existing_location:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Location with code '{location_update.code}' already exists"
            )
    
    # Update location fields
    for field, value in location_update.dict(exclude_unset=True).items():
        setattr(location, field, value)
    
    # Update updated_by field
    location.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(location)
    
    return location

@router.delete("/locations/{location_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_location(
    location_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a specific location by ID (soft delete, admin only)."""
    location = db.query(Location).filter(
        Location.id == location_id,
        Location.deleted_at == None
    ).first()
    
    if location is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Location not found"
        )
    
    # Check if location is used in any stock moves
    stock_moves = db.query(StockMove).filter(
        StockMove.location_id == location_id,
        StockMove.deleted_at == None
    ).first()
    
    if stock_moves:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete location that is used in stock movements"
        )
    
    # Soft delete
    location.deleted_at = datetime.utcnow()
    location.updated_by_id = current_user.id
    
    db.commit()
    
    return None

# Inventory Reports
@router.get("/inventory", response_model=List[ProductStock])
async def get_current_inventory(
    skip: int = 0,
    limit: int = 100,
    below_reorder_level: Optional[bool] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get current inventory levels for all products."""
    query = db.query(
        Product.id.label("product_id"),
        Product.name.label("product_name"),
        Product.sku.label("product_sku"),
        Product.stock_quantity,
        Product.unit_of_measure,
        Product.unit_cost,
        (Product.stock_quantity * Product.unit_cost).label("total_value"),
        Product.reorder_level
    ).filter(Product.deleted_at == None)
    
    # Filter products below reorder level if requested
    if below_reorder_level:
        query = query.filter(
            Product.reorder_level != None,
            Product.stock_quantity <= Product.reorder_level
        )
    
    # Apply pagination
    inventory = query.order_by(Product.name).offset(skip).limit(limit).all()
    
    # Convert to list of ProductStock objects
    result = []
    for item in inventory:
        result.append(
            ProductStock(
                product_id=item.product_id,
                product_name=item.product_name,
                product_sku=item.product_sku,
                stock_quantity=item.stock_quantity,
                unit_of_measure=item.unit_of_measure,
                unit_cost=item.unit_cost,
                total_value=item.total_value,
                reorder_level=item.reorder_level
            )
        )
    
    return result

@router.get("/movement-summary", response_model=List[StockMovementSummary])
async def get_stock_movement_summary(
    start_date: datetime = Query(..., description="Start date for the report period"),
    end_date: datetime = Query(..., description="End date for the report period"),
    product_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get stock movement summary for a specified period."""
    # Ensure end_date includes the entire day
    end_date = end_date.replace(hour=23, minute=59, second=59)
    
    # Query products
    product_query = db.query(Product).filter(Product.deleted_at == None)
    if product_id:
        product_query = product_query.filter(Product.id == product_id)
    
    products = product_query.all()
    
    # Get move types
    receipt_type = db.query(StockMoveType).filter(StockMoveType.name == "Receipt").first()
    issue_type = db.query(StockMoveType).filter(StockMoveType.name == "Issue").first()
    adjustment_type = db.query(StockMoveType).filter(StockMoveType.name == "Adjustment").first()
    
    result = []
    
    for product in products:
        # Calculate opening balance (all movements before start_date)
        opening_query = db.query(func.sum(StockMove.quantity)).filter(
            StockMove.product_id == product.id,
            StockMove.created_at < start_date,
            StockMove.deleted_at == None
        )
        
        # Handle different move types for opening balance
        opening_receipts = opening_query.filter(
            StockMove.move_type_id == receipt_type.id if receipt_type else None
        ).scalar() or 0
        
        opening_issues = opening_query.filter(
            StockMove.move_type_id == issue_type.id if issue_type else None
        ).scalar() or 0
        
        opening_adjustments = opening_query.filter(
            StockMove.move_type_id == adjustment_type.id if adjustment_type else None
        ).scalar() or 0
        
        opening_balance = opening_receipts - opening_issues + opening_adjustments
        
        # Calculate period movements
        period_query = db.query(func.sum(StockMove.quantity)).filter(
            StockMove.product_id == product.id,
            StockMove.created_at >= start_date,
            StockMove.created_at <= end_date,
            StockMove.deleted_at == None
        )
        
        # Get receipts, issues, and adjustments for the period
        receipts = period_query.filter(
            StockMove.move_type_id == receipt_type.id if receipt_type else None
        ).scalar() or 0
        
        issues = period_query.filter(
            StockMove.move_type_id == issue_type.id if issue_type else None
        ).scalar() or 0
        
        adjustments = period_query.filter(
            StockMove.move_type_id == adjustment_type.id if adjustment_type else None
        ).scalar() or 0
        
        # Calculate closing balance
        closing_balance = opening_balance + receipts - issues + adjustments
        
        result.append(
            StockMovementSummary(
                product_id=product.id,
                product_name=product.name,
                product_sku=product.sku,
                opening_balance=opening_balance,
                receipts=receipts,
                issues=issues,
                adjustments=adjustments,
                closing_balance=closing_balance,
                unit_of_measure=product.unit_of_measure
            )
        )
    
    return result