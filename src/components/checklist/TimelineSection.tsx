
import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import { WeddingTask } from "@/hooks/useWeddingTasks";
import TaskItem from "./TaskItem";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TimelineSectionProps {
  timeline: string;
  tasks: WeddingTask[];
  isCompleted: boolean;
  onToggleComplete: (task: WeddingTask, completed: boolean) => void;
  onTaskClick: (task: WeddingTask) => void;
  onMoveTimeline?: (timeline: string, direction: 'up' | 'down') => void;
  timelineIndex?: number;
  totalTimelines?: number;
}

const TimelineSection = ({ 
  timeline, 
  tasks, 
  isCompleted, 
  onToggleComplete, 
  onTaskClick,
  onMoveTimeline,
  timelineIndex,
  totalTimelines
}: TimelineSectionProps) => {
  
  if (isCompleted) {
    return (
      <div className="mb-8">
        <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy flex items-center justify-between">
          <span>{timeline}</span>
          {onMoveTimeline && (
            <div className="flex space-x-1">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onMoveTimeline(timeline, 'up')}
                disabled={timelineIndex === 0}
              >
                <ArrowUpIcon className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={() => onMoveTimeline(timeline, 'down')}
                disabled={timelineIndex === (totalTimelines! - 1)}
              >
                <ArrowDownIcon className="h-4 w-4" />
              </Button>
            </div>
          )}
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
          <h3 className="text-lg font-serif font-semibold mb-4 text-wedding-navy flex items-center justify-between">
            <span>{timeline}</span>
            {onMoveTimeline && (
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onMoveTimeline(timeline, 'up')}
                  disabled={timelineIndex === 0}
                >
                  <ArrowUpIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => onMoveTimeline(timeline, 'down')}
                  disabled={timelineIndex === (totalTimelines! - 1)}
                >
                  <ArrowDownIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
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
