import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft,
  Save,
  FileText,
  Package,
  Settings,
  Plus,
  Trash2,
  DollarSign
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/use-toast';
import type { Product, WorkCenter } from '../types';

interface BOMFormData {
  name: string;
  productId: string;
  version: string;
  isActive: boolean;
  description: string;
}

interface BOMComponent {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitCost: number;
}

interface BOMOperation {
  id: string;
  workCenterId: string;
  workCenter: WorkCenter;
  sequence: number;
  description: string;
  duration: number;
  setupTime: number;
  costPerHour: number;
}

export const BOMNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [formData, setFormData] = useState<BOMFormData>({
    name: '',
    productId: '',
    version: '1.0',
    isActive: true,
    description: ''
  });
  const [components, setComponents] = useState<BOMComponent[]>([]);
  const [operations, setOperations] = useState<BOMOperation[]>([]);
  const [activeTab, setActiveTab] = useState('basic');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, workCentersResponse] = await Promise.all([
          apiService.getProducts(1, 100),
          apiService.getWorkCenters(1, 100)
        ]);
        setProducts(productsResponse.data);
        setWorkCenters(workCentersResponse.data);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, []);

  const handleInputChange = (field: keyof BOMFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addComponent = () => {
    const newComponent: BOMComponent = {
      id: Date.now().toString(),
      productId: '',
      product: {} as Product,
      quantity: 1,
      unitCost: 0
    };
    setComponents(prev => [...prev, newComponent]);
  };

  const updateComponent = (id: string, field: keyof BOMComponent, value: any) => {
    setComponents(prev => prev.map(comp => 
      comp.id === id ? { ...comp, [field]: value } : comp
    ));
  };

  const removeComponent = (id: string) => {
    setComponents(prev => prev.filter(comp => comp.id !== id));
  };

  const addOperation = () => {
    const newOperation: BOMOperation = {
      id: Date.now().toString(),
      workCenterId: '',
      workCenter: {} as WorkCenter,
      sequence: operations.length + 1,
      description: '',
      duration: 60,
      setupTime: 0,
      costPerHour: 0
    };
    setOperations(prev => [...prev, newOperation]);
  };

  const updateOperation = (id: string, field: keyof BOMOperation, value: any) => {
    setOperations(prev => prev.map(op => 
      op.id === id ? { ...op, [field]: value } : op
    ));
  };

  const removeOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
  };

  const calculateTotalCost = () => {
    const materialCost = components.reduce((sum, comp) => sum + (comp.quantity * comp.unitCost), 0);
    const laborCost = operations.reduce((sum, op) => sum + ((op.duration + op.setupTime) / 60 * op.costPerHour), 0);
    return materialCost + laborCost;
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "BOM name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.productId) {
      toast({
        title: "Validation Error",
        description: "Product selection is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.version.trim()) {
      toast({
        title: "Validation Error",
        description: "Version is required",
        variant: "destructive"
      });
      return false;
    }

    if (components.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one component is required",
        variant: "destructive"
      });
      return false;
    }

    if (operations.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one operation is required",
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
      // Create BOM
      const bomData = {
        ...formData,
        totalCost: calculateTotalCost()
      };
      
      await apiService.createBOM(bomData);
      
      toast({
        title: "Success",
        description: "BOM created successfully"
      });
      
      navigate('/bom');
    } catch (error) {
      console.error('Failed to create BOM:', error);
      toast({
        title: "Error",
        description: "Failed to create BOM. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/bom')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to BOMs
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New BOM</h1>
          <p className="text-muted-foreground">
            Create a new Bill of Materials
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Enter the basic details for the BOM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">BOM Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Wooden Table BOM"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="version">Version *</Label>
                    <Input
                      id="version"
                      placeholder="e.g., 1.0"
                      value={formData.version}
                      onChange={(e) => handleInputChange('version', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productId">Product *</Label>
                    <Select value={formData.productId} onValueChange={(value) => handleInputChange('productId', value)}>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Enter a description for this BOM..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => handleInputChange('isActive', checked)}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="components" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Components
                </CardTitle>
                <CardDescription>
                  Add components and materials required for this BOM
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Components ({components.length})</h4>
                  <Button type="button" onClick={addComponent} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Component
                  </Button>
                </div>

                {components.map((component, index) => (
                  <Card key={component.id} className="p-4">
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="space-y-2">
                        <Label>Product</Label>
                        <Select 
                          value={component.productId} 
                          onValueChange={(value) => {
                            const product = products.find(p => p.id === value);
                            updateComponent(component.id, 'productId', value);
                            updateComponent(component.id, 'product', product || {} as Product);
                            updateComponent(component.id, 'unitCost', product?.unitCost || 0);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select product" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.map(product => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} ({product.sku})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.001"
                          value={component.quantity}
                          onChange={(e) => updateComponent(component.id, 'quantity', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Unit Cost</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={component.unitCost}
                          onChange={(e) => updateComponent(component.id, 'unitCost', parseFloat(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Total Cost</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            value={formatCurrency(component.quantity * component.unitCost)}
                            disabled
                            className="bg-muted"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeComponent(component.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {components.length === 0 && (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No components added</h3>
                    <p className="text-muted-foreground mb-4">
                      Add components to define the materials needed for this BOM
                    </p>
                    <Button type="button" onClick={addComponent}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Component
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="operations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Operations
                </CardTitle>
                <CardDescription>
                  Define the manufacturing operations and work centers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Operations ({operations.length})</h4>
                  <Button type="button" onClick={addOperation} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Operation
                  </Button>
                </div>

                {operations.map((operation, index) => (
                  <Card key={operation.id} className="p-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Sequence</Label>
                        <Input
                          type="number"
                          min="1"
                          value={operation.sequence}
                          onChange={(e) => updateOperation(operation.id, 'sequence', parseInt(e.target.value) || 1)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Work Center</Label>
                        <Select 
                          value={operation.workCenterId} 
                          onValueChange={(value) => {
                            const workCenter = workCenters.find(wc => wc.id === value);
                            updateOperation(operation.id, 'workCenterId', value);
                            updateOperation(operation.id, 'workCenter', workCenter || {} as WorkCenter);
                            updateOperation(operation.id, 'costPerHour', workCenter?.costPerHour || 0);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select work center" />
                          </SelectTrigger>
                          <SelectContent>
                            {workCenters.map(workCenter => (
                              <SelectItem key={workCenter.id} value={workCenter.id}>
                                {workCenter.name} ({workCenter.code})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Description</Label>
                        <Input
                          placeholder="e.g., Assembly of table legs"
                          value={operation.description}
                          onChange={(e) => updateOperation(operation.id, 'description', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Duration (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          value={operation.duration}
                          onChange={(e) => updateOperation(operation.id, 'duration', parseInt(e.target.value) || 60)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Setup Time (minutes)</Label>
                        <Input
                          type="number"
                          min="0"
                          value={operation.setupTime}
                          onChange={(e) => updateOperation(operation.id, 'setupTime', parseInt(e.target.value) || 0)}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Cost per Hour</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={operation.costPerHour}
                            onChange={(e) => updateOperation(operation.id, 'costPerHour', parseFloat(e.target.value) || 0)}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeOperation(operation.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}

                {operations.length === 0 && (
                  <div className="text-center py-8">
                    <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No operations added</h3>
                    <p className="text-muted-foreground mb-4">
                      Add operations to define the manufacturing steps
                    </p>
                    <Button type="button" onClick={addOperation}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add First Operation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Summary
                </CardTitle>
                <CardDescription>
                  Review the BOM details and cost breakdown
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">Basic Information</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Name:</strong> {formData.name || 'Not specified'}</p>
                      <p><strong>Version:</strong> {formData.version || 'Not specified'}</p>
                      <p><strong>Product:</strong> {products.find(p => p.id === formData.productId)?.name || 'Not selected'}</p>
                      <p><strong>Status:</strong> {formData.isActive ? 'Active' : 'Inactive'}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">Cost Breakdown</h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p><strong>Components:</strong> {components.length}</p>
                      <p><strong>Operations:</strong> {operations.length}</p>
                      <p><strong>Material Cost:</strong> {formatCurrency(components.reduce((sum, comp) => sum + (comp.quantity * comp.unitCost), 0))}</p>
                      <p><strong>Labor Cost:</strong> {formatCurrency(operations.reduce((sum, op) => sum + ((op.duration + op.setupTime) / 60 * op.costPerHour), 0))}</p>
                      <p className="font-bold text-lg"><strong>Total Cost:</strong> {formatCurrency(calculateTotalCost())}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/bom')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create BOM
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
