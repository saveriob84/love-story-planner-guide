
import { Table } from "@/types/table";

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
      // Add all guest IDs to the assignedGuestIds set
      assignedGuestIds.add(guest.guestId);
      
      // Always add the guest's ID to track main guests
      if (guest.guestId) {
        assignedGroupMemberIds.set(guest.guestId, guest.guestId);
      }
      
      // Handle group members with format "table-guest-guestId-memberId"
      const parts = guest.id.split('-');
      if (parts.length === 4) {
        const guestId = parts[2];
        const memberId = parts[3];
        assignedGroupMemberIds.set(memberId, guestId);
      }
      
      // Handle direct assignment format "table-guest-memberId"
      if (parts.length === 3) {
        const memberId = parts[2];
        assignedGroupMemberIds.set(memberId, memberId);
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
