
import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Check, GripVertical } from "lucide-react";
import { WeddingTask } from "@/hooks/useWeddingTasks";
import { cn } from "@/lib/utils";

interface TaskItemProps {
  task: WeddingTask;
  index: number;
  isCompleted: boolean;
  onToggleComplete: (task: WeddingTask, completed: boolean) => void;
  onTaskClick: (task: WeddingTask) => void;
}

const TaskItem = ({ task, index, isCompleted, onToggleComplete, onTaskClick }: TaskItemProps) => {
  if (isCompleted) {
    return (
      <div 
        key={task.id} 
        className="task-item completed"
        onClick={() => onTaskClick(task)}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 pt-1 pr-4" onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(task, !task.completed);
          }}>
            <Checkbox
              checked={task.completed}
              className="border-wedding-sage data-[state=checked]:bg-wedding-sage data-[state=checked]:border-wedding-sage"
            />
          </div>
          <div className="flex-1 cursor-pointer">
            <h4 className="font-medium text-gray-500 line-through">{task.title}</h4>
            <p className="text-sm text-gray-400 mt-1 line-through">{task.description}</p>
            <div className="flex items-center mt-2 text-xs text-wedding-sage">
              <Check className="h-3 w-3 mr-1" />
              <span>Completato</span>
              {task.category && (
                <>
                  <span className="mx-2">•</span>
                  <span>{task.category}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Draggable 
      key={task.id} 
      draggableId={task.id} 
      index={index}
    >
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={cn(
            "task-item upcoming border border-transparent",
            snapshot.isDragging ? "border-wedding-blush shadow-lg" : ""
          )}
        >
          <div className="flex items-start">
            <div 
              className="flex-shrink-0 pt-1 px-2 cursor-move text-gray-400 hover:text-wedding-navy"
              {...provided.dragHandleProps}
            >
              <GripVertical size={16} />
            </div>
            <div className="flex-shrink-0 pt-1 pr-4" onClick={(e) => {
              e.stopPropagation();
              onToggleComplete(task, !task.completed);
            }}>
              <Checkbox
                checked={task.completed}
                className="border-wedding-blush data-[state=checked]:bg-wedding-blush data-[state=checked]:border-wedding-blush"
              />
            </div>
            <div 
              className="flex-1 cursor-pointer"
              onClick={() => onTaskClick(task)}
            >
              <h4 className="font-medium text-wedding-navy">{task.title}</h4>
              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
              <div className="flex items-center mt-2 text-xs text-gray-500">
                <Calendar className="h-3 w-3 mr-1" />
                <span>{new Date(task.dueDate).toLocaleDateString('it-IT', { day: 'numeric', month: 'long' })}</span>
                {task.category && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{task.category}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default TaskItem;
