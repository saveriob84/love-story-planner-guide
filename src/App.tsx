
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/auth/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ChecklistPage from "./pages/ChecklistPage";
import Budget from "./pages/Budget";
import GuestsPage from "./pages/GuestsPage";
import TableArrangementPage from "./pages/TableArrangementPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import VendorProfile from "./pages/vendor/VendorProfile";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'couple' | 'vendor' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  console.log("ProtectedRoute check:", { 
    isAuthenticated, 
    loading, 
    userRole: user?.role, 
    requiredRole 
  });
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wedding-blush"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to home");
    return <Navigate to="/" replace />;
  }
  
  // Role-based access control
  if (requiredRole && user?.role !== requiredRole) {
    console.log(`Access denied. Required role: ${requiredRole}, User role: ${user?.role}`);
    if (user?.role === 'vendor') {
      console.log("Redirecting vendor to vendor dashboard");
      return <Navigate to="/vendor/dashboard" replace />;
    } else {
      console.log("Redirecting couple to couple dashboard");
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  console.log("Access granted to protected route");
  return children;
};

const AppRoutes = () => {
  const { isAuthenticated, user, loading } = useAuth();
  
  console.log("App routes rendering with auth state:", { 
    isAuthenticated, 
    userRole: user?.role,
    loading
  });
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wedding-blush"></div>
    </div>;
  }
  
  // Handle authenticated users on the index page
  const IndexComponent = () => {
    if (isAuthenticated) {
      // Redirect based on role
      if (user?.role === 'vendor') {
        console.log("Authenticated vendor on index page, redirecting to vendor dashboard");
        return <Navigate to="/vendor/dashboard" replace />;
      } else {
        console.log("Authenticated couple on index page, redirecting to couple dashboard");
        return <Navigate to="/dashboard" replace />;
      }
    }
    // If not authenticated, show the landing page
    return <Index />;
  };
  
  return (
    <Routes>
      <Route path="/" element={<IndexComponent />} />
      <Route path="/dashboard" element={
        <ProtectedRoute requiredRole="couple">
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/checklist" element={
        <ProtectedRoute requiredRole="couple">
          <ChecklistPage />
        </ProtectedRoute>
      } />
      <Route path="/budget" element={
        <ProtectedRoute requiredRole="couple">
          <Budget />
        </ProtectedRoute>
      } />
      <Route path="/guests" element={
        <ProtectedRoute requiredRole="couple">
          <GuestsPage />
        </ProtectedRoute>
      } />
      <Route path="/tables" element={
        <ProtectedRoute requiredRole="couple">
          <TableArrangementPage />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/vendor/dashboard" element={
        <ProtectedRoute requiredRole="vendor">
          <VendorDashboard />
        </ProtectedRoute>
      } />
      <Route path="/vendor/profile" element={
        <ProtectedRoute requiredRole="vendor">
          <VendorProfile />
        </ProtectedRoute>
      } />
      <Route path="/calendar" element={<NotFound />} />
      <Route path="/settings" element={<NotFound />} />
      <Route path="/guides" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
