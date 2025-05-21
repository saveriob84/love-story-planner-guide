
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { useWeddingTasks } from "@/hooks/useWeddingTasks";
import { useGuests } from "@/hooks/useGuests";
import { useBudget } from "@/hooks/budget/useBudget";

// Importing the separated components
import DashboardStats from "@/components/dashboard/DashboardStats";
import UpcomingTasks from "@/components/dashboard/UpcomingTasks";
import CompletedTasks from "@/components/dashboard/CompletedTasks";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { tasks, completedTasks } = useWeddingTasks();
  const [progress, setProgress] = useState(0);
  
  // Fetch guest data
  const { stats } = useGuests();
  
  // Fetch budget data
  const { 
    totalBudget, 
    totalPaid 
  } = useBudget(user?.id);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    if (tasks.length > 0) {
      const completedPercentage = (completedTasks.length / tasks.length) * 100;
      setProgress(Math.round(completedPercentage));
    }
  }, [tasks, completedTasks]);
  
  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Caricamento...</p>
        </div>
      </MainLayout>
    );
  }

  // Get next milestone tasks (not completed and next by date)
  const upcomingTasks = tasks
    .filter(task => !task.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);
  
  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Benvenuti, {user?.name || ""} {user?.partnerName ? `& ${user.partnerName}` : ""}
          </h1>
          <p className="text-gray-500 mt-2">
            Ecco gli aggiornamenti sulla pianificazione del tuo matrimonio
          </p>
        </div>

        {/* Stats/Overview Cards */}
        <DashboardStats 
          progress={progress}
          completedTasksCount={completedTasks.length}
          totalTasksCount={tasks.length}
          totalBudget={totalBudget}
          totalPaid={totalPaid}
          confirmedGuests={stats?.confirmedGuests || 0}
          totalAttending={stats?.totalAttending || 0}
        />

        {/* Next Tasks Section */}
        <UpcomingTasks upcomingTasks={upcomingTasks} />

        {/* Recently Completed */}
        <CompletedTasks completedTasks={completedTasks} />
      </div>
    </MainLayout>
  );
};

export default Dashboard;
