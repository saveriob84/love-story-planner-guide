import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CheckIcon, CalendarIcon, UserIcon, Settings, Bell, Menu, LogOut, Utensils } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Navigation items
  const navItems = [
    { 
      name: "Dashboard", 
      path: "/dashboard", 
      icon: <img src="/wedding-logo.svg" alt="Dashboard" className="h-5 w-5" /> 
    },
    { 
      name: "Checklist", 
      path: "/checklist", 
      icon: <CheckIcon className="h-5 w-5" /> 
    },
    { 
      name: "Budget", 
      path: "/budget", 
      icon: <span className="text-lg font-medium">€</span>
    },
    { 
      name: "Ospiti", 
      path: "/guests", 
      icon: <UserIcon className="h-5 w-5" /> 
    },
    { 
      name: "Calendario", 
      path: "/calendar", 
      icon: <CalendarIcon className="h-5 w-5" /> 
    },
  ];
  
  // Get initials for avatar
  const getInitials = () => {
    if (!user) return "U";
    
    let initials = "";
    if (user.name) {
      initials += user.name.charAt(0).toUpperCase();
    }
    if (user.partnerName) {
      initials += user.partnerName.charAt(0).toUpperCase();
    }
    
    return initials || "U";
  };
  
  const NavItemContent = ({ item, onClick }: { item: typeof navItems[0], onClick?: () => void }) => (
    <Link 
      to={item.path}
      className={cn(
        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
        location.pathname === item.path 
          ? "bg-wedding-blush/20 text-wedding-navy" 
          : "text-gray-600 hover:bg-wedding-blush/10 hover:text-wedding-navy"
      )}
      onClick={onClick}
    >
      <span className="mr-3">{item.icon}</span>
      {item.name}
    </Link>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Top navigation */}
      <header className="bg-white shadow-sm border-b border-gray-200 py-3 px-4 flex justify-between items-center">
        <div className="flex items-center">
          {isMobile && (
            <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="mr-2">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              
              <SheetContent side="left" className="w-72 pt-12">
                <nav className="space-y-1 mt-8">
                  {navItems.map((item) => (
                    <NavItemContent 
                      key={item.path} 
                      item={item} 
                      onClick={() => setIsSidebarOpen(false)} 
                    />
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          )}
          
          <Link to="/dashboard" className="flex items-center">
            <img src="/wedding-logo.svg" alt="Wedding Planner" className="h-8 w-8" />
            <h1 className="font-serif text-xl font-medium ml-2 text-wedding-navy hidden sm:inline">
              Wedding<span className="text-wedding-blush">Planner</span>
            </h1>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-wedding-blush rounded-full"></span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                <Avatar className="h-8 w-8 bg-wedding-blush/80 text-white">
                  <AvatarFallback>{getInitials()}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Il mio account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profilo</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/settings')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Impostazioni</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - shown on desktop */}
        {!isMobile && (
          <aside className="w-64 border-r border-gray-200 bg-white hidden md:block p-4 relative">
            <nav className="space-y-1 mt-4 mb-24">
              {navItems.map((item) => (
                <NavItemContent key={item.path} item={item} />
              ))}
            </nav>
            
            {/* Bottom section of sidebar - modified positioning */}
            <div className="absolute bottom-4 left-4 right-4 max-w-[90%]">
              <div className="p-4 bg-wedding-blush/10 rounded-lg border border-wedding-blush/20">
                <h4 className="font-medium text-wedding-navy text-sm">Aiuto per la pianificazione?</h4>
                <p className="text-xs text-gray-600 mt-1 line-clamp-2">Consulta le nostre guide e suggerimenti per un matrimonio perfetto.</p>
                <Button 
                  variant="ghost" 
                  className="mt-2 text-wedding-blush hover:bg-wedding-blush/20 hover:text-wedding-navy w-full text-xs h-auto py-1"
                  onClick={() => navigate('/guides')}
                >
                  Esplora guide
                </Button>
              </div>
            </div>
          </aside>
        )}
        
        {/* Main content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;
