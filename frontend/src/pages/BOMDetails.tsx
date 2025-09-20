import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  ArrowLeft,
  Edit,
  FileText,
  Package,
  Settings,
  DollarSign,
  Copy,
  Trash2,
  Plus,
  Clock,
  Factory
} from 'lucide-react';
import { apiService } from '../services/api';
import type { BOM } from '../types';

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

const VersionBadge = ({ version }: { version: string }) => {
  return (
    <Badge variant="outline" className="font-mono">
      v{version}
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

export const BOMDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [bom, setBom] = useState<BOM | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBOM = async () => {
      if (!id) return;
      
      try {
        const response = await apiService.getBOM(id);
        setBom(response.data);
      } catch (error) {
        console.error('Failed to load BOM:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBOM();
  }, [id]);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading BOM...</p>
        </div>
      </div>
    );
  }

  if (!bom) {
    return (
      <div className="text-center py-8">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">BOM not found</h3>
        <p className="text-muted-foreground mb-4">
          The BOM you're looking for doesn't exist or has been deleted.
        </p>
        <Button asChild>
          <Link to="/bom">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to BOMs
          </Link>
        </Button>
      </div>
    );
  }

  const materialCost = bom.components?.reduce((sum, comp) => sum + (comp.quantity * comp.unitCost), 0) || 0;
  const laborCost = bom.operations?.reduce((sum, op) => sum + ((op.duration + op.setupTime) / 60 * op.costPerHour), 0) || 0;
  const totalDuration = bom.operations?.reduce((sum, op) => sum + op.duration + op.setupTime, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/bom')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to BOMs
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{bom.name}</h1>
            <p className="text-muted-foreground">
              <VersionBadge version={bom.version} />
              <span className="ml-3">
                <StatusBadge isActive={bom.isActive} />
              </span>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to={`/bom/${bom.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit BOM
            </Link>
          </Button>
          <Button variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Cost"
          value={formatCurrency(bom.totalCost)}
          icon={DollarSign}
          description="manufacturing cost"
        />
        <MetricCard
          title="Components"
          value={`${bom.components?.length || 0}`}
          icon={Package}
          description="materials required"
        />
        <MetricCard
          title="Operations"
          value={`${bom.operations?.length || 0}`}
          icon={Settings}
          description="manufacturing steps"
        />
        <MetricCard
          title="Total Duration"
          value={formatDuration(totalDuration)}
          icon={Clock}
          description="manufacturing time"
        />
      </div>

      {/* Details Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="components">Components</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Name</p>
                    <p className="text-sm">{bom.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Version</p>
                    <p className="text-sm font-mono">v{bom.version}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Status</p>
                    <StatusBadge isActive={bom.isActive} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Created</p>
                    <p className="text-sm">{new Date(bom.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                {bom.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm">{bom.description}</p>
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
                    <p className="text-sm">{bom.product.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">SKU</p>
                    <p className="text-sm font-mono">{bom.product.sku}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Category</p>
                    <p className="text-sm">{bom.product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unit of Measure</p>
                    <p className="text-sm">{bom.product.unitOfMeasure}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="components" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Components
              </CardTitle>
              <CardDescription>
                Materials and components required for this BOM
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bom.components && bom.components.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>SKU</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Cost</TableHead>
                        <TableHead>Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.components.map((component) => (
                        <TableRow key={component.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{component.product.name}</div>
                              <div className="text-sm text-muted-foreground">{component.product.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <code className="text-sm bg-muted px-2 py-1 rounded">
                              {component.product.sku}
                            </code>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <span className="font-medium">{component.quantity}</span>
                              <span className="text-sm text-muted-foreground">{component.product.unitOfMeasure}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatCurrency(component.unitCost)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(component.quantity * component.unitCost)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No components</h3>
                  <p className="text-muted-foreground">
                    This BOM doesn't have any components defined yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Operations
              </CardTitle>
              <CardDescription>
                Manufacturing operations and work centers
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bom.operations && bom.operations.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Sequence</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Work Center</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Setup Time</TableHead>
                        <TableHead>Cost/Hour</TableHead>
                        <TableHead>Total Cost</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bom.operations
                        .sort((a, b) => a.sequence - b.sequence)
                        .map((operation) => (
                        <TableRow key={operation.id}>
                          <TableCell>
                            <Badge variant="outline">{operation.sequence}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{operation.description}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Factory className="h-4 w-4" />
                              <span>{operation.workCenter.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {formatDuration(operation.duration)}
                          </TableCell>
                          <TableCell>
                            {formatDuration(operation.setupTime)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency(operation.costPerHour)}
                          </TableCell>
                          <TableCell>
                            {formatCurrency((operation.duration + operation.setupTime) / 60 * operation.costPerHour)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No operations</h3>
                  <p className="text-muted-foreground">
                    This BOM doesn't have any operations defined yet.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Cost Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Material Cost</span>
                    <span className="text-sm">{formatCurrency(materialCost)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Labor Cost</span>
                    <span className="text-sm">{formatCurrency(laborCost)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between font-bold">
                      <span>Total Cost</span>
                      <span>{formatCurrency(bom.totalCost)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Time Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Total Duration</span>
                    <span className="text-sm">{formatDuration(totalDuration)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Setup Time</span>
                    <span className="text-sm">{formatDuration(bom.operations?.reduce((sum, op) => sum + op.setupTime, 0) || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Production Time</span>
                    <span className="text-sm">{formatDuration(bom.operations?.reduce((sum, op) => sum + op.duration, 0) || 0)}</span>
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
