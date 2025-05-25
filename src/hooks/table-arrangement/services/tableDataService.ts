
import { supabase } from "@/integrations/supabase/client";
import { Table } from "@/types/table";
import { User } from "@/types/auth";
import { tableAssignmentService } from "./tableAssignmentService";

// Service for table data operations
export const tableDataService = {
  // Fetch tables from Supabase
  fetchTables: async (userId: string) => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('profile_id', userId as any);
    
    if (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Fetch table assignments - delegated to specialized service
  fetchAssignments: async () => {
    return await tableAssignmentService.fetchAssignments();
  },
  
  // Create default tables
  createDefaultTables: async (userId: string) => {
    // Create the Sposi table first (making sure it's marked as special)
    const sposiTable = {
      name: 'Tavolo Sposi',
      capacity: 2,
      profile_id: userId,
      is_special: true
    };

    // Default tables to create
    const defaultTables = [
      sposiTable,
      { name: 'Tavolo 1', capacity: 8, profile_id: userId },
      { name: 'Tavolo 2', capacity: 8, profile_id: userId },
      { name: 'Tavolo 3', capacity: 8, profile_id: userId }
    ];
    
    // Insert the tables
    const { data, error } = await supabase
      .from('tables')
      .insert(defaultTables as any)
      .select();
    
    if (error) {
      console.error('Error creating default tables:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Add new table
  addTable: async (userId: string, name: string, capacity: number, isSpecial: boolean = false) => {
    const { data, error } = await supabase
      .from('tables')
      .insert({
        name,
        capacity,
        profile_id: userId,
        is_special: isSpecial
      } as any)
      .select()
      .single();
    
    if (error) {
      console.error("Error adding table:", error);
      throw error;
    }
    
    return data;
  },
  
  // Edit existing table
  editTable: async (userId: string, tableId: string, name: string, capacity: number) => {
    const { error } = await supabase
      .from('tables')
      .update({ name, capacity } as any)
      .eq('id', tableId as any)
      .eq('profile_id', userId as any);
    
    if (error) {
      console.error("Error updating table:", error);
      throw error;
    }
  },
  
  // Delete table
  deleteTable: async (userId: string, tableId: string) => {
    const { error } = await supabase
      .from('tables')
      .delete()
      .eq('id', tableId as any)
      .eq('profile_id', userId as any);
    
    if (error) {
      console.error("Error deleting table:", error);
      throw error;
    }
  },
  
  // Add couple to Sposi table - delegated to specialized service
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    return await tableAssignmentService.addCoupleToSposiTable(user, sposiTableId);
  }
};
