
export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paid: boolean;
}

export interface BudgetState {
  budgetItems: BudgetItem[];
  totalBudget: number;
  isLoading: boolean;
}

export interface BudgetActions {
  handleBudgetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveBudget: () => Promise<void>;
  addBudgetItem: (category: string, description: string, estimatedCost: number) => Promise<void>;
  updateBudgetItem: (id: string, updates: Partial<BudgetItem>) => Promise<void>;
  deleteBudgetItem: (id: string) => Promise<void>;
}
