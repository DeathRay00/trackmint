import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  FileText, 
  Download, 
  Calendar, 
  BarChart3, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Filter,
  Search,
  RefreshCw
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WorkOrder, ManufacturingOrder } from '../types';

interface ReportData {
  id: string;
  title: string;
  type: 'work_order' | 'manufacturing_order' | 'performance' | 'efficiency';
  generatedAt: Date;
  period: string;
  status: 'completed' | 'in_progress' | 'failed';
  fileUrl?: string;
}

interface PerformanceMetrics {
  totalWorkOrders: number;
  completedWorkOrders: number;
  averageCompletionTime: number;
  efficiency: number;
  onTimeDelivery: number;
}

export const MyReports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reports, setReports] = useState<ReportData[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [woResponse, moResponse] = await Promise.all([
          apiService.getWorkOrders(1, 100),
          apiService.getManufacturingOrders(1, 100)
        ]);

        setWorkOrders(woResponse.data);
        setManufacturingOrders(moResponse.data);
        
        // Generate mock performance metrics
        setPerformanceMetrics({
          totalWorkOrders: woResponse.data.length,
          completedWorkOrders: woResponse.data.filter(wo => wo.status === 'Completed').length,
          averageCompletionTime: 120, // minutes
          efficiency: 85,
          onTimeDelivery: 92
        });

        // Generate mock reports
        setReports([
          {
            id: '1',
            title: 'Work Order Performance Report',
            type: 'performance',
            generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            period: 'Last 30 days',
            status: 'completed',
            fileUrl: '/reports/work-order-performance.pdf'
          },
          {
            id: '2',
            title: 'Manufacturing Efficiency Report',
            type: 'efficiency',
            generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            period: 'Last 7 days',
            status: 'completed',
            fileUrl: '/reports/manufacturing-efficiency.pdf'
          },
          {
            id: '3',
            title: 'Weekly Work Order Summary',
            type: 'work_order',
            generatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
            period: 'Last 7 days',
            status: 'completed',
            fileUrl: '/reports/weekly-work-orders.pdf'
          }
        ]);
      } catch (err) {
        setError('Failed to load reports data');
        console.error('Error loading reports:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const generateReport = async (type: string) => {
    try {
      setLoading(true);
      // In a real app, this would call the API to generate a report
      console.log(`Generating ${type} report for ${dateRange} days`);
      
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newReport: ReportData = {
        id: Date.now().toString(),
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        type: type as any,
        generatedAt: new Date(),
        period: `Last ${dateRange} days`,
        status: 'completed',
        fileUrl: `/reports/${type}-${Date.now()}.pdf`
      };
      
      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (report: ReportData) => {
    if (report.fileUrl) {
      // In a real app, this would download the actual file
      console.log(`Downloading report: ${report.title}`);
      // window.open(report.fileUrl, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'in_progress':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />In Progress</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'work_order':
        return <Clock className="h-4 w-4" />;
      case 'manufacturing_order':
        return <BarChart3 className="h-4 w-4" />;
      case 'performance':
        return <TrendingUp className="h-4 w-4" />;
      case 'efficiency':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const filteredReports = reports.filter(report => {
    const matchesType = reportType === 'all' || report.type === reportType;
    const matchesSearch = report.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  if (loading && !reports.length) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading reports...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">My Reports</h1>
        <p className="text-muted-foreground">
          Generate and download reports for your work orders and performance
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Performance Overview */}
      {performanceMetrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Work Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.totalWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                All time
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.completedWorkOrders}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((performanceMetrics.completedWorkOrders / performanceMetrics.totalWorkOrders) * 100)}% completion rate
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.efficiency}%</div>
              <p className="text-xs text-muted-foreground">
                Average efficiency
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">On-Time Delivery</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{performanceMetrics.onTimeDelivery}%</div>
              <p className="text-xs text-muted-foreground">
                Delivery performance
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="work-orders">My Work Orders</TabsTrigger>
        </TabsList>

        {/* Generated Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Generated Reports</CardTitle>
                  <CardDescription>
                    View and download your previously generated reports
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reports..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="work_order">Work Orders</SelectItem>
                      <SelectItem value="manufacturing_order">Manufacturing Orders</SelectItem>
                      <SelectItem value="performance">Performance</SelectItem>
                      <SelectItem value="efficiency">Efficiency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(report.type)}
                          <span className="font-medium">{report.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{report.period}</TableCell>
                      <TableCell>
                        {report.generatedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadReport(report)}
                          disabled={report.status !== 'completed'}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Create a new report based on your work data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="reportType">Report Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="work_order">Work Order Summary</SelectItem>
                      <SelectItem value="manufacturing_order">Manufacturing Order Report</SelectItem>
                      <SelectItem value="performance">Performance Analysis</SelectItem>
                      <SelectItem value="efficiency">Efficiency Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 days</SelectItem>
                      <SelectItem value="30">Last 30 days</SelectItem>
                      <SelectItem value="90">Last 90 days</SelectItem>
                      <SelectItem value="365">Last year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button 
                onClick={() => generateReport(reportType)}
                disabled={loading}
                className="w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating Report...
                  </>
                ) : (
                  <>
                    <FileText className="mr-2 h-4 w-4" />
                    Generate Report
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* My Work Orders Tab */}
        <TabsContent value="work-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>My Work Orders</CardTitle>
              <CardDescription>
                View your assigned work orders and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Work Order</TableHead>
                    <TableHead>Operation</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workOrders.map((wo) => (
                    <TableRow key={wo.id}>
                      <TableCell className="font-medium">{wo.workOrderNumber}</TableCell>
                      <TableCell>{wo.bomOperation.description}</TableCell>
                      <TableCell>
                        <Badge variant={
                          wo.status === 'Completed' ? 'default' :
                          wo.status === 'Started' ? 'secondary' :
                          wo.status === 'Paused' ? 'outline' : 'secondary'
                        }>
                          {wo.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {Math.floor(wo.plannedDuration / 60)}h {wo.plannedDuration % 60}m
                      </TableCell>
                      <TableCell>
                        {new Date(wo.createdAt).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
