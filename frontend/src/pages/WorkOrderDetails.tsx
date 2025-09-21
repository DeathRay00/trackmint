import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ArrowLeft, 
  Edit, 
  Clock, 
  User, 
  Wrench,
  Factory,
  CheckCircle,
  Play,
  Pause,
  Square,
  AlertCircle,
  Calendar,
  Timer,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WorkOrder } from '../types';

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

export const WorkOrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const response = await apiService.getWorkOrder(id);
        setWorkOrder(response.data);
        setIsRunning(response.data.status === 'Started');
      } catch (err) {
        setError('Failed to load work order');
        console.error('Error loading work order:', err);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrder();
  }, [id]);

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

  const handleStatusChange = async (newStatus: string) => {
    if (!workOrder) return;

    try {
      await apiService.updateWorkOrder(workOrder.id, { status: newStatus });
      
      // Update local state
      setWorkOrder(prev => prev ? { ...prev, status: newStatus as any } : null);
      setIsRunning(newStatus === 'Started');
      
      if (newStatus === 'Completed') {
        setCurrentTime(0);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
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

  const calculateProgress = () => {
    if (!workOrder) return 0;
    if (workOrder.status === 'Completed') return 100;
    if (workOrder.status === 'Started') return 50;
    if (workOrder.status === 'Paused') return 30;
    return 0;
  };

  const calculateEfficiency = () => {
    if (!workOrder || !workOrder.actualDuration) return null;
    const plannedMinutes = workOrder.plannedDuration;
    const actualMinutes = workOrder.actualDuration;
    return Math.round((plannedMinutes / actualMinutes) * 100);
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
        <Button onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}>
          <Edit className="mr-2 h-4 w-4" />
          Edit
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Work Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Work Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Work Order Number:</span>
                <span className="text-sm">{workOrder.workOrderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <StatusBadge status={workOrder.status} />
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Created:</span>
                <span className="text-sm">
                  {new Date(workOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Last Updated:</span>
                <span className="text-sm">
                  {new Date(workOrder.updatedAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manufacturing Order Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Factory className="h-5 w-5" />
              Manufacturing Order
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Order Number:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Product:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.product.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Quantity:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Priority:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.priority}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Status:</span>
                <span className="text-sm">{workOrder.manufacturingOrder.status}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Operation Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="h-5 w-5" />
              Operation Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Description:</span>
                <span className="text-sm">{workOrder.bomOperation.description}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Work Center:</span>
                <span className="text-sm">{workOrder.bomOperation.workCenter.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Sequence:</span>
                <span className="text-sm">{workOrder.bomOperation.sequence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Duration:</span>
                <span className="text-sm">{workOrder.bomOperation.duration} min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Setup Time:</span>
                <span className="text-sm">{workOrder.bomOperation.setupTime} min</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Timer and Progress */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Timer & Duration
            </CardTitle>
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

            {/* Duration Information */}
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
              {workOrder.startTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Start Time:</span>
                  <span className="text-sm">
                    {new Date(workOrder.startTime).toLocaleString()}
                  </span>
                </div>
              )}
              {workOrder.endTime && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">End Time:</span>
                  <span className="text-sm">
                    {new Date(workOrder.endTime).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Progress & Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Progress</span>
                <span className="text-sm">{calculateProgress()}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${calculateProgress()}%` }}
                />
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="space-y-2">
              {calculateEfficiency() && (
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Efficiency:</span>
                  <span className="text-sm">{calculateEfficiency()}%</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm font-medium">Cost per Hour:</span>
                <span className="text-sm">${workOrder.bomOperation.costPerHour}</span>
              </div>
            </div>

            {/* Status Controls */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Status Controls</span>
              <div className="flex gap-2">
                {workOrder.status === 'Ready' && (
                  <Button 
                    size="sm" 
                    onClick={() => handleStatusChange('Started')}
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
                    >
                      <Pause className="mr-2 h-4 w-4" />
                      Pause
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => handleStatusChange('Completed')}
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
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Resume
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline" 
                      onClick={() => handleStatusChange('Completed')}
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

      {/* Assignment and Notes */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Assignment
            </CardTitle>
          </CardHeader>
          <CardContent>
            {workOrder.assignedOperator ? (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Operator:</span>
                  <span className="text-sm">
                    {workOrder.assignedOperator.firstName} {workOrder.assignedOperator.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm">{workOrder.assignedOperator.email}</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No operator assigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Comments & Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {workOrder.comments && (
              <div>
                <span className="text-sm font-medium">Comments:</span>
                <p className="text-sm text-muted-foreground mt-1">{workOrder.comments}</p>
              </div>
            )}
            {workOrder.issues && (
              <div>
                <span className="text-sm font-medium">Issues:</span>
                <p className="text-sm text-muted-foreground mt-1">{workOrder.issues}</p>
              </div>
            )}
            {!workOrder.comments && !workOrder.issues && (
              <p className="text-sm text-muted-foreground">No comments or issues recorded</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
