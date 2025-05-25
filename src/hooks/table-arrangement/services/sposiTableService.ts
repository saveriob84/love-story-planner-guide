
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { tableDataService } from "./tableDataService";

// Service dedicated to Sposi table operations
export const sposiTableService = {
  // Check if Sposi table exists
  checkSposiTableExists: async (userId: string) => {
    const { data, error } = await supabase
      .from('tables')
      .select('*')
      .eq('profile_id', userId as any)
      .eq('name', 'Tavolo Sposi' as any)
      .eq('is_special', true as any)
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
      const sposiTableExists = await sposiTableService.checkSposiTableExists(userId);
      
      if (!sposiTableExists) {
        const sposiTable = {
          name: 'Tavolo Sposi',
          capacity: 2,
          profile_id: userId,
          is_special: true
        };
        
        const { data, error } = await supabase
          .from('tables')
          .insert(sposiTable as any)
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
  
  // Add couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    return await tableDataService.addCoupleToSposiTable(user, sposiTableId);
  }
};
