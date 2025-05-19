
import React from "react";
import { WeddingTask } from "@/hooks/wedding-tasks/types";
import TaskDetailsDialog from "./TaskDetailsDialog";
import AddTaskDialog from "./AddTaskDialog";
import { AddTimelineDialog, EditTimelineDialog } from "./TimelineManagement";

interface ChecklistDialogsProps {
  taskDetailsOpen: boolean;
  setTaskDetailsOpen: (open: boolean) => void;
  selectedTask: WeddingTask | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<WeddingTask | null>>;
  timelines: string[];
  categories: string[];
  onSaveTask: () => void;
  onDeleteTask: () => void;
  
  isAddTaskOpen: boolean;
  setIsAddTaskOpen: (open: boolean) => void;
  newTask: Partial<WeddingTask>;
  setNewTask: React.Dispatch<React.SetStateAction<Partial<WeddingTask>>>;
  onAddTask: () => void;
  
  isAddTimelineOpen: boolean;
  setIsAddTimelineOpen: (open: boolean) => void;
  newTimelineName: string;
  setNewTimelineName: React.Dispatch<React.SetStateAction<string>>;
  onAddTimeline: () => void;
  
  isEditTimelineOpen: boolean;
  setIsEditTimelineOpen: (open: boolean) => void;
  onRemoveTimeline: (timeline: string) => void;
  onMoveTimeline: (timeline: string, direction: 'up' | 'down') => void;
}

const ChecklistDialogs = ({
  taskDetailsOpen,
  setTaskDetailsOpen,
  selectedTask,
  setSelectedTask,
  timelines,
  categories,
  onSaveTask,
  onDeleteTask,
  
  isAddTaskOpen,
  setIsAddTaskOpen,
  newTask,
  setNewTask,
  onAddTask,
  
  isAddTimelineOpen,
  setIsAddTimelineOpen,
  newTimelineName,
  setNewTimelineName,
  onAddTimeline,
  
  isEditTimelineOpen,
  setIsEditTimelineOpen,
  onRemoveTimeline,
  onMoveTimeline
}: ChecklistDialogsProps) => {
  return (
    <>
      <TaskDetailsDialog 
        open={taskDetailsOpen}
        onOpenChange={setTaskDetailsOpen}
        selectedTask={selectedTask}
        setSelectedTask={setSelectedTask}
        timelines={timelines}
        categories={categories}
        onSave={onSaveTask}
        onDelete={onDeleteTask}
      />
      
      <AddTaskDialog 
        open={isAddTaskOpen}
        onOpenChange={setIsAddTaskOpen}
        newTask={newTask}
        setNewTask={setNewTask}
        timelines={timelines}
        categories={categories}
        onAddTask={onAddTask}
      />
      
      <AddTimelineDialog 
        open={isAddTimelineOpen}
        onOpenChange={setIsAddTimelineOpen}
        timelineName={newTimelineName}
        setTimelineName={setNewTimelineName}
        onAddTimeline={onAddTimeline}
      />
      
      <EditTimelineDialog 
        open={isEditTimelineOpen}
        onOpenChange={setIsEditTimelineOpen}
        timelines={timelines}
        onRemoveTimeline={onRemoveTimeline}
        onMoveTimeline={onMoveTimeline}
      />
    </>
  );
};

export default ChecklistDialogs;
