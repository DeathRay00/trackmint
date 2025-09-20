import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { 
  ArrowLeft,
  Save,
  Factory,
  Settings,
  DollarSign,
  Clock
} from 'lucide-react';
import { apiService } from '../services/api';
import { useToast } from '../hooks/use-toast';

interface WorkCenterFormData {
  name: string;
  code: string;
  capacity: number;
  costPerHour: number;
  efficiency: number;
  description: string;
  isActive: boolean;
}

export const WorkCenterNew = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<WorkCenterFormData>({
    name: '',
    code: '',
    capacity: 8,
    costPerHour: 0,
    efficiency: 100,
    description: '',
    isActive: true
  });

  const handleInputChange = (field: keyof WorkCenterFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Work center name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.code.trim()) {
      toast({
        title: "Validation Error",
        description: "Work center code is required",
        variant: "destructive"
      });
      return false;
    }

    if (formData.capacity <= 0) {
      toast({
        title: "Validation Error",
        description: "Capacity must be greater than 0",
        variant: "destructive"
      });
      return false;
    }

    if (formData.costPerHour < 0) {
      toast({
        title: "Validation Error",
        description: "Cost per hour cannot be negative",
        variant: "destructive"
      });
      return false;
    }

    if (formData.efficiency < 0 || formData.efficiency > 100) {
      toast({
        title: "Validation Error",
        description: "Efficiency must be between 0 and 100",
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
      await apiService.createWorkCenter(formData);
      
      toast({
        title: "Success",
        description: "Work center created successfully"
      });
      
      navigate('/work-centers');
    } catch (error) {
      console.error('Failed to create work center:', error);
      toast({
        title: "Error",
        description: "Failed to create work center. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/work-centers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Centers
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">New Work Center</h1>
          <p className="text-muted-foreground">
            Create a new work center for production planning
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
                Enter the basic details for the work center
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Work Center Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Assembly Line 1"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="code">Work Center Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., AL1"
                  value={formData.code}
                  onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this work center..."
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={3}
                />
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

          {/* Capacity & Cost */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Capacity & Cost
              </CardTitle>
              <CardDescription>
                Set the capacity and cost parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Daily Capacity (hours) *
                </Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  step="0.5"
                  placeholder="8"
                  value={formData.capacity}
                  onChange={(e) => handleInputChange('capacity', parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Number of hours this work center can operate per day
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="costPerHour" className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost per Hour ($) *
                </Label>
                <Input
                  id="costPerHour"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="25.00"
                  value={formData.costPerHour}
                  onChange={(e) => handleInputChange('costPerHour', parseFloat(e.target.value) || 0)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Labor cost per hour for this work center
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="efficiency">Efficiency (%)</Label>
                <Input
                  id="efficiency"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  placeholder="100"
                  value={formData.efficiency}
                  onChange={(e) => handleInputChange('efficiency', parseInt(e.target.value) || 100)}
                />
                <p className="text-xs text-muted-foreground">
                  Efficiency percentage (0-100%)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Summary</CardTitle>
            <CardDescription>
              Review the work center details before creating
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-medium">Basic Information</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Name:</strong> {formData.name || 'Not specified'}</p>
                  <p><strong>Code:</strong> {formData.code || 'Not specified'}</p>
                  <p><strong>Status:</strong> {formData.isActive ? 'Active' : 'Inactive'}</p>
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Capacity & Cost</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p><strong>Daily Capacity:</strong> {formData.capacity} hours</p>
                  <p><strong>Cost per Hour:</strong> ${formData.costPerHour.toFixed(2)}</p>
                  <p><strong>Efficiency:</strong> {formData.efficiency}%</p>
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
            onClick={() => navigate('/work-centers')}
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
                Create Work Center
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
