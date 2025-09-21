from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging
import traceback

from app.utils.exceptions import TrackMintException, format_error_response

logger = logging.getLogger(__name__)

async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """Global exception handler for all unhandled exceptions."""
    
    # Log the error
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    
    # Handle different types of exceptions
    if isinstance(exc, TrackMintException):
        return format_error_response(exc)
    elif isinstance(exc, HTTPException):
        return format_error_response(exc)
    elif isinstance(exc, RequestValidationError):
        return format_error_response(exc)
    elif isinstance(exc, StarletteHTTPException):
        return format_error_response(HTTPException(
            status_code=exc.status_code,
            detail=exc.detail
        ))
    else:
        # Generic error response
        return JSONResponse(
            status_code=500,
            content={
                "success": False,
                "error": {
                    "message": "Internal server error",
                    "code": "INTERNAL_ERROR",
                    "details": {}
                }
            }
        )

async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    """Handle validation errors specifically."""
    logger.warning(f"Validation error: {exc.errors()}")
    
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "error": {
                "message": "Validation error",
                "code": "VALIDATION_ERROR",
                "details": {
                    "errors": exc.errors()
                }
            }
        }
    )

async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    """Handle HTTP exceptions."""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": {
                "message": exc.detail,
                "code": "HTTP_ERROR",
                "details": {}
            }
        }
    )

async def trackmint_exception_handler(request: Request, exc: TrackMintException) -> JSONResponse:
    """Handle TrackMint custom exceptions."""
    return format_error_response(exc)
