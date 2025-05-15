
import { Table, TableGuest } from "@/types/table";
import { Guest, GroupMember } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";

interface GuestOperationsProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

export const useGuestOperations = ({ tables, setTables }: GuestOperationsProps) => {
  const { toast } = useToast();

  // Add guest to table
  const addGuestToTable = (tableId: string, guest: Guest) => {
    // First, check if the guest is already assigned to any table
    let isGuestAlreadyAssigned = false;
    
    tables.forEach(table => {
      table.guests.forEach(g => {
        if (g.guestId === guest.id && !g.id.includes('-')) {
          isGuestAlreadyAssigned = true;
        }
      });
    });
    
    if (isGuestAlreadyAssigned) {
      toast({
        title: "Ospite già assegnato",
        description: `${guest.name} è già stato assegnato a un tavolo.`,
        variant: "default",
      });
      return;
    }
    
    // Find the target table
    const targetTable = tables.find(table => table.id === tableId);
    
    if (!targetTable) {
      toast({
        title: "Errore",
        description: "Tavolo non trovato.",
        variant: "destructive",
      });
      return;
    }
    
    // Count how many members are already assigned
    const alreadyAssignedMembers = guest.groupMembers.filter(member => {
      // Check if this member is already assigned to any table
      let isAssigned = false;
      tables.forEach(table => {
        table.guests.forEach(g => {
          if (g.id.includes(`-${member.id}`)) {
            isAssigned = true;
          }
        });
      });
      return isAssigned;
    }).length;
    
    // Calculate how many new guests we need to add
    const totalNewGuests = 1 + (guest.groupMembers.length - alreadyAssignedMembers);
    const availableSeats = targetTable.capacity - targetTable.guests.length;
    
    if (availableSeats < totalNewGuests) {
      toast({
        title: "Spazio insufficiente",
        description: `Il tavolo ${targetTable.name} ha solo ${availableSeats} posti disponibili, ma hai bisogno di ${totalNewGuests} posti.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the main guest and all unassigned group members to the selected table
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        // Add the main guest
        const newGuests = [...table.guests];
        
        // Add the main guest if not already in the table
        const mainGuestAlreadyInTable = newGuests.some(g => g.guestId === guest.id && !g.id.includes('-'));
        
        if (!mainGuestAlreadyInTable) {
          newGuests.push({
            id: `table-guest-${Date.now()}`,
            guestId: guest.id,
            name: guest.name,
            isChild: false
          });
        }
        
        // Add unassigned group members
        guest.groupMembers.forEach(member => {
          // Check if this member is already assigned to any table
          let isAssigned = false;
          tables.forEach(t => {
            t.guests.forEach(g => {
              if (g.id.includes(`-${member.id}`)) {
                isAssigned = true;
              }
            });
          });
          
          if (!isAssigned) {
            newGuests.push({
              id: `table-guest-${guest.id}-${member.id}`,
              guestId: guest.id, // Parent guest ID
              name: member.name,
              isChild: member.isChild
            });
          }
        });
        
        return {
          ...table,
          guests: newGuests
        };
      }
      return table;
    });
    
    setTables(updatedTables);
    
    toast({
      title: "Ospiti aggiunti",
      description: `${guest.name} e i membri disponibili del gruppo sono stati aggiunti al tavolo.`
    });
  };

  // Add group member to table
  const addGroupMemberToTable = (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => {
    // Check if this member is already assigned to any table
    let isAlreadyAssigned = false;
    
    tables.forEach(table => {
      table.guests.forEach(g => {
        if (g.id.includes(`-${member.id}`)) {
          isAlreadyAssigned = true;
        }
      });
    });
    
    if (isAlreadyAssigned) {
      toast({
        title: "Membro già assegnato",
        description: `${member.name} è già stato assegnato a un tavolo.`,
        variant: "default",
      });
      return;
    }
    
    // Find the target table
    const targetTable = tables.find(table => table.id === tableId);
    
    if (!targetTable) {
      toast({
        title: "Errore",
        description: "Tavolo non trovato.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if the table is already at capacity
    if (targetTable.guests.length >= targetTable.capacity) {
      toast({
        title: "Tavolo pieno",
        description: `Il tavolo ${targetTable.name} ha già raggiunto la capacità massima.`,
        variant: "destructive",
      });
      return;
    }
    
    // Add the member to the selected table
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          guests: [
            ...table.guests,
            {
              id: `table-guest-${guestId}-${member.id}`,
              guestId: guestId, // Parent guest ID
              name: member.name,
              isChild: member.isChild
            }
          ]
        };
      }
      return table;
    }));
    
    toast({
      title: "Membro aggiunto",
      description: `${member.name} è stato aggiunto al tavolo ${targetTable.name}.`
    });
  };

  // Remove guest from table
  const removeGuestFromTable = (tableId: string, guestInstanceId: string) => {
    const tableGuest = tables.find(t => t.id === tableId)?.guests.find(g => g.id === guestInstanceId);
    
    if (!tableGuest) {
      return;
    }
    
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          guests: table.guests.filter(g => g.id !== guestInstanceId)
        };
      }
      return table;
    }));
    
    toast({
      title: "Ospite rimosso",
      description: `${tableGuest.name} è stato rimosso dal tavolo.`
    });
  };

  return {
    addGuestToTable,
    addGroupMemberToTable,
    removeGuestFromTable
  };
};
