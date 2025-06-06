
import { getMonthsFromTimeline } from './utils';
import { supabase } from "@/integrations/supabase/client";

export function useTimelineManager(userId: string | undefined) {
  const getStoredTimelines = async (): Promise<string[]> => {
    if (!userId) return getDefaultTimelines();
    
    try {
      // Get timelines from database
      const { data: timelines, error } = await supabase
        .from('timelines')
        .select('*')
        .eq('profile_id', userId as any)
        .order('display_order', { ascending: true });
        
      if (error) {
        console.error('Error fetching timelines:', error);
        return getDefaultTimelines();
      }
      
      // If no timelines exist, return default ones
      if (timelines.length === 0) {
        return getDefaultTimelines();
      }
      
      // Map database timelines to string array
      return timelines.map(timeline => (timeline as any).name);
    } catch (error) {
      console.error('Error in getStoredTimelines:', error);
      return getDefaultTimelines();
    }
  };
  
  const getDefaultTimelines = (): string[] => {
    return [
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
  };
  
  const addTimeline = async (timelines: string[], timelineName: string): Promise<string[]> => {
    if (!userId) return [...timelines, timelineName];
    
    if (timelines.includes(timelineName)) return timelines;
    
    try {
      // Add timeline to database
      const { error } = await supabase
        .from('timelines')
        .insert({
          profile_id: userId,
          name: timelineName,
          display_order: timelines.length // Add to the end
        } as any);
        
      if (error) {
        console.error('Error adding timeline:', error);
        return [...timelines, timelineName]; // Add locally even if DB fails
      }
      
      console.log('Timeline added successfully:', timelineName);
      
      // Return updated timelines immediately including the new one
      return [...timelines, timelineName];
    } catch (error) {
      console.error('Error in addTimeline:', error);
      return [...timelines, timelineName];
    }
  };
  
  const removeTimeline = async (timelines: string[], timelineName: string, hasTasksInTimeline: boolean): Promise<{ success: boolean; updatedTimelines: string[] }> => {
    if (!userId) return { success: false, updatedTimelines: timelines };
    
    if (hasTasksInTimeline) {
      return { success: false, updatedTimelines: timelines };
    }
    
    try {
      // Get the timeline ID
      const { data: timeline } = await supabase
        .from('timelines')
        .select('id')
        .eq('profile_id', userId as any)
        .eq('name', timelineName as any)
        .single();
        
      if (!timeline) {
        return { success: false, updatedTimelines: timelines };
      }
      
      // Delete timeline from database
      const { error } = await supabase
        .from('timelines')
        .delete()
        .eq('id', (timeline as any).id as any);
        
      if (error) {
        console.error('Error removing timeline:', error);
        return { success: false, updatedTimelines: timelines };
      }
      
      // Update display order for remaining timelines
      const updatedTimelines = timelines.filter(t => t !== timelineName);
      
      // Update display order in database
      for (let i = 0; i < updatedTimelines.length; i++) {
        const { error: updateError } = await supabase
          .from('timelines')
          .update({ display_order: i } as any)
          .eq('profile_id', userId as any)
          .eq('name', updatedTimelines[i] as any);
          
        if (updateError) {
          console.error('Error updating timeline display order:', updateError);
        }
      }
      
      return { success: true, updatedTimelines };
    } catch (error) {
      console.error('Error in removeTimeline:', error);
      return { success: false, updatedTimelines: timelines };
    }
  };
  
  const moveTimeline = async (timelines: string[], timelineName: string, direction: 'up' | 'down'): Promise<string[]> => {
    if (!userId) return timelines;
    
    const index = timelines.indexOf(timelineName);
    if (index === -1) return timelines;
    
    // Non possiamo spostare oltre i limiti dell'array
    if (direction === 'up' && index === 0) return timelines;
    if (direction === 'down' && index === timelines.length - 1) return timelines;
    
    try {
      // Get timeline IDs and display orders
      const { data: dbTimelines, error } = await supabase
        .from('timelines')
        .select('id, name, display_order')
        .eq('profile_id', userId as any)
        .in('name', [timelineName, timelines[direction === 'up' ? index - 1 : index + 1]] as any)
        .order('display_order', { ascending: true });
        
      if (error || !dbTimelines || dbTimelines.length !== 2) {
        console.error('Error fetching timelines for move:', error);
        return timelines;
      }
      
      // Swap display order
      const timeline1 = dbTimelines.find(t => (t as any).name === timelineName);
      const timeline2 = dbTimelines.find(t => (t as any).name !== timelineName);
      
      if (!timeline1 || !timeline2) {
        return timelines;
      }
      
      // Update display orders in database
      await supabase
        .from('timelines')
        .update({ display_order: (timeline2 as any).display_order } as any)
        .eq('id', (timeline1 as any).id as any);
        
      await supabase
        .from('timelines')
        .update({ display_order: (timeline1 as any).display_order } as any)
        .eq('id', (timeline2 as any).id as any);
      
      // Create new array with swapped positions
      const newTimelines = [...timelines];
      if (direction === 'up') {
        [newTimelines[index - 1], newTimelines[index]] = [newTimelines[index], newTimelines[index - 1]];
      } else {
        [newTimelines[index], newTimelines[index + 1]] = [newTimelines[index + 1], newTimelines[index]];
      }
      
      return newTimelines;
    } catch (error) {
      console.error('Error in moveTimeline:', error);
      return timelines;
    }
  };
  
  return {
    getStoredTimelines,
    addTimeline,
    removeTimeline,
    moveTimeline
  };
}
