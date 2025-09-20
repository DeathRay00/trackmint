from typing import List, Optional
from uuid import UUID
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, and_

from app.db.database import get_db
from app.models.manufacturing import BOM, BOMComponent, BOMOperation
from app.models.product import Product
from app.models.lookup_tables import OrderStatus
from app.schemas.bom import (
    BOMCreate,
    BOMUpdate,
    BOMInDB,
    BOMDetail,
    BOMComponentCreate,
    BOMComponentUpdate,
    BOMComponentInDB,
    BOMComponentDetail,
    BOMOperationCreate,
    BOMOperationUpdate,
    BOMOperationInDB,
    BOMOperationDetail,
    BOMCostCalculation
)
from app.utils.security import get_current_active_user, get_current_admin_user
from app.models.user import User

router = APIRouter(prefix="/bom", tags=["Bill of Materials"])

# BOM Endpoints
@router.post("", response_model=BOMInDB)
async def create_bom(
    bom_data: BOMCreate,
    db: Session = Depends(get_db)
):
    """Create a new BOM."""
    # Check if product exists
    product = db.query(Product).filter(
        Product.id == bom_data.product_id,
        Product.deleted_at == None
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if BOM with same product and version already exists
    existing_bom = db.query(BOM).filter(
        BOM.product_id == bom_data.product_id,
        BOM.version == bom_data.version,
        BOM.deleted_at == None
    ).first()
    
    if existing_bom:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"BOM with version '{bom_data.version}' already exists for this product"
        )
    
    # Create new BOM
    new_bom = BOM(
        name=bom_data.name,
        product_id=bom_data.product_id,
        version=bom_data.version,
        is_active=bom_data.is_active,
        total_cost=bom_data.total_cost,
        created_by_id=None  # Temporarily allow creation without user
    )
    
    db.add(new_bom)
    db.commit()
    db.refresh(new_bom)
    
    return new_bom

@router.get("", response_model=List[BOMInDB])
async def read_boms(
    skip: int = 0,
    limit: int = 100,
    product_id: Optional[UUID] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db)
):
    """Get all BOMs with optional filters."""
    query = db.query(BOM).filter(BOM.deleted_at == None)
    
    # Apply filters
    if product_id:
        query = query.filter(BOM.product_id == product_id)
    
    if is_active is not None:
        query = query.filter(BOM.is_active == is_active)
    
    # Apply pagination
    boms = query.order_by(BOM.created_at.desc()).offset(skip).limit(limit).all()
    
    return boms

@router.get("/{bom_id}", response_model=BOMDetail)
async def read_bom(
    bom_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get a specific BOM by ID with components and operations."""
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).options(
        joinedload(BOM.product),
        joinedload(BOM.components).joinedload(BOMComponent.product),
        joinedload(BOM.operations).joinedload(BOMOperation.work_center)
    ).first()
    
    if bom is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    return bom

@router.put("/{bom_id}", response_model=BOMInDB)
async def update_bom(
    bom_id: UUID,
    bom_update: BOMUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a specific BOM by ID."""
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if bom is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    # Check if version is being updated and already exists
    if bom_update.version and bom_update.version != bom.version:
        existing_bom = db.query(BOM).filter(
            BOM.product_id == bom.product_id,
            BOM.version == bom_update.version,
            BOM.id != bom_id,
            BOM.deleted_at == None
        ).first()
        
        if existing_bom:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"BOM with version '{bom_update.version}' already exists for this product"
            )
    
    # Update BOM fields
    for field, value in bom_update.dict(exclude_unset=True).items():
        setattr(bom, field, value)
    
    # Update updated_by field
    bom.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(bom)
    
    return bom

@router.delete("/{bom_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bom(
    bom_id: UUID,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    """Delete a specific BOM by ID (soft delete, admin only)."""
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if bom is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    # Check if BOM is used in any manufacturing orders
    from app.models.manufacturing import ManufacturingOrder
    manufacturing_orders = db.query(ManufacturingOrder).filter(
        ManufacturingOrder.bom_id == bom_id,
        ManufacturingOrder.deleted_at == None
    ).first()
    
    if manufacturing_orders:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete BOM that is used in manufacturing orders"
        )
    
    # Soft delete
    bom.deleted_at = datetime.utcnow()
    bom.updated_by_id = current_user.id
    
    db.commit()
    
    return None

