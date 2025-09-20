// Mock API services for Trackmint Manufacturing Management System
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
  CreateWorkOrderForm 
} from '../types';

import { getMockData } from '../data/mockData';

// Simulate network delay
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API responses
class ApiService {
  private mockData = getMockData();

  // Auth endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1000);
    
    const user = this.mockData.users.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    return {
      success: true,
      data: {
        user,
        token: `mock-token-${Date.now()}`,
      },
      message: 'Login successful',
    };
  }

  async signup(data: SignupForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(1500);
    
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return {
      success: true,
      data: {
        user: newUser,
        token: `mock-token-${Date.now()}`,
      },
      message: 'Account created successfully',
    };
  }

  async sendOTP(email: string): Promise<ApiResponse<{ message: string }>> {
    await delay(800);
    
    return {
      success: true,
      data: { message: 'OTP sent to your email' },
      message: 'OTP sent successfully',
    };
  }

  async verifyOTP(data: OTPForm): Promise<ApiResponse<{ message: string }>> {
    await delay(1000);
    
    // Mock OTP verification - accept any 6-digit code
    if (data.otp.length === 6) {
      return {
        success: true,
        data: { message: 'OTP verified successfully' },
        message: 'OTP verified',
      };
    }
    
    throw new Error('Invalid OTP');
  }

  // Products
  async getProducts(page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    await delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = this.mockData.products.slice(start, end);
    
    return {
      data: paginatedData,
      total: this.mockData.products.length,
      page,
      limit,
      totalPages: Math.ceil(this.mockData.products.length / limit),
    };
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    await delay();
    
    const product = this.mockData.products.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      success: true,
      data: product,
    };
  }

  async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Product>> {
    await delay();
    
    const newProduct: Product = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: newProduct,
      message: 'Product created successfully',
    };
  }

  // Work Centers
  async getWorkCenters(): Promise<ApiResponse<WorkCenter[]>> {
    await delay();
    
    return {
      success: true,
      data: this.mockData.workCenters,
    };
  }

  async getWorkCenter(id: string): Promise<ApiResponse<WorkCenter>> {
    await delay();
    
    const workCenter = this.mockData.workCenters.find(wc => wc.id === id);
    if (!workCenter) {
      throw new Error('Work center not found');
    }
    
    return {
      success: true,
      data: workCenter,
    };
  }

  // BOMs
  async getBOMs(): Promise<ApiResponse<BOM[]>> {
    await delay();
    
    return {
      success: true,
      data: this.mockData.boms,
    };
  }

  async getBOM(id: string): Promise<ApiResponse<BOM>> {
    await delay();
    
    const bom = this.mockData.boms.find(b => b.id === id);
    if (!bom) {
      throw new Error('BOM not found');
    }
    
    return {
      success: true,
      data: bom,
    };
  }

  // Manufacturing Orders
  async getManufacturingOrders(page = 1, limit = 10): Promise<PaginatedResponse<ManufacturingOrder>> {
    await delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = this.mockData.manufacturingOrders.slice(start, end);
    
    return {
      data: paginatedData,
      total: this.mockData.manufacturingOrders.length,
      page,
      limit,
      totalPages: Math.ceil(this.mockData.manufacturingOrders.length / limit),
    };
  }

  async getManufacturingOrder(id: string): Promise<ApiResponse<ManufacturingOrder>> {
    await delay();
    
    const mo = this.mockData.manufacturingOrders.find(m => m.id === id);
    if (!mo) {
      throw new Error('Manufacturing order not found');
    }
    
    return {
      success: true,
      data: mo,
    };
  }

  async createManufacturingOrder(data: CreateManufacturingOrderForm): Promise<ApiResponse<ManufacturingOrder>> {
    await delay();
    
    const product = this.mockData.products.find(p => p.id === data.productId);
    const bom = this.mockData.boms.find(b => b.id === data.bomId);
    
    if (!product || !bom) {
      throw new Error('Product or BOM not found');
    }

    const newMO: ManufacturingOrder = {
      id: Date.now().toString(),
      orderNumber: `MO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      productId: data.productId,
      product,
      bomId: data.bomId,
      bom,
      quantity: data.quantity,
      status: 'Planned',
      priority: data.priority,
      plannedStartDate: new Date(data.plannedStartDate),
      plannedEndDate: new Date(data.plannedEndDate),
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: newMO,
      message: 'Manufacturing order created successfully',
    };
  }

  // Work Orders
  async getWorkOrders(page = 1, limit = 10): Promise<PaginatedResponse<WorkOrder>> {
    await delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = this.mockData.workOrders.slice(start, end);
    
    return {
      data: paginatedData,
      total: this.mockData.workOrders.length,
      page,
      limit,
      totalPages: Math.ceil(this.mockData.workOrders.length / limit),
    };
  }

  async getWorkOrder(id: string): Promise<ApiResponse<WorkOrder>> {
    await delay();
    
    const wo = this.mockData.workOrders.find(w => w.id === id);
    if (!wo) {
      throw new Error('Work order not found');
    }
    
    return {
      success: true,
      data: wo,
    };
  }

  async createWorkOrder(data: CreateWorkOrderForm): Promise<ApiResponse<WorkOrder>> {
    await delay();
    
    const mo = this.mockData.manufacturingOrders.find(m => m.id === data.manufacturingOrderId);
    const bomOperation = mo?.bom.operations.find(op => op.id === data.bomOperationId);
    const operator = data.assignedOperatorId ? 
      this.mockData.users.find(u => u.id === data.assignedOperatorId) : undefined;
    
    if (!mo || !bomOperation) {
      throw new Error('Manufacturing order or operation not found');
    }

    const newWO: WorkOrder = {
      id: Date.now().toString(),
      workOrderNumber: `WO-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      manufacturingOrderId: data.manufacturingOrderId,
      manufacturingOrder: mo,
      bomOperationId: data.bomOperationId,
      bomOperation,
      status: 'Ready',
      assignedOperatorId: data.assignedOperatorId,
      assignedOperator: operator,
      plannedDuration: data.plannedDuration,
      comments: data.comments,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    return {
      success: true,
      data: newWO,
      message: 'Work order created successfully',
    };
  }

  // Stock Moves
  async getStockMoves(page = 1, limit = 10): Promise<PaginatedResponse<StockMove>> {
    await delay();
    
    const start = (page - 1) * limit;
    const end = start + limit;
    const paginatedData = this.mockData.stockMoves.slice(start, end);
    
    return {
      data: paginatedData,
      total: this.mockData.stockMoves.length,
      page,
      limit,
      totalPages: Math.ceil(this.mockData.stockMoves.length / limit),
    };
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<ApiResponse<any>> {
    await delay();
    
    const totalOrders = this.mockData.manufacturingOrders.length;
    const completedOrders = this.mockData.manufacturingOrders.filter(mo => mo.status === 'Done').length;
    const inProgressOrders = this.mockData.manufacturingOrders.filter(mo => mo.status === 'In Progress').length;
    const delayedOrders = this.mockData.manufacturingOrders.filter(mo => 
      mo.status === 'In Progress' && new Date() > mo.plannedEndDate
    ).length;

    return {
      success: true,
      data: {
        totalOrders,
        completedOrders,
        inProgressOrders,
        delayedOrders,
        completionRate: totalOrders > 0 ? (completedOrders / totalOrders) * 100 : 0,
        onTimeDelivery: totalOrders > 0 ? ((totalOrders - delayedOrders) / totalOrders) * 100 : 0,
      },
    };
  }
}

// Export singleton instance
export const apiService = new ApiService();