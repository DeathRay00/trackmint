import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { 
  ArrowLeft,
  Save,
  Factory,
  Package,
  Calendar as CalendarIcon,
  User,
  AlertCircle,
  CheckCircle,
  Plus,
  X
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import type { Product, BOM, User as UserType } from '../types';

interface ManufacturingOrderFormData {
  productId: string;
  bomId: string;
  quantity: number;
  priority: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  assignedToId: string;
  notes: string;
}

export const ManufacturingOrderNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState<ManufacturingOrderFormData>({
    productId: '',
    bomId: '',
    quantity: 1,
    priority: 'Medium',
    plannedStartDate: new Date(),
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    assignedToId: '',
    notes: ''
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);
  const [componentAvailability, setComponentAvailability] = useState<boolean>(true);
  
  // Modal states
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [showNewBOMModal, setShowNewBOMModal] = useState(false);
  
  // New product form
  const [newProduct, setNewProduct] = useState({
    name: '',
    sku: '',
    category: '',
    unitOfMeasure: '',
    unitCost: 0,
    stockQuantity: 0,
    reorderLevel: 0,
    description: ''
  });
  
  // New BOM form
  const [newBOM, setNewBOM] = useState({
    name: '',
    version: '1.0',
    description: '',
    isActive: true
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, bomsResponse] = await Promise.all([
          apiService.getProducts(1, 100),
          apiService.getBOMs()
        ]);
        setProducts(productsResponse.data);
        setBoms(bomsResponse.data);
        
        // Load users (mock data for now)
        setUsers([
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ManufacturingManager', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'ManufacturingManager', createdAt: new Date(), updatedAt: new Date() }
        ]);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof ManufacturingOrderFormData, value: string | number | Date) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    setSelectedProduct(product || null);
    setFormData(prev => ({ ...prev, productId, bomId: '' }));
    setSelectedBOM(null);
  };

  const handleBOMChange = (bomId: string) => {
    const bom = boms.find(b => b.id === bomId);
    setSelectedBOM(bom || null);
    setFormData(prev => ({ ...prev, bomId }));
    
    // Check component availability
    if (bom && bom.components) {
      const hasInsufficientStock = bom.components.some(comp => 
        comp.product.stockQuantity < (comp.quantity * formData.quantity)
      );
      setComponentAvailability(!hasInsufficientStock);
    }
  };

  const validateForm = () => {
    if (!formData.productId) {
      toast({
        title: "Validation Error",
        description: "Product selection is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.bomId) {
      toast({
        title: "Validation Error",
        description: "BOM selection is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.quantity <= 0) {
      toast({
        title: "Validation Error",
        description: "Quantity must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    if (formData.plannedEndDate <= formData.plannedStartDate) {
      toast({
        title: "Validation Error",
        description: "End date must be after start date",
        variant: "destructive"
      });
      return false;
    }

    if (!componentAvailability) {
      toast({
        title: "Insufficient Stock",
        description: "Some components don't have enough stock for this quantity",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        productId: formData.productId,
        bomId: formData.bomId,
        quantity: formData.quantity,
        priority: formData.priority,
        plannedStartDate: formData.plannedStartDate.toISOString(),
        plannedEndDate: formData.plannedEndDate.toISOString(),
        assignedToId: formData.assignedToId || undefined,
        notes: formData.notes
      };
      
      await apiService.createManufacturingOrder(orderData);
      
      toast({
        title: "Success",
        description: "Manufacturing order created successfully"
      });
      
      navigate('/manufacturing-orders');
    } catch (error) {
      console.error('Failed to create manufacturing order:', error);
      toast({
        title: "Error",
        description: "Failed to create manufacturing order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAvailableBOMs = () => {
    if (!selectedProduct) return [];
    return boms.filter(bom => bom.productId === selectedProduct.id && bom.isActive);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'text-red-600';
      case 'High': return 'text-orange-600';
      case 'Medium': return 'text-yellow-600';
      case 'Low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const handleCreateProduct = async () => {
    try {
      const productData = {
        ...newProduct,
        unitCost: parseFloat(newProduct.unitCost.toString()),
        stockQuantity: parseFloat(newProduct.stockQuantity.toString()),
        reorderLevel: parseFloat(newProduct.reorderLevel.toString())
      };
      
      const response = await apiService.createProduct(productData);
      const createdProduct = response.data;
      
      // Add to products list
      setProducts(prev => [...prev, createdProduct]);
      
      // Select the new product
      setFormData(prev => ({ ...prev, productId: createdProduct.id }));
      setSelectedProduct(createdProduct);
      
      // Reset form
      setNewProduct({
        name: '',
        sku: '',
        category: '',
        unitOfMeasure: '',
        unitCost: 0,
        stockQuantity: 0,
        reorderLevel: 0,
        description: ''
      });
      
      setShowNewProductModal(false);
      
      toast({
        title: "Success",
        description: "Product created successfully"
      });
    } catch (error) {
      console.error('Failed to create product:', error);
      const errorMessage = error instanceof Error ? error.message : "Failed to create product. Please try again.";
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleCreateBOM = async () => {
    if (!selectedProduct) {
      toast({
        title: "Error",
        description: "Please select a product first",
        variant: "destructive"
      });
      return;
    }

    try {
      const bomData = {
        ...newBOM,
        productId: selectedProduct.id,
        totalCost: 0 // Will be calculated when components/operations are added
      };
      
      const response = await apiService.createBOM(bomData);
      const createdBOM = response.data;
      
      // Add to BOMs list
      setBoms(prev => [...prev, createdBOM]);
      
      // Select the new BOM
      setFormData(prev => ({ ...prev, bomId: createdBOM.id }));
      setSelectedBOM(createdBOM);
      
      // Reset form
      setNewBOM({
        name: '',
        version: '1.0',
        description: '',
        isActive: true
      });
      
      setShowNewBOMModal(false);
      
      toast({
        title: "Success",
        description: "BOM created successfully. You can add components and operations later."
      });
    } catch (error) {
      console.error('Failed to create BOM:', error);
      toast({
        title: "Error",
        description: "Failed to create BOM. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/manufacturing-orders')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Manufacturing Orders
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Manufacturing Order</h1>
          <p className="text-muted-foreground">
            Create a new manufacturing order for production
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>
                Enter the basic details for the manufacturing order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="productId">Product *</Label>
                  <Dialog open={showNewProductModal} onOpenChange={setShowNewProductModal}>
                    <DialogTrigger asChild>
                      <Button type="button" variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New Product</DialogTitle>
                        <DialogDescription>
                          Add a new product to the system
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newProductName">Product Name *</Label>
                          <Input
                            id="newProductName"
                            value={newProduct.name}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter product name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newProductSKU">SKU *</Label>
                          <Input
                            id="newProductSKU"
                            value={newProduct.sku}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                            placeholder="Enter SKU"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newProductCategory">Category *</Label>
                            <Input
                              id="newProductCategory"
                              value={newProduct.category}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                              placeholder="Category"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newProductUOM">Unit of Measure *</Label>
                            <Input
                              id="newProductUOM"
                              value={newProduct.unitOfMeasure}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, unitOfMeasure: e.target.value }))}
                              placeholder="e.g., pcs, kg, meters, liters"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newProductCost">Unit Cost *</Label>
                            <Input
                              id="newProductCost"
                              type="number"
                              step="0.01"
                              value={newProduct.unitCost}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newProductStock">Stock Qty *</Label>
                            <Input
                              id="newProductStock"
                              type="number"
                              value={newProduct.stockQuantity}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, stockQuantity: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newProductReorder">Reorder Level</Label>
                            <Input
                              id="newProductReorder"
                              type="number"
                              value={newProduct.reorderLevel}
                              onChange={(e) => setNewProduct(prev => ({ ...prev, reorderLevel: parseFloat(e.target.value) || 0 }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newProductDescription">Description</Label>
                          <Textarea
                            id="newProductDescription"
                            value={newProduct.description}
                            onChange={(e) => setNewProduct(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter product description"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowNewProductModal(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleCreateProduct}>
                            Create Product
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select value={formData.productId} onValueChange={handleProductChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(product => (
                      <SelectItem key={product.id} value={product.id}>
                        {product.name} ({product.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedProduct && (
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Category:</strong> {selectedProduct.category}</p>
                    <p><strong>Stock:</strong> {selectedProduct.stockQuantity} {selectedProduct.unitOfMeasure}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bomId">BOM *</Label>
                  <Dialog open={showNewBOMModal} onOpenChange={setShowNewBOMModal}>
                    <DialogTrigger asChild>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        disabled={!selectedProduct}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add New
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Create New BOM</DialogTitle>
                        <DialogDescription>
                          Add a new BOM for {selectedProduct?.name || 'the selected product'}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="newBOMName">BOM Name *</Label>
                          <Input
                            id="newBOMName"
                            value={newBOM.name}
                            onChange={(e) => setNewBOM(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter BOM name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="newBOMVersion">Version *</Label>
                            <Input
                              id="newBOMVersion"
                              value={newBOM.version}
                              onChange={(e) => setNewBOM(prev => ({ ...prev, version: e.target.value }))}
                              placeholder="e.g., 1.0"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="newBOMStatus">Status</Label>
                            <Select 
                              value={newBOM.isActive ? 'active' : 'inactive'}
                              onValueChange={(value) => setNewBOM(prev => ({ ...prev, isActive: value === 'active' }))}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="newBOMDescription">Description</Label>
                          <Textarea
                            id="newBOMDescription"
                            value={newBOM.description}
                            onChange={(e) => setNewBOM(prev => ({ ...prev, description: e.target.value }))}
                            placeholder="Enter BOM description"
                            rows={3}
                          />
                        </div>
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" onClick={() => setShowNewBOMModal(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleCreateBOM}>
                            Create BOM
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <Select 
                  value={formData.bomId} 
                  onValueChange={handleBOMChange}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a BOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableBOMs().length > 0 ? (
                      getAvailableBOMs().map(bom => (
                        <SelectItem key={bom.id} value={bom.id}>
                          {bom.name} (v{bom.version})
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-sm text-muted-foreground text-center">
                        No BOMs available for this product
                      </div>
                    )}
                  </SelectContent>
                </Select>
                {selectedBOM && (
                  <div className="text-sm text-muted-foreground">
                    <p><strong>Components:</strong> {selectedBOM.components?.length || 0}</p>
                    <p><strong>Operations:</strong> {selectedBOM.operations?.length || 0}</p>
                    <p><strong>Total Cost:</strong> ${selectedBOM.totalCost.toFixed(2)}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity *</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  value={formData.quantity}
                  onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority</Label>
                <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling & Assignment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Scheduling & Assignment
              </CardTitle>
              <CardDescription>
                Set the production schedule and assign responsibility
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Planned Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.plannedStartDate ? format(formData.plannedStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.plannedStartDate}
                      onSelect={(date) => date && handleInputChange('plannedStartDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Planned End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.plannedEndDate ? format(formData.plannedEndDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.plannedEndDate}
                      onSelect={(date) => date && handleInputChange('plannedEndDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedToId">Assigned To</Label>
                <Select value={formData.assignedToId} onValueChange={(value) => handleInputChange('assignedToId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select assignee" />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.firstName} {user.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Enter any additional notes or instructions..."
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Component Availability Check */}
        {selectedBOM && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {componentAvailability ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                Component Availability
              </CardTitle>
              <CardDescription>
                Check if all required components are available in stock
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedBOM.components && selectedBOM.components.length > 0 ? (
                <div className="space-y-2">
                  {selectedBOM.components.map((component) => {
                    const requiredQuantity = component.quantity * formData.quantity;
                    const availableQuantity = component.product.stockQuantity;
                    const isAvailable = availableQuantity >= requiredQuantity;
                    
                    return (
                      <div key={component.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{component.product.name}</div>
                          <div className="text-sm text-muted-foreground">{component.product.sku}</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">
                              {requiredQuantity} needed
                            </span>
                            <span className="text-sm text-muted-foreground">
                              ({availableQuantity} available)
                            </span>
                            {isAvailable ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertCircle className="h-4 w-4 text-red-600" />
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-muted-foreground">No components defined for this BOM.</p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>
              Review the manufacturing order details before creating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Order Details</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Product:</strong> {selectedProduct?.name || 'Not selected'}</p>
                  <p><strong>BOM:</strong> {selectedBOM?.name || 'Not selected'}</p>
                  <p><strong>Quantity:</strong> {formData.quantity}</p>
                  <p><strong>Priority:</strong> <span className={getPriorityColor(formData.priority)}>{formData.priority}</span></p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Schedule</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Start Date:</strong> {format(formData.plannedStartDate, "PPP")}</p>
                  <p><strong>End Date:</strong> {format(formData.plannedEndDate, "PPP")}</p>
                  <p><strong>Duration:</strong> {Math.ceil((formData.plannedEndDate.getTime() - formData.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24))} days</p>
                  <p><strong>Assigned To:</strong> {users.find(u => u.id === formData.assignedToId)?.firstName + ' ' + users.find(u => u.id === formData.assignedToId)?.lastName || 'Unassigned'}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/manufacturing-orders')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading || !componentAvailability}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Manufacturing Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
