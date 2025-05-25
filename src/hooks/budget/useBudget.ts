
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { BudgetItem } from "@/components/budget/BudgetItemsList";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthContext";

export const useBudget = (userId?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [totalBudget, setTotalBudget] = useState<number>(0);

  // Calculate totals
  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const totalPaid = budgetItems.reduce(
    (sum, item) => sum + (item.paid ? item.actualCost || item.estimatedCost : 0), 
    0
  );
  
  // Calculate remaining budget
  const remainingBudget = totalBudget - totalPaid;

  // Load budget data from Supabase
  const loadBudgetData = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Load budget items
      const { data: items, error: itemsError } = await supabase
        .from('budget_items')
        .select('*')
        .eq('user_id', userId);

      if (itemsError) {
        throw itemsError;
      }

      // Transform data for our component - only if items exist and no error
      const transformedItems = (items || []).map(item => ({
        id: item.id,
        category: item.category,
        description: item.description || "",
        estimatedCost: Number(item.estimated_cost),
        actualCost: item.actual_cost ? Number(item.actual_cost) : null,
        paid: item.paid
      }));

      setBudgetItems(transformedItems);

      // Load budget settings
      const { data: settings, error: settingsError } = await supabase
        .from('budget_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (settingsError && settingsError.code !== 'PGRST116') { // Not found error
        throw settingsError;
      }

      if (settings) {
        setTotalBudget(Number(settings.total_budget));
      }
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
      // Check if settings already exist for this user
      const { data: existingSettings } = await supabase
        .from('budget_settings')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('budget_settings')
          .update({ total_budget: totalBudget })
          .eq('user_id', userId);
        
        if (error) throw error;
      } else {
        // Insert new settings
        const { error } = await supabase
          .from('budget_settings')
          .insert({ user_id: userId, total_budget: totalBudget });
        
        if (error) throw error;
      }
      
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
      // Insert into database
      const { data, error } = await supabase
        .from('budget_items')
        .insert({
          user_id: userId,
          category,
          description: description || null,
          estimated_cost: estimatedCost,
          paid: false
        })
        .select()
        .single();

      if (error) throw error;
      
      if (data) {
        // Transform returned data for our component
        const newItem: BudgetItem = {
          id: data.id,
          category: data.category,
          description: data.description || "",
          estimatedCost: Number(data.estimated_cost),
          actualCost: data.actual_cost ? Number(data.actual_cost) : null,
          paid: data.paid
        };
        
        setBudgetItems(prev => [...prev, newItem]);
        
        toast({
          title: "Voce aggiunta",
          description: `${category} aggiunto al budget.`,
        });
      }
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
      // Transform data for database
      const dbUpdates: any = {};
      if ('category' in updates) dbUpdates.category = updates.category;
      if ('description' in updates) dbUpdates.description = updates.description || null;
      if ('estimatedCost' in updates) dbUpdates.estimated_cost = updates.estimatedCost;
      if ('actualCost' in updates) dbUpdates.actual_cost = updates.actualCost;
      if ('paid' in updates) dbUpdates.paid = updates.paid;
      
      const { error } = await supabase
        .from('budget_items')
        .update(dbUpdates)
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      
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
      const { error } = await supabase
        .from('budget_items')
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
      
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
    const migrateLocalStorageData = async () => {
      if (!userId) return;
      
      const localItems = localStorage.getItem(`budget_items_${userId}`);
      const localBudget = localStorage.getItem(`total_budget_${userId}`);
      
      if (!localItems && !localBudget) return;
      
      try {
        // Check if user already has data in Supabase
        const { data: existingItems } = await supabase
          .from('budget_items')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        
        const { data: existingSettings } = await supabase
          .from('budget_settings')
          .select('id')
          .eq('user_id', userId)
          .limit(1);
        
        // If no data in Supabase but data exists in localStorage, migrate it
        if ((!existingItems || existingItems.length === 0) && localItems) {
          const parsedItems = JSON.parse(localItems);
          
          // Insert items into Supabase
          for (const item of parsedItems) {
            const { error } = await supabase
              .from('budget_items')
              .insert({
                user_id: userId,
                category: item.category,
                description: item.description || null,
                estimated_cost: item.estimatedCost,
                actual_cost: item.actualCost || null,
                paid: item.paid
              });
            
            if (error) console.error('Error migrating item:', error);
          }
        }
        
        // Migrate budget setting if needed
        if ((!existingSettings || existingSettings.length === 0) && localBudget) {
          const parsedBudget = parseInt(localBudget) || 0;
          
          const { error } = await supabase
            .from('budget_settings')
            .insert({
              user_id: userId,
              total_budget: parsedBudget
            });
          
          if (error) console.error('Error migrating budget setting:', error);
        }
        
        // After migration, reload data from Supabase
        await loadBudgetData();
        
        // Clear local storage after migration
        localStorage.removeItem(`budget_items_${userId}`);
        localStorage.removeItem(`total_budget_${userId}`);
        
        toast({
          title: "Dati migrati",
          description: "I dati salvati localmente sono stati migrati al database.",
        });
      } catch (error) {
        console.error('Error migrating local data:', error);
      }
    };
    
    migrateLocalStorageData();
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
