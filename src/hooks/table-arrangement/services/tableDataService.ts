
import { supabase } from "@/integrations/supabase/client";
import { Table } from "@/types/table";
import { User } from "@/types/auth";

// Service for table data operations
export const tableDataService = {
  // Fetch tables from Supabase
  fetchTables: async (userId: string) => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('profile_id', userId);
    
    if (error) {
      console.error('Error fetching tables:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Fetch table assignments
  fetchAssignments: async () => {
    const { data, error } = await supabase
      .from('table_assignments')
      .select(`
        id,
        table_id,
        guest_id,
        group_member_id,
        guests:guest_id(id, name, dietary_restrictions),
        group_members:group_member_id(id, name, dietary_restrictions, is_child, guest_id)
      `);
    
    if (error) {
      console.error('Error fetching table assignments:', error);
      throw error;
    }
    
    return data || [];
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
      .insert(defaultTables)
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
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error adding table:", error);
      throw error;
    }
    
    return data;
  },
  
  // Check if Sposi table exists
  checkSposiTableExists: async (userId: string) => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('profile_id', userId)
      .eq('name', 'Tavolo Sposi')
      .eq('is_special', true)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned" error
      console.error("Error checking for Sposi table:", error);
      throw error;
    }
    
    return !!data;
  },
  
  // Create Sposi table if it doesn't exist
  createSposiTableIfNotExists: async (userId: string) => {
    try {
      const sposiTableExists = await tableDataService.checkSposiTableExists(userId);
      
      if (!sposiTableExists) {
        const sposiTable = {
          name: 'Tavolo Sposi',
          capacity: 2,
          profile_id: userId,
          is_special: true
        };
        
        const { data, error } = await supabase
          .from('tables')
          .insert(sposiTable)
          .select()
          .single();
          
        if (error) {
          console.error("Error creating Sposi table:", error);
          throw error;
        }
        
        return data;
      }
      return null;
    } catch (error) {
      console.error("Error in createSposiTableIfNotExists:", error);
      throw error;
    }
  },
  
  // Edit existing table
  editTable: async (userId: string, tableId: string, name: string, capacity: number) => {
    const { error } = await supabase
      .from('tables')
      .update({ name, capacity })
      .eq('id', tableId)
      .eq('profile_id', userId);
    
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
      .eq('id', tableId)
      .eq('profile_id', userId);
    
    if (error) {
      console.error("Error deleting table:", error);
      throw error;
    }
  },
  
  // Add couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    if (!user.name) return;
    
    const coupleNames = [];
    
    // Add first partner
    if (user.name) {
      coupleNames.push(user.name);
      
      // Insert the first partner as a guest
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: user.name,
          profile_id: user.id,
          relationship: 'Sposa/Sposo',
          rsvp: 'confirmed'
        })
        .select('id')
        .single();
        
      if (!guestError && guestData) {
        // Assign the first partner to the Sposi table
        await supabase
          .from('table_assignments')
          .insert({
            table_id: sposiTableId,
            guest_id: guestData.id
          });
      }
    }
    
    // Add second partner if available
    if (user.partnerName) {
      coupleNames.push(user.partnerName);
      
      // Insert the second partner as a guest
      const { data: partnerData, error: partnerError } = await supabase
        .from('guests')
        .insert({
          name: user.partnerName,
          profile_id: user.id,
          relationship: 'Sposa/Sposo',
          rsvp: 'confirmed'
        })
        .select('id')
        .single();
        
      if (!partnerError && partnerData) {
        // Assign the second partner to the Sposi table
        await supabase
          .from('table_assignments')
          .insert({
            table_id: sposiTableId,
            guest_id: partnerData.id
          });
      }
    }
    
    return coupleNames;
  }
};
