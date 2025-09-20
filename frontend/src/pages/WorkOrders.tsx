import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus,
  Search,
  Filter,
  Clock,
  Play,
  Pause,
  Square,
  CheckCircle,
  User,
  Wrench,
  Factory,
  Timer,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../components/ui/dropdown-menu';
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

const WorkOrderCard = ({ workOrder }: { workOrder: WorkOrder }) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(workOrder.status === 'Started');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(prev => prev + 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isRunning]);

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

  const handleStart = () => {
    setIsRunning(true);
    // TODO: Update work order status via API
  };

  const handlePause = () => {
    setIsRunning(false);
    // TODO: Update work order status via API
  };

  const handleComplete = () => {
    setIsRunning(false);
    // TODO: Update work order status via API
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workOrder.workOrderNumber}</CardTitle>
          <StatusBadge status={workOrder.status} />
        </div>
        <CardDescription className="space-y-1">
          <div>{workOrder.bomOperation.description}</div>
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Factory className="h-4 w-4" />
              {workOrder.manufacturingOrder.orderNumber}
            </span>
            <span className="flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              {workOrder.bomOperation.workCenter.name}
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Timer Display */}
        {workOrder.status === 'Started' && (
          <div className="text-center p-3 bg-muted rounded-lg">
            <div className="text-2xl font-mono font-bold">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-muted-foreground">Active Time</div>
          </div>
        )}

        {/* Duration Info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span>Planned: {formatDuration(workOrder.plannedDuration)}</span>
          </div>
          {workOrder.actualDuration && (
            <span>Actual: {formatDuration(workOrder.actualDuration)}</span>
          )}
        </div>

        {/* Operator Info */}
        {workOrder.assignedOperator && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>{workOrder.assignedOperator.firstName} {workOrder.assignedOperator.lastName}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          {workOrder.status === 'Ready' && (
            <Button size="sm" onClick={handleStart} className="flex-1">
              <Play className="mr-2 h-4 w-4" />
              Start
            </Button>
          )}
          
          {workOrder.status === 'Started' && (
            <>
              <Button size="sm" variant="outline" onClick={handlePause}>
                <Pause className="mr-2 h-4 w-4" />
                Pause
              </Button>
              <Button size="sm" onClick={handleComplete}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Complete
              </Button>
            </>
          )}
          
          {workOrder.status === 'Paused' && (
            <>
              <Button size="sm" onClick={handleStart}>
                <Play className="mr-2 h-4 w-4" />
                Resume
              </Button>
              <Button size="sm" variant="outline" onClick={handleComplete}>
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

        {/* Comments */}
        {workOrder.comments && (
          <div className="text-sm text-muted-foreground p-2 bg-muted rounded">
            <strong>Notes:</strong> {workOrder.comments}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export const WorkOrders = () => {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('cards');

  useEffect(() => {
    const loadWorkOrders = async () => {
      try {
        const response = await apiService.getWorkOrders(1, 50);
        setWorkOrders(response.data);
      } catch (error) {
        console.error('Failed to load work orders:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, []);

  const filteredOrders = workOrders.filter(order => {
    const matchesSearch = order.workOrderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.bomOperation.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const groupedOrders = {
    Ready: filteredOrders.filter(wo => wo.status === 'Ready'),
    Started: filteredOrders.filter(wo => wo.status === 'Started'),
    Paused: filteredOrders.filter(wo => wo.status === 'Paused'),
    Completed: filteredOrders.filter(wo => wo.status === 'Completed'),
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Wrench className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading work orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Orders</h1>
          <p className="text-muted-foreground">
            Manage production tasks, track time, and monitor operator performance
          </p>
        </div>
        <Button asChild>
          <Link to="/work-orders/new">
            <Plus className="mr-2 h-4 w-4" />
            New Work Order
          </Link>
        </Button>
      </div>

      {/* Status Summary */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(groupedOrders).map(([status, orders]) => (
          <Card key={status}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{status}</CardTitle>
              <StatusBadge status={status} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-muted-foreground">
                {orders.length === 1 ? 'work order' : 'work orders'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search work orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Ready">Ready</SelectItem>
                <SelectItem value="Started">Started</SelectItem>
                <SelectItem value="Paused">Paused</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Orders Display */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="cards">Card View</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
          <TabsTrigger value="board">Status Board</TabsTrigger>
        </TabsList>

        <TabsContent value="cards" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((workOrder) => (
              <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Operator</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Progress</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">
                        <Link 
                          to={`/work-orders/${wo.id}`}
                          className="text-primary hover:underline"
                        >
                          {wo.workOrderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{wo.bomOperation.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {wo.bomOperation.workCenter.name}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={wo.status} />
                      </TableCell>
                      <TableCell>
                        {wo.assignedOperator ? (
                          `${wo.assignedOperator.firstName} ${wo.assignedOperator.lastName}`
                        ) : (
                          <span className="text-muted-foreground">Unassigned</span>
                        )}
                      </TableCell>
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
                          {wo.status === 'Completed' ? '100%' : 
                           wo.status === 'Started' ? '50%' :
                           wo.status === 'Paused' ? '30%' : '0%'}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="board" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(groupedOrders).map(([status, orders]) => (
              <div key={status} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{status}</h3>
                  <Badge variant="secondary">{orders.length}</Badge>
                </div>
                <div className="space-y-3">
                  {orders.map((workOrder) => (
                    <WorkOrderCard key={workOrder.id} workOrder={workOrder} />
                  ))}
                  {orders.length === 0 && (
                    <Card className="border-dashed">
                      <CardContent className="flex items-center justify-center py-8">
                        <p className="text-muted-foreground">No {status.toLowerCase()} orders</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredOrders.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <Wrench className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No work orders found</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Create your first work order to get started.'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <Button asChild>
                <Link to="/work-orders/new">
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Work Order
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};