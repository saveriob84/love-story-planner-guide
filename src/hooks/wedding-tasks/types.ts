
export interface WeddingTask {
  id: string;
  title: string;
  description: string;
  timeline: string; // e.g., "12 months before", "6 months before" etc.
  dueDate: string; // ISO date string
  completed: boolean;
  notes?: string;
  category: string;
}
