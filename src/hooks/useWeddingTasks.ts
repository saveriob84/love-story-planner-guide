
import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/auth/AuthContext";
import { WeddingTask } from './wedding-tasks/types';
import { useTaskManager } from './wedding-tasks/task-manager';
import { useTimelineManager } from './wedding-tasks/timeline-manager';

export type { WeddingTask } from './wedding-tasks/types';

export const useWeddingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [timelines, setTimelines] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  const taskManager = useTaskManager(user?.id);
  const timelineManager = useTimelineManager(user?.id);

  // Load tasks and timelines from Supabase
  useEffect(() => {
    const loadTasks = async () => {
      try {
        setLoading(true);
        
        // If we have a wedding date, use it to calculate task due dates
        const weddingDate = user?.weddingDate 
          ? new Date(user.weddingDate) 
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // default to 1 year from now
        
        // Load timelines
        const storedTimelines = await timelineManager.getStoredTimelines();
        setTimelines(storedTimelines);
        
        // Load tasks
        const storedTasks = await taskManager.getStoredTasks(weddingDate);
        setTasks(storedTasks);
      } catch (error) {
        console.error("Error loading tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadTasks();
    }
  }, [user]);

  const updateTask = async (taskId: string, updates: Partial<WeddingTask>) => {
    const updatedTasks = await taskManager.updateTask(tasks, taskId, updates);
    setTasks(updatedTasks);
  };

  const addTask = async (task: Omit<WeddingTask, 'id'>) => {
    const updatedTasks = await taskManager.addTask(tasks, task);
    setTasks(updatedTasks);
  };

  const deleteTask = async (taskId: string) => {
    const updatedTasks = await taskManager.deleteTask(tasks, taskId);
    setTasks(updatedTasks);
  };

  const reorderTasks = async (taskId: string, newTimeline: string) => {
    const updatedTasks = await taskManager.reorderTasks(tasks, taskId, newTimeline);
    setTasks(updatedTasks);
  };

  const addTimelineItem = async (timelineName: string) => {
    const updatedTimelines = await timelineManager.addTimeline(timelines, timelineName);
    setTimelines(updatedTimelines);
  };

  const removeTimeline = async (timelineName: string) => {
    // Check if the timeline has tasks
    const hasTasksInTimeline = tasks.some(task => task.timeline === timelineName);
    
    const result = await timelineManager.removeTimeline(timelines, timelineName, hasTasksInTimeline);
    if (result.success) {
      setTimelines(result.updatedTimelines);
    }
    
    return result.success;
  };
  
  const moveTimeline = async (timelineName: string, direction: 'up' | 'down') => {
    const updatedTimelines = await timelineManager.moveTimeline(timelines, timelineName, direction);
    setTimelines(updatedTimelines);
  };

  const completedTasks = tasks.filter(task => task.completed);
  const incompleteTasks = tasks.filter(task => !task.completed);

  return {
    tasks,
    timelines,
    completedTasks,
    incompleteTasks,
    loading,
    updateTask,
    addTask,
    deleteTask,
    reorderTasks,
    addTimeline: addTimelineItem,
    removeTimeline,
    moveTimeline
  };
};
