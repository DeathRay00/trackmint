from enum import Enum
from typing import List, Optional
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.user import User
from app.models.lookup_tables import UserRole
from app.utils.security import get_current_user

class Permission(str, Enum):
    # User Management
    CREATE_USER = "create_user"
    READ_USER = "read_user"
    UPDATE_USER = "update_user"
    DELETE_USER = "delete_user"
    
    # Product Management
    CREATE_PRODUCT = "create_product"
    READ_PRODUCT = "read_product"
    UPDATE_PRODUCT = "update_product"
    DELETE_PRODUCT = "delete_product"
    
    # BOM Management
    CREATE_BOM = "create_bom"
    READ_BOM = "read_bom"
    UPDATE_BOM = "update_bom"
    DELETE_BOM = "delete_bom"
    
    # Work Center Management
    CREATE_WORK_CENTER = "create_work_center"
    READ_WORK_CENTER = "read_work_center"
    UPDATE_WORK_CENTER = "update_work_center"
    DELETE_WORK_CENTER = "delete_work_center"
    
    # Manufacturing Order Management
    CREATE_MANUFACTURING_ORDER = "create_manufacturing_order"
    READ_MANUFACTURING_ORDER = "read_manufacturing_order"
    UPDATE_MANUFACTURING_ORDER = "update_manufacturing_order"
    DELETE_MANUFACTURING_ORDER = "delete_manufacturing_order"
    APPROVE_MANUFACTURING_ORDER = "approve_manufacturing_order"
    
    # Work Order Management
    CREATE_WORK_ORDER = "create_work_order"
    READ_WORK_ORDER = "read_work_order"
    UPDATE_WORK_ORDER = "update_work_order"
    DELETE_WORK_ORDER = "delete_work_order"
    START_WORK_ORDER = "start_work_order"
    PAUSE_WORK_ORDER = "pause_work_order"
    COMPLETE_WORK_ORDER = "complete_work_order"
    
    # Stock Management
    CREATE_STOCK_MOVE = "create_stock_move"
    READ_STOCK_MOVE = "read_stock_move"
    UPDATE_STOCK_MOVE = "update_stock_move"
    DELETE_STOCK_MOVE = "delete_stock_move"
    
    # Reports and Analytics
    READ_REPORTS = "read_reports"
    EXPORT_REPORTS = "export_reports"
    READ_ANALYTICS = "read_analytics"
    
    # System Administration
    MANAGE_ROLES = "manage_roles"
    MANAGE_SYSTEM = "manage_system"
    VIEW_AUDIT_LOGS = "view_audit_logs"

