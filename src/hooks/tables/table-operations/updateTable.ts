
import { Table } from "@/types/table";
import { TableOperationsProps } from "./types";

export const useUpdateTable = ({ tables, setTables }: TableOperationsProps) => {
  // Update table
  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(table => 
      table.id === id ? { ...table, ...updates } : table
    ));
  };

  return { updateTable };
};
