
import { Guest } from "@/types/guest";
import { UseTableArrangementReturn } from "./types";
import { 
  useTableCore, 
  useTableAssignment, 
  useTableManagement, 
  useTableStats 
} from "./hooks";

export const useTableArrangement = (guests: Guest[]): UseTableArrangementReturn => {
  // Core table functionality
  const { tables, setTables, isLoading, toast } = useTableCore();
  
  // Guest assignment functionality
  const { assignGuestToTable } = useTableAssignment(tables, setTables, guests, toast);
  
  // Table management functionality
  const { addTable, addCustomTable, editTable, deleteTable } = useTableManagement(tables, setTables, toast);
  
  // Calculate table statistics
  const tableStats = useTableStats(tables);

  return {
    tables,
    assignGuestToTable,
    addTable,
    addCustomTable,
    editTable,
    deleteTable,
    tableStats,
    isLoading
  };
};
