import { toast } from "@/hooks/use-toast";
import { DropResult } from "@hello-pangea/dnd";
import { WeddingTask } from "../wedding-tasks/types";

type TaskOperations = {
  updateTask: (taskId: string, updates: Partial<WeddingTask>) => Promise<any>;
  addTask: (task: Omit<WeddingTask, 'id'>) => Promise<any>;
  reorderTasks: (taskId: string, newTimeline: string) => Promise<any>;
  addTimeline: (timelineName: string) => Promise<any>;
  removeTimeline: (timelineName: string) => Promise<boolean>;
  moveTimeline: (timelineName: string, direction: 'up' | 'down') => Promise<any>;
};

type DialogState = {
  setTaskDetailsOpen: (open: boolean) => void;
  selectedTask: WeddingTask | null;
  setSelectedTask: React.Dispatch<React.SetStateAction<WeddingTask | null>>;
  setIsAddTaskOpen: (open: boolean) => void;
  newTask: Partial<WeddingTask>;
  setNewTask: React.Dispatch<React.SetStateAction<Partial<WeddingTask>>>;
  setNewTimelineName: React.Dispatch<React.SetStateAction<string>>;
  setIsAddTimelineOpen: (open: boolean) => void;
  setIsEditTimelineOpen: (open: boolean) => void;
  newTimelineName: string;
};

export const useChecklistHandlers = (
  taskOperations: TaskOperations,
  dialogState: DialogState,
  timelines: string[]
) => {
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
    
    taskOperations.reorderTasks(taskId, newTimeline);
    
    toast({
      title: "Attività spostata",
      description: `L'attività è stata spostata in "${newTimeline}"`,
      duration: 3000,
    });
  };
  
  const handleTaskClick = (task: WeddingTask) => {
    dialogState.setSelectedTask(task);
    dialogState.setTaskDetailsOpen(true);
  };
  
  const handleToggleComplete = (task: WeddingTask, completed: boolean) => {
    taskOperations.updateTask(task.id, { completed });
  };
  
  const handleSaveTask = () => {
    if (dialogState.selectedTask) {
      const { id, notes, title, description, timeline, dueDate, category } = dialogState.selectedTask;
      taskOperations.updateTask(id, { notes, title, description, timeline, dueDate, category });
      
      toast({
        title: "Attività aggiornata",
        description: "Le modifiche sono state salvate con successo",
        duration: 3000,
      });
    }
    dialogState.setTaskDetailsOpen(false);
  };
  
  const handleAddTask = () => {
    if (!dialogState.newTask.title) return;
    
    taskOperations.addTask({
      title: dialogState.newTask.title,
      description: dialogState.newTask.description || "",
      timeline: dialogState.newTask.timeline || timelines[0],
      dueDate: dialogState.newTask.dueDate || new Date().toISOString(),
      category: dialogState.newTask.category || "Altro",
      completed: false,
    });
    
    toast({
      title: "Attività aggiunta",
      description: `"${dialogState.newTask.title}" è stata aggiunta alla tua checklist`,
      duration: 3000,
    });
    
    // Reset form
    dialogState.setNewTask({
      title: "",
      description: "",
      timeline: "",
      dueDate: new Date().toISOString(),
      category: "Altro",
      completed: false
    });
    
    dialogState.setIsAddTaskOpen(false);
  };
  
  const handleAddTimeline = () => {
    if (!dialogState.newTimelineName.trim()) return;
    
    // Call addTimeline with the trimmed timeline name
    taskOperations.addTimeline(dialogState.newTimelineName.trim());
    
    toast({
      title: "Timeline aggiunta",
      description: `"${dialogState.newTimelineName}" è stata aggiunta alle tue timeline`,
      duration: 3000,
    });
    
    // Reset the form and close the dialog
    dialogState.setNewTimelineName("");
    dialogState.setIsAddTimelineOpen(false);
  };
  
  const handleRemoveTimeline = (timeline: string) => {
    taskOperations.removeTimeline(timeline).then(success => {
      if (success) {
        toast({
          title: "Timeline rimossa",
          description: `"${timeline}" è stata rimossa dalle tue timeline`,
          duration: 3000,
        });
        dialogState.setIsEditTimelineOpen(false);
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
    taskOperations.moveTimeline(timeline, direction);
    
    toast({
      title: "Timeline spostata",
      description: `"${timeline}" è stata spostata ${direction === 'up' ? 'su' : 'giù'}`,
      duration: 3000,
    });
  };

  return {
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
