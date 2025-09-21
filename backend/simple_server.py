from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Trackmint API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Trackmint API is running!"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/products")
async def get_products():
    return {
        "items": [
            {
                "id": "1",
                "name": "Sample Product",
                "sku": "SP-001",
                "category": "Sample",
                "unitOfMeasure": "pcs",
                "unitCost": 10.0,
                "stockQuantity": 100,
                "reorderLevel": 20,
                "createdAt": "2024-01-01T00:00:00Z",
                "updatedAt": "2024-01-01T00:00:00Z"
            }
        ],
        "total": 1
    }

@app.post("/api/products")
async def create_product(product: dict):
    return {
        "id": "2",
        "name": product.get("name", "New Product"),
        "sku": product.get("sku", "NP-001"),
        "category": product.get("category", "New"),
        "unitOfMeasure": product.get("unitOfMeasure", "pcs"),
        "unitCost": product.get("unitCost", 0),
        "stockQuantity": product.get("stockQuantity", 0),
        "reorderLevel": product.get("reorderLevel", 0),
        "createdAt": "2024-01-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z"
    }

@app.get("/api/manufacturing-orders")
async def get_manufacturing_orders():
    return {
        "items": [],
        "total": 0
    }

@app.get("/api/work-orders")
async def get_work_orders():
    return {
        "items": [],
        "total": 0
    }

@app.get("/api/dashboard/kpis")
async def get_dashboard_kpis():
    return {
        "totalOrders": 0,
        "completedOrders": 0,
        "efficiency": 85,
        "onTimeDelivery": 92
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