# Role-based permissions mapping
ROLE_PERMISSIONS = {
    "Admin": [
        # Admin has all permissions
        permission.value for permission in Permission
    ],
    "ManufacturingManager": [
        Permission.CREATE_MANUFACTURING_ORDER.value,
        Permission.READ_MANUFACTURING_ORDER.value,
        Permission.UPDATE_MANUFACTURING_ORDER.value,
        Permission.DELETE_MANUFACTURING_ORDER.value,
        Permission.APPROVE_MANUFACTURING_ORDER.value,
        Permission.CREATE_WORK_ORDER.value,
        Permission.READ_WORK_ORDER.value,
        Permission.UPDATE_WORK_ORDER.value,
        Permission.DELETE_WORK_ORDER.value,
        Permission.START_WORK_ORDER.value,
        Permission.PAUSE_WORK_ORDER.value,
        Permission.COMPLETE_WORK_ORDER.value,
        Permission.CREATE_PRODUCT.value,
        Permission.READ_PRODUCT.value,
        Permission.UPDATE_PRODUCT.value,
        Permission.DELETE_PRODUCT.value,
        Permission.CREATE_BOM.value,
        Permission.READ_BOM.value,
        Permission.UPDATE_BOM.value,
        Permission.DELETE_BOM.value,
        Permission.CREATE_WORK_CENTER.value,
        Permission.READ_WORK_CENTER.value,
        Permission.UPDATE_WORK_CENTER.value,
        Permission.DELETE_WORK_CENTER.value,
        Permission.CREATE_STOCK_MOVE.value,
        Permission.READ_STOCK_MOVE.value,
        Permission.UPDATE_STOCK_MOVE.value,
        Permission.DELETE_STOCK_MOVE.value,
        Permission.READ_REPORTS.value,
        Permission.EXPORT_REPORTS.value,
        Permission.READ_ANALYTICS.value,
        Permission.READ_USER.value,
    ],
    "Operator": [
        Permission.READ_MANUFACTURING_ORDER.value,
        Permission.READ_WORK_ORDER.value,
        Permission.UPDATE_WORK_ORDER.value,
        Permission.START_WORK_ORDER.value,
        Permission.PAUSE_WORK_ORDER.value,
        Permission.COMPLETE_WORK_ORDER.value,
        Permission.READ_PRODUCT.value,
        Permission.READ_BOM.value,
        Permission.READ_WORK_CENTER.value,
        Permission.READ_STOCK_MOVE.value,
        Permission.CREATE_STOCK_MOVE.value,
    ],
    "InventoryManager": [
        Permission.READ_PRODUCT.value,
        Permission.UPDATE_PRODUCT.value,
        Permission.CREATE_STOCK_MOVE.value,
        Permission.READ_STOCK_MOVE.value,
        Permission.UPDATE_STOCK_MOVE.value,
        Permission.DELETE_STOCK_MOVE.value,
        Permission.READ_MANUFACTURING_ORDER.value,
        Permission.READ_WORK_ORDER.value,
        Permission.READ_REPORTS.value,
        Permission.EXPORT_REPORTS.value,
    ]
}

def has_permission(user: User, permission: Permission) -> bool:
    """Check if user has a specific permission."""
    if not user.role:
        return False
    
    role_name = user.role.name
    user_permissions = ROLE_PERMISSIONS.get(role_name, [])
    return permission.value in user_permissions

def require_permission(permission: Permission):
    """Decorator to require a specific permission."""
    def permission_dependency(current_user: User = Depends(get_current_user)):
        if not has_permission(current_user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required permission: {permission.value}"
            )
        return current_user
    return permission_dependency

def require_any_permission(permissions: List[Permission]):
    """Decorator to require any of the specified permissions."""
    def permission_dependency(current_user: User = Depends(get_current_user)):
        if not any(has_permission(current_user, perm) for perm in permissions):
            required_perms = [perm.value for perm in permissions]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required any of: {required_perms}"
            )
        return current_user
    return permission_dependency

def require_all_permissions(permissions: List[Permission]):
    """Decorator to require all of the specified permissions."""
    def permission_dependency(current_user: User = Depends(get_current_user)):
        if not all(has_permission(current_user, perm) for perm in permissions):
            required_perms = [perm.value for perm in permissions]
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Required all of: {required_perms}"
            )
        return current_user
    return permission_dependency

def get_user_permissions(user: User) -> List[str]:
    """Get all permissions for a user."""
    if not user.role:
        return []
    
    role_name = user.role.name
    return ROLE_PERMISSIONS.get(role_name, [])

def can_access_resource(user: User, resource_type: str, action: str) -> bool:
    """Check if user can perform action on resource type."""
    permission_name = f"{action}_{resource_type}"
    try:
        permission = Permission(permission_name)
        return has_permission(user, permission)
    except ValueError:
        return False

# Common permission dependencies
require_admin = require_permission(Permission.MANAGE_SYSTEM)
require_manufacturing_manager = require_any_permission([
    Permission.CREATE_MANUFACTURING_ORDER,
    Permission.UPDATE_MANUFACTURING_ORDER,
    Permission.DELETE_MANUFACTURING_ORDER
])
require_operator = require_any_permission([
    Permission.START_WORK_ORDER,
    Permission.PAUSE_WORK_ORDER,
    Permission.COMPLETE_WORK_ORDER
])
require_inventory_manager = require_any_permission([
    Permission.CREATE_STOCK_MOVE,
    Permission.UPDATE_STOCK_MOVE,
    Permission.DELETE_STOCK_MOVE
])
