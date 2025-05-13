
import { WeddingTask } from './types';
import { generateDefaultTasks } from './utils';

export function useTaskManager(userId: string | undefined) {
  const getStoredTasks = (weddingDate: Date): WeddingTask[] => {
    if (!userId) return [];
    
    const storedTasksKey = `weddingTasks_${userId}`;
    const storedTasks = localStorage.getItem(storedTasksKey);
    
    if (storedTasks) {
      return JSON.parse(storedTasks);
    }
    
    // Generate default tasks if none exist
    const defaultTasks = generateDefaultTasks(weddingDate);
    saveTasks(defaultTasks);
    return defaultTasks;
  };
  
  const saveTasks = (tasks: WeddingTask[]): void => {
    if (!userId) return;
    
    const storedTasksKey = `weddingTasks_${userId}`;
    localStorage.setItem(storedTasksKey, JSON.stringify(tasks));
  };
  
  const updateTask = (tasks: WeddingTask[], taskId: string, updates: Partial<WeddingTask>): WeddingTask[] => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    
    saveTasks(updatedTasks);
    return updatedTasks;
  };
  
  const addTask = (tasks: WeddingTask[], task: Omit<WeddingTask, 'id'>): WeddingTask[] => {
    const newTask: WeddingTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    
    const updatedTasks = [...tasks, newTask];
    saveTasks(updatedTasks);
    return updatedTasks;
  };
  
  const deleteTask = (tasks: WeddingTask[], taskId: string): WeddingTask[] => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    saveTasks(updatedTasks);
    return updatedTasks;
  };
  
  const reorderTasks = (tasks: WeddingTask[], taskId: string, newTimeline: string): WeddingTask[] => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, timeline: newTimeline } : task
    );
    
    saveTasks(updatedTasks);
    return updatedTasks;
  };
  
  return {
    getStoredTasks,
    updateTask,
    addTask,
    deleteTask,
    reorderTasks
  };
}
