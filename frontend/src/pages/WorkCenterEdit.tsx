import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
import type { WorkCenter } from '../types';

interface WorkCenterFormData {
  name: string;
  code: string;
  capacity: number;
  costPerHour: number;
  efficiency: number;
  description: string;
  isActive: boolean;
}

export const WorkCenterEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [workCenter, setWorkCenter] = useState<WorkCenter | null>(null);
  const [formData, setFormData] = useState<WorkCenterFormData>({
    name: '',
    code: '',
    capacity: 8,
    costPerHour: 0,
    efficiency: 100,
    description: '',
    isActive: true
  });

  useEffect(() => {
    const loadWorkCenter = async () => {
      if (!id) return;
      
      try {
        const response = await apiService.getWorkCenter(id);
        const wc = response.data;
        setWorkCenter(wc);
        setFormData({
          name: wc.name,
          code: wc.code,
          capacity: wc.capacity,
          costPerHour: wc.costPerHour,
          efficiency: wc.efficiency,
          description: wc.description || '',
          isActive: wc.isActive
        });
      } catch (error) {
        console.error('Failed to load work center:', error);
        toast({
          title: "Error",
          description: "Failed to load work center details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadWorkCenter();
  }, [id, toast]);

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
    
    if (!id || !validateForm()) {
      return;
    }

    setSaving(true);
    try {
      await apiService.updateWorkCenter(id, formData);
      
      toast({
        title: "Success",
        description: "Work center updated successfully"
      });
      
      navigate(`/work-centers/${id}`);
    } catch (error) {
      console.error('Failed to update work center:', error);
      toast({
        title: "Error",
        description: "Failed to update work center. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Factory className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading work center...</p>
        </div>
      </div>
    );
  }

  if (!workCenter) {
    return (
      <div className="text-center py-8">
        <Factory className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Work Center not found</h3>
        <p className="text-muted-foreground mb-4">
          The work center you're trying to edit doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link to="/work-centers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Centers
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(`/work-centers/${id}`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Center
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Work Center</h1>
          <p className="text-muted-foreground">
            Update work center details and settings
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
                Update the basic details for the work center
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
                Update the capacity and cost parameters
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
              Review the updated work center details
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
            onClick={() => navigate(`/work-centers/${id}`)}
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
