
import { supabase } from "@/integrations/supabase/client";

// Frontend types - definiamo i nostri tipi semplici
export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paid: boolean;
}

export interface BudgetSettings {
  id: string;
  userId: string;
  totalBudget: number;
  createdAt: string;
  updatedAt: string;
}

export const budgetService = {
  async loadBudgetItems(userId: string): Promise<BudgetItem[]> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('*')
      .eq('user_id', userId as any)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    if (!data) return [];
    
    return data.map((item: any) => ({
      id: item.id,
      category: item.category,
      description: item.description || "",
      estimatedCost: Number(item.estimated_cost),
      actualCost: item.actual_cost ? Number(item.actual_cost) : null,
      paid: Boolean(item.paid)
    }));
  },

  async loadBudgetSettings(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('budget_settings')
      .select('*')
      .eq('user_id', userId as any)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') throw error;
    if (!data) return 0;
    
    return Number(data.total_budget);
  },

  async saveBudgetSettings(userId: string, totalBudget: number): Promise<void> {
    // Prima controlla se esistono già delle impostazioni
    const { data: existingData } = await supabase
      .from('budget_settings')
      .select('id')
      .eq('user_id', userId as any)
      .maybeSingle();

    if (existingData) {
      // Aggiorna le impostazioni esistenti
      const { error } = await supabase
        .from('budget_settings')
        .update({ 
          total_budget: totalBudget,
          updated_at: new Date().toISOString()
        } as any)
        .eq('user_id', userId as any);

      if (error) throw error;
    } else {
      // Crea nuove impostazioni
      const { error } = await supabase
        .from('budget_settings')
        .insert({ 
          user_id: userId, 
          total_budget: totalBudget 
        } as any);
      
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
      } as any)
      .select()
      .single();

    if (error) throw error;
    if (!data) throw new Error('Nessun dato restituito dall\'inserimento');
    
    return {
      id: data.id,
      category: data.category,
      description: data.description || "",
      estimatedCost: Number(data.estimated_cost),
      actualCost: data.actual_cost ? Number(data.actual_cost) : null,
      paid: Boolean(data.paid)
    };
  },

  async updateBudgetItem(userId: string, id: string, updates: Partial<BudgetItem>): Promise<void> {
    const dbUpdates: any = {};
    
    if ('category' in updates && updates.category !== undefined) {
      dbUpdates.category = updates.category;
    }
    if ('description' in updates && updates.description !== undefined) {
      dbUpdates.description = updates.description || null;
    }
    if ('estimatedCost' in updates && updates.estimatedCost !== undefined) {
      dbUpdates.estimated_cost = updates.estimatedCost;
    }
    if ('actualCost' in updates && updates.actualCost !== undefined) {
      dbUpdates.actual_cost = updates.actualCost;
    }
    if ('paid' in updates && updates.paid !== undefined) {
      dbUpdates.paid = updates.paid;
    }

    // Aggiungi timestamp di aggiornamento
    dbUpdates.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('budget_items')
      .update(dbUpdates)
      .eq('id', id as any)
      .eq('user_id', userId as any);

    if (error) throw error;
  },

  async deleteBudgetItem(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('budget_items')
      .delete()
      .eq('id', id as any)
      .eq('user_id', userId as any);

    if (error) throw error;
  },

  async getTotalSpent(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('actual_cost')
      .eq('user_id', userId as any)
      .eq('paid', true as any);

    if (error) throw error;
    if (!data) return 0;

    return data.reduce((total: number, item: any) => {
      return total + (item.actual_cost ? Number(item.actual_cost) : 0);
    }, 0);
  },

  async getTotalEstimated(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('budget_items')
      .select('estimated_cost')
      .eq('user_id', userId as any);

    if (error) throw error;
    if (!data) return 0;

    return data.reduce((total: number, item: any) => {
      return total + Number(item.estimated_cost);
    }, 0);
  }
};
