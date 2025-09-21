// Mock API service for development when backend is not available
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

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Sample Product 1',
    sku: 'SP-001',
    category: 'Electronics',
    unitOfMeasure: 'pcs',
    unitCost: 25.50,
    stockQuantity: 100,
    reorderLevel: 20,
    description: 'A sample electronic product',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Sample Product 2',
    sku: 'SP-002',
    category: 'Furniture',
    unitOfMeasure: 'pcs',
    unitCost: 150.00,
    stockQuantity: 50,
    reorderLevel: 10,
    description: 'A sample furniture product',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockWorkCenters: WorkCenter[] = [
  {
    id: '1',
    name: 'Assembly Line 1',
    code: 'AL1',
    capacity: 8,
    costPerHour: 50,
    efficiency: 90,
    description: 'Main assembly line',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    name: 'Quality Control',
    code: 'QC1',
    capacity: 4,
    costPerHour: 60,
    efficiency: 95,
    description: 'Quality control station',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@trackmint.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  {
    id: '2',
    email: 'operator@trackmint.com',
    firstName: 'John',
    lastName: 'Operator',
    role: 'Operator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockBOMs: BOM[] = [
  {
    id: '1',
    name: 'Sample BOM 1',
    productId: '1',
    product: mockProducts[0],
    version: '1.0',
    components: [
      {
        id: '1',
        productId: '1',
        product: mockProducts[0],
        quantity: 1,
        unitCost: 25.50
      }
    ],
    operations: [
      {
        id: '1',
        workCenterId: '1',
        workCenter: mockWorkCenters[0],
        sequence: 1,
        description: 'Assembly Operation',
        duration: 60,
        setupTime: 10,
        costPerHour: 50
      }
    ],
    isActive: true,
    totalCost: 75.50,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockManufacturingOrders: ManufacturingOrder[] = [
  {
    id: '1',
    orderNumber: 'MO-001',
    productId: '1',
    product: mockProducts[0],
    bomId: '1',
    bom: mockBOMs[0],
    quantity: 100,
    status: 'Planned',
    priority: 'Medium',
    plannedStartDate: new Date('2024-02-01'),
    plannedEndDate: new Date('2024-02-15'),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

const mockWorkOrders: WorkOrder[] = [
  {
    id: '1',
    workOrderNumber: 'WO-001',
    manufacturingOrderId: '1',
    manufacturingOrder: mockManufacturingOrders[0],
    bomOperationId: '1',
    bomOperation: {
      id: '1',
      workCenterId: '1',
      workCenter: mockWorkCenters[0],
      sequence: 1,
      description: 'Assembly Operation',
      duration: 60,
      setupTime: 10,
      costPerHour: 50
    },
    status: 'Ready',
    assignedOperatorId: '2',
    assignedOperator: mockUsers[1],
    plannedDuration: 60,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// Helper function to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API Service Class
class MockApiService {
  // Auth endpoints
  async login(credentials: LoginForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(500);
    
    const user = mockUsers.find(u => u.email === credentials.email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    return {
      success: true,
      data: {
        user,
        token: 'mock-jwt-token'
      },
      message: 'Login successful'
    };
  }

  async signup(data: SignupForm): Promise<ApiResponse<{ user: User; token: string }>> {
    await delay(500);
    
    const newUser: User = {
      id: Date.now().toString(),
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockUsers.push(newUser);
    
    return {
      success: true,
      data: {
        user: newUser,
        token: 'mock-jwt-token'
      },
      message: 'Signup successful'
    };
  }

  async forgotPassword(email: string): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    return {
      success: true,
      data: { message: 'Password reset email sent' },
      message: 'Password reset email sent'
    };
  }

  async verifyOTP(data: OTPForm): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    return {
      success: true,
      data: { message: 'OTP verified successfully' },
      message: 'OTP verified successfully'
    };
  }

  async logout(): Promise<ApiResponse<{ message: string }>> {
    await delay(200);
    return {
      success: true,
      data: { message: 'Logged out successfully' }
    };
  }

  // Products
  async getProducts(page = 1, limit = 10): Promise<PaginatedResponse<Product>> {
    await delay(300);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: mockProducts.slice(start, end),
      total: mockProducts.length,
      page,
      limit,
      totalPages: Math.ceil(mockProducts.length / limit)
    };
  }

  async getProduct(id: string): Promise<ApiResponse<Product>> {
    await delay(200);
    const product = mockProducts.find(p => p.id === id);
    if (!product) {
      throw new Error('Product not found');
    }
    
    return {
      success: true,
      data: product,
      message: 'Product retrieved successfully'
    };
  }

  async createProduct(data: any): Promise<ApiResponse<Product>> {
    await delay(500);
    
    const newProduct: Product = {
      id: Date.now().toString(),
      name: data.name,
      sku: data.sku,
      category: data.category,
      unitOfMeasure: data.unitOfMeasure || data.unit_of_measure,
      unitCost: data.unitCost || data.unit_cost,
      stockQuantity: data.stockQuantity || data.stock_quantity,
      reorderLevel: data.reorderLevel || data.reorder_level,
      description: data.description,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockProducts.push(newProduct);
    
    return {
      success: true,
      data: newProduct,
      message: 'Product created successfully'
    };
  }

  // Work Centers
  async getWorkCenters(page = 1, limit = 10): Promise<PaginatedResponse<WorkCenter>> {
    await delay(300);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: mockWorkCenters.slice(start, end),
      total: mockWorkCenters.length,
      page,
      limit,
      totalPages: Math.ceil(mockWorkCenters.length / limit)
    };
  }

  async getWorkCenter(id: string): Promise<ApiResponse<WorkCenter>> {
    await delay(200);
    const workCenter = mockWorkCenters.find(wc => wc.id === id);
    if (!workCenter) {
      throw new Error('Work center not found');
    }
    
    return {
      success: true,
      data: workCenter,
      message: 'Work center retrieved successfully'
    };
  }

  async createWorkCenter(data: CreateWorkCenterForm): Promise<ApiResponse<WorkCenter>> {
    await delay(500);
    
    const newWorkCenter: WorkCenter = {
      id: Date.now().toString(),
      name: data.name,
      code: data.code,
      capacity: data.capacity,
      costPerHour: data.costPerHour,
      efficiency: data.efficiency,
      description: data.description,
      isActive: data.isActive,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockWorkCenters.push(newWorkCenter);
    
    return {
      success: true,
      data: newWorkCenter,
      message: 'Work center created successfully'
    };
  }

  async updateWorkCenter(id: string, data: UpdateWorkCenterForm): Promise<ApiResponse<WorkCenter>> {
    await delay(500);
    
    const workCenterIndex = mockWorkCenters.findIndex(wc => wc.id === id);
    if (workCenterIndex === -1) {
      throw new Error('Work center not found');
    }
    
    mockWorkCenters[workCenterIndex] = {
      ...mockWorkCenters[workCenterIndex],
      ...data,
      updatedAt: new Date()
    };
    
    return {
      success: true,
      data: mockWorkCenters[workCenterIndex],
      message: 'Work center updated successfully'
    };
  }

  async deleteWorkCenter(id: string): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    
    const workCenterIndex = mockWorkCenters.findIndex(wc => wc.id === id);
    if (workCenterIndex === -1) {
      throw new Error('Work center not found');
    }
    
    mockWorkCenters.splice(workCenterIndex, 1);
    
    return {
      success: true,
      data: { message: 'Work center deleted successfully' },
      message: 'Work center deleted successfully'
    };
  }

  // BOMs
  async getBOMs(): Promise<ApiResponse<BOM[]>> {
    await delay(300);
    return {
      success: true,
      data: mockBOMs,
      message: 'BOMs retrieved successfully'
    };
  }

  async getBOM(id: string): Promise<ApiResponse<BOM>> {
    await delay(200);
    const bom = mockBOMs.find(b => b.id === id);
    if (!bom) {
      throw new Error('BOM not found');
    }
    
    return {
      success: true,
      data: bom,
      message: 'BOM retrieved successfully'
    };
  }

  async createBOM(data: any): Promise<ApiResponse<BOM>> {
    await delay(500);
    
    // Find the product for this BOM
    const product = mockProducts.find(p => p.id === data.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const newBOM: BOM = {
      id: Date.now().toString(),
      name: data.name,
      productId: data.productId,
      product: product,
      version: data.version || '1.0',
      components: data.components || [],
      operations: data.operations || [],
      isActive: data.isActive !== undefined ? data.isActive : true,
      totalCost: data.totalCost || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockBOMs.push(newBOM);
    
    return {
      success: true,
      data: newBOM,
      message: 'BOM created successfully'
    };
  }

  async updateBOM(id: string, data: any): Promise<ApiResponse<BOM>> {
    await delay(500);
    
    const bomIndex = mockBOMs.findIndex(b => b.id === id);
    if (bomIndex === -1) {
      throw new Error('BOM not found');
    }
    
    mockBOMs[bomIndex] = {
      ...mockBOMs[bomIndex],
      ...data,
      updatedAt: new Date()
    };
    
    return {
      success: true,
      data: mockBOMs[bomIndex],
      message: 'BOM updated successfully'
    };
  }

  async deleteBOM(id: string): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    
    const bomIndex = mockBOMs.findIndex(b => b.id === id);
    if (bomIndex === -1) {
      throw new Error('BOM not found');
    }
    
    mockBOMs.splice(bomIndex, 1);
    
    return {
      success: true,
      data: { message: 'BOM deleted successfully' },
      message: 'BOM deleted successfully'
    };
  }

  // Manufacturing Orders
  async getManufacturingOrders(page = 1, limit = 10): Promise<PaginatedResponse<ManufacturingOrder>> {
    await delay(300);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: mockManufacturingOrders.slice(start, end),
      total: mockManufacturingOrders.length,
      page,
      limit,
      totalPages: Math.ceil(mockManufacturingOrders.length / limit)
    };
  }

  async getManufacturingOrder(id: string): Promise<ApiResponse<ManufacturingOrder>> {
    await delay(200);
    const order = mockManufacturingOrders.find(mo => mo.id === id);
    if (!order) {
      throw new Error('Manufacturing order not found');
    }
    
    return {
      success: true,
      data: order,
      message: 'Manufacturing order retrieved successfully'
    };
  }

  async createManufacturingOrder(data: any): Promise<ApiResponse<ManufacturingOrder>> {
    await delay(500);
    
    const product = mockProducts.find(p => p.id === data.productId);
    if (!product) {
      throw new Error('Product not found');
    }
    
    const bom = data.bomId ? mockBOMs.find(b => b.id === data.bomId) : undefined;
    
    const newOrder: ManufacturingOrder = {
      id: Date.now().toString(),
      orderNumber: `MO-${String(mockManufacturingOrders.length + 1).padStart(3, '0')}`,
      productId: data.productId,
      product: product,
      bomId: data.bomId,
      bom: bom || ({} as BOM),
      quantity: data.quantity,
      status: 'Planned',
      priority: data.priority,
      plannedStartDate: new Date(data.plannedStartDate),
      plannedEndDate: new Date(data.plannedEndDate),
      notes: data.notes,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockManufacturingOrders.push(newOrder);
    
    return {
      success: true,
      data: newOrder,
      message: 'Manufacturing order created successfully'
    };
  }

  async updateManufacturingOrder(id: string, data: any): Promise<ApiResponse<ManufacturingOrder>> {
    await delay(500);
    
    const orderIndex = mockManufacturingOrders.findIndex(mo => mo.id === id);
    if (orderIndex === -1) {
      throw new Error('Manufacturing order not found');
    }
    
    mockManufacturingOrders[orderIndex] = {
      ...mockManufacturingOrders[orderIndex],
      ...data,
      updatedAt: new Date()
    };
    
    return {
      success: true,
      data: mockManufacturingOrders[orderIndex],
      message: 'Manufacturing order updated successfully'
    };
  }

  async deleteManufacturingOrder(id: string): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    
    const orderIndex = mockManufacturingOrders.findIndex(mo => mo.id === id);
    if (orderIndex === -1) {
      throw new Error('Manufacturing order not found');
    }
    
    mockManufacturingOrders.splice(orderIndex, 1);
    
    return {
      success: true,
      data: { message: 'Manufacturing order deleted successfully' },
      message: 'Manufacturing order deleted successfully'
    };
  }

  // Work Orders
  async getWorkOrders(page = 1, limit = 10): Promise<PaginatedResponse<WorkOrder>> {
    await delay(300);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: mockWorkOrders.slice(start, end),
      total: mockWorkOrders.length,
      page,
      limit,
      totalPages: Math.ceil(mockWorkOrders.length / limit)
    };
  }

  async getWorkOrder(id: string): Promise<ApiResponse<WorkOrder>> {
    await delay(200);
    const workOrder = mockWorkOrders.find(wo => wo.id === id);
    if (!workOrder) {
      throw new Error('Work order not found');
    }
    
    return {
      success: true,
      data: workOrder,
      message: 'Work order retrieved successfully'
    };
  }

  async createWorkOrder(data: CreateWorkOrderForm): Promise<ApiResponse<WorkOrder>> {
    await delay(500);
    
    const newWorkOrder: WorkOrder = {
      id: Date.now().toString(),
      workOrderNumber: `WO-${String(mockWorkOrders.length + 1).padStart(3, '0')}`,
      manufacturingOrderId: data.manufacturingOrderId,
      manufacturingOrder: mockManufacturingOrders.find(mo => mo.id === data.manufacturingOrderId) || mockManufacturingOrders[0],
      bomOperationId: data.bomOperationId,
      bomOperation: {
        id: data.bomOperationId,
        workCenterId: '1',
        workCenter: mockWorkCenters[0],
        sequence: 1,
        description: 'Mock Operation',
        duration: data.plannedDuration,
        setupTime: 10,
        costPerHour: 50
      },
      status: 'Ready',
      assignedOperatorId: data.assignedOperatorId,
      assignedOperator: data.assignedOperatorId ? mockUsers.find(u => u.id === data.assignedOperatorId) : undefined,
      plannedDuration: data.plannedDuration,
      comments: data.comments,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    mockWorkOrders.push(newWorkOrder);
    
    return {
      success: true,
      data: newWorkOrder,
      message: 'Work order created successfully'
    };
  }

  async updateWorkOrder(id: string, data: Partial<CreateWorkOrderForm>): Promise<ApiResponse<WorkOrder>> {
    await delay(500);
    
    const workOrderIndex = mockWorkOrders.findIndex(wo => wo.id === id);
    if (workOrderIndex === -1) {
      throw new Error('Work order not found');
    }
    
    mockWorkOrders[workOrderIndex] = {
      ...mockWorkOrders[workOrderIndex],
      ...data,
      updatedAt: new Date()
    };
    
    return {
      success: true,
      data: mockWorkOrders[workOrderIndex],
      message: 'Work order updated successfully'
    };
  }

  async deleteWorkOrder(id: string): Promise<ApiResponse<{ message: string }>> {
    await delay(500);
    
    const workOrderIndex = mockWorkOrders.findIndex(wo => wo.id === id);
    if (workOrderIndex === -1) {
      throw new Error('Work order not found');
    }
    
    mockWorkOrders.splice(workOrderIndex, 1);
    
    return {
      success: true,
      data: { message: 'Work order deleted successfully' },
      message: 'Work order deleted successfully'
    };
  }

  // Stock Moves
  async getStockMoves(page = 1, limit = 10): Promise<PaginatedResponse<StockMove>> {
    await delay(300);
    return {
      data: [],
      total: 0,
      page,
      limit,
      totalPages: 0
    };
  }

  // Dashboard KPIs
  async getDashboardKPIs(): Promise<ApiResponse<any>> {
    await delay(300);
    return {
      success: true,
      data: {
        totalOrders: mockManufacturingOrders.length,
        completedOrders: mockManufacturingOrders.filter(mo => mo.status === 'Done').length,
        efficiency: 85,
        onTimeDelivery: 92
      },
      message: 'KPIs retrieved successfully'
    };
  }

  // Users
  async getUsers(page = 1, limit = 10): Promise<PaginatedResponse<User>> {
    await delay(300);
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: mockUsers.slice(start, end),
      total: mockUsers.length,
      page,
      limit,
      totalPages: Math.ceil(mockUsers.length / limit)
    };
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    await delay(200);
    return {
      success: true,
      data: mockUsers[0],
      message: 'Current user retrieved successfully'
    };
  }
}

// Export singleton instance
export const apiService = new MockApiService();
