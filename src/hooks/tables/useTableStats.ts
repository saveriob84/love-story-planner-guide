
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
      
      // Gestione del capogruppo (quando l'ID guest è uguale all'ID della tabella-guest)
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
          
          // Segna questo membro come assegnato
          assignedGroupMemberIds.set(memberId, guestId);
        }
      }
      
      // Caso speciale per i membri assegnati individualmente
      // Se l'ID contiene "table-guest-" ma non è un ID di gruppo (non ha parti aggiuntive)
      if (guest.id.startsWith('table-guest-') && !guest.id.includes('-', 12)) {
        const directMemberId = guest.id.substring(12); // Rimuove "table-guest-"
        assignedGroupMemberIds.set(directMemberId, directMemberId);
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
