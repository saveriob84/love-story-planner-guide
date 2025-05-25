
import { supabase } from "@/integrations/supabase/client";
import { BudgetItem } from "./types";
import type { Database } from "@/integrations/supabase/types";

type BudgetItemRow = Database['public']['Tables']['budget_items']['Row'];
type BudgetSettingsRow = Database['public']['Tables']['budget_settings']['Row'];
type BudgetItemInsert = Database['public']['Tables']['budget_items']['Insert'];
type BudgetItemUpdate = Database['public']['Tables']['budget_items']['Update'];
type BudgetSettingsInsert = Database['public']['Tables']['budget_settings']['Insert'];
type BudgetSettingsUpdate = Database['public']['Tables']['budget_settings']['Update'];

export const budgetService = {
  async loadBudgetItems(userId: string): Promise<BudgetItem[]> {
    const { data: items, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return (items || []).map((item) => ({
      id: item.id,
      category: item.category,
      description: item.description || "",
      estimatedCost: Number(item.estimated_cost),
      actualCost: item.actual_cost ? Number(item.actual_cost) : null,
      paid: item.paid
    }));
  },

  async loadBudgetSettings(userId: string): Promise<number> {
    const { data: settings, error } = await supabase
      .from('budget_settings')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return settings ? Number(settings.total_budget) : 0;
  },

  async saveBudgetSettings(userId: string, totalBudget: number): Promise<void> {
    const { data: existingSettings } = await supabase
      .from('budget_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSettings) {
      const updateData: BudgetSettingsUpdate = { 
        total_budget: totalBudget 
      };
      
      const { error } = await supabase
        .from('budget_settings')
        .update(updateData)
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      const insertData: BudgetSettingsInsert = { 
        user_id: userId, 
        total_budget: totalBudget 
      };
      
      const { error } = await supabase
        .from('budget_settings')
        .insert(insertData);
      
      if (error) throw error;
    }
  },

  async addBudgetItem(userId: string, category: string, description: string, estimatedCost: number): Promise<BudgetItem> {
    const insertData: BudgetItemInsert = {
      user_id: userId,
      category,
      description: description || null,
      estimated_cost: estimatedCost,
      paid: false
    };

    const { data, error } = await supabase
      .from('budget_items')
      .insert(insertData)
      .select()
      .single();

    if (error) throw error;
    
    return {
      id: data.id,
      category: data.category,
      description: data.description || "",
      estimatedCost: Number(data.estimated_cost),
      actualCost: data.actual_cost ? Number(data.actual_cost) : null,
      paid: data.paid
    };
  },

  async updateBudgetItem(userId: string, id: string, updates: Partial<BudgetItem>): Promise<void> {
    const dbUpdates: BudgetItemUpdate = {};
    
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
  },

  async deleteBudgetItem(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
