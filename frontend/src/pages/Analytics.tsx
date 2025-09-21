import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Factory,
  Wrench,
  Users,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
  Target,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WorkOrder, ManufacturingOrder, KPI } from '../types';

interface ProductionMetrics {
  totalOrders: number;
  completedOrders: number;
  inProgressOrders: number;
  averageCompletionTime: number;
  efficiency: number;
  onTimeDelivery: number;
  totalValue: number;
  costSavings: number;
}

interface ChartData {
  name: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface TimeSeriesData {
  date: string;
  orders: number;
  efficiency: number;
  cost: number;
}

export const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30');
  const [metrics, setMetrics] = useState<ProductionMetrics | null>(null);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);

  useEffect(() => {
    const loadAnalyticsData = async () => {
      try {
        setLoading(true);
        const [woResponse, moResponse, kpiResponse] = await Promise.all([
          apiService.getWorkOrders(1, 100),
          apiService.getManufacturingOrders(1, 100),
          apiService.getDashboardKPIs()
        ]);

        setWorkOrders(woResponse.data);
        setManufacturingOrders(moResponse.data);
        setKpis(kpiResponse.data);

        // Calculate metrics
        const completedOrders = woResponse.data.filter(wo => wo.status === 'Completed').length;
        const inProgressOrders = woResponse.data.filter(wo => wo.status === 'Started' || wo.status === 'Paused').length;
        const totalOrders = woResponse.data.length;
        
        const averageCompletionTime = woResponse.data
          .filter(wo => wo.actualDuration)
          .reduce((sum, wo) => sum + (wo.actualDuration || 0), 0) / 
          woResponse.data.filter(wo => wo.actualDuration).length || 0;

        const efficiency = completedOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0;
        const onTimeDelivery = Math.round(Math.random() * 20 + 80); // Mock data
        const totalValue = manufacturingOrders.reduce((sum, mo) => sum + (mo.quantity * 100), 0); // Mock calculation
        const costSavings = Math.round(totalValue * 0.15); // Mock 15% savings

        setMetrics({
          totalOrders,
          completedOrders,
          inProgressOrders,
          averageCompletionTime: Math.round(averageCompletionTime),
          efficiency,
          onTimeDelivery,
          totalValue,
          costSavings
        });

        // Generate chart data
        setChartData([
          { name: 'Work Orders', value: totalOrders, change: 12, trend: 'up' },
          { name: 'Efficiency', value: efficiency, change: 5, trend: 'up' },
          { name: 'On-Time Delivery', value: onTimeDelivery, change: -2, trend: 'down' },
          { name: 'Cost Savings', value: costSavings, change: 8, trend: 'up' }
        ]);

        // Generate time series data
        const timeSeries = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          timeSeries.push({
            date: date.toISOString().split('T')[0],
            orders: Math.floor(Math.random() * 20 + 5),
            efficiency: Math.floor(Math.random() * 20 + 70),
            cost: Math.floor(Math.random() * 1000 + 500)
          });
        }
        setTimeSeriesData(timeSeries);

      } catch (err) {
        console.error('Error loading analytics data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAnalyticsData();
  }, [timeRange]);

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <BarChart3 className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-green-600';
      case 'down':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading && !metrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor production performance and key metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Factory className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.completedOrders}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((metrics.completedOrders / metrics.totalOrders) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.efficiency}%</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metrics.onTimeDelivery}%</div>
              <p className="text-xs text-muted-foreground">
                -2% from last month
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Performance Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Performance Metrics
            </CardTitle>
            <CardDescription>
              Key performance indicators and trends
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {chartData.map((item, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{item.name}</span>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(item.trend)}
                    <span className={`text-sm ${getTrendColor(item.trend)}`}>
                      {item.change > 0 ? '+' : ''}{item.change}%
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{item.value}</span>
                  <Progress value={item.value} className="w-24" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Time Analysis
            </CardTitle>
            <CardDescription>
              Average completion times and efficiency
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Average Completion Time</span>
                <span className="text-sm">{formatDuration(metrics?.averageCompletionTime || 0)}</span>
              </div>
              <Progress value={75} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Efficiency Rate</span>
                <span className="text-sm">{metrics?.efficiency || 0}%</span>
              </div>
              <Progress value={metrics?.efficiency || 0} className="w-full" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">On-Time Delivery</span>
                <span className="text-sm">{metrics?.onTimeDelivery || 0}%</span>
              </div>
              <Progress value={metrics?.onTimeDelivery || 0} className="w-full" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="manufacturing">Manufacturing</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Work Order Status Distribution</CardTitle>
                <CardDescription>
                  Current status of all work orders
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Ready', 'Started', 'Paused', 'Completed'].map((status) => {
                    const count = workOrders.filter(wo => wo.status === status).length;
                    const percentage = workOrders.length > 0 ? Math.round((count / workOrders.length) * 100) : 0;
                    
                    return (
                      <div key={status} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">{status}</span>
                          <span className="text-sm">{count} ({percentage}%)</span>
                        </div>
                        <Progress value={percentage} className="w-full" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Latest work order activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workOrders.slice(0, 5).map((wo) => (
                    <div key={wo.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{wo.workOrderNumber}</p>
                        <p className="text-sm text-muted-foreground">{wo.bomOperation.description}</p>
                      </div>
                      <Badge variant={
                        wo.status === 'Completed' ? 'default' :
                        wo.status === 'Started' ? 'secondary' :
                        wo.status === 'Paused' ? 'outline' : 'secondary'
                      }>
                        {wo.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Work Order Performance</CardTitle>
                <CardDescription>
                  Detailed analysis of work order completion and efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {workOrders.filter(wo => wo.status === 'Completed').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">
                      {workOrders.filter(wo => wo.status === 'Started' || wo.status === 'Paused').length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {workOrders.filter(wo => wo.status === 'Ready').length}
                    </div>
                    <div className="text-sm text-muted-foreground">Ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="manufacturing" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manufacturing Orders Overview</CardTitle>
                <CardDescription>
                  Analysis of manufacturing order status and performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  {['Planned', 'In Progress', 'Done', 'Canceled'].map((status) => {
                    const count = manufacturingOrders.filter(mo => mo.status === status).length;
                    return (
                      <div key={status} className="text-center p-4 border rounded-lg">
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-muted-foreground">{status}</div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Financial Overview</CardTitle>
                <CardDescription>
                  Production value and cost analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Production Value</span>
                    <span className="text-sm font-bold">{formatCurrency(metrics?.totalValue || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Cost Savings</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency(metrics?.costSavings || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Efficiency Savings</span>
                    <span className="text-sm font-bold text-green-600">{formatCurrency((metrics?.costSavings || 0) * 0.3)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Breakdown</CardTitle>
                <CardDescription>
                  Analysis of production costs and savings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Labor Costs</span>
                      <span className="text-sm">{formatCurrency((metrics?.totalValue || 0) * 0.4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Material Costs</span>
                      <span className="text-sm">{formatCurrency((metrics?.totalValue || 0) * 0.35)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Overhead</span>
                      <span className="text-sm">{formatCurrency((metrics?.totalValue || 0) * 0.25)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
