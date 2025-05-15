
import { Table } from "@/types/table";

// Helper function to check if a guest is already assigned to any table
export const isGuestAssigned = (tables: Table[], guestId: string): boolean => {
  // Simplified logic: check if any guest in any table has this guestId
  for (const table of tables) {
    for (const guest of table.guests) {
      if (guest.guestId === guestId) {
        // If we find a guest with this guestId, they're assigned
        return true;
      }
    }
  }
  return false;
};

// Helper function to check if a group member is already assigned
export const isGroupMemberAssigned = (tables: Table[], memberId: string): boolean => {
  for (const table of tables) {
    for (const guest of table.guests) {
      // Verifica tutti i formati possibili per un ID membro:
      // 1. Format diretto: "table-guest-memberId"
      // 2. Format con ID gruppo: "table-guest-guestId-memberId"  
      // 3. Quando il membro è registrato con il suo ID come guestId
      if (
        guest.id === `table-guest-${memberId}` || 
        guest.id.endsWith(`-${memberId}`) ||
        guest.guestId === memberId
      ) {
        return true;
      }
    }
  }
  return false;
};

// Helper function to find a table by ID
export const findTableById = (tables: Table[], tableId: string): Table | undefined => {
  return tables.find(table => table.id === tableId);
};
