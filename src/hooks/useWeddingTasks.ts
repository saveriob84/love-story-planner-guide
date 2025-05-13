import { useState, useEffect } from 'react';
import { useAuth } from "@/contexts/AuthContext";

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

export const useWeddingTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<WeddingTask[]>([]);
  const [timelines, setTimelines] = useState<string[]>([
    "12+ mesi prima",
    "10-12 mesi prima",
    "8-10 mesi prima",
    "6-8 mesi prima",
    "4-6 mesi prima",
    "2-4 mesi prima",
    "1-2 mesi prima",
    "1-2 settimane prima",
    "Ultimi giorni"
  ]);
  const [loading, setLoading] = useState(true);

  // Load tasks and timelines from localStorage
  useEffect(() => {
    const loadTasks = () => {
      try {
        setLoading(true);
        
        // If we have a wedding date, use it to calculate task due dates
        const weddingDate = user?.weddingDate ? new Date(user.weddingDate) : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // default to 1 year from now
        
        // Try to load tasks from localStorage first
        const userId = user?.id;
        const storedTasksKey = `weddingTasks_${userId}`;
        const storedTasks = localStorage.getItem(storedTasksKey);
        
        // Try to load custom timelines from localStorage
        const storedTimelinesKey = `weddingTimelines_${userId}`;
        const storedTimelines = localStorage.getItem(storedTimelinesKey);
        
        if (storedTimelines) {
          setTimelines(JSON.parse(storedTimelines));
        }
        
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        } else {
          // Generate default tasks if none exist
          const defaultTasks = generateDefaultTasks(weddingDate);
          setTasks(defaultTasks);
          
          // Save to localStorage
          if (userId) {
            localStorage.setItem(storedTasksKey, JSON.stringify(defaultTasks));
          }
        }
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

  const updateTask = (taskId: string, updates: Partial<WeddingTask>) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, ...updates } : task
    );
    
    setTasks(updatedTasks);
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`weddingTasks_${user.id}`, JSON.stringify(updatedTasks));
    }
  };

  const addTask = (task: Omit<WeddingTask, 'id'>) => {
    const newTask: WeddingTask = {
      ...task,
      id: `task-${Date.now()}`
    };
    
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`weddingTasks_${user.id}`, JSON.stringify(updatedTasks));
    }
  };

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`weddingTasks_${user.id}`, JSON.stringify(updatedTasks));
    }
  };

  // Add new function to reorder tasks (for drag and drop)
  const reorderTasks = (taskId: string, newTimeline: string) => {
    const updatedTasks = tasks.map(task => 
      task.id === taskId ? { ...task, timeline: newTimeline } : task
    );
    
    setTasks(updatedTasks);
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`weddingTasks_${user.id}`, JSON.stringify(updatedTasks));
    }
  };

  // Add new function to add custom timeline
  const addTimeline = (timelineName: string) => {
    if (timelines.includes(timelineName)) return;
    
    const sortedTimelines = [...timelines, timelineName].sort((a, b) => {
      // Custom sort for predefined timelines
      const numA = getMonthsFromTimeline(a);
      const numB = getMonthsFromTimeline(b);
      return numB - numA;
    });
    
    setTimelines(sortedTimelines);
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`weddingTimelines_${user.id}`, JSON.stringify(sortedTimelines));
    }
  };

  // Add new function to remove timeline
  const removeTimeline = (timelineName: string) => {
    // Don't remove if it contains tasks
    const hasTasksInTimeline = tasks.some(task => task.timeline === timelineName);
    if (hasTasksInTimeline) return false;
    
    const updatedTimelines = timelines.filter(t => t !== timelineName);
    setTimelines(updatedTimelines);
    
    // Save to localStorage
    if (user?.id) {
      localStorage.setItem(`weddingTimelines_${user.id}`, JSON.stringify(updatedTimelines));
    }
    
    return true;
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
    addTimeline,
    removeTimeline
  };
};

