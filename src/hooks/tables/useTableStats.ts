
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
      
      // Per il capogruppo (quando l'ID guest è uguale all'ID della tabella-guest)
      if (guest.id === `table-guest-${guest.guestId}`) {
        // Segna l'ID principale dell'ospite come assegnato
        assignedGroupMemberIds.set(guest.guestId, guest.guestId);
      }
      
      // Per membri del gruppo con formato "table-guest-guestId-memberId"
      if (guest.id.includes('-')) {
        const parts = guest.id.split('-');
        if (parts.length >= 4) {
          // Format is "table-guest-guestId-memberId"
          const guestId = parts[2];
          const memberId = parts[3];
          
          // Segna sia il membro che il suo capogruppo
          assignedGroupMemberIds.set(memberId, guestId);
          
          // Segna anche questo ID come membro assegnato per la ricerca diretta
          // Questo garantisce che tutti i membri siano visibili come assegnati
          // indipendentemente dal formato utilizzato per cercarli
          if (memberId !== guestId) {
            assignedGroupMemberIds.set(memberId, memberId);
          }
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
