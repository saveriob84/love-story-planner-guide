
import { Table, TableGuest } from "@/types/table";
import { Guest } from "@/types/guest";
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
        guests: table.guests.filter(g => g.guestId !== guest.id)
      };
    });
    
    // Then add them to the selected table
    const finalTables = updatedTables.map(table => {
      if (table.id === tableId) {
        // Check if the table is already at capacity
        if (table.guests.length >= table.capacity) {
          toast({
            title: "Tavolo pieno",
            description: `Il tavolo ${table.name} ha già raggiunto la capacità massima.`,
            variant: "destructive",
          });
          return table;
        }
        
        return {
          ...table,
          guests: [
            ...table.guests,
            {
              id: `table-guest-${Date.now()}`,
              guestId: guest.id,
              name: guest.name,
              isChild: false
            }
          ]
        };
      }
      return table;
    });
    
    setTables(finalTables);
  };

  // Add group member to table
  const addGroupMemberToTable = (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => {
    // First, remove the member from any other table they might be in
    const updatedTables = tables.map(table => {
      return {
        ...table,
        guests: table.guests.filter(g => g.id !== member.id)
      };
    });
    
    // Then add them to the selected table
    const finalTables = updatedTables.map(table => {
      if (table.id === tableId) {
        // Check if the table is already at capacity
        if (table.guests.length >= table.capacity) {
          toast({
            title: "Tavolo pieno",
            description: `Il tavolo ${table.name} ha già raggiunto la capacità massima.`,
            variant: "destructive",
          });
          return table;
        }
        
        return {
          ...table,
          guests: [
            ...table.guests,
            {
              id: `table-guest-${member.id}`,
              guestId: guestId, // Parent guest ID
              name: member.name,
              isChild: member.isChild
            }
          ]
        };
      }
      return table;
    });
    
    setTables(finalTables);
  };

  // Remove guest from table
  const removeGuestFromTable = (tableId: string, guestInstanceId: string) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          guests: table.guests.filter(g => g.id !== guestInstanceId)
        };
      }
      return table;
    }));
  };

  return {
    addGuestToTable,
    addGroupMemberToTable,
    removeGuestFromTable
  };
};
