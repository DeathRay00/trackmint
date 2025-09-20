import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Factory, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Package, 
  TrendingUp, 
  Users,
  Calendar,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ManufacturingOrder, WorkOrder, KPI } from '../types';

const StatusFilter = ({ 
  activeStatus, 
  onStatusChange, 
  counts 
}: { 
  activeStatus: string;
  onStatusChange: (status: string) => void;
  counts: Record<string, number>;
}) => {
  const statusOptions = [
    { key: 'all', label: 'All Orders', count: counts.total || 0, color: 'bg-gray-100 text-gray-800' },
    { key: 'Planned', label: 'Planned', count: counts.planned || 0, color: 'bg-blue-100 text-blue-800' },
    { key: 'In Progress', label: 'In Progress', count: counts.inProgress || 0, color: 'bg-yellow-100 text-yellow-800' },
    { key: 'Done', label: 'Done', count: counts.done || 0, color: 'bg-green-100 text-green-800' },
    { key: 'Canceled', label: 'Canceled', count: counts.canceled || 0, color: 'bg-red-100 text-red-800' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {statusOptions.map((option) => (
        <Button
          key={option.key}
          variant={activeStatus === option.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => onStatusChange(option.key)}
          className="flex items-center gap-2"
        >
          {option.label}
          <Badge className={option.color}>
            {option.count}
          </Badge>
        </Button>
      ))}
    </div>
  );
};

const KPICard = ({ icon: Icon, label, value, change, trend, format }: KPI & { icon: any }) => {
  const formatValue = (val: number, fmt: string) => {
    switch (fmt) {
      case 'percentage':
        return `${val.toFixed(1)}%`;
      case 'currency':
        return `$${val.toLocaleString()}`;
      case 'duration':
        return `${val}h`;
      default:
        return val.toLocaleString();
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value, format)}</div>
        <div className="flex items-center text-xs text-muted-foreground">
          <TrendingUp className={`mr-1 h-3 w-3 ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-600'
          }`} />
          {change > 0 ? '+' : ''}{change.toFixed(1)}% from last month
        </div>
      </CardContent>
    </Card>
  );
};