// Helper function to generate default tasks based on wedding date
const generateDefaultTasks = (weddingDate: Date): WeddingTask[] => {
  const tasks: WeddingTask[] = [];
  
  // Helper function to calculate date based on months before wedding
  const getDateMonthsBefore = (months: number): string => {
    const date = new Date(weddingDate);
    date.setMonth(date.getMonth() - months);
    return date.toISOString();
  };
  
  // 12+ months before
  tasks.push({
    id: `task-${Date.now()}-1`,
    title: "Stabilire la data del matrimonio",
    description: "Scegliere una data che funzioni per entrambi e verificare la disponibilità delle location.",
    timeline: "12+ mesi prima",
    dueDate: getDateMonthsBefore(12),
    completed: false,
    category: "Pianificazione"
  });
  
  tasks.push({
    id: `task-${Date.now()}-2`,
    title: "Definire il budget",
    description: "Stabilire quanto si vuole spendere e come allocare i fondi.",
    timeline: "12+ mesi prima",
    dueDate: getDateMonthsBefore(12),
    completed: false,
    category: "Budget"
  });
  
  tasks.push({
    id: `task-${Date.now()}-3`,
    title: "Scegliere la location della cerimonia",
    description: "Visitare e prenotare la chiesa o il luogo della cerimonia.",
    timeline: "12+ mesi prima",
    dueDate: getDateMonthsBefore(12),
    completed: false,
    category: "Location"
  });
  
  tasks.push({
    id: `task-${Date.now()}-4`,
    title: "Scegliere la location del ricevimento",
    description: "Visitare e prenotare il ristorante o la villa per il ricevimento.",
    timeline: "12+ mesi prima",
    dueDate: getDateMonthsBefore(12),
    completed: false,
    category: "Location"
  });
  
  // 10-12 months before
  tasks.push({
    id: `task-${Date.now()}-5`,
    title: "Selezionare il fotografo",
    description: "Scegliere il fotografo per il matrimonio e prenotarlo.",
    timeline: "10-12 mesi prima",
    dueDate: getDateMonthsBefore(11),
    completed: false,
    category: "Fornitori"
  });
  
  tasks.push({
    id: `task-${Date.now()}-6`,
    title: "Scegliere il catering",
    description: "Selezionare il servizio di catering e fissare il menù.",
    timeline: "10-12 mesi prima",
    dueDate: getDateMonthsBefore(11),
    completed: false,
    category: "Fornitori"
  });
  
  // 8-10 months before
  tasks.push({
    id: `task-${Date.now()}-7`,
    title: "Scegliere l'abito da sposa",
    description: "Visitare atelier e scegliere l'abito dei tuoi sogni.",
    timeline: "8-10 mesi prima",
    dueDate: getDateMonthsBefore(9),
    completed: false,
    category: "Abbigliamento"
  });
  
  tasks.push({
    id: `task-${Date.now()}-8`,
    title: "Selezionare la musica",
    description: "Scegliere la band o il DJ per la cerimonia e il ricevimento.",
    timeline: "8-10 mesi prima",
    dueDate: getDateMonthsBefore(9),
    completed: false,
    category: "Intrattenimento"
  });
  
  // 6-8 months before
  tasks.push({
    id: `task-${Date.now()}-9`,
    title: "Preparare la lista nozze",
    description: "Creare una lista dei regali che volete ricevere.",
    timeline: "6-8 mesi prima",
    dueDate: getDateMonthsBefore(7),
    completed: false,
    category: "Regali"
  });
  
  tasks.push({
    id: `task-${Date.now()}-10`,
    title: "Prenotare la luna di miele",
    description: "Organizzare il viaggio di nozze e prenotare voli e alloggi.",
    timeline: "6-8 mesi prima",
    dueDate: getDateMonthsBefore(7),
    completed: false,
    category: "Viaggio"
  });
  
  // 4-6 months before
  tasks.push({
    id: `task-${Date.now()}-11`,
    title: "Scegliere le bomboniere",
    description: "Decidere cosa regalare agli ospiti come ricordo.",
    timeline: "4-6 mesi prima",
    dueDate: getDateMonthsBefore(5),
    completed: false,
    category: "Regali"
  });
  
  tasks.push({
    id: `task-${Date.now()}-12`,
    title: "Ordinare le partecipazioni",
    description: "Progettare e ordinare gli inviti di nozze.",
    timeline: "4-6 mesi prima",
    dueDate: getDateMonthsBefore(5),
    completed: false,
    category: "Inviti"
  });
  
  // 2-4 months before
  tasks.push({
    id: `task-${Date.now()}-13`,
    title: "Inviare le partecipazioni",
    description: "Spedire gli inviti a tutti gli ospiti.",
    timeline: "2-4 mesi prima",
    dueDate: getDateMonthsBefore(3),
    completed: false,
    category: "Inviti"
  });
  
  tasks.push({
    id: `task-${Date.now()}-14`,
    title: "Prove dell'abito",
    description: "Fare le prove finali dell'abito da sposa.",
    timeline: "2-4 mesi prima",
    dueDate: getDateMonthsBefore(3),
    completed: false,
    category: "Abbigliamento"
  });
  
  // 1-2 months before
  tasks.push({
    id: `task-${Date.now()}-15`,
    title: "Confermare i dettagli con i fornitori",
    description: "Ricontattare tutti i fornitori per confermare i dettagli finali.",
    timeline: "1-2 mesi prima",
    dueDate: getDateMonthsBefore(1.5),
    completed: false,
    category: "Fornitori"
  });
  
  tasks.push({
    id: `task-${Date.now()}-16`,
    title: "Creare il tableau de mariage",
    description: "Organizzare i posti a sedere per il ricevimento.",
    timeline: "1-2 mesi prima",
    dueDate: getDateMonthsBefore(1.5),
    completed: false,
    category: "Ricevimento"
  });
  
  // 1-2 weeks before
  tasks.push({
    id: `task-${Date.now()}-17`,
    title: "Confermare il numero finale di ospiti",
    description: "Comunicare il numero definitivo al catering e alla location.",
    timeline: "1-2 settimane prima",
    dueDate: getDateMonthsBefore(0.5),
    completed: false,
    category: "Organizzazione"
  });
  
  tasks.push({
    id: `task-${Date.now()}-18`,
    title: "Ritirare le fedi",
    description: "Ritirare le fedi nuziali dal gioielliere.",
    timeline: "1-2 settimane prima",
    dueDate: getDateMonthsBefore(0.5),
    completed: false,
    category: "Cerimonia"
  });
  
  // Last few days
  tasks.push({
    id: `task-${Date.now()}-19`,
    title: "Preparare la valigia per il viaggio di nozze",
    description: "Fare i bagagli per la luna di miele.",
    timeline: "Ultimi giorni",
    dueDate: getDateMonthsBefore(0.1),
    completed: false,
    category: "Viaggio"
  });
  
  tasks.push({
    id: `task-${Date.now()}-20`,
    title: "Ritirare l'abito",
    description: "Ritirare l'abito da sposa e lo smoking.",
    timeline: "Ultimi giorni",
    dueDate: getDateMonthsBefore(0.1),
    completed: false,
    category: "Abbigliamento"
  });
  
  return tasks;
};

// Helper function to extract numeric months from timeline for sorting
const getMonthsFromTimeline = (timeline: string): number => {
  // Extract numeric values from the timeline string
  if (timeline.includes('+')) {
    const months = parseInt(timeline.split(' ')[0]);
    return months || 0;
  } else if (timeline.includes('-')) {
    const range = timeline.split(' ')[0];
    const months = parseInt(range.split('-')[1]);
    return months || 0;
  } else if (timeline.includes('settimane')) {
    return 0.5; // weeks are less than a month
  } else if (timeline === 'Ultimi giorni') {
    return 0.1; // last few days are the closest to wedding
  } else {
    return 0; // custom timelines default to 0 (right before wedding)
  }
};
