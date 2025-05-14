
import React from "react";
import { WeddingTask } from "@/hooks/useWeddingTasks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import TimelineSection from "./TimelineSection";
import EmptyTasksMessage from "./EmptyTasksMessage";

interface TaskListProps {
  timelines: string[];
  tasksByTimeline: Record<string, WeddingTask[]>;
  activeTab: string;
  selectedCategory: string;
  onTabChange: (value: string) => void;
  onDragEnd: (result: DropResult) => void;
  onToggleComplete: (task: WeddingTask, completed: boolean) => void;
  onTaskClick: (task: WeddingTask) => void;
}

const TaskList = ({
  timelines,
  tasksByTimeline,
  activeTab,
  selectedCategory,
  onTabChange,
  onDragEnd,
  onToggleComplete,
  onTaskClick
}: TaskListProps) => {
  // Ensure tasksByTimeline has a defined value for each timeline
  const hasTasksInTimelines = timelines.some(timeline => 
    Array.isArray(tasksByTimeline[timeline]) && tasksByTimeline[timeline].length > 0
  );
  
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="grid grid-cols-2 w-full">
        <TabsTrigger value="da-fare">Da fare</TabsTrigger>
        <TabsTrigger value="completate">Completate</TabsTrigger>
      </TabsList>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <TabsContent value="da-fare" className="mt-6">
          {hasTasksInTimelines ? (
            timelines.map(timeline => {
              // Skip rendering if the timeline doesn't exist in tasksByTimeline or has no tasks
              if (!Array.isArray(tasksByTimeline[timeline]) || tasksByTimeline[timeline].length === 0) {
                return null;
              }
              
              return (
                <TimelineSection
                  key={timeline}
                  timeline={timeline}
                  tasks={tasksByTimeline[timeline]}
                  isCompleted={false}
                  onToggleComplete={onToggleComplete}
                  onTaskClick={onTaskClick}
                />
              );
            })
          ) : (
            <EmptyTasksMessage 
              isCompleted={false} 
              selectedCategory={selectedCategory} 
            />
          )}
        </TabsContent>
      
        <TabsContent value="completate" className="mt-6">
          {hasTasksInTimelines ? (
            timelines.map(timeline => {
              // Skip rendering if the timeline doesn't exist in tasksByTimeline or has no tasks
              if (!Array.isArray(tasksByTimeline[timeline]) || tasksByTimeline[timeline].length === 0) {
                return null;
              }
              
              return (
                <TimelineSection
                  key={timeline}
                  timeline={timeline}
                  tasks={tasksByTimeline[timeline]}
                  isCompleted={true}
                  onToggleComplete={onToggleComplete}
                  onTaskClick={onTaskClick}
                />
              );
            })
          ) : (
            <EmptyTasksMessage 
              isCompleted={true} 
              selectedCategory={selectedCategory} 
            />
          )}
        </TabsContent>
      </DragDropContext>
    </Tabs>
  );
};

export default TaskList;
