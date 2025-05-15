
import { useLoadTables } from "./tables-state/loadTables";
import { useSaveTables } from "./tables-state/saveTables";
import { TablesStateReturn } from "./tables-state/types";

export const useTablesState = (): TablesStateReturn => {
  const { tables, setTables, isLoading } = useLoadTables();
  
  // Save tables to localStorage whenever they change
  useSaveTables(tables);

  return {
    tables,
    setTables,
    isLoading
  };
};
