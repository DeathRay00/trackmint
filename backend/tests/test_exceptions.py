import pytest
from fastapi import HTTPException
from fastapi.responses import JSONResponse

from app.utils.exceptions import (
    TrackMintException,
    ValidationError,
    BusinessLogicError,
    ResourceNotFoundError,
    PermissionDeniedError,
    ConflictError,
    ExternalServiceError,
    format_error_response,
    get_status_code_for_error,
    validate_required_fields,
    validate_field_length,
    validate_email_format,
    validate_positive_number,
    validate_date_range,
    validate_work_order_status_transition,
    validate_manufacturing_order_quantity,
    validate_stock_availability
)

def test_trackmint_exception():
    """Test TrackMint base exception."""
    error = TrackMintException("Test error", "TEST_ERROR", {"field": "value"})
    
    assert error.message == "Test error"
    assert error.error_code == "TEST_ERROR"
    assert error.details == {"field": "value"}

def test_validation_error():
    """Test validation error."""
    error = ValidationError("Invalid field", "field_name", "invalid_value")
    
    assert error.message == "Invalid field"
    assert error.error_code == "VALIDATION_ERROR"
    assert error.details["field"] == "field_name"
    assert error.details["value"] == "invalid_value"

def test_business_logic_error():
    """Test business logic error."""
    error = BusinessLogicError("Business rule violated", "RULE_VIOLATION", {"rule": "test"})
    
    assert error.message == "Business rule violated"
    assert error.error_code == "RULE_VIOLATION"
    assert error.details["rule"] == "test"

def test_resource_not_found_error():
    """Test resource not found error."""
    error = ResourceNotFoundError("User", "user-123")
    
    assert error.message == "User not found with ID: user-123"
    assert error.error_code == "RESOURCE_NOT_FOUND"
    assert error.details["resource_type"] == "User"
    assert error.details["resource_id"] == "user-123"

def test_permission_denied_error():
    """Test permission denied error."""
    error = PermissionDeniedError("create_user", "users")
    
    assert error.message == "Permission denied for action: create_user on resource: users"
    assert error.error_code == "PERMISSION_DENIED"
    assert error.details["action"] == "create_user"
    assert error.details["resource"] == "users"

def test_conflict_error():
    """Test conflict error."""
    error = ConflictError("Resource already exists", "email", "test@example.com")
    
    assert error.message == "Resource already exists"
    assert error.error_code == "CONFLICT_ERROR"
    assert error.details["conflicting_field"] == "email"
    assert error.details["conflicting_value"] == "test@example.com"

def test_external_service_error():
    """Test external service error."""
    error = ExternalServiceError("Database", "Connection failed", 500)
    
    assert "External service error (Database): Connection failed" in error.message
    assert error.error_code == "EXTERNAL_SERVICE_ERROR"
    assert error.details["service_name"] == "Database"
    assert error.details["status_code"] == 500

def test_format_error_response_trackmint_exception():
    """Test error response formatting for TrackMint exceptions."""
    error = ValidationError("Invalid input", "field", "value")
    response = format_error_response(error)
    
    assert isinstance(response, JSONResponse)
    assert response.status_code == 422
    
    content = response.body.decode()
    assert "Invalid input" in content
    assert "VALIDATION_ERROR" in content

def test_format_error_response_http_exception():
    """Test error response formatting for HTTP exceptions."""
    error = HTTPException(status_code=404, detail="Not found")
    response = format_error_response(error)
    
    assert isinstance(response, JSONResponse)
    assert response.status_code == 404
    
    content = response.body.decode()
    assert "Not found" in content

def test_get_status_code_for_error():
    """Test status code mapping for different error types."""
    assert get_status_code_for_error(ValidationError("test")) == 422
    assert get_status_code_for_error(ResourceNotFoundError("test")) == 404
    assert get_status_code_for_error(PermissionDeniedError("test")) == 403
    assert get_status_code_for_error(ConflictError("test")) == 409
    assert get_status_code_for_error(BusinessLogicError("test")) == 400
    assert get_status_code_for_error(ExternalServiceError("test", "test")) == 502

