
import { BudgetItem } from "./types";

export const budgetCalculations = {
  getTotalEstimated: (budgetItems: BudgetItem[]): number => {
    return budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  },

  getTotalActual: (budgetItems: BudgetItem[]): number => {
    return budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  },

  getTotalPaid: (budgetItems: BudgetItem[]): number => {
    return budgetItems.reduce(
      (sum, item) => sum + (item.paid ? item.actualCost || item.estimatedCost : 0), 
      0
    );
  },

  getRemainingBudget: (totalBudget: number, totalPaid: number): number => {
    return totalBudget - totalPaid;
  }
};
