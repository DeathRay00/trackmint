import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Clock, 
  User, 
  Wrench,
  Factory,
  CheckCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ManufacturingOrder, BOM, WorkCenter, User as UserType } from '../types';

const workOrderSchema = z.object({
  manufacturingOrderId: z.string().min(1, 'Manufacturing Order is required'),
  bomOperationId: z.string().min(1, 'BOM Operation is required'),
  assignedOperatorId: z.string().optional(),
  plannedDuration: z.number().min(1, 'Planned duration must be at least 1 minute'),
  comments: z.string().optional(),
});

type WorkOrderFormData = z.infer<typeof workOrderSchema>;

export const WorkOrderNew = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [boms, setBoms] = useState<BOM[]>([]);
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [operators, setOperators] = useState<UserType[]>([]);
  const [selectedMO, setSelectedMO] = useState<ManufacturingOrder | null>(null);
  const [selectedBOM, setSelectedBOM] = useState<BOM | null>(null);

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

  const watchedMOId = watch('manufacturingOrderId');
  const watchedBOMId = watch('bomOperationId');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [moResponse, bomResponse, wcResponse, usersResponse] = await Promise.all([
          apiService.getManufacturingOrders(1, 100),
          apiService.getBOMs(),
          apiService.getWorkCenters(1, 100),
          apiService.getUsers(1, 100)
        ]);

        setManufacturingOrders(moResponse.data);
        setBoms(bomResponse.data);
        setWorkCenters(wcResponse.data);
        setOperators(usersResponse.data.filter(user => user.role === 'Operator'));
      } catch (err) {
        setError('Failed to load required data');
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (watchedMOId) {
      const mo = manufacturingOrders.find(mo => mo.id === watchedMOId);
      if (mo) {
        setSelectedMO(mo);
        const bom = boms.find(b => b.id === mo.bomId);
        if (bom) {
          setSelectedBOM(bom);
          setValue('bomOperationId', '');
        }
      }
    }
  }, [watchedMOId, manufacturingOrders, boms, setValue]);

  const onSubmit = async (data: WorkOrderFormData) => {
    try {
      setLoading(true);
      setError(null);

      await apiService.createWorkOrder(data);
      navigate('/work-orders');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create work order');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setSelectedMO(null);
    setSelectedBOM(null);
  };

  if (loading && !manufacturingOrders.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading data...</p>
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Work Order</h1>
          <p className="text-muted-foreground">
            Create a new work order for production operations
          </p>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Work Order Details
              </CardTitle>
              <CardDescription>
                Basic information about the work order
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturingOrderId">Manufacturing Order *</Label>
                <Select
                  value={watchedMOId || ''}
                  onValueChange={(value) => setValue('manufacturingOrderId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manufacturing order" />
                  </SelectTrigger>
                  <SelectContent>
                    {manufacturingOrders.map((mo) => (
                      <SelectItem key={mo.id} value={mo.id}>
                        <div className="flex items-center gap-2">
                          <Factory className="h-4 w-4" />
                          <span>{mo.orderNumber} - {mo.product.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.manufacturingOrderId && (
                  <p className="text-sm text-destructive">{errors.manufacturingOrderId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="bomOperationId">BOM Operation *</Label>
                <Select
                  value={watchedBOMId || ''}
                  onValueChange={(value) => setValue('bomOperationId', value)}
                  disabled={!selectedBOM}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select BOM operation" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBOM?.operations.map((operation) => (
                      <SelectItem key={operation.id} value={operation.id}>
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4" />
                          <span>{operation.description}</span>
                          <span className="text-muted-foreground">
                            ({operation.workCenter.name})
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.bomOperationId && (
                  <p className="text-sm text-destructive">{errors.bomOperationId.message}</p>
                )}
                {!selectedBOM && (
                  <p className="text-sm text-muted-foreground">
                    Select a manufacturing order first to see available operations
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="assignedOperatorId">Assigned Operator</Label>
                <Select
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

              <div className="space-y-2">
                <Label htmlFor="comments">Comments</Label>
                <Textarea
                  id="comments"
                  placeholder="Enter any additional comments or notes"
                  {...register('comments')}
                />
              </div>
            </CardContent>
          </Card>

          {/* Manufacturing Order Details */}
          {selectedMO && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Manufacturing Order Details
                </CardTitle>
                <CardDescription>
                  Information about the selected manufacturing order
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Order Number:</span>
                    <span className="text-sm">{selectedMO.orderNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Product:</span>
                    <span className="text-sm">{selectedMO.product.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Quantity:</span>
                    <span className="text-sm">{selectedMO.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Priority:</span>
                    <span className="text-sm">{selectedMO.priority}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm">{selectedMO.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Planned Start:</span>
                    <span className="text-sm">
                      {new Date(selectedMO.plannedStartDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Planned End:</span>
                    <span className="text-sm">
                      {new Date(selectedMO.plannedEndDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* BOM Operation Details */}
          {selectedBOM && watchedBOMId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  BOM Operation Details
                </CardTitle>
                <CardDescription>
                  Information about the selected BOM operation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(() => {
                  const operation = selectedBOM.operations.find(op => op.id === watchedBOMId);
                  if (!operation) return null;

                  return (
                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Description:</span>
                        <span className="text-sm">{operation.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Work Center:</span>
                        <span className="text-sm">{operation.workCenter.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Sequence:</span>
                        <span className="text-sm">{operation.sequence}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Duration:</span>
                        <span className="text-sm">{operation.duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Setup Time:</span>
                        <span className="text-sm">{operation.setupTime} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Cost per Hour:</span>
                        <span className="text-sm">${operation.costPerHour}</span>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Wrench className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Create Work Order
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
