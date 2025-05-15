
import { Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";

interface TableOperationsProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}

export const useTableOperations = ({ tables, setTables }: TableOperationsProps) => {
  const { toast } = useToast();

  // Add new table
  const addTable = (name: string, capacity: number) => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      name,
      capacity,
      guests: []
    };
    
    setTables([...tables, newTable]);
    return true;
  };

  // Update table
  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(table => 
      table.id === id ? { ...table, ...updates } : table
    ));
  };

  // Remove table
  const removeTable = (id: string) => {
    // Don't allow removing the bride and groom table
    if (id === "table-sposi") {
      toast({
        title: "Operazione non consentita",
        description: "Non è possibile rimuovere il tavolo degli sposi.",
        variant: "destructive",
      });
      return;
    }
    
    setTables(tables.filter(table => table.id !== id));
    toast({
      title: "Tavolo rimosso",
      description: "Il tavolo è stato rimosso con successo.",
    });
  };

  return {
    addTable,
    updateTable,
    removeTable
  };
};
