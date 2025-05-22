
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/auth/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ChecklistPage from "./pages/ChecklistPage";
import Budget from "./pages/Budget";
import GuestsPage from "./pages/GuestsPage";
import TableArrangementPage from "./pages/TableArrangementPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import { useAuth } from "./contexts/auth/AuthContext";

const queryClient = new QueryClient();

// Protected route component
const ProtectedRoute = ({ children, requiredRole }: { children: JSX.Element, requiredRole?: 'couple' | 'vendor' }) => {
  const { user, isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-wedding-blush"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  // Role-based access control
  if (requiredRole && user?.role !== requiredRole) {
    console.log("Access denied. Required role:", requiredRole, "User role:", user?.role);
    if (user?.role === 'vendor') {
      return <Navigate to="/vendor/dashboard" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
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
      <Route path="/calendar" element={<NotFound />} />
      <Route path="/settings" element={<NotFound />} />
      <Route path="/guides" element={<NotFound />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
