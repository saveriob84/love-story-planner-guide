
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
      // Check all possible formats for a member ID:
      
      // 1. Direct format: "table-guest-memberId" (when member added directly)
      if (guest.id === `table-guest-${memberId}`) {
        return true;
      }
      
      // 2. Group member format: "table-guest-guestId-memberId"  
      if (guest.id.endsWith(`-${memberId}`)) {
        const parts = guest.id.split('-');
        if (parts.length === 4 && parts[3] === memberId) {
          return true;
        }
      }
      
      // 3. When the member is registered with their ID as guestId
      if (guest.guestId === memberId) {
        return true;
      }
      
      // 4. Extract memberId using our utility function
      const extractedId = extractMemberIdFromGuestId(guest.id);
      if (extractedId === memberId) {
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

// Utility function to extract member ID from a table guest ID
export const extractMemberIdFromGuestId = (guestId: string): string | null => {
  // Format: "table-guest-guestId-memberId" or "table-guest-memberId"
  const parts = guestId.split('-');
  
  // Case 1: "table-guest-guestId-memberId" format
  if (parts.length === 4) {
    return parts[3]; // Return the memberId
  }
  
  // Case 2: "table-guest-memberId" format (direct assignment)
  if (parts.length === 3) {
    return parts[2]; // Return the memberId
  }
  
  return null;
};
