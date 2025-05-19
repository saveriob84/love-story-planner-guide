
import { Table } from "@/types/table";
import { User } from "@/types/auth";
import { tableDataService } from "./tableDataService";
import { tableAssignmentService } from "./tableAssignmentService";

// Service for table manipulation operations
export const tableService = {
  // Create default tables
  createDefaultTables: async (userId: string) => {
    return await tableDataService.createDefaultTables(userId);
  },
  
  // Add couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    return await tableAssignmentService.addCoupleToSposiTable(user, sposiTableId);
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
