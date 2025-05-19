
import { Guest } from "@/types/guest";
import { Table } from "@/types/table";
import { guestAssignmentService } from "../services/guestAssignmentService";

/**
 * Hook for handling guest-to-table assignments
 */
export const useTableAssignment = (
  tables: Table[],
  setTables: React.Dispatch<React.SetStateAction<Table[]>>,
  guests: Guest[],
  toast: any
) => {
  // Assign guest to table
  const assignGuestToTable = async (guestId: string, tableId: string) => {
    try {
      await guestAssignmentService.assignGuestToTable(
        guestId, 
        tableId, 
        tables, 
        guests, 
        setTables,
        toast
      );
    } catch (error) {
      console.error("Error assigning guest to table:", error);
      toast({
        title: "Errore",
        description: "Impossibile assegnare l'ospite al tavolo",
        variant: "destructive",
      });
    }
  };

  return { assignGuestToTable };
};
