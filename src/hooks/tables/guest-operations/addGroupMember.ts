
import { Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";
import { isGroupMemberAssigned, findTableById } from "./utils";

interface AddGroupMemberProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

export const useAddGroupMember = ({ tables, setTables }: AddGroupMemberProps) => {
  const { toast } = useToast();

  // Add group member to table
  const addGroupMemberToTable = (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => {
    // Check if this member is already assigned to any table
    if (isGroupMemberAssigned(tables, member.id)) {
      toast({
        title: "Membro già assegnato",
        description: `${member.name} è già stato assegnato a un tavolo.`,
        variant: "default",
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
    
    // Check if the table is already at capacity
    if (targetTable.guests.length >= targetTable.capacity) {
      toast({
        title: "Tavolo pieno",
        description: `Il tavolo ${targetTable.name} ha già raggiunto la capacità massima.`,
        variant: "destructive",
      });
      return;
    }
    
    // Determine the correct ID format based on whether this is a main guest or a group member
    let guestInstanceId: string;
    
    if (member.id === guestId) {
      // This is the main guest (capogruppo)
      guestInstanceId = `table-guest-${guestId}`;
    } else {
      // This is a group member
      guestInstanceId = `table-guest-${guestId}-${member.id}`;
    }
    
    // Add the member to the selected table
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          guests: [
            ...table.guests,
            {
              id: guestInstanceId,
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

  return { addGroupMemberToTable };
};
