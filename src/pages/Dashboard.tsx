
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckIcon, Calendar, Clock, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useWeddingTasks } from "@/hooks/useWeddingTasks";

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { tasks, completedTasks } = useWeddingTasks();
  const [progress, setProgress] = useState(0);
  
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

  // Next dates to show in countdown
  const weddingDate = user?.weddingDate ? new Date(user.weddingDate) : null;
  const today = new Date();
  const daysUntilWedding = weddingDate ? Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Progress Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Completamento</CardTitle>
              <CardDescription>La tua pianificazione</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-3xl font-bold text-wedding-navy">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2 bg-wedding-blush/20" />
              <p className="text-sm text-gray-500 mt-2">
                {completedTasks.length}/{tasks.length} attività completate
              </p>
            </CardContent>
          </Card>

          {/* Countdown Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Conto alla rovescia</CardTitle>
              <CardDescription>Giorno del matrimonio</CardDescription>
            </CardHeader>
            <CardContent>
              {weddingDate ? (
                <>
                  <p className="text-3xl font-bold text-wedding-navy">{daysUntilWedding}</p>
                  <p className="text-sm text-gray-500">giorni rimanenti</p>
                  <p className="text-sm mt-2 text-wedding-blush">
                    {weddingDate.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </>
              ) : (
                <div className="h-full flex flex-col items-start justify-center">
                  <p className="text-sm text-gray-500">Data non impostata</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-wedding-blush"
                    onClick={() => navigate('/profile')}
                  >
                    Imposta la data
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Budget Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Budget</CardTitle>
              <CardDescription>Spese e previsioni</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-wedding-navy">€0</p>
              <p className="text-sm text-gray-500">su €0 previsti</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-wedding-blush mt-2"
                onClick={() => navigate('/budget')}
              >
                Imposta budget
              </Button>
            </CardContent>
          </Card>

          {/* Guests Card */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Ospiti</CardTitle>
              <CardDescription>RSVP e inviti</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-wedding-navy">0</p>
              <p className="text-sm text-gray-500">su 0 inviti confermati</p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-wedding-blush mt-2"
                onClick={() => navigate('/guests')}
              >
                Gestisci ospiti
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Next Tasks Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-serif text-xl font-bold text-wedding-navy">Prossime attività</h2>
            <Button 
              variant="ghost" 
              className="text-wedding-blush hover:text-wedding-blush/80 hover:bg-wedding-blush/10"
              onClick={() => navigate('/checklist')}
            >
              Vedi tutte <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingTasks.length > 0 ? (
              upcomingTasks.map(task => (
                <div key={task.id} className="task-item upcoming">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-wedding-navy">{task.title}</h3>
                      <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                    </div>
                    <div className="flex items-center text-sm text-wedding-blush">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2">Nessuna attività in sospeso. Ottimo lavoro!</p>
            )}
          </div>
        </div>

        {/* Recently Completed */}
        <div>
          <h2 className="font-serif text-xl font-bold text-wedding-navy mb-4">Completate recentemente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {completedTasks.length > 0 ? (
              completedTasks.slice(0, 4).map(task => (
                <div key={task.id} className="task-item completed">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-500 line-through">{task.title}</h3>
                    </div>
                    <div className="flex items-center text-sm text-wedding-sage">
                      <CheckIcon className="h-4 w-4 mr-1" />
                      <span>Completato</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 col-span-2">Non hai ancora completato nessuna attività.</p>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
