import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Clock, 
  User, 
  Wrench,
  Factory,
  CheckCircle,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WorkOrder, ManufacturingOrder, BOM, WorkCenter, User as UserType } from '../types';

const workOrderSchema = z.object({
  assignedOperatorId: z.string().optional(),
  plannedDuration: z.number().min(1, 'Planned duration must be at least 1 minute'),
  comments: z.string().optional(),
  issues: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Ready':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'Started':
        return { color: 'bg-green-100 text-green-800', icon: Play };
      case 'Paused':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Pause };
      case 'Completed':
        return { color: 'bg-gray-100 text-gray-800', icon: CheckCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: Clock };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
};

export const WorkOrderEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [operators, setOperators] = useState<UserType[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset
  } = useForm<WorkOrderFormData>({
    resolver: zodResolver(workOrderSchema)
  });

  const watchedStatus = watch('status');

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const [woResponse, usersResponse] = await Promise.all([
          apiService.getWorkOrder(id),
          apiService.getUsers(1, 100)
        ]);

        setWorkOrder(woResponse.data);
        setOperators(usersResponse.data.filter(user => user.role === 'Operator'));
        
        // Set form values
        reset({
          assignedOperatorId: woResponse.data.assignedOperatorId || '',
          plannedDuration: woResponse.data.plannedDuration,
          comments: woResponse.data.comments || '',
          issues: woResponse.data.issues || '',
        });

        setIsRunning(woResponse.data.status === 'Started');
      } catch (err) {
        setError('Failed to load work order');
        console.error('Error loading work order:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrder();
  }, [id, reset]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && workOrder?.status === 'Started') {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning, workOrder?.status]);

  const onSubmit = async (data: WorkOrderFormData) => {
    if (!workOrder) return;

    try {
      setSaving(true);
      setError(null);

      await apiService.updateWorkOrder(workOrder.id, data);
      navigate('/work-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update work order');
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!workOrder) return;

    try {
      setSaving(true);
      setError(null);

      await apiService.updateWorkOrder(workOrder.id, { status: newStatus });
      
      // Update local state
      setWorkOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      setIsRunning(newStatus === 'Started');
      
      if (newStatus === 'Completed') {
        setCurrentTime(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setSaving(false);
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading work order...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-lg font-medium">Work Order Not Found</h3>
          <p className="text-muted-foreground">The work order you're looking for doesn't exist.</p>
          <Button className="mt-4" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/work-orders')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{workOrder.workOrderNumber}</h1>
            <StatusBadge status={workOrder.status} />
          </div>
          <p className="text-muted-foreground">
            {workOrder.bomOperation.description} - {workOrder.bomOperation.workCenter.name}
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Work Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Work Order Information
            </CardTitle>
            <CardDescription>
              Basic information about this work order
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Work Order Number:</span>
                <span className="text-sm">{workOrder.workOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Manufacturing Order:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Product:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Work Center:</span>
                <span className="text-sm">{workOrder.bomOperation.workCenter.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">
                  {new Date(workOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timer and Status Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Timer & Status
            </CardTitle>
            <CardDescription>
              Monitor progress and control work order status
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Timer Display */}
            {workOrder.status === 'Started' && (
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-3xl font-mono font-bold">
                  {formatTime(currentTime)}
                </div>
                <div className="text-sm text-muted-foreground">Active Time</div>
              </div>
            )}

            {/* Duration Info */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Planned Duration:</span>
                <span className="text-sm">{formatDuration(workOrder.plannedDuration)}</span>
              </div>
              {workOrder.actualDuration && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Actual Duration:</span>
                  <span className="text-sm">{formatDuration(workOrder.actualDuration)}</span>
                </div>
              )}
            </div>

            {/* Status Controls */}
            <div className="space-y-2">
              <Label>Status Controls</Label>
              <div className="flex gap-2">
                {workOrder.status === 'Ready' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleStatusChange('Started')}
                    disabled={saving}
                    className="flex-1"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Start
                  </Button>
                )}
                
                {workOrder.status === 'Started' && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleStatusChange('Paused')}
                      disabled={saving}
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusChange('Completed')}
                      disabled={saving}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  </>
                )}
                
                {workOrder.status === 'Paused' && (
                  <>
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusChange('Started')}
                      disabled={saving}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleStatusChange('Completed')}
                      disabled={saving}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete
                    </Button>
                  </>
                )}
                
                {workOrder.status === 'Completed' && (
                  <Button size="sm" variant="outline" disabled className="flex-1">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Completed
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Edit Work Order</CardTitle>
            <CardDescription>
              Update work order details and assignments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="assignedOperatorId">Assigned Operator</Label>
                <Select
                  value={watch('assignedOperatorId') || ''}
                  onValueChange={(value) => setValue('assignedOperatorId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select operator (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {operators.map((operator) => (
                      <SelectItem key={operator.id} value={operator.id}>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span>{operator.firstName} {operator.lastName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="plannedDuration">Planned Duration (minutes) *</Label>
                <Input
                  id="plannedDuration"
                  type="number"
                  min="1"
                  placeholder="Enter planned duration in minutes"
                  {...register('plannedDuration', { valueAsNumber: true })}
                />
                {errors.plannedDuration && (
                  <p className="text-sm text-destructive">{errors.plannedDuration.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                placeholder="Enter any additional comments or notes"
                {...register('comments')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="issues">Issues</Label>
              <Textarea
                id="issues"
                placeholder="Enter any issues or problems encountered"
                {...register('issues')}
              />
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/work-orders')}>
            Cancel
          </Button>
          <Button type="submit" disabled={saving}>
            {saving ? (
              <>
                <Wrench className="mr-2 h-4 w-4 animate-spin" />
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
