import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Sheet, SheetContent, SheetTrigger } from '../ui/sheet';
import { 
  Menu, 
  X, 
  Home, 
  Wrench, 
  Factory, 
  BarChart3, 
  FileText, 
  User, 
  Settings,
  Bell,
  Search
} from 'lucide-react';
import { useMobile } from '../../hooks/use-mobile';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  currentPage?: string;
}

const navigationItems = [
  { id: 'dashboard', label: 'Dashboard', icon: Home, href: '/dashboard' },
  { id: 'work-orders', label: 'Work Orders', icon: Wrench, href: '/work-orders' },
  { id: 'manufacturing', label: 'Manufacturing', icon: Factory, href: '/manufacturing-orders' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/analytics' },
  { id: 'reports', label: 'Reports', icon: FileText, href: '/reports' },
  { id: 'profile', label: 'Profile', icon: User, href: '/profile' },
];

export const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({ 
  children, 
  currentPage 
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useMobile();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <Factory className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-lg">TrackMint</span>
        </div>
        {isMobile && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <Button
              key={item.id}
              variant={isActive ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => {
                if (isMobile) {
                  setSidebarOpen(false);
                }
                // Navigation would be handled by React Router
                window.location.href = item.href;
              }}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
            <User className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-muted-foreground truncate">Operator</p>
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      {isMobile && (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Factory className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-bold">TrackMint</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="w-4 h-4" />
              </Button>
              <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="w-4 h-4" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <SidebarContent />
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </header>
      )}

      <div className="flex h-screen">
        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside className="w-64 border-r bg-background">
            <SidebarContent />
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {isMobile ? (
            <div className="p-4">
              {children}
            </div>
          ) : (
            <div className="p-6">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
