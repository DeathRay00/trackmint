import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  ArrowLeft,
  Edit,
  Factory,
  Package,
  Calendar,
  User,
  Clock,
  DollarSign,
  CheckCircle,
  AlertCircle,
  Play,
  Pause,
  Square
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ManufacturingOrder } from '../types';

const StatusBadge = ({ status }: { status: string }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'Planned':
        return { color: 'bg-blue-100 text-blue-800', icon: Clock };
      case 'In Progress':
        return { color: 'bg-yellow-100 text-yellow-800', icon: Play };
      case 'Done':
        return { color: 'bg-green-100 text-green-800', icon: CheckCircle };
      case 'Canceled':
        return { color: 'bg-red-100 text-red-800', icon: Square };
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

const PriorityBadge = ({ priority }: { priority: string }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'Critical': return 'bg-red-100 text-red-800';
      case 'High': return 'bg-orange-100 text-orange-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Badge variant="outline" className={getPriorityColor(priority)}>
      {priority}
    </Badge>
  );
};

const MetricCard = ({ title, value, icon: Icon, description, trend }: {
  title: string;
  value: string;
  icon: any;
  description: string;
  trend?: string;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {description}
        {trend && <span className="ml-2 text-green-600">{trend}</span>}
      </p>
    </CardContent>
  </Card>
);

export const ManufacturingOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [manufacturingOrder, setManufacturingOrder] = useState<ManufacturingOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadManufacturingOrder = async () => {
      if (!id) return;
      
      try {
        const response = await apiService.getManufacturingOrder(id);
        setManufacturingOrder(response.data);
      } catch (error) {
        console.error('Failed to load manufacturing order:', error);
      } finally {
        setLoading(false);
      }
    };

    loadManufacturingOrder();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getProgress = (order: ManufacturingOrder) => {
    switch (order.status) {
      case 'Done': return 100;
      case 'In Progress': return 65;
      case 'Planned': return 0;
      default: return 0;
    }
  };

  const getEstimatedCost = (order: ManufacturingOrder) => {
    if (order.bom) {
      return order.bom.totalCost * order.quantity;
    }
    return 0;
  };

  const getWorkOrders = () => {
    // Mock work orders - would come from API
    return [
      {
        id: '1',
        workOrderNumber: 'WO-2024-001',
        status: 'Ready',
        description: 'Assembly of table legs',
        assignedOperator: 'John Doe',
        plannedDuration: 120,
        actualDuration: null
      },
      {
        id: '2',
        workOrderNumber: 'WO-2024-002',
        status: 'In Progress',
        description: 'Painting and finishing',
        assignedOperator: 'Jane Smith',
        plannedDuration: 90,
        actualDuration: 45
      },
      {
        id: '3',
        workOrderNumber: 'WO-2024-003',
        status: 'Planned',
        description: 'Quality inspection',
        assignedOperator: 'Mike Johnson',
        plannedDuration: 30,
        actualDuration: null
      }
    ];
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
          The manufacturing order you're looking for doesn't exist or has been deleted.
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

  const workOrders = getWorkOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/manufacturing-orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Manufacturing Orders
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{manufacturingOrder.orderNumber}</h1>
            <p className="text-muted-foreground">
              <StatusBadge status={manufacturingOrder.status} />
              <span className="ml-3">
                <PriorityBadge priority={manufacturingOrder.priority} />
              </span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/manufacturing-orders/${manufacturingOrder.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Order
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Progress"
          value={`${getProgress(manufacturingOrder)}%`}
          icon={Package}
          description="completion status"
        />
        <MetricCard
          title="Quantity"
          value={manufacturingOrder.quantity.toString()}
          icon={Factory}
          description="units to produce"
        />
        <MetricCard
          title="Estimated Cost"
          value={formatCurrency(getEstimatedCost(manufacturingOrder))}
          icon={DollarSign}
          description="total production cost"
        />
        <MetricCard
          title="Duration"
          value={`${Math.ceil((manufacturingOrder.plannedEndDate.getTime() - manufacturingOrder.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24))} days`}
          icon={Clock}
          description="planned duration"
        />
      </div>

      {/* Progress Bar */}
      <Card>
        <CardHeader>
          <CardTitle>Production Progress</CardTitle>
          <CardDescription>
            Current progress of the manufacturing order
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{getProgress(manufacturingOrder)}%</span>
            </div>
            <Progress value={getProgress(manufacturingOrder)} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Started: {manufacturingOrder.actualStartDate ? formatDate(manufacturingOrder.actualStartDate) : 'Not started'}</span>
              <span>Due: {formatDate(manufacturingOrder.plannedEndDate)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="bom">BOM Details</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Order Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Order Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Order Number</p>
                    <p className="text-sm font-mono">{manufacturingOrder.orderNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <StatusBadge status={manufacturingOrder.status} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Priority</p>
                    <PriorityBadge priority={manufacturingOrder.priority} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Quantity</p>
                    <p className="text-sm">{manufacturingOrder.quantity}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{formatDate(manufacturingOrder.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                    <p className="text-sm">{formatDate(manufacturingOrder.updatedAt)}</p>
                  </div>
                </div>
                {manufacturingOrder.notes && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Notes</p>
                    <p className="text-sm">{manufacturingOrder.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Product Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Product Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Product Name</p>
                    <p className="text-sm">{manufacturingOrder.product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SKU</p>
                    <p className="text-sm font-mono">{manufacturingOrder.product.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm">{manufacturingOrder.product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unit of Measure</p>
                    <p className="text-sm">{manufacturingOrder.product.unitOfMeasure}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h4 className="font-medium">Planned Schedule</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Start Date:</strong> {formatDate(manufacturingOrder.plannedStartDate)}</p>
                    <p><strong>End Date:</strong> {formatDate(manufacturingOrder.plannedEndDate)}</p>
                    <p><strong>Duration:</strong> {Math.ceil((manufacturingOrder.plannedEndDate.getTime() - manufacturingOrder.plannedStartDate.getTime()) / (1000 * 60 * 60 * 24))} days</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Actual Schedule</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p><strong>Start Date:</strong> {manufacturingOrder.actualStartDate ? formatDate(manufacturingOrder.actualStartDate) : 'Not started'}</p>
                    <p><strong>End Date:</strong> {manufacturingOrder.actualEndDate ? formatDate(manufacturingOrder.actualEndDate) : 'Not completed'}</p>
                    <p><strong>Assigned To:</strong> {manufacturingOrder.assignedTo ? `${manufacturingOrder.assignedTo.firstName} ${manufacturingOrder.assignedTo.lastName}` : 'Unassigned'}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Work Orders
              </CardTitle>
              <CardDescription>
                Individual work orders for this manufacturing order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Work Order</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Operator</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Progress</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workOrders.map((wo) => (
                      <TableRow key={wo.id}>
                        <TableCell className="font-medium">
                          <Link 
                            to={`/work-orders/${wo.id}`}
                            className="text-primary hover:underline"
                          >
                            {wo.workOrderNumber}
                          </Link>
                        </TableCell>
                        <TableCell>{wo.description}</TableCell>
                        <TableCell>
                          <StatusBadge status={wo.status} />
                        </TableCell>
                        <TableCell>{wo.assignedOperator}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>Planned: {Math.floor(wo.plannedDuration / 60)}h {wo.plannedDuration % 60}m</div>
                            {wo.actualDuration && (
                              <div className="text-muted-foreground">
                                Actual: {Math.floor(wo.actualDuration / 60)}h {wo.actualDuration % 60}m
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {wo.status === 'Done' ? '100%' : 
                             wo.status === 'In Progress' ? '50%' :
                             wo.status === 'Ready' ? '0%' : '0%'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bom" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                BOM Details
              </CardTitle>
              <CardDescription>
                Bill of Materials for this manufacturing order
              </CardDescription>
            </CardHeader>
            <CardContent>
              {manufacturingOrder.bom ? (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium">BOM Information</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Name:</strong> {manufacturingOrder.bom.name}</p>
                        <p><strong>Version:</strong> v{manufacturingOrder.bom.version}</p>
                        <p><strong>Total Cost:</strong> {formatCurrency(manufacturingOrder.bom.totalCost)}</p>
                        <p><strong>Components:</strong> {manufacturingOrder.bom.components?.length || 0}</p>
                        <p><strong>Operations:</strong> {manufacturingOrder.bom.operations?.length || 0}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium">Cost Breakdown</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p><strong>Unit Cost:</strong> {formatCurrency(manufacturingOrder.bom.totalCost)}</p>
                        <p><strong>Total Cost:</strong> {formatCurrency(manufacturingOrder.bom.totalCost * manufacturingOrder.quantity)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4">
                    <Button asChild>
                      <Link to={`/bom/${manufacturingOrder.bom.id}`}>
                        <Package className="mr-2 h-4 w-4" />
                        View Full BOM Details
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No BOM assigned</h3>
                  <p className="text-muted-foreground">
                    This manufacturing order doesn't have a BOM assigned.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Production Timeline
              </CardTitle>
              <CardDescription>
                Timeline of events and milestones for this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Clock className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Timeline</h3>
                <p className="text-muted-foreground">
                  Production timeline will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
