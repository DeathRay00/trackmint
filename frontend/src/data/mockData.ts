import type { 
  User, 
  Product, 
  WorkCenter, 
  BOM, 
  BOMComponent, 
  BOMOperation, 
  ManufacturingOrder, 
  WorkOrder, 
  StockMove 
} from '../types';

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@trackmint.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'Admin',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '2',
    email: 'manager@trackmint.com',
    firstName: 'Jane',
    lastName: 'Smith',
    role: 'ManufacturingManager',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '3',
    email: 'operator@trackmint.com',
    firstName: 'Mike',
    lastName: 'Johnson',
    role: 'Operator',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: '4',
    email: 'inventory@trackmint.com',
    firstName: 'Sarah',
    lastName: 'Wilson',
    role: 'InventoryManager',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Products - Wooden Table components
export const mockProducts: Product[] = [
  {
    id: 'p1',
    name: 'Wooden Table',
    sku: 'WT-001',
    category: 'Finished Goods',
    unitOfMeasure: 'Each',
    unitCost: 120.00,
    stockQuantity: 15,
    reorderLevel: 5,
    description: 'Handcrafted wooden dining table',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'p2',
    name: 'Table Legs',
    sku: 'TL-001',
    category: 'Components',
    unitOfMeasure: 'Each',
    unitCost: 15.00,
    stockQuantity: 50,
    reorderLevel: 20,
    description: 'Solid wood table legs',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'p3',
    name: 'Table Top',
    sku: 'TT-001',
    category: 'Components',
    unitOfMeasure: 'Each',
    unitCost: 35.00,
    stockQuantity: 25,
    reorderLevel: 10,
    description: 'Wooden table top surface',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'p4',
    name: 'Wood Screws',
    sku: 'WS-001',
    category: 'Hardware',
    unitOfMeasure: 'Pack',
    unitCost: 2.50,
    stockQuantity: 100,
    reorderLevel: 30,
    description: 'Wood screws for assembly',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'p5',
    name: 'Wood Varnish',
    sku: 'WV-001',
    category: 'Materials',
    unitOfMeasure: 'Liter',
    unitCost: 12.00,
    stockQuantity: 20,
    reorderLevel: 5,
    description: 'Clear wood varnish finish',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Work Centers
export const mockWorkCenters: WorkCenter[] = [
  {
    id: 'wc1',
    name: 'Assembly Station',
    code: 'ASM-01',
    capacity: 8,
    costPerHour: 25.00,
    efficiency: 85,
    description: 'Main assembly workstation',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'wc2',
    name: 'Painting Station',
    code: 'PNT-01',
    capacity: 6,
    costPerHour: 20.00,
    efficiency: 90,
    description: 'Painting and finishing station',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'wc3',
    name: 'Packing Station',
    code: 'PCK-01',
    capacity: 8,
    costPerHour: 15.00,
    efficiency: 95,
    description: 'Final packing and shipping prep',
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock BOM Components
export const mockBOMComponents: BOMComponent[] = [
  {
    id: 'bc1',
    productId: 'p2',
    product: mockProducts[1], // Table Legs
    quantity: 4,
    unitCost: 15.00,
  },
  {
    id: 'bc2',
    productId: 'p3',
    product: mockProducts[2], // Table Top
    quantity: 1,
    unitCost: 35.00,
  },
  {
    id: 'bc3',
    productId: 'p4',
    product: mockProducts[3], // Wood Screws
    quantity: 2,
    unitCost: 2.50,
  },
  {
    id: 'bc4',
    productId: 'p5',
    product: mockProducts[4], // Wood Varnish
    quantity: 0.5,
    unitCost: 12.00,
  },
];

// Mock BOM Operations
export const mockBOMOperations: BOMOperation[] = [
  {
    id: 'bo1',
    workCenterId: 'wc1',
    workCenter: mockWorkCenters[0],
    sequence: 1,
    description: 'Assembly of table legs and top',
    duration: 60,
    setupTime: 10,
    costPerHour: 25.00,
  },
  {
    id: 'bo2',
    workCenterId: 'wc2',
    workCenter: mockWorkCenters[1],
    sequence: 2,
    description: 'Apply varnish finish',
    duration: 30,
    setupTime: 5,
    costPerHour: 20.00,
  },
  {
    id: 'bo3',
    workCenterId: 'wc3',
    workCenter: mockWorkCenters[2],
    sequence: 3,
    description: 'Final packing',
    duration: 20,
    setupTime: 5,
    costPerHour: 15.00,
  },
];

// Mock BOMs
export const mockBOMs: BOM[] = [
  {
    id: 'bom1',
    name: 'Wooden Table BOM v1.0',
    productId: 'p1',
    product: mockProducts[0],
    version: '1.0',
    components: mockBOMComponents,
    operations: mockBOMOperations,
    isActive: true,
    totalCost: 125.00,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
];

// Mock Manufacturing Orders
export const mockManufacturingOrders: ManufacturingOrder[] = [
  {
    id: 'mo1',
    orderNumber: 'MO-2024-001',
    productId: 'p1',
    product: mockProducts[0],
    bomId: 'bom1',
    bom: mockBOMs[0],
    quantity: 10,
    status: 'In Progress',
    priority: 'High',
    plannedStartDate: new Date('2024-09-01'),
    plannedEndDate: new Date('2024-09-15'),
    actualStartDate: new Date('2024-09-02'),
    assignedTo: '2',
    notes: 'Rush order for client presentation',
    createdAt: new Date('2024-08-25'),
    updatedAt: new Date('2024-09-02'),
  },
  {
    id: 'mo2',
    orderNumber: 'MO-2024-002',
    productId: 'p1',
    product: mockProducts[0],
    bomId: 'bom1',
    bom: mockBOMs[0],
    quantity: 5,
    status: 'Planned',
    priority: 'Medium',
    plannedStartDate: new Date('2024-09-20'),
    plannedEndDate: new Date('2024-09-30'),
    assignedTo: '2',
    notes: 'Standard production run',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
  {
    id: 'mo3',
    orderNumber: 'MO-2024-003',
    productId: 'p1',
    product: mockProducts[0],
    bomId: 'bom1',
    bom: mockBOMs[0],
    quantity: 15,
    status: 'Done',
    priority: 'Low',
    plannedStartDate: new Date('2024-08-01'),
    plannedEndDate: new Date('2024-08-15'),
    actualStartDate: new Date('2024-08-01'),
    actualEndDate: new Date('2024-08-14'),
    assignedTo: '2',
    notes: 'Completed ahead of schedule',
    createdAt: new Date('2024-07-20'),
    updatedAt: new Date('2024-08-14'),
  },
];

// Mock Work Orders
export const mockWorkOrders: WorkOrder[] = [
  {
    id: 'wo1',
    workOrderNumber: 'WO-2024-001',
    manufacturingOrderId: 'mo1',
    manufacturingOrder: mockManufacturingOrders[0],
    bomOperationId: 'bo1',
    bomOperation: mockBOMOperations[0],
    status: 'Started',
    assignedOperatorId: '3',
    assignedOperator: mockUsers[2],
    plannedDuration: 600, // 10 hours * 60 minutes
    actualDuration: 480, // 8 hours completed
    startTime: new Date('2024-09-02T08:00:00'),
    comments: 'Assembly proceeding smoothly',
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-02'),
  },
  {
    id: 'wo2',
    workOrderNumber: 'WO-2024-002',
    manufacturingOrderId: 'mo1',
    manufacturingOrder: mockManufacturingOrders[0],
    bomOperationId: 'bo2',
    bomOperation: mockBOMOperations[1],
    status: 'Ready',
    plannedDuration: 300, // 5 hours * 60 minutes
    createdAt: new Date('2024-09-01'),
    updatedAt: new Date('2024-09-01'),
  },
];

// Mock Stock Moves
export const mockStockMoves: StockMove[] = [
  {
    id: 'sm1',
    productId: 'p2',
    product: mockProducts[1],
    moveType: 'Out',
    quantity: -40,
    unitCost: 15.00,
    reference: 'MO-2024-001',
    referenceType: 'MO',
    notes: 'Consumed for manufacturing order',
    createdAt: new Date('2024-09-02'),
    updatedAt: new Date('2024-09-02'),
  },
  {
    id: 'sm2',
    productId: 'p3',
    product: mockProducts[2],
    moveType: 'Out',
    quantity: -10,
    unitCost: 35.00,
    reference: 'MO-2024-001',
    referenceType: 'MO',
    notes: 'Consumed for manufacturing order',
    createdAt: new Date('2024-09-02'),
    updatedAt: new Date('2024-09-02'),
  },
  {
    id: 'sm3',
    productId: 'p1',
    product: mockProducts[0],
    moveType: 'In',
    quantity: 15,
    unitCost: 120.00,
    reference: 'MO-2024-003',
    referenceType: 'MO',
    notes: 'Completed manufacturing order',
    createdAt: new Date('2024-08-14'),
    updatedAt: new Date('2024-08-14'),
  },
];

// Helper function to get mock data
export const getMockData = () => ({
  users: mockUsers,
  products: mockProducts,
  workCenters: mockWorkCenters,
  boms: mockBOMs,
  manufacturingOrders: mockManufacturingOrders,
  workOrders: mockWorkOrders,
  stockMoves: mockStockMoves,
});