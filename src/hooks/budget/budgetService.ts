
import { supabase } from "@/integrations/supabase/client";
import { BudgetItem } from "./types";
import type { Database } from "@/integrations/supabase/types";

// Simple type definitions based on the actual database schema
type DbBudgetItem = {
  id: string;
  user_id: string;
  category: string;
  description: string | null;
  estimated_cost: number;
  actual_cost: number | null;
  paid: boolean;
  created_at: string;
  updated_at: string;
};

type DbBudgetSettings = {
  id: string;
  user_id: string;
  total_budget: number;
  created_at: string;
  updated_at: string;
};

export const budgetService = {
  async loadBudgetItems(userId: string): Promise<BudgetItem[]> {
    const { data: items, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      throw error;
    }

    return (items as DbBudgetItem[] || []).map((item) => ({
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

    return settings ? Number((settings as DbBudgetSettings).total_budget) : 0;
  },

  async saveBudgetSettings(userId: string, totalBudget: number): Promise<void> {
    const { data: existingSettings } = await supabase
      .from('budget_settings')
      .select('id')
      .eq('user_id', userId)
      .maybeSingle();

    if (existingSettings) {
      const { error } = await supabase
        .from('budget_settings')
        .update({ total_budget: totalBudget })
        .eq('user_id', userId);
      
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('budget_settings')
        .insert({ 
          user_id: userId, 
          total_budget: totalBudget 
        });
      
      if (error) throw error;
    }
  },

  async addBudgetItem(userId: string, category: string, description: string, estimatedCost: number): Promise<BudgetItem> {
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
    
    const item = data as DbBudgetItem;
    
    return {
      id: item.id,
      category: item.category,
      description: item.description || "",
      estimatedCost: Number(item.estimated_cost),
      actualCost: item.actual_cost ? Number(item.actual_cost) : null,
      paid: item.paid
    };
  },

  async updateBudgetItem(userId: string, id: string, updates: Partial<BudgetItem>): Promise<void> {
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
