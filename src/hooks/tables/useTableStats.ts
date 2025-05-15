
import { Table } from "@/types/table";

export const useTableStats = (tables: Table[]) => {
  // Calculate stats
  const totalTables = tables.length;
  const totalSeats = tables.reduce((total, table) => total + table.capacity, 0);
  const occupiedSeats = tables.reduce((total, table) => total + table.guests.length, 0);
  const availableSeats = totalSeats - occupiedSeats;
  
  // Get assigned guests IDs (to filter out already assigned guests)
  const assignedGuestIds = new Set<string>();
  // Track assigned group member IDs separately to allow adding the main guest
  // even if some group members are already assigned
  const assignedGroupMemberIds = new Set<string>();

  tables.forEach(table => {
    table.guests.forEach(guest => {
      if (guest.id.includes("table-guest-") && guest.id.includes("-")) {
        // This is a group member, track it separately
        assignedGroupMemberIds.add(guest.id);
      } else {
        // This is a main guest, track it normally
        assignedGuestIds.add(guest.guestId);
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
