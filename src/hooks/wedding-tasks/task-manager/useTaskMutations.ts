
import { WeddingTask } from '../types';
import { supabase } from "@/integrations/supabase/client";

export function useTaskMutations(userId: string | undefined) {
  const updateTask = async (tasks: WeddingTask[], taskId: string, updates: Partial<WeddingTask>): Promise<WeddingTask[]> => {
    if (!userId) return tasks;
    
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) {
        return tasks;
      }
      
      const updatedTask = { ...taskToUpdate, ...updates };
      
      // If timeline changed, we need to get the timeline_id
      let timelineId = null;
      if (updates.timeline && updates.timeline !== taskToUpdate.timeline) {
        const { data: timeline } = await supabase
          .from('timelines')
          .select('id')
          .eq('profile_id', userId)
          .eq('name', updates.timeline)
          .single();
          
        timelineId = timeline?.id;
      }
      
      // Update task in database
      const { error } = await supabase
        .from('tasks')
        .update({
          title: updates.title !== undefined ? updates.title : undefined,
          description: updates.description !== undefined ? updates.description : undefined,
          timeline_id: timelineId || undefined,
          due_date: updates.dueDate !== undefined ? updates.dueDate : undefined,
          completed: updates.completed !== undefined ? updates.completed : undefined,
          notes: updates.notes !== undefined ? updates.notes : undefined,
          category: updates.category !== undefined ? updates.category : undefined
        })
        .eq('id', taskId);
      
      if (error) {
        console.error('Error updating task:', error);
        return tasks;
      }
      
      return tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
    } catch (error) {
      console.error('Error in updateTask:', error);
      return tasks;
    }
  };

  const addTask = async (tasks: WeddingTask[], task: Omit<WeddingTask, 'id'>): Promise<WeddingTask[]> => {
    if (!userId) return tasks;
    
    try {
      // Get timeline_id from timeline name
      const { data: timeline } = await supabase
        .from('timelines')
        .select('id')
        .eq('profile_id', userId)
        .eq('name', task.timeline)
        .single();
        
      if (!timeline) {
        console.error('Timeline not found:', task.timeline);
        return tasks;
      }
      
      // Add task to database
      const { data: insertedTask, error } = await supabase
        .from('tasks')
        .insert({
          profile_id: userId,
          timeline_id: timeline.id,
          title: task.title,
          description: task.description,
          due_date: task.dueDate,
          completed: task.completed,
          notes: task.notes || null,
          category: task.category
        })
        .select('*')
        .single();
      
      if (error) {
        console.error('Error adding task:', error);
        return tasks;
      }
      
      const newTask: WeddingTask = {
        id: insertedTask.id,
        title: insertedTask.title,
        description: insertedTask.description || "",
        timeline: task.timeline,
        dueDate: insertedTask.due_date || new Date().toISOString(),
        completed: insertedTask.completed || false,
        notes: insertedTask.notes || "",
        category: insertedTask.category || "Altro"
      };
      
      return [...tasks, newTask];
    } catch (error) {
      console.error('Error in addTask:', error);
      return tasks;
    }
  };
  
  const deleteTask = async (tasks: WeddingTask[], taskId: string): Promise<WeddingTask[]> => {
    if (!userId) return tasks;
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) {
        console.error('Error deleting task:', error);
        return tasks;
      }
      
      return tasks.filter(task => task.id !== taskId);
    } catch (error) {
      console.error('Error in deleteTask:', error);
      return tasks;
    }
  };
  
  const reorderTasks = async (tasks: WeddingTask[], taskId: string, newTimeline: string): Promise<WeddingTask[]> => {
    if (!userId) return tasks;
    
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      
      if (!taskToUpdate) {
        return tasks;
      }
      
      // Get timeline_id from timeline name
      const { data: timeline } = await supabase
        .from('timelines')
        .select('id')
        .eq('profile_id', userId)
        .eq('name', newTimeline)
        .single();
        
      if (!timeline) {
        console.error('Timeline not found:', newTimeline);
        return tasks;
      }
      
      // Update task in database
      const { error } = await supabase
        .from('tasks')
        .update({
          timeline_id: timeline.id
        })
        .eq('id', taskId);
      
      if (error) {
        console.error('Error reordering task:', error);
        return tasks;
      }
      
      return tasks.map(task => 
        task.id === taskId ? { ...task, timeline: newTimeline } : task
      );
    } catch (error) {
      console.error('Error in reorderTasks:', error);
      return tasks;
    }
  };

  return {
    updateTask,
    addTask,
    deleteTask,
    reorderTasks
  };
}
