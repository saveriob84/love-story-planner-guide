
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
      // Add all guestIds to the assignedGuestIds set
      assignedGuestIds.add(guest.guestId);
      
      // Track the guest's main ID to prevent duplicate assignments
      if (guest.id === `table-guest-${guest.guestId}`) {
        // This is a main guest - mark their ID as assigned
        assignedGroupMemberIds.set(guest.guestId, guest.guestId);
      }
      
      // For group members, track their memberId as well
      if (guest.id.includes('-')) {
        const parts = guest.id.split('-');
        if (parts.length >= 4) {
          // Format is "table-guest-guestId-memberId"
          const memberId = parts[3];
          assignedGroupMemberIds.set(memberId, guest.guestId);
        }
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
