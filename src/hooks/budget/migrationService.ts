
import { supabase } from "@/integrations/supabase/client";

export const migrationService = {
  async migrateLocalStorageData(userId: string, loadBudgetData: () => Promise<void>): Promise<boolean> {
    const localItems = localStorage.getItem(`budget_items_${userId}`);
    const localBudget = localStorage.getItem(`total_budget_${userId}`);
    
    if (!localItems && !localBudget) return false;
    
    try {
      // Check if user already has data in Supabase
      const { data: existingItems } = await supabase
        .from('budget_items')
        .select('id')
        .eq('user_id', userId as any)
        .limit(1);
      
      const { data: existingSettings } = await supabase
        .from('budget_settings')
        .select('id')
        .eq('user_id', userId as any)
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
            } as any);
          
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
          } as any);
        
        if (error) console.error('Error migrating budget setting:', error);
      }
      
      // After migration, reload data from Supabase
      await loadBudgetData();
      
      // Clear local storage after migration
      localStorage.removeItem(`budget_items_${userId}`);
      localStorage.removeItem(`total_budget_${userId}`);
      
      return true;
    } catch (error) {
      console.error('Error migrating local data:', error);
      return false;
    }
  }
};
