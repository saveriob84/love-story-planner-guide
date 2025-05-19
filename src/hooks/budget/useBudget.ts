
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { BudgetItem } from "@/components/budget/BudgetItemsList";

export const useBudget = (userId?: string) => {
  const { toast } = useToast();

  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    if (!userId) return [];
    // Try to load from localStorage
    const savedItems = localStorage.getItem(`budget_items_${userId}`);
    return savedItems ? JSON.parse(savedItems) : [];
  });
  
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    if (!userId) return 0;
    const savedBudget = localStorage.getItem(`total_budget_${userId}`);
    return savedBudget ? parseInt(savedBudget) : 0;
  });

  // Calculate totals
  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const totalPaid = budgetItems.reduce(
    (sum, item) => sum + (item.paid ? item.actualCost || item.estimatedCost : 0), 
    0
  );
  
  // Calculate remaining budget
  const remainingBudget = totalBudget - totalPaid;

  // Save budget to localStorage
  const saveBudget = () => {
    if (userId) {
      localStorage.setItem(`budget_items_${userId}`, JSON.stringify(budgetItems));
      localStorage.setItem(`total_budget_${userId}`, totalBudget.toString());
      
      // Show toast confirmation when budget is updated
      toast({
        title: "Budget aggiornato",
        description: `Il budget totale è stato aggiornato a €${totalBudget.toLocaleString()}.`,
      });
    }
  };

  // Handle budget change
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTotalBudget(value);
  };

  // Add new budget item
  const addBudgetItem = (category: string, description: string, estimatedCost: number) => {
    if (category && estimatedCost) {
      const item: BudgetItem = {
        id: `item-${Date.now()}`,
        category,
        description,
        estimatedCost,
        actualCost: null,
        paid: false
      };
      
      const updatedItems = [...budgetItems, item];
      setBudgetItems(updatedItems);
      
      if (userId) {
        localStorage.setItem(`budget_items_${userId}`, JSON.stringify(updatedItems));
      }
      
      // Show success toast
      toast({
        title: "Voce aggiunta",
        description: `${item.category} aggiunto al budget.`,
      });
    }
  };

  // Update budget item
  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    const updatedItems = budgetItems.map(item => 
      item.id === id ? { ...item, ...updates } : item
    );
    
    setBudgetItems(updatedItems);
    
    if (userId) {
      localStorage.setItem(`budget_items_${userId}`, JSON.stringify(updatedItems));
    }
  };

  // Delete budget item
  const deleteBudgetItem = (id: string) => {
    const updatedItems = budgetItems.filter(item => item.id !== id);
    setBudgetItems(updatedItems);
    
    if (userId) {
      localStorage.setItem(`budget_items_${userId}`, JSON.stringify(updatedItems));
    }
  };

  return {
    budgetItems,
    totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingBudget,
    handleBudgetChange,
    saveBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem
  };
};
