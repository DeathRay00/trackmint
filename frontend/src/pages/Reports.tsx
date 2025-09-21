import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Checkbox } from '../components/ui/checkbox';
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
  RefreshCw,
  FileSpreadsheet,
  FileImage,
  Mail,
  Settings,
  Plus
} from 'lucide-react';
import { apiService } from '../services/api';
import type { WorkOrder, ManufacturingOrder } from '../types';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'work_order' | 'manufacturing_order' | 'performance' | 'efficiency' | 'financial' | 'custom';
  category: 'operational' | 'financial' | 'performance' | 'compliance';
  fields: string[];
  isCustom: boolean;
  createdAt: Date;
}

interface GeneratedReport {
  id: string;
  templateId: string;
  name: string;
  type: string;
  status: 'generating' | 'completed' | 'failed';
  generatedAt: Date;
  fileUrl?: string;
  fileSize?: number;
  format: 'pdf' | 'excel' | 'csv';
  parameters: Record<string, any>;
}

interface ReportParameters {
  dateRange: string;
  workOrderStatus?: string[];
  manufacturingOrderStatus?: string[];
  workCenter?: string[];
  operator?: string[];
  includeCharts: boolean;
  includeDetails: boolean;
  groupBy?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const Reports = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [parameters, setParameters] = useState<ReportParameters>({
    dateRange: '30',
    includeCharts: true,
    includeDetails: true,
    groupBy: 'status',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [activeTab, setActiveTab] = useState('templates');

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

        // Load report templates
        setTemplates([
          {
            id: '1',
            name: 'Work Order Summary',
            description: 'Comprehensive summary of work orders with status and performance metrics',
            type: 'work_order',
            category: 'operational',
            fields: ['workOrderNumber', 'status', 'assignedOperator', 'plannedDuration', 'actualDuration', 'createdAt'],
            isCustom: false,
            createdAt: new Date()
          },
          {
            id: '2',
            name: 'Manufacturing Order Report',
            description: 'Detailed report of manufacturing orders with production metrics',
            type: 'manufacturing_order',
            category: 'operational',
            fields: ['orderNumber', 'product', 'quantity', 'status', 'priority', 'plannedStartDate', 'actualStartDate'],
            isCustom: false,
            createdAt: new Date()
          },
          {
            id: '3',
            name: 'Performance Analysis',
            description: 'Analysis of production performance and efficiency metrics',
            type: 'performance',
            category: 'performance',
            fields: ['efficiency', 'completionRate', 'averageDuration', 'onTimeDelivery'],
            isCustom: false,
            createdAt: new Date()
          },
          {
            id: '4',
            name: 'Financial Summary',
            description: 'Financial overview including costs, savings, and ROI',
            type: 'financial',
            category: 'financial',
            fields: ['totalValue', 'costSavings', 'efficiency', 'roi'],
            isCustom: false,
            createdAt: new Date()
          }
        ]);

        // Load generated reports
        setGeneratedReports([
          {
            id: '1',
            templateId: '1',
            name: 'Work Order Summary - Last 30 Days',
            type: 'work_order',
            status: 'completed',
            generatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
            fileUrl: '/reports/work-order-summary.pdf',
            fileSize: 1024000,
            format: 'pdf',
            parameters: { dateRange: '30' }
          },
          {
            id: '2',
            templateId: '2',
            name: 'Manufacturing Order Report - Q1 2024',
            type: 'manufacturing_order',
            status: 'completed',
            generatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            fileUrl: '/reports/manufacturing-orders.xlsx',
            fileSize: 2048000,
            format: 'excel',
            parameters: { dateRange: '90' }
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

  const generateReport = async (template: ReportTemplate) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Simulate report generation
      const reportId = Date.now().toString();
      const newReport: GeneratedReport = {
        id: reportId,
        templateId: template.id,
        name: `${template.name} - ${getDateRangeLabel(parameters.dateRange)}`,
        type: template.type,
        status: 'generating',
        generatedAt: new Date(),
        format: 'pdf',
        parameters: { ...parameters }
      };

      setGeneratedReports(prev => [newReport, ...prev]);

      // Simulate generation process
      setTimeout(() => {
        setGeneratedReports(prev => 
          prev.map(report => 
            report.id === reportId 
              ? { 
                  ...report, 
                  status: 'completed', 
                  fileUrl: `/reports/${template.name.toLowerCase().replace(/\s+/g, '-')}-${reportId}.pdf`,
                  fileSize: Math.floor(Math.random() * 2000000) + 500000
                }
              : report
          )
        );
        setSuccess('Report generated successfully');
      }, 3000);

    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (report: GeneratedReport) => {
    if (report.fileUrl) {
      // In a real app, this would download the actual file
      console.log(`Downloading report: ${report.name}`);
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = report.fileUrl;
      link.download = `${report.name}.${report.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const getDateRangeLabel = (range: string) => {
    switch (range) {
      case '7': return 'Last 7 Days';
      case '30': return 'Last 30 Days';
      case '90': return 'Last 90 Days';
      case '365': return 'Last Year';
      default: return 'Custom Range';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Completed</Badge>;
      case 'generating':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="mr-1 h-3 w-3" />Generating</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="mr-1 h-3 w-3" />Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'pdf':
        return <FileText className="h-4 w-4" />;
      case 'excel':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'csv':
        return <FileText className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading && !templates.length) {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
          <p className="text-muted-foreground">
            Generate and manage production reports
          </p>
        </div>
        <Button onClick={() => setActiveTab('generate')}>
          <Plus className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="templates">Report Templates</TabsTrigger>
          <TabsTrigger value="generate">Generate Report</TabsTrigger>
          <TabsTrigger value="generated">Generated Reports</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
        </TabsList>

        {/* Report Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Included Fields:</h4>
                    <div className="flex flex-wrap gap-1">
                      {template.fields.slice(0, 3).map((field) => (
                        <Badge key={field} variant="secondary" className="text-xs">
                          {field}
                        </Badge>
                      ))}
                      {template.fields.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{template.fields.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => {
                        setSelectedTemplate(template);
                        setActiveTab('generate');
                      }}
                      className="flex-1"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Generate Report Tab */}
        <TabsContent value="generate" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Report Configuration</CardTitle>
                <CardDescription>
                  Configure report parameters and settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="template">Report Template</Label>
                  <Select 
                    value={selectedTemplate?.id || ''} 
                    onValueChange={(value) => setSelectedTemplate(templates.find(t => t.id === value) || null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={parameters.dateRange} onValueChange={(value) => setParameters(prev => ({ ...prev, dateRange: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">Last 7 Days</SelectItem>
                      <SelectItem value="30">Last 30 Days</SelectItem>
                      <SelectItem value="90">Last 90 Days</SelectItem>
                      <SelectItem value="365">Last Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value="pdf" onValueChange={() => {}}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF Document</SelectItem>
                      <SelectItem value="excel">Excel Spreadsheet</SelectItem>
                      <SelectItem value="csv">CSV File</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeCharts" 
                      checked={parameters.includeCharts}
                      onCheckedChange={(checked) => setParameters(prev => ({ ...prev, includeCharts: !!checked }))}
                    />
                    <Label htmlFor="includeCharts">Include Charts and Graphs</Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="includeDetails" 
                      checked={parameters.includeDetails}
                      onCheckedChange={(checked) => setParameters(prev => ({ ...prev, includeDetails: !!checked }))}
                    />
                    <Label htmlFor="includeDetails">Include Detailed Data</Label>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Report Preview</CardTitle>
                <CardDescription>
                  Preview of the selected report template
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedTemplate ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium">{selectedTemplate.name}</h4>
                      <p className="text-sm text-muted-foreground">{selectedTemplate.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium mb-2">Included Data:</h4>
                      <div className="space-y-1">
                        {selectedTemplate.fields.map((field) => (
                          <div key={field} className="flex items-center space-x-2">
                            <CheckCircle className="h-3 w-3 text-green-600" />
                            <span className="text-sm">{field}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4 border-t">
                      <Button 
                        onClick={() => selectedTemplate && generateReport(selectedTemplate)}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <FileText className="mr-2 h-4 w-4" />
                            Generate Report
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">Select a template to preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Generated Reports Tab */}
        <TabsContent value="generated" className="space-y-4">
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
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Report Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Format</TableHead>
                    <TableHead>Generated</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {generatedReports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getFormatIcon(report.format)}
                          <span className="font-medium">{report.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {report.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {report.format.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {report.generatedAt.toLocaleDateString()}
                      </TableCell>
                      <TableCell>{getStatusBadge(report.status)}</TableCell>
                      <TableCell>
                        {report.fileSize ? formatFileSize(report.fileSize) : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => downloadReport(report)}
                            disabled={report.status !== 'completed'}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                          {report.status === 'generating' && (
                            <Button size="sm" variant="outline" disabled>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Generating
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Scheduled Reports Tab */}
        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scheduled Reports</CardTitle>
              <CardDescription>
                Manage automatically scheduled reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No Scheduled Reports</h3>
                <p className="text-muted-foreground">
                  Create scheduled reports to automatically generate and email reports on a regular basis.
                </p>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Scheduled Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