# BOM Component Endpoints
@router.post("/{bom_id}/components", response_model=BOMComponentInDB)
async def create_bom_component(
    bom_id: UUID,
    component_data: BOMComponentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add a component to a BOM."""
    # Check if BOM exists
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    # Check if product exists
    product = db.query(Product).filter(
        Product.id == component_data.product_id,
        Product.deleted_at == None
    ).first()
    
    if not product:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found"
        )
    
    # Check if component already exists in this BOM
    existing_component = db.query(BOMComponent).filter(
        BOMComponent.bom_id == bom_id,
        BOMComponent.product_id == component_data.product_id,
        BOMComponent.deleted_at == None
    ).first()
    
    if existing_component:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Component already exists in this BOM"
        )
    
    # Create new BOM component
    new_component = BOMComponent(
        bom_id=bom_id,
        product_id=component_data.product_id,
        quantity=component_data.quantity,
        unit_cost=component_data.unit_cost,
        created_by_id=current_user.id
    )
    
    db.add(new_component)
    
    # Recalculate BOM total cost
    bom.total_cost = calculate_bom_cost(db, bom_id)
    
    db.commit()
    db.refresh(new_component)
    
    return new_component

@router.get("/{bom_id}/components", response_model=List[BOMComponentDetail])
async def read_bom_components(
    bom_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all components for a specific BOM."""
    # Check if BOM exists
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    components = db.query(BOMComponent).filter(
        BOMComponent.bom_id == bom_id,
        BOMComponent.deleted_at == None
    ).options(
        joinedload(BOMComponent.product)
    ).order_by(BOMComponent.created_at).all()
    
    return components

@router.put("/{bom_id}/components/{component_id}", response_model=BOMComponentInDB)
async def update_bom_component(
    bom_id: UUID,
    component_id: UUID,
    component_update: BOMComponentUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a BOM component."""
    component = db.query(BOMComponent).filter(
        BOMComponent.id == component_id,
        BOMComponent.bom_id == bom_id,
        BOMComponent.deleted_at == None
    ).first()
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM component not found"
        )
    
    # Update component fields
    for field, value in component_update.dict(exclude_unset=True).items():
        setattr(component, field, value)
    
    component.updated_by_id = current_user.id
    
    # Recalculate BOM total cost
    bom = db.query(BOM).filter(BOM.id == bom_id).first()
    if bom:
        bom.total_cost = calculate_bom_cost(db, bom_id)
    
    db.commit()
    db.refresh(component)
    
    return component

@router.delete("/{bom_id}/components/{component_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bom_component(
    bom_id: UUID,
    component_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a BOM component."""
    component = db.query(BOMComponent).filter(
        BOMComponent.id == component_id,
        BOMComponent.bom_id == bom_id,
        BOMComponent.deleted_at == None
    ).first()
    
    if not component:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM component not found"
        )
    
    # Soft delete
    component.deleted_at = datetime.utcnow()
    component.updated_by_id = current_user.id
    
    # Recalculate BOM total cost
    bom = db.query(BOM).filter(BOM.id == bom_id).first()
    if bom:
        bom.total_cost = calculate_bom_cost(db, bom_id)
    
    db.commit()
    
    return None

# BOM Operation Endpoints
@router.post("/{bom_id}/operations", response_model=BOMOperationInDB)
async def create_bom_operation(
    bom_id: UUID,
    operation_data: BOMOperationCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Add an operation to a BOM."""
    # Check if BOM exists
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    # Check if work center exists
    from app.models.manufacturing import WorkCenter
    work_center = db.query(WorkCenter).filter(
        WorkCenter.id == operation_data.work_center_id,
        WorkCenter.deleted_at == None
    ).first()
    
    if not work_center:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Work center not found"
        )
    
    # Create new BOM operation
    new_operation = BOMOperation(
        bom_id=bom_id,
        work_center_id=operation_data.work_center_id,
        sequence=operation_data.sequence,
        description=operation_data.description,
        duration=operation_data.duration,
        setup_time=operation_data.setup_time,
        cost_per_hour=operation_data.cost_per_hour,
        created_by_id=current_user.id
    )
    
    db.add(new_operation)
    db.commit()
    db.refresh(new_operation)
    
    return new_operation

@router.get("/{bom_id}/operations", response_model=List[BOMOperationDetail])
async def read_bom_operations(
    bom_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get all operations for a specific BOM."""
    # Check if BOM exists
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    operations = db.query(BOMOperation).filter(
        BOMOperation.bom_id == bom_id,
        BOMOperation.deleted_at == None
    ).options(
        joinedload(BOMOperation.work_center)
    ).order_by(BOMOperation.sequence).all()
    
    return operations

@router.put("/{bom_id}/operations/{operation_id}", response_model=BOMOperationInDB)
async def update_bom_operation(
    bom_id: UUID,
    operation_id: UUID,
    operation_update: BOMOperationUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Update a BOM operation."""
    operation = db.query(BOMOperation).filter(
        BOMOperation.id == operation_id,
        BOMOperation.bom_id == bom_id,
        BOMOperation.deleted_at == None
    ).first()
    
    if not operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM operation not found"
        )
    
    # Update operation fields
    for field, value in operation_update.dict(exclude_unset=True).items():
        setattr(operation, field, value)
    
    operation.updated_by_id = current_user.id
    
    db.commit()
    db.refresh(operation)
    
    return operation

@router.delete("/{bom_id}/operations/{operation_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bom_operation(
    bom_id: UUID,
    operation_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Delete a BOM operation."""
    operation = db.query(BOMOperation).filter(
        BOMOperation.id == operation_id,
        BOMOperation.bom_id == bom_id,
        BOMOperation.deleted_at == None
    ).first()
    
    if not operation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM operation not found"
        )
    
    # Soft delete
    operation.deleted_at = datetime.utcnow()
    operation.updated_by_id = current_user.id
    
    db.commit()
    
    return None

# BOM Cost Calculation
@router.get("/{bom_id}/cost-calculation", response_model=BOMCostCalculation)
async def calculate_bom_cost_endpoint(
    bom_id: UUID,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Calculate the total cost of a BOM."""
    # Check if BOM exists
    bom = db.query(BOM).filter(
        BOM.id == bom_id,
        BOM.deleted_at == None
    ).first()
    
    if not bom:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="BOM not found"
        )
    
    # Calculate costs
    material_cost, labor_cost, total_cost, component_count, operation_count = calculate_bom_cost_detailed(db, bom_id)
    
    return BOMCostCalculation(
        bom_id=bom_id,
        material_cost=material_cost,
        labor_cost=labor_cost,
        total_cost=total_cost,
        component_count=component_count,
        operation_count=operation_count
    )

# Helper Functions
def calculate_bom_cost(db: Session, bom_id: UUID) -> float:
    """Calculate total cost of a BOM."""
    material_cost, labor_cost, total_cost, _, _ = calculate_bom_cost_detailed(db, bom_id)
    return total_cost

def calculate_bom_cost_detailed(db: Session, bom_id: UUID):
    """Calculate detailed cost breakdown of a BOM."""
    # Calculate material cost
    components = db.query(BOMComponent).filter(
        BOMComponent.bom_id == bom_id,
        BOMComponent.deleted_at == None
    ).all()
    
    material_cost = sum(component.quantity * component.unit_cost for component in components)
    component_count = len(components)
    
    # Calculate labor cost
    operations = db.query(BOMOperation).filter(
        BOMOperation.bom_id == bom_id,
        BOMOperation.deleted_at == None
    ).all()
    
    labor_cost = sum(
        (operation.duration + operation.setup_time) / 60 * operation.cost_per_hour 
        for operation in operations
    )
    operation_count = len(operations)
    
    total_cost = material_cost + labor_cost
    
    return material_cost, labor_cost, total_cost, component_count, operation_count
