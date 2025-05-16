
import { Table } from "@/types/table";
import { extractMemberIdFromGuestId } from "./guest-operations/utils";

export const useTableStats = (tables: Table[]) => {
  // Calculate stats
  const totalTables = tables.length;
  const totalSeats = tables.reduce((total, table) => total + table.capacity, 0);
  const occupiedSeats = tables.reduce((total, table) => total + table.guests.length, 0);
  const availableSeats = totalSeats - occupiedSeats;
  
  // Get assigned guests IDs (to filter out already assigned guests)
  const assignedGuestIds = new Set<string>();
  // Track assigned group member IDs to prevent duplicate assignments
  const assignedGroupMemberIds = new Map<string, string>(); // Format: memberId -> guestId

  tables.forEach(table => {
    table.guests.forEach(guest => {
      // Add all guestIds to the assignedGuestIds set
      assignedGuestIds.add(guest.guestId);
      
      // Case 1: Main guest (capogruppo)
      assignedGroupMemberIds.set(guest.guestId, guest.guestId);
      
      // Case 2: Group member format "table-guest-guestId-memberId"
      if (guest.id.includes('-')) {
        const parts = guest.id.split('-');
        if (parts.length === 4) {
          // Format is "table-guest-guestId-memberId"
          const guestId = parts[2];
          const memberId = parts[3];
          
          // Mark this member as assigned
          assignedGroupMemberIds.set(memberId, guestId);
        }
      }
      
      // Case 3: Directly assigned member (when added individually)
      if (guest.id.startsWith('table-guest-') && !guest.id.includes('-', 12)) {
        const directMemberId = guest.id.substring(12); // Remove "table-guest-"
        assignedGroupMemberIds.set(directMemberId, directMemberId);
      }
      
      // Case 4: Extract member ID using our utility function as a fallback
      const extractedMemberId = extractMemberIdFromGuestId(guest.id);
      if (extractedMemberId) {
        assignedGroupMemberIds.set(extractedMemberId, guest.guestId);
      }
    });
  });

  return {
    stats: {
      totalTables,
      totalSeats,
      occupiedSeats,
      availableSeats
    },
    assignedGuestIds,
    assignedGroupMemberIds
  };
};
