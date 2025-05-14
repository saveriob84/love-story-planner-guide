
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ChecklistPage from "./pages/ChecklistPage";
import Budget from "./pages/Budget";
import GuestsPage from "./pages/GuestsPage";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/checklist" element={<ChecklistPage />} />
            <Route path="/budget" element={<Budget />} />
            <Route path="/guests" element={<GuestsPage />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/calendar" element={<NotFound />} /> {/* Temporary Calendar route */}
            <Route path="/settings" element={<NotFound />} /> {/* Temporary Settings route */}
            <Route path="/guides" element={<NotFound />} /> {/* Temporary Guides route */}
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
