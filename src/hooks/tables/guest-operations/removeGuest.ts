
import { Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";

interface RemoveGuestProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

export const useRemoveGuest = ({ tables, setTables }: RemoveGuestProps) => {
  const { toast } = useToast();

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

  return { removeGuestFromTable };
};
