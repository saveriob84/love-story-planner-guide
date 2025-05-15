
import { useToast } from "@/hooks/use-toast";
import { TableOperationsProps } from "./types";

export const useRemoveTable = ({ tables, setTables }: TableOperationsProps) => {
  const { toast } = useToast();

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

  return { removeTable };
};
