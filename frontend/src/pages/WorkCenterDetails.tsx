import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  ArrowLeft,
  Edit,
  Factory,
  Settings,
  DollarSign,
  Clock,
  TrendingUp,
  Calendar,
  Users,
  Activity
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WorkCenter } from '../types';

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {isActive ? 'Active' : 'Inactive'}
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

export const WorkCenterDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workCenter, setWorkCenter] = useState<WorkCenter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadWorkCenter = async () => {
      if (!id) return;
      
      try {
        const response = await apiService.getWorkCenter(id);
        setWorkCenter(response.data);
      } catch (error) {
        console.error('Failed to load work center:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkCenter();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatHours = (hours: number) => {
    return `${hours}h/day`;
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
          The work center you're looking for doesn't exist or has been deleted.
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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/work-centers')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Work Centers
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{workCenter.name}</h1>
            <p className="text-muted-foreground">
              <code className="bg-muted px-2 py-1 rounded text-sm">{workCenter.code}</code>
              <span className="ml-3">
                <StatusBadge isActive={workCenter.isActive} />
              </span>
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to={`/work-centers/${workCenter.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Work Center
          </Link>
        </Button>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Daily Capacity"
          value={formatHours(workCenter.capacity)}
          icon={Clock}
          description="Hours per day"
        />
        <MetricCard
          title="Cost per Hour"
          value={formatCurrency(workCenter.costPerHour)}
          icon={DollarSign}
          description="Labor cost"
        />
        <MetricCard
          title="Efficiency"
          value={`${workCenter.efficiency}%`}
          icon={Settings}
          description="Performance rating"
        />
        <MetricCard
          title="Utilization"
          value="75%"
          icon={TrendingUp}
          description="Current month"
          trend="+5%"
        />
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="utilization">Utilization</TabsTrigger>
          <TabsTrigger value="work-orders">Work Orders</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{workCenter.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Code</p>
                    <p className="text-sm font-mono">{workCenter.code}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <StatusBadge isActive={workCenter.isActive} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(workCenter.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {workCenter.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{workCenter.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Capacity & Cost */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Capacity & Cost
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Daily Capacity</p>
                    <p className="text-sm">{formatHours(workCenter.capacity)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Cost per Hour</p>
                    <p className="text-sm">{formatCurrency(workCenter.costPerHour)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Efficiency</p>
                    <p className="text-sm">{workCenter.efficiency}%</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Daily Cost</p>
                    <p className="text-sm">{formatCurrency(workCenter.capacity * workCenter.costPerHour)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="utilization" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Utilization Analytics
              </CardTitle>
              <CardDescription>
                Work center utilization over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Utilization Chart</h3>
                <p className="text-muted-foreground">
                  Utilization analytics will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Recent Work Orders
              </CardTitle>
              <CardDescription>
                Work orders assigned to this work center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Work Orders</h3>
                <p className="text-muted-foreground">
                  Work orders for this work center will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Activity History
              </CardTitle>
              <CardDescription>
                Recent changes and activities for this work center
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Activity className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Activity History</h3>
                <p className="text-muted-foreground">
                  Activity history will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
