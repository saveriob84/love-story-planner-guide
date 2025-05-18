
import { useState } from "react";
import { WeddingTask } from "../wedding-tasks/types";

export const useChecklistFilters = (tasks: WeddingTask[], timelines: string[]) => {
  const [activeTab, setActiveTab] = useState("da-fare");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");

  // Filter tasks based on active tab and category
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === "da-fare" ? !task.completed : task.completed;
    const matchesCategory = selectedCategory === "Tutti" || task.category === selectedCategory;
    return matchesTab && matchesCategory;
  });
  
  // Group tasks by timeline
  const getTasksByTimeline = (): Record<string, WeddingTask[]> => {
    const tasksByTimeline: Record<string, WeddingTask[]> = {};
    
    // Initialize empty arrays for all timelines
    timelines.forEach(timeline => {
      tasksByTimeline[timeline] = [];
    });
    
    // Populate with filtered tasks
    filteredTasks.forEach(task => {
      // If the task's timeline exists in our timelines array, add it
      if (timelines.includes(task.timeline)) {
        tasksByTimeline[task.timeline].push(task);
      } else {
        // If the timeline doesn't exist (possibly a legacy task),
        // add it to "Altro" or create a new timeline
        if (!tasksByTimeline["Altro"]) {
          tasksByTimeline["Altro"] = [];
        }
        tasksByTimeline["Altro"].push(task);
      }
    });
    
    return tasksByTimeline;
  };

  return {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    filteredTasks,
    tasksByTimeline: getTasksByTimeline()
  };
};
