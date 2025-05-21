
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Calendar, CheckIcon } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthContext";

interface DashboardStatsProps {
  progress: number;
  completedTasksCount: number;
  totalTasksCount: number;
  totalBudget: number;
  totalPaid: number;
  confirmedGuests: number;
  totalAttending: number;
}

const DashboardStats = ({
  progress,
  completedTasksCount,
  totalTasksCount,
  totalBudget,
  totalPaid,
  confirmedGuests,
  totalAttending
}: DashboardStatsProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  // Calculate wedding date information
  const weddingDate = user?.weddingDate ? new Date(user.weddingDate) : null;
  const today = new Date();
  const daysUntilWedding = weddingDate ? Math.ceil((weddingDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : null;

  return (
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
            {completedTasksCount}/{totalTasksCount} attività completate
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
          <p className="text-3xl font-bold text-wedding-navy">€{totalPaid}</p>
          <p className="text-sm text-gray-500">su €{totalBudget} previsti</p>
          <Button 
            variant="link" 
            className="p-0 h-auto text-wedding-blush mt-2"
            onClick={() => navigate('/budget')}
          >
            Gestisci budget
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
          <p className="text-3xl font-bold text-wedding-navy">{confirmedGuests}</p>
          <p className="text-sm text-gray-500">su {totalAttending} inviti confermati</p>
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
  );
};

export default DashboardStats;
