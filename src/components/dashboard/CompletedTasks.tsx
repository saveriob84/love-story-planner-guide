
import { CheckIcon } from "lucide-react";
import { WeddingTask } from "@/hooks/useWeddingTasks";

interface CompletedTasksProps {
  completedTasks: WeddingTask[];
}

const CompletedTasks = ({ completedTasks }: CompletedTasksProps) => {
  return (
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
  );
};

export default CompletedTasks;
