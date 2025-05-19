
import { Guest } from "@/types/guest";
import { Table } from "@/types/table";
import { assignmentService } from "./assignmentService";
import { Toast } from "../types";

// Service for guest-to-table assignment operations
export const guestAssignmentService = {
  // Handle assigning a guest to a table
  assignGuestToTable: async (
    guestId: string, 
    tableId: string, 
    tables: Table[], 
    guests: Guest[],
    updateTables: (newTables: Table[]) => void,
    toast: Toast | null
  ) => {
    try {
      console.log("Assigning guest", guestId, "to table", tableId);
      
      // First, remove any existing assignment for this guest
      const isGroupMember = assignmentService.checkIfGroupMember(guests, guestId);
      await assignmentService.removeExistingAssignment(guestId, isGroupMember);
      
      // If tableId is "unassigned", we're done
      if (tableId === "unassigned") {
        // Update local state
        const updatedTables = tables.map(table => ({
          ...table,
          guests: table.guests.filter(g => g.id !== guestId)
        }));
        updateTables(updatedTables);
        
        if (toast) {
          toast({
            title: "Ospite rimosso",
            description: "L'ospite è stato rimosso dal tavolo",
          });
        }
        return;
      }
      
      // Find the target table
      const targetTable = tables.find(t => t.id === tableId);
      if (!targetTable) {
        console.log("Table not found:", tableId);
        return;
      }
      
      // Check if table is full
      if (targetTable.guests.length >= targetTable.capacity) {
        if (toast) {
          toast({
            title: "Tavolo pieno",
            description: `${targetTable.name} ha raggiunto la sua capacità massima`,
            variant: "destructive",
          });
        }
        return;
      }
      
      // Insert the assignment in Supabase
      await assignmentService.createAssignment(tableId, guestId, isGroupMember);
      
      // Find guest details
      const guestInfo = assignmentService.findGuestInfo(guests, guestId, isGroupMember);
      
      if (!guestInfo) {
        console.log("Guest not found:", guestId);
        return;
      }
      
      // Update local state
      const updatedTables = tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            guests: [...table.guests.filter(g => g.id !== guestId), guestInfo]
          };
        }
        return {
          ...table,
          guests: table.guests.filter(g => g.id !== guestId)
        };
      });
      
      updateTables(updatedTables);
      
      if (toast) {
        toast({
          title: "Ospite assegnato",
          description: `${guestInfo.name} è stato assegnato a ${targetTable.name}`,
        });
      }
    } catch (error) {
      console.error("Error in assignGuestToTable:", error);
      if (toast) {
        toast({
          title: "Errore",
          description: "Si è verificato un errore durante l'assegnazione dell'ospite",
          variant: "destructive",
        });
      }
    }
  }
};