const ManufacturingOrderCard = ({ order }: { order: ManufacturingOrder }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Planned': return 'bg-blue-100 text-blue-800';
      case 'In Progress': return 'bg-yellow-100 text-yellow-800';
      case 'Done': return 'bg-green-100 text-green-800';
      case 'Canceled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
    <Card className="hover:shadow-md transition-shadow cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
          <div className="flex gap-2">
            <Badge className={getStatusColor(order.status)}>
              {order.status}
            </Badge>
            <Badge className={getPriorityColor(order.priority)}>
              {order.priority}
            </Badge>
          </div>
        </div>
        <CardDescription>
          {order.product.name} × {order.quantity}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-medium">
            {order.status === 'Done' ? '100%' : 
             order.status === 'In Progress' ? '65%' : 
             order.status === 'Planned' ? '0%' : '0%'}
          </span>
        </div>
        
        <Progress 
          value={
            order.status === 'Done' ? 100 : 
            order.status === 'In Progress' ? 65 : 0
          } 
          className="h-2"
        />
        
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Due: {order.plannedEndDate.toLocaleDateString()}
          </div>
          <div className="flex items-center gap-1">
            <Package className="h-4 w-4 text-green-600" />
            <span className="text-green-600">Components Available</span>
          </div>
        </div>
        
        {order.notes && (
          <p className="text-sm text-muted-foreground truncate">
            {order.notes}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export const Dashboard = () => {
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [kpis, setKpis] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStatus, setActiveStatus] = useState('all');

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [moResponse, woResponse, kpiResponse] = await Promise.all([
          apiService.getManufacturingOrders(1, 20),
          apiService.getWorkOrders(1, 10),
          apiService.getDashboardKPIs()
        ]);
        
        setManufacturingOrders(moResponse.data);
        setWorkOrders(woResponse.data);
        setKpis(kpiResponse.data);
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const filteredOrders = manufacturingOrders.filter(order => 
    activeStatus === 'all' || order.status === activeStatus
  );

  const statusCounts = {
    total: manufacturingOrders.length,
    planned: manufacturingOrders.filter(mo => mo.status === 'Planned').length,
    inProgress: manufacturingOrders.filter(mo => mo.status === 'In Progress').length,
    done: manufacturingOrders.filter(mo => mo.status === 'Done').length,
    canceled: manufacturingOrders.filter(mo => mo.status === 'Canceled').length,
  };

  const mockKPIs: (KPI & { icon: any })[] = [
    {
      icon: CheckCircle,
      label: 'Orders Completed',
      value: kpis?.completedOrders || 0,
      change: 12.5,
      trend: 'up',
      format: 'number'
    },
    {
      icon: Clock,
      label: 'In Progress',
      value: kpis?.inProgressOrders || 0,
      change: -2.1,
      trend: 'down',
      format: 'number'
    },
    {
      icon: AlertTriangle,
      label: 'Delayed',
      value: kpis?.delayedOrders || 0,
      change: -8.2,
      trend: 'down',
      format: 'number'
    },
    {
      icon: TrendingUp,
      label: 'On-Time Delivery',
      value: kpis?.onTimeDelivery || 92.5,
      change: 3.2,
      trend: 'up',
      format: 'percentage'
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Factory className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Manufacturing operations overview and key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild>
            <Link to="/manufacturing-orders/new">
              <Factory className="mr-2 h-4 w-4" />
              New Order
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {mockKPIs.map((kpi) => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Manufacturing Orders</TabsTrigger>
          <TabsTrigger value="workorders">Work Orders</TabsTrigger>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
        </TabsList>
        
        <TabsContent value="orders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Manufacturing Orders</h2>
            <Button variant="outline" asChild>
              <Link to="/manufacturing-orders">View All</Link>
            </Button>
          </div>
          
          <StatusFilter 
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
            counts={statusCounts}
          />
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredOrders.map((order) => (
              <Link key={order.id} to={`/manufacturing-orders/${order.id}`}>
                <ManufacturingOrderCard order={order} />
              </Link>
            ))}
          </div>
          
          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Factory className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  {activeStatus === 'all' 
                    ? "You don't have any manufacturing orders yet."
                    : `No orders with "${activeStatus}" status.`
                  }
                </p>
                <Button asChild>
                  <Link to="/manufacturing-orders/new">Create First Order</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="workorders" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Active Work Orders</h2>
            <Button variant="outline" asChild>
              <Link to="/work-orders">View All</Link>
            </Button>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {workOrders.map((wo) => (
              <Card key={wo.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{wo.workOrderNumber}</CardTitle>
                    <Badge className={
                      wo.status === 'Started' ? 'bg-green-100 text-green-800' :
                      wo.status === 'Ready' ? 'bg-blue-100 text-blue-800' :
                      wo.status === 'Paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {wo.status}
                    </Badge>
                  </div>
                  <CardDescription>
                    {wo.bomOperation.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm">
                    <span>Duration:</span>
                    <span>{Math.floor(wo.plannedDuration / 60)}h {wo.plannedDuration % 60}m</span>
                  </div>
                  {wo.assignedOperator && (
                    <div className="flex items-center gap-2 mt-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{wo.assignedOperator.firstName} {wo.assignedOperator.lastName}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="activity" className="space-y-4">
          <h2 className="text-xl font-semibold">Recent Activity</h2>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { action: 'Manufacturing Order MO-2024-001 started', time: '2 hours ago', type: 'success' },
                { action: 'Work Order WO-2024-001 completed by Mike Johnson', time: '4 hours ago', type: 'success' },
                { action: 'Low stock alert for Table Legs', time: '6 hours ago', type: 'warning' },
                { action: 'New BOM created for Wooden Table v1.1', time: '1 day ago', type: 'info' },
                { action: 'Manufacturing Order MO-2024-003 completed', time: '2 days ago', type: 'success' },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-3 py-2">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'success' ? 'bg-green-500' :
                    activity.type === 'warning' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`} />
                  <div className="flex-1">
                    <p className="text-sm">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};