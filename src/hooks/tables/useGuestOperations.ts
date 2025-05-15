
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
    // First, remove the guest from any other table they might be in
    const updatedTables = tables.map(table => {
      return {
        ...table,
        guests: table.guests.filter(g => g.guestId !== guest.id || g.id.includes("-"))
      };
    });
    
    // Find the target table
    const targetTable = updatedTables.find(table => table.id === tableId);
    
    if (!targetTable) {
      toast({
        title: "Errore",
        description: "Tavolo non trovato.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if there's enough space for the guest and all group members
    const totalNewGuests = 1 + guest.groupMembers.length;
    const availableSeats = targetTable.capacity - targetTable.guests.length;
    
    if (availableSeats < totalNewGuests) {
      toast({
        title: "Spazio insufficiente",
        description: `Il tavolo ${targetTable.name} ha solo ${availableSeats} posti disponibili, ma hai bisogno di ${totalNewGuests} posti per ${guest.name} e i membri del gruppo.`,
        variant: "destructive",
      });
      return;
    }
    
    // Then add the main guest and all group members to the selected table
    const finalTables = updatedTables.map(table => {
      if (table.id === tableId) {
        // Add the main guest
        const newGuests: TableGuest[] = [
          ...table.guests,
          {
            id: `table-guest-${Date.now()}`,
            guestId: guest.id,
            name: guest.name,
            isChild: false
          }
        ];
        
        // Add all group members
        guest.groupMembers.forEach((member, index) => {
          newGuests.push({
            id: `table-guest-${guest.id}-${member.id}`,
            guestId: guest.id, // Parent guest ID
            name: member.name,
            isChild: member.isChild
          });
        });
        
        return {
          ...table,
          guests: newGuests
        };
      }
      return table;
    });
    
    setTables(finalTables);
    
    // Show success toast with information about added members
    toast({
      title: "Ospiti aggiunti",
      description: `${guest.name} e ${guest.groupMembers.length} membri del gruppo sono stati aggiunti al tavolo.`
    });
  };

  // Add group member to table (now only used for individual member additions)
  const addGroupMemberToTable = (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => {
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
    
    // Check if this specific member is already assigned to this table
    const isAlreadyAssigned = targetTable.guests.some(
      guest => guest.name === member.name && guest.id.includes(`-${member.id}`)
    );
    
    if (isAlreadyAssigned) {
      toast({
        title: "Membro già assegnato",
        description: `${member.name} è già stato assegnato a questo tavolo.`,
        variant: "default", // Changed from "warning" to "default"
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
