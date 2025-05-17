
import { User } from "@/types/auth";
import { Table } from "@/types/table";
import { supabase } from "@/integrations/supabase/client";
import { TableStats } from "../types";

// Service for table-specific operations
export const tableService = {
  // Create default tables if none exist
  createDefaultTables: async (userId: string) => {
    if (!userId) return [];
    
    try {
      return await tableDataService.createDefaultTables(userId);
    } catch (error) {
      console.error('Error creating default tables:', error);
      throw error;
    }
  },

  // Add Sposi couple to their table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    return await tableDataService.addCoupleToSposiTable(user, sposiTableId);
  },
  
  // Calculate table statistics
  calculateTableStats: (tables: Table[]): TableStats => {
    return {
      totalTables: tables.length,
      assignedGuests: tables.reduce((sum, table) => sum + table.guests.length, 0),
      availableSeats: tables.reduce((sum, table) => sum + table.capacity, 0),
    };
  }
};

// Import at the end to avoid circular dependencies
import { tableDataService } from "./tableDataService";
