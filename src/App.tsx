
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/auth/AuthContext";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import GuestsPage from "@/pages/GuestsPage";
import ChecklistPage from "@/pages/ChecklistPage";
import TableArrangementPage from "@/pages/TableArrangementPage";
import NotFound from "@/pages/NotFound";
import Profile from "./pages/Profile";
import Budget from "./pages/Budget";
import RoadmapPage from "./pages/RoadmapPage";
import VendorDashboardPage from "./pages/VendorDashboardPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guests" element={<GuestsPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/tables" element={<TableArrangementPage />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/vendor-dashboard" element={<VendorDashboardPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <Toaster />
    </AuthProvider>
  );
}

export default App;
