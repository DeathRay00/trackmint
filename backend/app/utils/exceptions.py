from typing import Any, Dict, Optional
from fastapi import HTTPException, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)

class TrackMintException(Exception):
    """Base exception for TrackMint application."""
    def __init__(self, message: str, error_code: str = None, details: Dict[str, Any] = None):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)

class ValidationError(TrackMintException):
    """Custom validation error."""
    def __init__(self, message: str, field: str = None, value: Any = None):
        super().__init__(
            message=message,
            error_code="VALIDATION_ERROR",
            details={"field": field, "value": value}
        )

class BusinessLogicError(TrackMintException):
    """Business logic violation error."""
    def __init__(self, message: str, error_code: str = None, details: Dict[str, Any] = None):
        super().__init__(
            message=message,
            error_code=error_code or "BUSINESS_LOGIC_ERROR",
            details=details
        )

class ResourceNotFoundError(TrackMintException):
    """Resource not found error."""
    def __init__(self, resource_type: str, resource_id: str = None):
        message = f"{resource_type} not found"
        if resource_id:
            message += f" with ID: {resource_id}"
        super().__init__(
            message=message,
            error_code="RESOURCE_NOT_FOUND",
            details={"resource_type": resource_type, "resource_id": resource_id}
        )

class PermissionDeniedError(TrackMintException):
    """Permission denied error."""
    def __init__(self, action: str, resource: str = None):
        message = f"Permission denied for action: {action}"
        if resource:
            message += f" on resource: {resource}"
        super().__init__(
            message=message,
            error_code="PERMISSION_DENIED",
            details={"action": action, "resource": resource}
        )

class ConflictError(TrackMintException):
    """Resource conflict error."""
    def __init__(self, message: str, conflicting_field: str = None, conflicting_value: Any = None):
        super().__init__(
            message=message,
            error_code="CONFLICT_ERROR",
            details={"conflicting_field": conflicting_field, "conflicting_value": conflicting_value}
        )

class ExternalServiceError(TrackMintException):
    """External service error."""
    def __init__(self, service_name: str, message: str, status_code: int = None):
        super().__init__(
            message=f"External service error ({service_name}): {message}",
            error_code="EXTERNAL_SERVICE_ERROR",
            details={"service_name": service_name, "status_code": status_code}
        )

# Error response formatter
def format_error_response(
    error: Exception,
    status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR,
    include_details: bool = True
) -> JSONResponse:
    """Format error response consistently."""
    
    if isinstance(error, TrackMintException):
        response_data = {
            "success": False,
            "error": {
                "message": error.message,
                "code": error.error_code,
                "details": error.details if include_details else {}
            }
        }
        status_code = get_status_code_for_error(error)
    elif isinstance(error, HTTPException):
        response_data = {
            "success": False,
            "error": {
                "message": error.detail,
                "code": "HTTP_ERROR",
                "details": {}
            }
        }
        status_code = error.status_code
    elif isinstance(error, RequestValidationError):
        response_data = {
            "success": False,
            "error": {
                "message": "Validation error",
                "code": "VALIDATION_ERROR",
                "details": {
                    "errors": error.errors() if include_details else []
                }
            }
        }
        status_code = status.HTTP_422_UNPROCESSABLE_ENTITY
    else:
        # Generic error
        response_data = {
            "success": False,
            "error": {
                "message": "Internal server error",
                "code": "INTERNAL_ERROR",
                "details": {}
            }
        }
        status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
        logger.error(f"Unhandled error: {str(error)}", exc_info=True)
    
    return JSONResponse(
        status_code=status_code,
        content=response_data
    )

def get_status_code_for_error(error: TrackMintException) -> int:
    """Get appropriate HTTP status code for TrackMint exceptions."""
    error_code = error.error_code
    
    if error_code == "VALIDATION_ERROR":
        return status.HTTP_422_UNPROCESSABLE_ENTITY
    elif error_code == "RESOURCE_NOT_FOUND":
        return status.HTTP_404_NOT_FOUND
    elif error_code == "PERMISSION_DENIED":
        return status.HTTP_403_FORBIDDEN
    elif error_code == "CONFLICT_ERROR":
        return status.HTTP_409_CONFLICT
    elif error_code == "BUSINESS_LOGIC_ERROR":
        return status.HTTP_400_BAD_REQUEST
    elif error_code == "EXTERNAL_SERVICE_ERROR":
        return status.HTTP_502_BAD_GATEWAY
    else:
        return status.HTTP_500_INTERNAL_SERVER_ERROR

# Validation helpers
def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """Validate that all required fields are present."""
    missing_fields = [field for field in required_fields if field not in data or data[field] is None]
    if missing_fields:
        raise ValidationError(
            message=f"Missing required fields: {', '.join(missing_fields)}",
            field="required_fields",
            value=missing_fields
        )

def validate_field_length(field_value: str, field_name: str, max_length: int) -> None:
    """Validate field length."""
    if field_value and len(field_value) > max_length:
        raise ValidationError(
            message=f"{field_name} exceeds maximum length of {max_length} characters",
            field=field_name,
            value=field_value
        )

def validate_email_format(email: str) -> None:
    """Validate email format."""
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_pattern, email):
        raise ValidationError(
            message="Invalid email format",
            field="email",
            value=email
        )

def validate_positive_number(value: float, field_name: str) -> None:
    """Validate that a number is positive."""
    if value <= 0:
        raise ValidationError(
            message=f"{field_name} must be a positive number",
            field=field_name,
            value=value
        )

def validate_date_range(start_date, end_date, start_field: str = "start_date", end_field: str = "end_date") -> None:
    """Validate that start date is before end date."""
    if start_date and end_date and start_date >= end_date:
        raise ValidationError(
            message=f"{start_field} must be before {end_field}",
            field=start_field,
            value=start_date
        )

# Business logic validation helpers
def validate_work_order_status_transition(current_status: str, new_status: str) -> None:
    """Validate work order status transition."""
    valid_transitions = {
        "Ready": ["Started", "Canceled"],
        "Started": ["Paused", "Completed", "Canceled"],
        "Paused": ["Started", "Canceled"],
        "Completed": [],  # Cannot transition from completed
        "Canceled": []    # Cannot transition from canceled
    }
    
    if new_status not in valid_transitions.get(current_status, []):
        raise BusinessLogicError(
            message=f"Cannot transition work order from {current_status} to {new_status}",
            error_code="INVALID_STATUS_TRANSITION",
            details={"current_status": current_status, "new_status": new_status}
        )

def validate_manufacturing_order_quantity(quantity: int) -> None:
    """Validate manufacturing order quantity."""
    if quantity <= 0:
        raise ValidationError(
            message="Manufacturing order quantity must be greater than 0",
            field="quantity",
            value=quantity
        )
    
    if quantity > 10000:  # Business rule: max 10k units per order
        raise BusinessLogicError(
            message="Manufacturing order quantity cannot exceed 10,000 units",
            error_code="QUANTITY_LIMIT_EXCEEDED",
            details={"quantity": quantity, "max_quantity": 10000}
        )

def validate_stock_availability(product_id: str, required_quantity: int, available_quantity: int) -> None:
    """Validate stock availability for manufacturing."""
    if available_quantity < required_quantity:
        raise BusinessLogicError(
            message=f"Insufficient stock. Required: {required_quantity}, Available: {available_quantity}",
            error_code="INSUFFICIENT_STOCK",
            details={
                "product_id": product_id,
                "required_quantity": required_quantity,
                "available_quantity": available_quantity
            }
        )
