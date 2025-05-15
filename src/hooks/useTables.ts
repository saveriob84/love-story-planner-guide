
import { useTablesState } from "./tables/useTablesState";
import { useTableOperations } from "./tables/useTableOperations";
import { useGuestOperations } from "./tables/useGuestOperations";
import { useTableStats } from "./tables/useTableStats";

export const useTables = () => {
  const { tables, setTables, isLoading } = useTablesState();
  const { addTable, updateTable, removeTable } = useTableOperations({ tables, setTables });
  const { addGuestToTable, addGroupMemberToTable, removeGuestFromTable } = useGuestOperations({ tables, setTables });
  const { stats, assignedGuestIds, assignedGroupMemberIds } = useTableStats(tables);

  return {
    // Table state
    tables,
    isLoading,
    
    // Table operations
    addTable,
    updateTable,
    removeTable,
    
    // Guest operations
    addGuestToTable,
    addGroupMemberToTable,
    removeGuestFromTable,
    
    // Stats and utilities
    stats,
    assignedGuestIds,
    assignedGroupMemberIds
  };
};