def test_validate_required_fields():
    """Test required fields validation."""
    data = {"name": "Test", "email": "test@example.com"}
    required_fields = ["name", "email"]
    
    # Should not raise exception
    validate_required_fields(data, required_fields)
    
    # Should raise exception for missing fields
    with pytest.raises(ValidationError) as exc_info:
        validate_required_fields(data, ["name", "email", "password"])
    
    assert "Missing required fields" in str(exc_info.value)
    assert "password" in str(exc_info.value)

def test_validate_field_length():
    """Test field length validation."""
    # Should not raise exception for valid length
    validate_field_length("short", "field", 10)
    
    # Should raise exception for excessive length
    with pytest.raises(ValidationError) as exc_info:
        validate_field_length("this is a very long string", "field", 10)
    
    assert "exceeds maximum length" in str(exc_info.value)

def test_validate_email_format():
    """Test email format validation."""
    # Should not raise exception for valid emails
    validate_email_format("test@example.com")
    validate_email_format("user.name+tag@domain.co.uk")
    
    # Should raise exception for invalid emails
    with pytest.raises(ValidationError) as exc_info:
        validate_email_format("invalid-email")
    
    assert "Invalid email format" in str(exc_info.value)

def test_validate_positive_number():
    """Test positive number validation."""
    # Should not raise exception for positive numbers
    validate_positive_number(10.5, "field")
    validate_positive_number(1, "field")
    
    # Should raise exception for non-positive numbers
    with pytest.raises(ValidationError) as exc_info:
        validate_positive_number(0, "field")
    
    assert "must be a positive number" in str(exc_info.value)

def test_validate_date_range():
    """Test date range validation."""
    from datetime import datetime, timedelta
    
    start_date = datetime.now()
    end_date = start_date + timedelta(days=1)
    
    # Should not raise exception for valid range
    validate_date_range(start_date, end_date)
    
    # Should raise exception for invalid range
    with pytest.raises(ValidationError) as exc_info:
        validate_date_range(end_date, start_date)
    
    assert "must be before" in str(exc_info.value)

def test_validate_work_order_status_transition():
    """Test work order status transition validation."""
    # Valid transitions
    validate_work_order_status_transition("Ready", "Started")
    validate_work_order_status_transition("Started", "Paused")
    validate_work_order_status_transition("Paused", "Started")
    validate_work_order_status_transition("Started", "Completed")
    
    # Invalid transitions
    with pytest.raises(BusinessLogicError) as exc_info:
        validate_work_order_status_transition("Completed", "Started")
    
    assert "Cannot transition work order" in str(exc_info.value)

def test_validate_manufacturing_order_quantity():
    """Test manufacturing order quantity validation."""
    # Valid quantities
    validate_manufacturing_order_quantity(1)
    validate_manufacturing_order_quantity(100)
    validate_manufacturing_order_quantity(1000)
    
    # Invalid quantities
    with pytest.raises(ValidationError) as exc_info:
        validate_manufacturing_order_quantity(0)
    
    assert "must be greater than 0" in str(exc_info.value)
    
    with pytest.raises(BusinessLogicError) as exc_info:
        validate_manufacturing_order_quantity(15000)
    
    assert "cannot exceed 10,000 units" in str(exc_info.value)

def test_validate_stock_availability():
    """Test stock availability validation."""
    # Valid availability
    validate_stock_availability("product-1", 100, 150)
    validate_stock_availability("product-2", 50, 50)
    
    # Invalid availability
    with pytest.raises(BusinessLogicError) as exc_info:
        validate_stock_availability("product-3", 100, 50)
    
    assert "Insufficient stock" in str(exc_info.value)
    assert "Required: 100" in str(exc_info.value)
    assert "Available: 50" in str(exc_info.value)
