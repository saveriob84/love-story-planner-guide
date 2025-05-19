
import { useWeddingTasks } from "../useWeddingTasks";
import { useChecklistFilters } from "./useChecklistFilters";
import { useChecklistDialogs } from "./useChecklistDialogs";
import { useChecklistHandlers } from "./useChecklistHandlers";

export const useChecklistState = () => {
  const {
    tasks,
    timelines,
    updateTask,
    addTask,
    deleteTask,
    reorderTasks,
    addTimeline,
    removeTimeline,
    moveTimeline
  } = useWeddingTasks();
  
  // Use the modular hooks
  const {
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    filteredTasks,
    tasksByTimeline
  } = useChecklistFilters(tasks, timelines);
  
  const dialogState = useChecklistDialogs();
  
  const taskOperations = {
    updateTask,
    addTask,
    deleteTask,
    reorderTasks,
    addTimeline,
    removeTimeline,
    moveTimeline
  };
  
  const {
    handleDragEnd,
    handleTaskClick,
    handleToggleComplete,
    handleSaveTask,
    handleDeleteTask,
    handleAddTask,
    handleAddTimeline,
    handleRemoveTimeline,
    handleMoveTimeline
  } = useChecklistHandlers(taskOperations, dialogState, timelines);

  // Return everything the original hook returned
  return {
    // Data
    tasks,
    timelines,
    filteredTasks,
    tasksByTimeline,
    
    // State
    activeTab,
    selectedCategory,
    taskDetailsOpen: dialogState.taskDetailsOpen,
    selectedTask: dialogState.selectedTask,
    isAddTaskOpen: dialogState.isAddTaskOpen,
    isAddTimelineOpen: dialogState.isAddTimelineOpen,
    newTimelineName: dialogState.newTimelineName,
    isEditTimelineOpen: dialogState.isEditTimelineOpen,
    newTask: dialogState.newTask,
    
    // Setters
    setActiveTab,
    setSelectedCategory,
    setTaskDetailsOpen: dialogState.setTaskDetailsOpen,
    setSelectedTask: dialogState.setSelectedTask,
    setIsAddTaskOpen: dialogState.setIsAddTaskOpen,
    setIsAddTimelineOpen: dialogState.setIsAddTimelineOpen,
    setNewTimelineName: dialogState.setNewTimelineName,
    setIsEditTimelineOpen: dialogState.setIsEditTimelineOpen,
    setNewTask: dialogState.setNewTask,
    
    // Handlers
    handleDragEnd,
    handleTaskClick,
    handleToggleComplete,
    handleSaveTask,
    handleDeleteTask,
    handleAddTask,
    handleAddTimeline,
    handleRemoveTimeline,
    handleMoveTimeline
  };
};
