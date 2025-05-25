
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { BudgetItem } from "./types";
import { budgetService } from "./budgetService";
import { migrationService } from "./migrationService";
import { budgetCalculations } from "./budgetCalculations";

export const useBudget = (userId?: string) => {
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Calculate totals using the calculations service
  const totalEstimated = budgetCalculations.getTotalEstimated(budgetItems);
  const totalActual = budgetCalculations.getTotalActual(budgetItems);
  const totalPaid = budgetCalculations.getTotalPaid(budgetItems);
  const remainingBudget = budgetCalculations.getRemainingBudget(totalBudget, totalPaid);

  // Load budget data from Supabase
  const loadBudgetData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [items, settings] = await Promise.all([
        budgetService.loadBudgetItems(userId),
        budgetService.loadBudgetSettings(userId)
      ]);

      setBudgetItems(items);
      setTotalBudget(settings);
    } catch (error) {
      console.error('Error loading budget data:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il caricamento dei dati del budget.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Initial data load
  useEffect(() => {
    loadBudgetData();
  }, [userId]);

  // Handle budget change
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTotalBudget(value);
  };

  // Save budget to database
  const saveBudget = async () => {
    if (!userId) return;
    
    try {
      await budgetService.saveBudgetSettings(userId, totalBudget);
      
      toast({
        title: "Budget aggiornato",
        description: `Il budget totale è stato aggiornato a €${totalBudget.toLocaleString()}.`,
      });
    } catch (error) {
      console.error('Error saving budget:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il salvataggio del budget.",
        variant: "destructive",
      });
    }
  };

  // Add new budget item
  const addBudgetItem = async (category: string, description: string, estimatedCost: number) => {
    if (!userId || !category || !estimatedCost) return;
    
    try {
      const newItem = await budgetService.addBudgetItem(userId, category, description, estimatedCost);
      setBudgetItems(prev => [...prev, newItem]);
      
      toast({
        title: "Voce aggiunta",
        description: `${category} aggiunto al budget.`,
      });
    } catch (error) {
      console.error('Error adding budget item:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiunta della voce.",
        variant: "destructive",
      });
    }
  };

  // Update budget item
  const updateBudgetItem = async (id: string, updates: Partial<BudgetItem>) => {
    if (!userId) return;
    
    try {
      await budgetService.updateBudgetItem(userId, id, updates);
      
      // Update local state
      setBudgetItems(prev => 
        prev.map(item => item.id === id ? { ...item, ...updates } : item)
      );

      toast({
        title: "Voce aggiornata",
        description: "La voce del budget è stata aggiornata con successo.",
      });
    } catch (error) {
      console.error('Error updating budget item:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento della voce.",
        variant: "destructive",
      });
    }
  };

  // Delete budget item
  const deleteBudgetItem = async (id: string) => {
    if (!userId) return;
    
    try {
      await budgetService.deleteBudgetItem(userId, id);
      
      // Update local state
      setBudgetItems(prev => prev.filter(item => item.id !== id));

      toast({
        title: "Voce eliminata",
        description: "La voce del budget è stata eliminata con successo.",
      });
    } catch (error) {
      console.error('Error deleting budget item:', error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'eliminazione della voce.",
        variant: "destructive",
      });
    }
  };

  // Migrate localStorage data to Supabase if needed
  useEffect(() => {
    const migrate = async () => {
      if (!userId) return;
      
      const migrated = await migrationService.migrateLocalStorageData(userId, loadBudgetData);
      
      if (migrated) {
        toast({
          title: "Dati migrati",
          description: "I dati salvati localmente sono stati migrati al database.",
        });
      }
    };
    
    migrate();
  }, [userId]);

  return {
    budgetItems,
    totalBudget,
    totalEstimated,
    totalActual,
    totalPaid,
    remainingBudget,
    isLoading,
    handleBudgetChange,
    saveBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem
  };
};
