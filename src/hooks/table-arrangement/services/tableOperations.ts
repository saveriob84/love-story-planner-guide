
import { Table } from "@/types/table";
import { tableDataService } from "./tableDataService";
import { User } from "@/types/auth";
import { tableService } from "./tableService";

// Service for table management operations
export const tableOperations = {
  // Add couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    if (user.name && sposiTableId) {
      await tableService.addCoupleToSposiTable(user, sposiTableId);
    }
  },
  
  // Add new table
  addTable: async (userId: string, tableCount: number) => {
    if (!userId) return null;
    
    try {
      const newName = `Tavolo ${tableCount}`;
      const data = await tableDataService.addTable(userId, newName, 8);
      return data;
    } catch (error) {
      console.error("Error in addTable:", error);
      throw error;
    }
  },

  // Add custom table with name and capacity
  addCustomTable: async (userId: string, name: string, capacity: number) => {
    if (!userId) return null;
    
    try {
      const data = await tableDataService.addTable(userId, name, capacity);
      return data;
    } catch (error) {
      console.error("Error in addCustomTable:", error);
      throw error;
    }
  },

  // Edit existing table
  editTable: async (userId: string, tableId: string, name: string, capacity: number) => {
    if (!userId) return;
    
    try {
      // Update in Supabase
      await tableDataService.editTable(userId, tableId, name, capacity);
    } catch (error) {
      console.error("Error in editTable:", error);
      throw error;
    }
  },

  // Delete table
  deleteTable: async (userId: string, tableId: string) => {
    if (!userId) return;
    
    try {
      // Delete from Supabase (assignments will cascade delete)
      await tableDataService.deleteTable(userId, tableId);
    } catch (error) {
      console.error("Error in deleteTable:", error);
      throw error;
    }
  }
};
