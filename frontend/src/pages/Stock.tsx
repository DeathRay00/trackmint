import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Plus,
  Search,
  Filter,
  Package,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Eye,
  Edit,
  MoreHorizontal,
  SortAsc,
  SortDesc,
  DollarSign,
  BarChart3
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
import type { Product, StockMove } from '../types';

const StockLevelBadge = ({ quantity, reorderLevel }: { quantity: number; reorderLevel: number }) => {
  if (quantity <= 0) {
    return <Badge className="bg-red-100 text-red-800">Out of Stock</Badge>;
  }
  if (quantity <= reorderLevel) {
    return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
  }
  return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
};

const StockTrendIcon = ({ trend }: { trend: 'up' | 'down' | 'stable' }) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-4 w-4 text-green-600" />;
    case 'down':
      return <TrendingDown className="h-4 w-4 text-red-600" />;
    default:
      return <div className="h-4 w-4" />;
  }
};

export const Stock = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [stockMoves, setStockMoves] = useState<StockMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('inventory');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsResponse, stockMovesResponse] = await Promise.all([
          apiService.getProducts(1, 100),
          apiService.getStockMoves(1, 50)
        ]);
        setProducts(productsResponse.data);
        setStockMoves(stockMovesResponse.data);
      } catch (error) {
        console.error('Failed to load stock data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
    const matchesStock = stockFilter === 'all' || 
                        (stockFilter === 'in-stock' && product.stockQuantity > product.reorderLevel) ||
                        (stockFilter === 'low-stock' && product.stockQuantity <= product.reorderLevel && product.stockQuantity > 0) ||
                        (stockFilter === 'out-of-stock' && product.stockQuantity <= 0);
    
    return matchesSearch && matchesCategory && matchesStock;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getTotalValue = () => {
    return products.reduce((sum, product) => sum + (product.stockQuantity * product.unitCost), 0);
  };

  const getLowStockCount = () => {
    return products.filter(product => product.stockQuantity <= product.reorderLevel && product.stockQuantity > 0).length;
  };

  const getOutOfStockCount = () => {
    return products.filter(product => product.stockQuantity <= 0).length;
  };

  const getCategories = () => {
    return [...new Set(products.map(product => product.category))];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <p className="mt-2 text-muted-foreground">Loading stock data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stock Management</h1>
          <p className="text-muted-foreground">
            Manage inventory, track movements, and monitor stock levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link to="/stock/products/new">
              <Plus className="mr-2 h-4 w-4" />
              New Product
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/stock/movements/new">
              <Plus className="mr-2 h-4 w-4" />
              Stock Movement
            </Link>
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">
              {getCategories().length} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(getTotalValue())}</div>
            <p className="text-xs text-muted-foreground">inventory value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{getLowStockCount()}</div>
            <p className="text-xs text-muted-foreground">items need restocking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{getOutOfStockCount()}</div>
            <p className="text-xs text-muted-foreground">items unavailable</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
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
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {getCategories().map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Filter by stock level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Stock Levels</SelectItem>
                    <SelectItem value="in-stock">In Stock</SelectItem>
                    <SelectItem value="low-stock">Low Stock</SelectItem>
                    <SelectItem value="out-of-stock">Out of Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products ({filteredProducts.length})</CardTitle>
              <CardDescription>
                {filteredProducts.length === products.length 
                  ? 'Showing all products'
                  : `Showing ${filteredProducts.length} of ${products.length} products`
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Product</th>
                      <th className="text-left p-4 font-medium">SKU</th>
                      <th className="text-left p-4 font-medium">Category</th>
                      <th className="text-left p-4 font-medium">Stock Level</th>
                      <th className="text-left p-4 font-medium">Unit Cost</th>
                      <th className="text-left p-4 font-medium">Total Value</th>
                      <th className="text-left p-4 font-medium">Status</th>
                      <th className="text-right p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="p-4">
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.description}</div>
                          </div>
                        </td>
                        <td className="p-4">
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {product.sku}
                          </code>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline">{product.category}</Badge>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{product.stockQuantity}</span>
                            <span className="text-sm text-muted-foreground">{product.unitOfMeasure}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {formatCurrency(product.unitCost)}
                        </td>
                        <td className="p-4">
                          {formatCurrency(product.stockQuantity * product.unitCost)}
                        </td>
                        <td className="p-4">
                          <StockLevelBadge 
                            quantity={product.stockQuantity} 
                            reorderLevel={product.reorderLevel} 
                          />
                        </td>
                        <td className="p-4 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link to={`/stock/products/${product.id}`}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link to={`/stock/products/${product.id}/edit`}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Product
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                Adjust Stock
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No products found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== 'all' || stockFilter !== 'all'
                      ? 'Try adjusting your search or filter criteria.'
                      : 'Create your first product to get started.'
                    }
                  </p>
                  {(!searchTerm && categoryFilter === 'all' && stockFilter === 'all') && (
                    <Button asChild>
                      <Link to="/stock/products/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Create First Product
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Stock Movements</CardTitle>
              <CardDescription>
                Latest stock movements and transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Stock Movements</h3>
                <p className="text-muted-foreground">
                  Stock movement history will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Analytics</CardTitle>
              <CardDescription>
                Inventory analytics and insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p className="text-muted-foreground">
                  Stock analytics and charts will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
