
import { useState } from "react";
import { WeddingTask } from "../wedding-tasks/types";

export const useChecklistDialogs = () => {
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WeddingTask | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState("");
  const [isEditTimelineOpen, setIsEditTimelineOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<WeddingTask>>({
    title: "",
    description: "",
    timeline: "",
    dueDate: new Date().toISOString(),
    category: "Altro",
    completed: false
  });

  return {
    taskDetailsOpen,
    setTaskDetailsOpen,
    selectedTask,
    setSelectedTask,
    isAddTaskOpen,
    setIsAddTaskOpen,
    isAddTimelineOpen,
    setIsAddTimelineOpen,
    newTimelineName,
    setNewTimelineName,
    isEditTimelineOpen,
    setIsEditTimelineOpen,
    newTask,
    setNewTask
  };
};
