
// Esportiamo i tipi principali dal budgetService
export { BudgetItem, BudgetSettings } from './budgetService';

// Tipo per lo stato del budget nell'hook
export interface BudgetState {
  budgetItems: BudgetItem[];
  totalBudget: number;
  isLoading: boolean;
}

// Azioni disponibili per gestire il budget
export interface BudgetActions {
  handleBudgetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveBudget: () => Promise<void>;
  addBudgetItem: (category: string, description: string, estimatedCost: number) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
}

// Import per compatibilità
import { BudgetItem } from './budgetService';
