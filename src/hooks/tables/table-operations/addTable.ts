
import { Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";
import { TableOperationsProps } from "./types";

export const useAddTable = ({ tables, setTables }: TableOperationsProps) => {
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

  return { addTable };
};
