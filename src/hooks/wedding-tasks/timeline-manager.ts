
import { getMonthsFromTimeline } from './utils';

export function useTimelineManager(userId: string | undefined) {
  const getStoredTimelines = (): string[] => {
    if (!userId) return getDefaultTimelines();
    
    const storedTimelinesKey = `weddingTimelines_${userId}`;
    const storedTimelines = localStorage.getItem(storedTimelinesKey);
    
    if (storedTimelines) {
      return JSON.parse(storedTimelines);
    }
    
    return getDefaultTimelines();
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
  
  const saveTimelines = (timelines: string[]): void => {
    if (!userId) return;
    
    const storedTimelinesKey = `weddingTimelines_${userId}`;
    localStorage.setItem(storedTimelinesKey, JSON.stringify(timelines));
  };
  
  const addTimeline = (timelines: string[], timelineName: string): string[] => {
    if (timelines.includes(timelineName)) return timelines;
    
    const sortedTimelines = [...timelines, timelineName].sort((a, b) => {
      // Custom sort for predefined timelines
      const numA = getMonthsFromTimeline(a);
      const numB = getMonthsFromTimeline(b);
      return numB - numA;
    });
    
    saveTimelines(sortedTimelines);
    return sortedTimelines;
  };
  
  const removeTimeline = (timelines: string[], timelineName: string, hasTasksInTimeline: boolean): { success: boolean; updatedTimelines: string[] } => {
    if (hasTasksInTimeline) {
      return { success: false, updatedTimelines: timelines };
    }
    
    const updatedTimelines = timelines.filter(t => t !== timelineName);
    saveTimelines(updatedTimelines);
    
    return { success: true, updatedTimelines };
  };
  
  const moveTimeline = (timelines: string[], timelineName: string, direction: 'up' | 'down'): string[] => {
    const index = timelines.indexOf(timelineName);
    if (index === -1) return timelines;
    
    // Non possiamo spostare oltre i limiti dell'array
    if (direction === 'up' && index === 0) return timelines;
    if (direction === 'down' && index === timelines.length - 1) return timelines;
    
    const newTimelines = [...timelines];
    
    // Scambia la posizione con l'elemento adiacente
    if (direction === 'up') {
      [newTimelines[index - 1], newTimelines[index]] = [newTimelines[index], newTimelines[index - 1]];
    } else {
      [newTimelines[index], newTimelines[index + 1]] = [newTimelines[index + 1], newTimelines[index]];
    }
    
    saveTimelines(newTimelines);
    return newTimelines;
  };
  
  return {
    getStoredTimelines,
    addTimeline,
    removeTimeline,
    moveTimeline
  };
}
