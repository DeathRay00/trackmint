// Real API services for Trackmint Manufacturing Management System
import type { 
  User, 
  Product, 
  WorkCenter, 
  BOM, 
  ManufacturingOrder, 
  WorkOrder, 
  StockMove,
  ApiResponse,
  PaginatedResponse,
  LoginForm,
  SignupForm,
  OTPForm,
  CreateManufacturingOrderForm,
  CreateWorkOrderForm,
  CreateWorkCenterForm,
  UpdateWorkCenterForm
} from '../types';

// API Configuration
const API_BASE_URL = 'http://localhost:8000/api';

// Helper function to handle API responses
async function handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
  if (!response.ok) {
    let errorMessage = `HTTP error! status: ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.detail || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse JSON, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  
  const data = await response.json();
    return {
      success: true,
    data,
    message: data.message || 'Success'
  };
}

// Helper function to get auth headers
function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
}

// API Service Class
class ApiService {
  // Auth endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        username: credentials.email,
        password: credentials.password
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.detail || 'Login failed');
    }
    
    // Store token
    localStorage.setItem('auth_token', data.access_token);

    return {
      success: true,
      data: {
        user: data.user,
        token: data.access_token
      },
      message: 'Login successful'
    };
  }

  async signup(data: SignupForm): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    
    return handleResponse(response);
  }

  async verifyOTP(data: OTPForm): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    localStorage.removeItem('auth_token');
      return {
        success: true,
      data: { message: 'Logged out successfully' }
      };
  }

  // Products
  async getProducts(page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    const skip = (page - 1) * limit;
    const response = await fetch(`${API_BASE_URL}/products?skip=${skip}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const data = await response.json();
    return {
      data: data.items || data,
      total: data.total || data.length,
      page,
      limit,
      totalPages: Math.ceil((data.total || data.length) / limit)
    };
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    const response = await fetch(`${API_BASE_URL}/products/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  async createProduct(data: {
    name: string;
    sku: string;
    category: string;
    unitOfMeasure: string;
    unitCost: number;
    stockQuantity: number;
    reorderLevel: number;
    description?: string;
  }): Promise<ApiResponse<Product>> {
    // Map frontend field names to backend field names
    const productData = {
      name: data.name,
      sku: data.sku,
      category: data.category,
      unit_of_measure: data.unitOfMeasure,
      unit_cost: data.unitCost,
      stock_quantity: data.stockQuantity,
      reorder_level: data.reorderLevel,
      description: data.description
    };
    
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData)
    });
    
    return handleResponse(response);
  }

  // Work Centers
  async getWorkCenters(page = 1, limit = 10): Promise<PaginatedResponse<WorkCenter>> {
    const response = await fetch(`${API_BASE_URL}/work-centers?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch work centers');
    }
    
    const data = await response.json();
    return {
      data: data.items || data,
      total: data.total || data.length,
      page,
      limit,
      totalPages: Math.ceil((data.total || data.length) / limit)
    };
  }

  async getWorkCenter(id: string): Promise<ApiResponse<WorkCenter>> {
    const response = await fetch(`${API_BASE_URL}/work-centers/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  async createWorkCenter(data: CreateWorkCenterForm): Promise<ApiResponse<WorkCenter>> {
    const response = await fetch(`${API_BASE_URL}/work-centers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async updateWorkCenter(id: string, data: UpdateWorkCenterForm): Promise<ApiResponse<WorkCenter>> {
    const response = await fetch(`${API_BASE_URL}/work-centers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async deleteWorkCenter(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/work-centers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  // BOMs
  async getBOMs(): Promise<ApiResponse<BOM[]>> {
    const response = await fetch(`${API_BASE_URL}/boms`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  async getBOM(id: string): Promise<ApiResponse<BOM>> {
    const response = await fetch(`${API_BASE_URL}/boms/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  async createBOM(data: {
    name: string;
    productId: string;
    version: string;
    isActive: boolean;
    description: string;
    totalCost: number;
  }): Promise<ApiResponse<BOM>> {
    // Map frontend field names to backend field names
    const bomData = {
      name: data.name,
      product_id: data.productId,
      version: data.version,
      is_active: data.isActive,
      description: data.description,
      total_cost: data.totalCost
    };
    
    const response = await fetch(`${API_BASE_URL}/boms`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(bomData)
    });
    
    return handleResponse(response);
  }

  async updateBOM(id: string, data: {
    name: string;
    productId: string;
    version: string;
    isActive: boolean;
    description: string;
    totalCost: number;
  }): Promise<ApiResponse<BOM>> {
    // Map frontend field names to backend field names
    const bomData = {
      name: data.name,
      product_id: data.productId,
      version: data.version,
      is_active: data.isActive,
      description: data.description,
      total_cost: data.totalCost
    };
    
    const response = await fetch(`${API_BASE_URL}/boms/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(bomData)
    });
    
    return handleResponse(response);
  }

  async deleteBOM(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/boms/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  // Manufacturing Orders
  async getManufacturingOrders(page = 1, limit = 10): Promise<PaginatedResponse<ManufacturingOrder>> {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch manufacturing orders');
    }
    
    const data = await response.json();
    return {
      data: data.items || data,
      total: data.total || data.length,
      page,
      limit,
      totalPages: Math.ceil((data.total || data.length) / limit)
    };
  }

  async getManufacturingOrder(id: string): Promise<ApiResponse<ManufacturingOrder>> {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  async createManufacturingOrder(data: {
    productId: string;
    bomId: string;
    quantity: number;
    priority: string;
    plannedStartDate: string;
    plannedEndDate: string;
    assignedToId?: string;
    notes?: string;
  }): Promise<ApiResponse<ManufacturingOrder>> {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async updateManufacturingOrder(id: string, data: {
    productId: string;
    bomId: string;
    quantity: number;
    priority: string;
    status: string;
    plannedStartDate: string;
    plannedEndDate: string;
    actualStartDate?: string;
    actualEndDate?: string;
    assignedToId?: string;
    notes?: string;
  }): Promise<ApiResponse<ManufacturingOrder>> {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async deleteManufacturingOrder(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/manufacturing-orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  // Work Orders
  async getWorkOrders(page = 1, limit = 10): Promise<PaginatedResponse<WorkOrder>> {
    const response = await fetch(`${API_BASE_URL}/work-orders?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch work orders');
    }
    
    const data = await response.json();
    return {
      data: data.items || data,
      total: data.total || data.length,
      page,
      limit,
      totalPages: Math.ceil((data.total || data.length) / limit)
    };
  }

  async getWorkOrder(id: string): Promise<ApiResponse<WorkOrder>> {
    const response = await fetch(`${API_BASE_URL}/work-orders/${id}`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  async createWorkOrder(data: CreateWorkOrderForm): Promise<ApiResponse<WorkOrder>> {
    const response = await fetch(`${API_BASE_URL}/work-orders`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async updateWorkOrder(id: string, data: Partial<CreateWorkOrderForm>): Promise<ApiResponse<WorkOrder>> {
    const response = await fetch(`${API_BASE_URL}/work-orders/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  }

  async deleteWorkOrder(id: string): Promise<ApiResponse<{ message: string }>> {
    const response = await fetch(`${API_BASE_URL}/work-orders/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }

  // Stock Moves
  async getStockMoves(page = 1, limit = 10): Promise<PaginatedResponse<StockMove>> {
    const response = await fetch(`${API_BASE_URL}/stock/movements?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch stock moves');
    }
    
    const data = await response.json();
    return {
      data: data.items || data,
      total: data.total || data.length,
      page,
      limit,
      totalPages: Math.ceil((data.total || data.length) / limit)
    };
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/dashboard/kpis`, {
      headers: getAuthHeaders()
    });
    
    return handleResponse(response);
  }
}

// Export singleton instance
export const apiService = new ApiService();