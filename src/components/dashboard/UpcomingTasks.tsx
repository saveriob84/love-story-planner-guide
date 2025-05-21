
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Clock } from "lucide-react";
import { WeddingTask } from "@/hooks/useWeddingTasks";

interface UpcomingTasksProps {
  upcomingTasks: WeddingTask[];
}

const UpcomingTasks = ({ upcomingTasks }: UpcomingTasksProps) => {
  const navigate = useNavigate();

  return (
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
  );
};

export default UpcomingTasks;
