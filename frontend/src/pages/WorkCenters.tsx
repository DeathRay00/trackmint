import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { 
  Plus,
  Search,
  Filter,
  Factory,
  Settings,
  Eye,
  Edit,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Clock,
  DollarSign,
  TrendingUp
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
import type { WorkCenter } from '../types';

const StatusBadge = ({ isActive }: { isActive: boolean }) => {
  return (
    <Badge className={isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
};

const UtilizationCard = ({ workCenter }: { workCenter: WorkCenter }) => {
  const utilization = 75; // Mock data - would come from API
  const getUtilizationColor = (util: number) => {
    if (util >= 90) return 'text-red-600';
    if (util >= 75) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="flex items-center gap-2">
      <TrendingUp className="h-4 w-4 text-muted-foreground" />
      <span className={`text-sm font-medium ${getUtilizationColor(utilization)}`}>
        {utilization}%
      </span>
    </div>
  );
};

export const WorkCenters = () => {
  const [workCenters, setWorkCenters] = useState<WorkCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof WorkCenter>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    const loadWorkCenters = async () => {
      try {
        const response = await apiService.getWorkCenters(1, 50);
        setWorkCenters(response.data);
      } catch (error) {
        console.error('Failed to load work centers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWorkCenters();
  }, []);

  const filteredWorkCenters = workCenters
    .filter(workCenter => {
      const matchesSearch = workCenter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           workCenter.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && workCenter.isActive) ||
                           (statusFilter === 'inactive' && !workCenter.isActive);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof WorkCenter) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof WorkCenter) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

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
          <p className="mt-2 text-muted-foreground">Loading work centers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Work Centers</h1>
          <p className="text-muted-foreground">
            Manage production work centers, capacity, and utilization
          </p>
        </div>
        <Button asChild>
          <Link to="/work-centers/new">
            <Plus className="mr-2 h-4 w-4" />
            New Work Center
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Work Centers</CardTitle>
            <Factory className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{workCenters.length}</div>
            <p className="text-xs text-muted-foreground">
              {workCenters.filter(wc => wc.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workCenters.reduce((sum, wc) => sum + wc.capacity, 0).toFixed(1)}h
            </div>
            <p className="text-xs text-muted-foreground">per day</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Cost/Hour</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                workCenters.length > 0 
                  ? workCenters.reduce((sum, wc) => sum + wc.costPerHour, 0) / workCenters.length
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">average rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">this month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
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
                  placeholder="Search work centers..."
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
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Work Centers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Work Centers ({filteredWorkCenters.length})</CardTitle>
          <CardDescription>
            {filteredWorkCenters.length === workCenters.length 
              ? 'Showing all work centers'
              : `Showing ${filteredWorkCenters.length} of ${workCenters.length} work centers`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center gap-2">
                      Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('code')}
                  >
                    <div className="flex items-center gap-2">
                      Code
                      {getSortIcon('code')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('capacity')}
                  >
                    <div className="flex items-center gap-2">
                      Capacity
                      {getSortIcon('capacity')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('costPerHour')}
                  >
                    <div className="flex items-center gap-2">
                      Cost/Hour
                      {getSortIcon('costPerHour')}
                    </div>
                  </TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('efficiency')}
                  >
                    <div className="flex items-center gap-2">
                      Efficiency
                      {getSortIcon('efficiency')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkCenters.map((workCenter) => (
                  <TableRow key={workCenter.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link 
                        to={`/work-centers/${workCenter.id}`}
                        className="text-primary hover:underline"
                      >
                        {workCenter.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <code className="text-sm bg-muted px-2 py-1 rounded">
                        {workCenter.code}
                      </code>
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={workCenter.isActive} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Clock className="h-4 w-4" />
                        {formatHours(workCenter.capacity)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(workCenter.costPerHour)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <UtilizationCard workCenter={workCenter} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Settings className="h-4 w-4" />
                        {workCenter.efficiency}%
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link to={`/work-centers/${workCenter.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/work-centers/${workCenter.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Work Center
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            {workCenter.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredWorkCenters.length === 0 && (
            <div className="text-center py-8">
              <Factory className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No work centers found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first work center to get started.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button asChild>
                  <Link to="/work-centers/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Work Center
                  </Link>
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
