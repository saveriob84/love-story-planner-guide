import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { PanelLeft, X, Menu, Home, Users, CheckSquare, GripHorizontal, CreditCard, Settings, Map } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sidebar } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const isMobile = useIsMobile();

  const mainNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Ospiti', href: '/guests', icon: Users },
    { name: 'Checklist', href: '/checklist', icon: CheckSquare },
    { name: 'Tavoli', href: '/tables', icon: GripHorizontal },
    { name: 'Budget', href: '/budget', icon: CreditCard },
    { name: 'Roadmap', href: '/roadmap', icon: Map },
  ];

  const vendorNavItems = [
    { name: 'Dashboard', href: '/vendor-dashboard', icon: Home },
    { name: 'Profilo', href: '/profile', icon: Settings },
  ];

  // Determine which nav items to show based on user role
  const navItems = user?.role === 'vendor' ? vendorNavItems : mainNavItems;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar for desktop */}
      <aside
        className={cn(
          "hidden lg:flex lg:flex-col fixed inset-y-0 z-50 w-64 border-r transition-transform duration-300 ease-in-out bg-white",
          {
            "translate-x-0": sidebarOpen || !isMobile,
            "-translate-x-full": !sidebarOpen && isMobile,
          }
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b">
          <Link to="/" className="flex items-center">
            <img src="/wedding-logo.svg" alt="Wedding Planner Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-wedding-navy">Wedding</span>
          </Link>
        </div>
        <Sidebar className="p-4 flex-1 overflow-auto">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-wedding-blush/10 text-wedding-blush"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <IconComponent className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </Sidebar>
        <div className="p-4 border-t">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className="text-gray-500 hover:text-red-500"
            >
              Esci
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-50 lg:hidden",
          sidebarOpen ? "block" : "hidden"
        )}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white">
          <div className="flex items-center justify-between h-14 px-4 border-b">
            <Link to="/" className="flex items-center">
              <img src="/wedding-logo.svg" alt="Wedding Planner Logo" className="h-8 w-8 mr-2" />
              <span className="text-xl font-bold text-wedding-navy">Wedding</span>
            </Link>
            <button
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4">
            <div className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-wedding-blush/10 text-wedding-blush"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <IconComponent className="h-4 w-4" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{user?.name}</p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="text-gray-500 hover:text-red-500"
              >
                Esci
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <header className="flex items-center h-14 px-4 border-b bg-white lg:hidden">
          <button
            className="text-gray-500 hover:text-gray-700 mr-4"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link to="/" className="flex items-center">
            <img src="/wedding-logo.svg" alt="Wedding Planner Logo" className="h-8 w-8 mr-2" />
            <span className="text-xl font-bold text-wedding-navy">Wedding</span>
          </Link>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
};

export default MainLayout;
