
import { WeddingTask } from '../types';
import { generateDefaultTasks } from '../utils';
import { supabase } from "@/integrations/supabase/client";

export function useTaskQueries(userId: string | undefined) {
  const getStoredTasks = async (weddingDate: Date): Promise<WeddingTask[]> => {
    if (!userId) return [];
    
    try {
      // Get timelines first to ensure we have timeline IDs
      const { data: timelines, error: timelinesError } = await supabase
        .from('timelines')
        .select('*')
        .eq('profile_id', userId)
        .order('display_order', { ascending: true });
      
      if (timelinesError) {
        console.error('Error fetching timelines:', timelinesError);
        return [];
      }

      // If no timelines exist, create default ones
      if (timelines.length === 0) {
        // Create default timelines with correct display order
        const defaultTimelines = [
          "12+ mesi prima",
          "10-12 mesi prima",
          "8-10 mesi prima",
          "6-8 mesi prima",
          "4-6 mesi prima",
          "2-4 mesi prima",
          "1-2 mesi prima",
          "1-2 settimane prima",
          "Ultimi giorni"
        ];
        
        for (let i = 0; i < defaultTimelines.length; i++) {
          await supabase.from('timelines').insert({
            profile_id: userId,
            name: defaultTimelines[i],
            display_order: i
          });
        }
        
        const { data: createdTimelines } = await supabase
          .from('timelines')
          .select('*')
          .eq('profile_id', userId)
          .order('display_order', { ascending: true });
          
        // Now create default tasks
        const defaultTasks = generateDefaultTasks(weddingDate);
        for (const task of defaultTasks) {
          // Find the timeline with the matching name
          const timeline = createdTimelines?.find(t => t.name === task.timeline);
          if (timeline) {
            await supabase.from('tasks').insert({
              profile_id: userId,
              timeline_id: timeline.id,
              title: task.title,
              description: task.description,
              due_date: task.dueDate,
              completed: task.completed,
              category: task.category,
              notes: task.notes || null
            });
          }
        }
        
        // Return the default tasks
        return defaultTasks;
      }

      // Get tasks from database
      const { data: tasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*, timelines(*)')
        .eq('profile_id', userId);
        
      if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
        return [];
      }
      
      // Map the database tasks to our WeddingTask interface
      return tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || "",
        timeline: task.timelines.name,
        dueDate: task.due_date || new Date().toISOString(),
        completed: task.completed || false,
        notes: task.notes || "",
        category: task.category || "Altro"
      }));
    } catch (error) {
      console.error('Error in getStoredTasks:', error);
      return [];
    }
  };

  return {
    getStoredTasks
  };
}
