
import { Table } from "@/types/table";

// Helper function to check if a guest is already assigned to any table
export const isGuestAssigned = (tables: Table[], guestId: string): boolean => {
  // Check if any guest in any table has this guestId
  return tables.some(table => 
    table.guests.some(guest => guest.guestId === guestId)
  );
};

// Helper function to check if a group member is already assigned
export const isGroupMemberAssigned = (tables: Table[], memberId: string): boolean => {
  return tables.some(table => 
    table.guests.some(guest => {
      // Case 1: Direct match when memberId is stored in id after "table-guest-"
      if (guest.id === `table-guest-${memberId}`) {
        return true;
      }
      
      // Case 2: Group member format "table-guest-guestId-memberId"
      const parts = guest.id.split('-');
      if (parts.length === 4 && parts[3] === memberId) {
        return true;
      }
      
      // Case 3: When the member ID is used as the guestId
      if (guest.guestId === memberId) {
        return true;
      }
      
      return false;
    })
  );
};

// Helper function to find a table by ID
export const findTableById = (tables: Table[], tableId: string): Table | undefined => {
  return tables.find(table => table.id === tableId);
};

// Extract member ID from guest ID - simplified version
export const extractMemberIdFromGuestId = (guestId: string): string | null => {
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
