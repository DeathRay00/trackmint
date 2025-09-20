import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { 
  ArrowLeft,
  Save,
  Factory,
  Package,
  Calendar as CalendarIcon,
  User,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/use-toast';
import { format } from 'date-fns';
import type { ManufacturingOrder, Product, BOM, User as UserType } from '../types';

interface ManufacturingOrderFormData {
  productId: string;
  bomId: string;
  quantity: number;
  priority: string;
  status: string;
  plannedStartDate: Date;
  plannedEndDate: Date;
  actualStartDate: Date | null;
  actualEndDate: Date | null;
  assignedToId: string;
  notes: string;
}

export const ManufacturingOrderEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [manufacturingOrder, setManufacturingOrder] = useState<ManufacturingOrder | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [formData, setFormData] = useState<ManufacturingOrderFormData>({
    productId: '',
    bomId: '',
    quantity: 1,
    priority: 'Medium',
    status: 'Planned',
    plannedStartDate: new Date(),
    plannedEndDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    actualStartDate: null,
    actualEndDate: null,
    assignedToId: '',
    notes: ''
  });
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      
      try {
        const [orderResponse, productsResponse, bomsResponse] = await Promise.all([
          apiService.getManufacturingOrder(id),
          apiService.getProducts(1, 100),
          apiService.getBOMs()
        ]);
        
        const order = orderResponse.data;
        setManufacturingOrder(order);
        setProducts(productsResponse.data);
        setBoms(bomsResponse.data);
        
        // Load users (mock data for now)
        setUsers([
          { id: '1', firstName: 'John', lastName: 'Doe', email: 'john@example.com', role: 'ManufacturingManager', createdAt: new Date(), updatedAt: new Date() },
          { id: '2', firstName: 'Jane', lastName: 'Smith', email: 'jane@example.com', role: 'ManufacturingManager', createdAt: new Date(), updatedAt: new Date() }
        ]);
        
        setFormData({
          productId: order.product.id,
          bomId: order.bom?.id || '',
          quantity: order.quantity,
          priority: order.priority,
          status: order.status,
          plannedStartDate: order.plannedStartDate,
          plannedEndDate: order.plannedEndDate,
          actualStartDate: order.actualStartDate,
          actualEndDate: order.actualEndDate,
          assignedToId: order.assignedTo?.id || '',
          notes: order.notes || ''
        });
        
        setSelectedProduct(order.product);
        setSelectedBOM(order.bom || null);
        
      } catch (error) {
        console.error('Failed to load data:', error);
        toast({
          title: "Error",
          description: "Failed to load manufacturing order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, toast]);

  const handleInputChange = (field: keyof ManufacturingOrderFormData, value: string | number | Date | null) => {
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

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !validateForm()) {
      return;
    }

    setSaving(true);
    try {
      const orderData = {
        productId: formData.productId,
        bomId: formData.bomId,
        quantity: formData.quantity,
        priority: formData.priority,
        status: formData.status,
        plannedStartDate: formData.plannedStartDate.toISOString(),
        plannedEndDate: formData.plannedEndDate.toISOString(),
        actualStartDate: formData.actualStartDate?.toISOString(),
        actualEndDate: formData.actualEndDate?.toISOString(),
        assignedToId: formData.assignedToId || undefined,
        notes: formData.notes
      };
      
      await apiService.updateManufacturingOrder(id, orderData);
      
      toast({
        title: "Success",
        description: "Manufacturing order updated successfully"
      });
      
      navigate(`/manufacturing-orders/${id}`);
    } catch (error) {
      console.error('Failed to update manufacturing order:', error);
      toast({
        title: "Error",
        description: "Failed to update manufacturing order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Factory className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading manufacturing order...</p>
        </div>
      </div>
    );
  }

  if (!manufacturingOrder) {
    return (
      <div className="text-center py-8">
        <Factory className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Manufacturing order not found</h3>
        <p className="text-muted-foreground mb-4">
          The manufacturing order you're trying to edit doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link to="/manufacturing-orders">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Manufacturing Orders
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/manufacturing-orders/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Manufacturing Order
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Manufacturing Order</h1>
          <p className="text-muted-foreground">
            Update manufacturing order details and schedule
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
                Update the basic details for the manufacturing order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="productId">Product *</Label>
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
                <Label htmlFor="bomId">BOM *</Label>
                <Select 
                  value={formData.bomId} 
                  onValueChange={handleBOMChange}
                  disabled={!selectedProduct}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a BOM" />
                  </SelectTrigger>
                  <SelectContent>
                    {getAvailableBOMs().map(bom => (
                      <SelectItem key={bom.id} value={bom.id}>
                        {bom.name} (v{bom.version})
                      </SelectItem>
                    ))}
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

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Planned">Planned</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                    <SelectItem value="Canceled">Canceled</SelectItem>
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
                Update the production schedule and assignment
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
                <Label>Actual Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.actualStartDate ? format(formData.actualStartDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.actualStartDate}
                      onSelect={(date) => handleInputChange('actualStartDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Actual End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.actualEndDate ? format(formData.actualEndDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.actualEndDate}
                      onSelect={(date) => handleInputChange('actualEndDate', date)}
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

        {/* Order Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Order Summary
            </CardTitle>
            <CardDescription>
              Review the updated manufacturing order details
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
                  <p><strong>Status:</strong> {formData.status}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Schedule</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Planned Start:</strong> {format(formData.plannedStartDate, "PPP")}</p>
                  <p><strong>Planned End:</strong> {format(formData.plannedEndDate, "PPP")}</p>
                  <p><strong>Actual Start:</strong> {formData.actualStartDate ? format(formData.actualStartDate, "PPP") : 'Not started'}</p>
                  <p><strong>Actual End:</strong> {formData.actualEndDate ? format(formData.actualEndDate, "PPP") : 'Not completed'}</p>
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
            onClick={() => navigate(`/manufacturing-orders/${id}`)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
