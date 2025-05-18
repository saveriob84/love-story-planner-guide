
import { useState } from "react";
import { WeddingTask } from "./wedding-tasks/types";
import { useWeddingTasks } from "./useWeddingTasks";
import { toast } from "./use-toast";
import { DropResult } from "@hello-pangea/dnd";

export const useChecklistState = () => {
  const {
    tasks,
    timelines,
    updateTask,
    addTask,
    reorderTasks,
    addTimeline,
    removeTimeline,
    moveTimeline
  } = useWeddingTasks();
  
  // State for filters and modals
  const [activeTab, setActiveTab] = useState("da-fare");
  const [selectedCategory, setSelectedCategory] = useState("Tutti");
  const [taskDetailsOpen, setTaskDetailsOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<WeddingTask | null>(null);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isAddTimelineOpen, setIsAddTimelineOpen] = useState(false);
  const [newTimelineName, setNewTimelineName] = useState("");
  const [isEditTimelineOpen, setIsEditTimelineOpen] = useState(false);
  const [selectedTimeline, setSelectedTimeline] = useState("");
  const [newTask, setNewTask] = useState<Partial<WeddingTask>>({
    title: "",
    description: "",
    timeline: "",
    dueDate: new Date().toISOString(),
    category: "Altro",
    completed: false
  });
  
  // Filter tasks based on active tab and category
  const filteredTasks = tasks.filter(task => {
    const matchesTab = activeTab === "da-fare" ? !task.completed : task.completed;
    const matchesCategory = selectedCategory === "Tutti" || task.category === selectedCategory;
    return matchesTab && matchesCategory;
  });
  
  // Group tasks by timeline
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
  
  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;
    
    // Drop outside a valid area or drop in the same place
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }
    
    // Get task ID and update its timeline
    const taskId = draggableId;
    const newTimeline = destination.droppableId;
    
    reorderTasks(taskId, newTimeline);
    
    toast({
      title: "Attività spostata",
      description: `L'attività è stata spostata in "${newTimeline}"`,
      duration: 3000,
    });
  };
  
  const handleTaskClick = (task: WeddingTask) => {
    setSelectedTask(task);
    setTaskDetailsOpen(true);
  };
  
  const handleToggleComplete = (task: WeddingTask, completed: boolean) => {
    updateTask(task.id, { completed });
  };
  
  const handleSaveTask = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, { 
        notes: selectedTask.notes,
        title: selectedTask.title,
        description: selectedTask.description,
        timeline: selectedTask.timeline,
        dueDate: selectedTask.dueDate,
        category: selectedTask.category
      });
      
      toast({
        title: "Attività aggiornata",
        description: "Le modifiche sono state salvate con successo",
        duration: 3000,
      });
    }
    setTaskDetailsOpen(false);
  };
  
  const handleAddTask = () => {
    if (!newTask.title) return;
    
    addTask({
      title: newTask.title,
      description: newTask.description || "",
      timeline: newTask.timeline || timelines[0],
      dueDate: newTask.dueDate || new Date().toISOString(),
      category: newTask.category || "Altro",
      completed: false,
    });
    
    toast({
      title: "Attività aggiunta",
      description: `"${newTask.title}" è stata aggiunta alla tua checklist`,
      duration: 3000,
    });
    
    // Reset form
    setNewTask({
      title: "",
      description: "",
      timeline: "",
      dueDate: new Date().toISOString(),
      category: "Altro",
      completed: false
    });
    
    setIsAddTaskOpen(false);
  };
  
  const handleAddTimeline = () => {
    if (!newTimelineName.trim()) return;
    
    // Call addTimeline with the trimmed timeline name
    addTimeline(newTimelineName.trim());
    
    toast({
      title: "Timeline aggiunta",
      description: `"${newTimelineName}" è stata aggiunta alle tue timeline`,
      duration: 3000,
    });
    
    // Reset the form and close the dialog
    setNewTimelineName("");
    setIsAddTimelineOpen(false);
  };
  
  const handleRemoveTimeline = (timeline: string) => {
    removeTimeline(timeline).then(success => {
      if (success) {
        toast({
          title: "Timeline rimossa",
          description: `"${timeline}" è stata rimossa dalle tue timeline`,
          duration: 3000,
        });
        setIsEditTimelineOpen(false);
      } else {
        toast({
          title: "Impossibile rimuovere la timeline",
          description: "Ci sono ancora attività associate a questa timeline",
          variant: "destructive",
          duration: 3000,
        });
      }
    });
  };
  
  const handleMoveTimeline = (timeline: string, direction: 'up' | 'down') => {
    moveTimeline(timeline, direction);
    
    toast({
      title: "Timeline spostata",
      description: `"${timeline}" è stata spostata ${direction === 'up' ? 'su' : 'giù'}`,
      duration: 3000,
    });
  };
  
  return {
    // Data
    tasks,
    timelines,
    filteredTasks,
    tasksByTimeline,
    
    // State
    activeTab,
    selectedCategory,
    taskDetailsOpen,
    selectedTask,
    isAddTaskOpen,
    isAddTimelineOpen,
    newTimelineName,
    isEditTimelineOpen,
    selectedTimeline,
    newTask,
    
    // Setters
    setActiveTab,
    setSelectedCategory,
    setTaskDetailsOpen,
    setSelectedTask,
    setIsAddTaskOpen,
    setIsAddTimelineOpen,
    setNewTimelineName,
    setIsEditTimelineOpen,
    setSelectedTimeline,
    setNewTask,
    
    // Handlers
    handleDragEnd,
    handleTaskClick,
    handleToggleComplete,
    handleSaveTask,
    handleAddTask,
    handleAddTimeline,
    handleRemoveTimeline,
    handleMoveTimeline
  };
};
