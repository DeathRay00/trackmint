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
  FileText,
  Eye,
  Edit,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  DollarSign,
  Package,
  Settings,
  Copy
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

export const BOMList = () => {
  const [boms, setBoms] = useState<BOM[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof BOM>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadBOMs = async () => {
      try {
        const response = await apiService.getBOMs();
        setBOMs(response.data);
      } catch (error) {
        console.error('Failed to load BOMs:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBOMs();
  }, []);

  const filteredBOMs = boms
    .filter(bom => {
      const matchesSearch = bom.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bom.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           bom.version.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && bom.isActive) ||
                           (statusFilter === 'inactive' && !bom.isActive);
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof BOM) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof BOM) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalComponents = (bom: BOM) => {
    return bom.components?.length || 0;
  };

  const getTotalOperations = (bom: BOM) => {
    return bom.operations?.length || 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading BOMs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bill of Materials</h1>
          <p className="text-muted-foreground">
            Manage product BOMs, components, and operations
          </p>
        </div>
        <Button asChild>
          <Link to="/bom/new">
            <Plus className="mr-2 h-4 w-4" />
            New BOM
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total BOMs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{boms.length}</div>
            <p className="text-xs text-muted-foreground">
              {boms.filter(bom => bom.isActive).length} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Components</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boms.reduce((sum, bom) => sum + getTotalComponents(bom), 0)}
            </div>
            <p className="text-xs text-muted-foreground">across all BOMs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Operations</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {boms.reduce((sum, bom) => sum + getTotalOperations(bom), 0)}
            </div>
            <p className="text-xs text-muted-foreground">manufacturing steps</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(
                boms.length > 0 
                  ? boms.reduce((sum, bom) => sum + bom.totalCost, 0) / boms.length
                  : 0
              )}
            </div>
            <p className="text-xs text-muted-foreground">per BOM</p>
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
                  placeholder="Search BOMs..."
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

      {/* BOMs Table */}
      <Card>
        <CardHeader>
          <CardTitle>BOMs ({filteredBOMs.length})</CardTitle>
          <CardDescription>
            {filteredBOMs.length === boms.length 
              ? 'Showing all BOMs'
              : `Showing ${filteredBOMs.length} of ${boms.length} BOMs`
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
                      BOM Name
                      {getSortIcon('name')}
                    </div>
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('version')}
                  >
                    <div className="flex items-center gap-2">
                      Version
                      {getSortIcon('version')}
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Components</TableHead>
                  <TableHead>Operations</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('totalCost')}
                  >
                    <div className="flex items-center gap-2">
                      Total Cost
                      {getSortIcon('totalCost')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBOMs.map((bom) => (
                  <TableRow key={bom.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <Link 
                        to={`/bom/${bom.id}`}
                        className="text-primary hover:underline"
                      >
                        {bom.name}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{bom.product.name}</div>
                        <div className="text-sm text-muted-foreground">{bom.product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <VersionBadge version={bom.version} />
                    </TableCell>
                    <TableCell>
                      <StatusBadge isActive={bom.isActive} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Package className="h-4 w-4" />
                        {getTotalComponents(bom)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Settings className="h-4 w-4" />
                        {getTotalOperations(bom)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <DollarSign className="h-4 w-4" />
                        {formatCurrency(bom.totalCost)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">
                        {new Date(bom.createdAt).toLocaleDateString()}
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
                            <Link to={`/bom/${bom.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link to={`/bom/${bom.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit BOM
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate BOM
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            {bom.isActive ? 'Deactivate' : 'Activate'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredBOMs.length === 0 && (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No BOMs found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first BOM to get started.'
                }
              </p>
              {(!searchTerm && statusFilter === 'all') && (
                <Button asChild>
                  <Link to="/bom/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First BOM
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
