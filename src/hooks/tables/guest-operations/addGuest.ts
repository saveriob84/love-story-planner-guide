
import { Table } from "@/types/table";
import { Guest } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { isGuestAssigned, isGroupMemberAssigned, findTableById } from "./utils";

interface AddGuestProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

export const useAddGuest = ({ tables, setTables }: AddGuestProps) => {
  const { toast } = useToast();

  // Add guest to table
  const addGuestToTable = (tableId: string, guest: Guest) => {
    // First, check if the guest is already assigned to any table
    if (isGuestAssigned(tables, guest.id)) {
      toast({
        title: "Ospite già assegnato",
        description: `${guest.name} è già stato assegnato a un tavolo.`,
        variant: "destructive",
      });
      return;
    }
    
    // Find the target table
    const targetTable = findTableById(tables, tableId);
    
    if (!targetTable) {
      toast({
        title: "Errore",
        description: "Tavolo non trovato.",
        variant: "destructive",
      });
      return;
    }
    
    // Count how many unassigned members we have
    const unassignedMembers = guest.groupMembers.filter(member => !isGroupMemberAssigned(tables, member.id));
    
    // Calculate how many new guests we need to add
    const totalNewGuests = 1 + unassignedMembers.length;
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
        // Create new guests array
        const newGuests = [...table.guests];
        
        // Add the main guest
        newGuests.push({
          id: `table-guest-${guest.id}-${Date.now()}`,
          guestId: guest.id,
          name: guest.name,
          isChild: false
        });
        
        // Add unassigned group members
        unassignedMembers.forEach(member => {
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
    
    setTables(updatedTables);
    
    toast({
      title: "Ospiti aggiunti",
      description: `${guest.name} e i membri disponibili del gruppo sono stati aggiunti al tavolo.`
    });
  };

  return { addGuestToTable };
};
