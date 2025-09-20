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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Eye,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  Calendar,
  Package,
  User
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
import type { StockMove } from '../types';

const MoveTypeBadge = ({ type }: { type: string }) => {
  const getTypeConfig = (type: string) => {
    switch (type.toLowerCase()) {
      case 'receipt':
      case 'in':
        return { color: 'bg-green-100 text-green-800', icon: ArrowUp };
      case 'issue':
      case 'out':
        return { color: 'bg-red-100 text-red-800', icon: ArrowDown };
      case 'transfer':
        return { color: 'bg-blue-100 text-blue-800', icon: ArrowUpDown };
      case 'adjustment':
        return { color: 'bg-yellow-100 text-yellow-800', icon: RotateCcw };
      default:
        return { color: 'bg-gray-100 text-gray-800', icon: ArrowUpDown };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <Badge className={`${config.color} flex items-center gap-1`}>
      <Icon className="h-3 w-3" />
      {type}
    </Badge>
  );
};

const QuantityDisplay = ({ quantity, type }: { quantity: number; type: string }) => {
  const isPositive = ['receipt', 'in', 'adjustment'].includes(type.toLowerCase()) ? quantity > 0 : quantity > 0;
  const isNegative = ['issue', 'out'].includes(type.toLowerCase()) ? quantity > 0 : quantity < 0;
  
  return (
    <div className={`flex items-center gap-1 ${isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-muted-foreground'}`}>
      {isPositive && <ArrowUp className="h-4 w-4" />}
      {isNegative && <ArrowDown className="h-4 w-4" />}
      <span className="font-medium">{Math.abs(quantity)}</span>
    </div>
  );
};

export const StockMovements = () => {
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof StockMove>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    const loadStockMoves = async () => {
      try {
        const response = await apiService.getStockMoves(1, 100);
        setStockMoves(response.data);
      } catch (error) {
        console.error('Failed to load stock movements:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStockMoves();
  }, []);

  const filteredMoves = stockMoves
    .filter(move => {
      const matchesSearch = move.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           move.product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           move.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = typeFilter === 'all' || move.type.toLowerCase() === typeFilter.toLowerCase();
      
      // Date filtering (simplified - would need proper date range in real implementation)
      const matchesDate = dateFilter === 'all' || 
                         (dateFilter === 'today' && isToday(move.createdAt)) ||
                         (dateFilter === 'week' && isThisWeek(move.createdAt)) ||
                         (dateFilter === 'month' && isThisMonth(move.createdAt));
      
      return matchesSearch && matchesType && matchesDate;
    })
    .sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

  const handleSort = (field: keyof StockMove) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: keyof StockMove) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />;
  };

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

  const isToday = (date: Date) => {
    const today = new Date();
    const moveDate = new Date(date);
    return moveDate.toDateString() === today.toDateString();
  };

  const isThisWeek = (date: Date) => {
    const today = new Date();
    const moveDate = new Date(date);
    const diffTime = today.getTime() - moveDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7;
  };

  const isThisMonth = (date: Date) => {
    const today = new Date();
    const moveDate = new Date(date);
    return moveDate.getMonth() === today.getMonth() && moveDate.getFullYear() === today.getFullYear();
  };

  const getMoveTypes = () => {
    return [...new Set(stockMoves.map(move => move.type))];
  };

  const getTotalValue = () => {
    return stockMoves.reduce((sum, move) => sum + (move.quantity * move.unitCost), 0);
  };

  const getTodayMoves = () => {
    return stockMoves.filter(move => isToday(move.createdAt)).length;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <ArrowUpDown className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading stock movements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Movements</h1>
          <p className="text-muted-foreground">
            Track all inventory movements and transactions
          </p>
        </div>
        <Button asChild>
          <Link to="/stock/movements/new">
            <Plus className="mr-2 h-4 w-4" />
            New Movement
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Movements</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stockMoves.length}</div>
            <p className="text-xs text-muted-foreground">
              {getTodayMoves()} today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalValue())}</div>
            <p className="text-xs text-muted-foreground">moved value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receipts</CardTitle>
            <ArrowUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stockMoves.filter(m => m.type.toLowerCase() === 'receipt' || m.type.toLowerCase() === 'in').length}
            </div>
            <p className="text-xs text-muted-foreground">incoming movements</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <ArrowDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {stockMoves.filter(m => m.type.toLowerCase() === 'issue' || m.type.toLowerCase() === 'out').length}
            </div>
            <p className="text-xs text-muted-foreground">outgoing movements</p>
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
                  placeholder="Search movements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {getMoveTypes().map(type => (
                  <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Movements Table */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Movements ({filteredMoves.length})</CardTitle>
          <CardDescription>
            {filteredMoves.length === stockMoves.length 
              ? 'Showing all movements'
              : `Showing ${filteredMoves.length} of ${stockMoves.length} movements`
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
                    onClick={() => handleSort('createdAt')}
                  >
                    <div className="flex items-center gap-2">
                      Date & Time
                      {getSortIcon('createdAt')}
                    </div>
                  </TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('type')}
                  >
                    <div className="flex items-center gap-2">
                      Type
                      {getSortIcon('type')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('quantity')}
                  >
                    <div className="flex items-center gap-2">
                      Quantity
                      {getSortIcon('quantity')}
                    </div>
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('unitCost')}
                  >
                    <div className="flex items-center gap-2">
                      Unit Cost
                      {getSortIcon('unitCost')}
                    </div>
                  </TableHead>
                  <TableHead>Total Value</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMoves.map((move) => (
                  <TableRow key={move.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        {formatDate(move.createdAt)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{move.product.name}</div>
                        <div className="text-sm text-muted-foreground">{move.product.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <MoveTypeBadge type={move.type} />
                    </TableCell>
                    <TableCell>
                      <QuantityDisplay quantity={move.quantity} type={move.type} />
                    </TableCell>
                    <TableCell>
                      {formatCurrency(move.unitCost)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(move.quantity * move.unitCost)}
                    </TableCell>
                    <TableCell>
                      {move.reference ? (
                        <div className="text-sm">
                          <div className="font-medium">{move.referenceType}</div>
                          <div className="text-muted-foreground">{move.reference}</div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
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
                            <Link to={`/stock/movements/${move.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            Edit Movement
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete Movement
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {filteredMoves.length === 0 && (
            <div className="text-center py-8">
              <ArrowUpDown className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No movements found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || typeFilter !== 'all' || dateFilter !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Create your first stock movement to get started.'
                }
              </p>
              {(!searchTerm && typeFilter === 'all' && dateFilter === 'all') && (
                <Button asChild>
                  <Link to="/stock/movements/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Create First Movement
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
