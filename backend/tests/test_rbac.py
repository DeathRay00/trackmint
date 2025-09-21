import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.lookup_tables import UserRole
from app.utils.rbac import Permission, has_permission, require_permission

def test_has_permission_admin(test_admin_user):
    """Test that admin user has all permissions."""
    for permission in Permission:
        assert has_permission(test_admin_user, permission)

def test_has_permission_operator(test_user):
    """Test that operator user has limited permissions."""
    # Create operator role
    operator_role = UserRole(
        id="operator-role-id",
        name="Operator",
        description="Operator role"
    )
    test_user.role = operator_role
    
    # Test operator permissions
    assert has_permission(test_user, Permission.READ_WORK_ORDER)
    assert has_permission(test_user, Permission.START_WORK_ORDER)
    assert has_permission(test_user, Permission.PAUSE_WORK_ORDER)
    assert has_permission(test_user, Permission.COMPLETE_WORK_ORDER)
    
    # Test admin-only permissions
    assert not has_permission(test_user, Permission.CREATE_USER)
    assert not has_permission(test_user, Permission.DELETE_USER)
    assert not has_permission(test_user, Permission.MANAGE_SYSTEM)

def test_require_permission_decorator(client: TestClient, test_user, auth_headers):
    """Test permission requirement decorator."""
    # This would require creating a test endpoint with permission requirements
    # For now, we'll test the permission checking logic directly
    
    # Test valid permission
    assert has_permission(test_user, Permission.READ_WORK_ORDER)
    
    # Test invalid permission
    assert not has_permission(test_user, Permission.CREATE_USER)

def test_permission_denied_error():
    """Test permission denied error creation."""
    from app.utils.exceptions import PermissionDeniedError
    
    error = PermissionDeniedError("create_user", "users")
    assert error.message == "Permission denied for action: create_user on resource: users"
    assert error.error_code == "PERMISSION_DENIED"
    assert error.details["action"] == "create_user"
    assert error.details["resource"] == "users"

def test_role_permissions_mapping():
    """Test that role permissions mapping is correct."""
    from app.utils.rbac import ROLE_PERMISSIONS
    
    # Test admin has all permissions
    admin_permissions = ROLE_PERMISSIONS.get("Admin", [])
    assert len(admin_permissions) > 0
    
    # Test operator has limited permissions
    operator_permissions = ROLE_PERMISSIONS.get("Operator", [])
    assert Permission.READ_WORK_ORDER.value in operator_permissions
    assert Permission.START_WORK_ORDER.value in operator_permissions
    assert Permission.CREATE_USER.value not in operator_permissions

def test_manufacturing_manager_permissions():
    """Test manufacturing manager permissions."""
    from app.utils.rbac import ROLE_PERMISSIONS
    
    manager_permissions = ROLE_PERMISSIONS.get("ManufacturingManager", [])
    
    # Should have manufacturing order permissions
    assert Permission.CREATE_MANUFACTURING_ORDER.value in manager_permissions
    assert Permission.UPDATE_MANUFACTURING_ORDER.value in manager_permissions
    assert Permission.DELETE_MANUFACTURING_ORDER.value in manager_permissions
    
    # Should have work order permissions
    assert Permission.CREATE_WORK_ORDER.value in manager_permissions
    assert Permission.UPDATE_WORK_ORDER.value in manager_permissions
    
    # Should not have user management permissions
    assert Permission.CREATE_USER.value not in manager_permissions
    assert Permission.DELETE_USER.value not in manager_permissions

def test_inventory_manager_permissions():
    """Test inventory manager permissions."""
    from app.utils.rbac import ROLE_PERMISSIONS
    
    inventory_permissions = ROLE_PERMISSIONS.get("InventoryManager", [])
    
    # Should have stock management permissions
    assert Permission.CREATE_STOCK_MOVE.value in inventory_permissions
    assert Permission.UPDATE_STOCK_MOVE.value in inventory_permissions
    assert Permission.DELETE_STOCK_MOVE.value in inventory_permissions
    
    # Should have read permissions for orders
    assert Permission.READ_MANUFACTURING_ORDER.value in inventory_permissions
    assert Permission.READ_WORK_ORDER.value in inventory_permissions
    
    # Should not have manufacturing order creation permissions
    assert Permission.CREATE_MANUFACTURING_ORDER.value not in inventory_permissions
    assert Permission.CREATE_WORK_ORDER.value not in inventory_permissions

def test_permission_validation():
    """Test permission validation functions."""
    from app.utils.rbac import can_access_resource
    
    # Create a test user with operator role
    operator_role = UserRole(
        id="test-operator-role",
        name="Operator",
        description="Operator role"
    )
    
    operator_user = User(
        id="test-operator-user",
        email="operator@example.com",
        password_hash="test_hash",
        first_name="Test",
        last_name="Operator",
        role_id=operator_role.id,
        is_active=True
    )
    operator_user.role = operator_role
    
    # Test valid access
    assert can_access_resource(operator_user, "work_order", "read")
    assert can_access_resource(operator_user, "work_order", "update")
    
    # Test invalid access
    assert not can_access_resource(operator_user, "user", "create")
    assert not can_access_resource(operator_user, "user", "delete")
