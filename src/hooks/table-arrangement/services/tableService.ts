
import { supabase } from "@/integrations/supabase/client";
import { Table } from "@/types/table";
import { User } from "@/types/auth";

// Service for table manipulation operations
export const tableService = {
  // Create default tables
  createDefaultTables: async (userId: string) => {
    return await tableDataService.createDefaultTables(userId);
  },
  
  // Add couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    return await tableDataService.addCoupleToSposiTable(user, sposiTableId);
  },
  
  // Calculate table statistics
  calculateTableStats: (tables: Table[]) => {
    // Calculate total tables
    const totalTables = tables.length;
    
    // Calculate assigned guests
    let assignedGuests = 0;
    let availableSeats = 0;
    
    for (const table of tables) {
      assignedGuests += table.guests.length;
      availableSeats += table.capacity - table.guests.length;
    }
    
    return {
      totalTables,
      assignedGuests,
      availableSeats
    };
  }
};

// Import the main service to avoid circular dependencies
import { tableDataService } from "./tableDataService";
