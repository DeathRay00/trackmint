from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.api.routes import auth, users, manufacturing_orders, work_orders, work_centers, stock, bom, products
from app.core.config import settings
from app.middleware.error_handler import (
    global_exception_handler,
    validation_exception_handler,
    http_exception_handler,
    trackmint_exception_handler
)
from app.utils.exceptions import TrackMintException

app = FastAPI(
    title="Trackmint API",
    description="Manufacturing Management System API",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add exception handlers
app.add_exception_handler(TrackMintException, trackmint_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(HTTPException, http_exception_handler)
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(Exception, global_exception_handler)

# Include routers
app.include_router(auth.router, prefix="/api", tags=["Authentication"])
app.include_router(users.router, prefix="/api", tags=["Users"])
app.include_router(products.router, prefix="/api", tags=["Product Management"])
app.include_router(manufacturing_orders.router, prefix="/api", tags=["Manufacturing Orders"])
app.include_router(work_orders.router, prefix="/api", tags=["Work Orders"])
app.include_router(work_centers.router, prefix="/api", tags=["Work Centers"])
app.include_router(stock.router, prefix="/api", tags=["Stock Management"])
app.include_router(bom.router, prefix="/api", tags=["Bill of Materials"])

@app.get("/", tags=["Root"])
async def root():
    return {"message": "Welcome to Trackmint Manufacturing Management API"}

@app.get("/health", tags=["Health"])
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)