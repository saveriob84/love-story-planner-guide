
import { WeddingTask } from './types';

// Helper function to generate default tasks based on wedding date
export const generateDefaultTasks = (weddingDate: Date): WeddingTask[] => {
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
export const getMonthsFromTimeline = (timeline: string): number => {
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
