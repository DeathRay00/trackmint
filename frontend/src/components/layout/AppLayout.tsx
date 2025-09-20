import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Factory,
  ClipboardList,
  Wrench,
  Package,
  FileText,
  BarChart3,
  UserCircle,
  FileBarChart
} from 'lucide-react';
import { useStore, useUser } from '../../store';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';

const profileMenuItems = [
  { title: 'My Profile', href: '/me', icon: UserCircle },
  { title: 'My Reports', href: '/me/reports', icon: FileBarChart },
];

const masterMenuItems = [
  { title: 'Dashboard', href: '/', icon: BarChart3 },
  { title: 'Manufacturing Orders', href: '/manufacturing-orders', icon: Factory },
  { title: 'Work Orders', href: '/work-orders', icon: ClipboardList },
  { title: 'Work Centers', href: '/work-centers', icon: Wrench },
  { title: 'Stock Ledger', href: '/stock', icon: Package },
  { title: 'BOM', href: '/bom', icon: FileText },
];

export const AppLayout = () => {
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const user = useUser();
  const logout = useStore(state => state.logout);
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="w-full px-4 flex h-14 items-center justify-between">
          {/* Left section - Logo and toggle */}
          <div className="flex items-center">
            {/* Left sidebar toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden mr-2"
              onClick={() => setLeftSidebarOpen(!leftSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>

            {/* App Title */}
            <div className="flex items-center space-x-2">
              <Factory className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Trackmint</h1>
            </div>
          </div>

          {/* Global Search - Centered */}
          <div className="hidden md:flex flex-1 justify-center max-w-md">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders, products..."
                className="pl-8 w-full"
              />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-4 ml-4">
            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-4 w-4" />
              <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback>
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {profileMenuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.href} asChild>
                      <Link to={item.href} className="flex items-center">
                        <Icon className="mr-2 h-4 w-4" />
                        {item.title}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Left Sidebar - Master Menu */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 max-w-[30%] bg-card border-r transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          leftSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex flex-col h-full pt-4">
            <div className="flex items-center justify-between px-4 md:hidden">
              <h2 className="text-lg font-semibold">Master Menu</h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLeftSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="hidden md:block px-4 mb-4">
              <h2 className="text-lg font-semibold text-foreground">Master Menu</h2>
            </div>

            <nav className="flex-1 px-2 space-y-1">
              {masterMenuItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      "nav-link",
                      isActiveRoute(item.href) && "active"
                    )}
                    onClick={() => setLeftSidebarOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>

            {/* Additional Menu Items */}
            <div className="mt-auto px-2 pb-4 space-y-1 border-t pt-4">
              <Link
                to="/analytics"
                className={cn(
                  "nav-link",
                  isActiveRoute('/analytics') && "active"
                )}
                onClick={() => setLeftSidebarOpen(false)}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
              <Link
                to="/reports"
                className={cn(
                  "nav-link",
                  isActiveRoute('/reports') && "active"
                )}
                onClick={() => setLeftSidebarOpen(false)}
              >
                <FileText className="h-4 w-4" />
                Reports
              </Link>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 w-full overflow-x-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {leftSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => {
            setLeftSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
};