
import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { WeddingTask } from "@/hooks/useWeddingTasks";
import TaskItem from "./TaskItem";

interface TimelineSectionProps {
  timeline: string;
  tasks: WeddingTask[];
  isCompleted: boolean;
  onToggleComplete: (task: WeddingTask, completed: boolean) => void;
  onTaskClick: (task: WeddingTask) => void;
}

const TimelineSection = ({ 
  timeline, 
  tasks, 
  isCompleted, 
  onToggleComplete, 
  onTaskClick 
}: TimelineSectionProps) => {
  
  if (isCompleted) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy">
          {timeline}
        </h3>
        <div className="space-y-3">
          {tasks.map((task, index) => (
            <TaskItem
              key={task.id}
              task={task}
              index={index}
              isCompleted={isCompleted}
              onToggleComplete={onToggleComplete}
              onTaskClick={onTaskClick}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <Droppable droppableId={timeline} key={timeline}>
      {(provided) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className="mb-8"
        >
          <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy flex items-center">
            {timeline}
          </h3>
          <div className="space-y-3">
            {tasks.map((task, index) => (
              <TaskItem
                key={task.id}
                task={task}
                index={index}
                isCompleted={isCompleted}
                onToggleComplete={onToggleComplete}
                onTaskClick={onTaskClick}
              />
            ))}
            {provided.placeholder}
          </div>
        </div>
      )}
    </Droppable>
  );
};

export default TimelineSection;
