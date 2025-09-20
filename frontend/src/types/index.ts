// Core types for Trackmint Manufacturing Management System

export type Role = 'Admin' | 'ManufacturingManager' | 'Operator' | 'InventoryManager';

export type OrderStatus = 'Planned' | 'In Progress' | 'Done' | 'Canceled';
export type WorkOrderStatus = 'Ready' | 'Started' | 'Paused' | 'Completed';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitOfMeasure: string;
  unitCost: number;
  stockQuantity: number;
  reorderLevel: number;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BOMComponent {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitCost: number;
}

export interface BOMOperation {
  id: string;
  workCenterId: string;
  workCenter: WorkCenter;
  sequence: number;
  description: string;
  duration: number; // in minutes
  setupTime: number; // in minutes
  costPerHour: number;
}

export interface BOM {
  id: string;
  name: string;
  productId: string;
  product: Product;
  version: string;
  components: BOMComponent[];
  operations: BOMOperation[];
  isActive: boolean;
  totalCost: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkCenter {
  id: string;
  name: string;
  code: string;
  capacity: number; // hours per day
  costPerHour: number;
  efficiency: number; // percentage
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ManufacturingOrder {
  id: string;
  orderNumber: string;
  productId: string;
  product: Product;
  bomId: string;
  bom: BOM;
  quantity: number;
  status: OrderStatus;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate?: Date;
  actualEndDate?: Date;
  assignedTo?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkOrder {
  id: string;
  workOrderNumber: string;
  manufacturingOrderId: string;
  manufacturingOrder: ManufacturingOrder;
  bomOperationId: string;
  bomOperation: BOMOperation;
  status: WorkOrderStatus;
  assignedOperatorId?: string;
  assignedOperator?: User;
  plannedDuration: number; // in minutes
  actualDuration?: number; // in minutes
  startTime?: Date;
  endTime?: Date;
  comments?: string;
  issues?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMove {
  id: string;
  productId: string;
  product: Product;
  moveType: 'In' | 'Out' | 'Transfer' | 'Adjustment';
  quantity: number;
  unitCost: number;
  reference?: string; // MO or WO reference
  referenceType?: 'MO' | 'WO';
  location?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface KPI {
  label: string;
  value: number;
  change: number; // percentage change
  trend: 'up' | 'down' | 'stable';
  format: 'number' | 'percentage' | 'currency' | 'duration';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

export interface AppState {
  auth: AuthState;
  users: User[];
  products: Product[];
  boms: BOM[];
  workCenters: WorkCenter[];
  manufacturingOrders: ManufacturingOrder[];
  workOrders: WorkOrder[];
  stockMoves: StockMove[];
  loading: boolean;
  error: string | null;
}

// API Response types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface OTPForm {
  email: string;
  otp: string;
}

export interface CreateManufacturingOrderForm {
  productId: string;
  bomId: string;
  quantity: number;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  plannedStartDate: string;
  plannedEndDate: string;
  notes?: string;
}

export interface CreateWorkOrderForm {
  manufacturingOrderId: string;
  bomOperationId: string;
  assignedOperatorId?: string;
  plannedDuration: number;
  comments?: string;
}

export interface CreateWorkCenterForm {
  name: string;
  code: string;
  capacity: number;
  costPerHour: number;
  efficiency: number;
  description?: string;
  isActive: boolean;
}

export interface UpdateWorkCenterForm {
  name?: string;
  code?: string;
  capacity?: number;
  costPerHour?: number;
  efficiency?: number;
  description?: string;
  isActive?: boolean;
}