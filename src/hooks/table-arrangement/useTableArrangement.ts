
import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { Table } from "@/types/table";
import { useAuth } from "@/contexts/auth/AuthContext";
import { sposiTableService } from "./services/tableDataService";
import { tableService } from "./services/tableService";
import { UseTableArrangementReturn } from "./types";
import { tableOperations } from "./services/tableOperations";
import { guestAssignmentService } from "./services/guestAssignmentService";
import { migrationService } from "./services/migrationService";

export const useTableArrangement = (guests: Guest[]): UseTableArrangementReturn => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load tables and assignments from Supabase
  useEffect(() => {
    const fetchTables = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      
      try {
        // Attempt to load tables from Supabase
        const success = await migrationService.loadTableData(
          user.id,
          setTables,
          () => createDefaultTables()
        );
        
        // If Supabase loading failed, try localStorage fallback
        if (!success) {
          await migrationService.loadFromLocalStorageFallback(user.id, setTables);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, [user?.id]);

  // Create default tables if none exist
  const createDefaultTables = async () => {
    if (!user?.id) return;
    
    await tableOperations.createDefaultTables(user.id, setTables);
    
    // If tables were created and we know user names, assign to the "Sposi" table
    const tablesData = await tableService.createDefaultTables(user.id);
    if (tablesData && user.name && tablesData[0]?.id) {
      await tableOperations.addCoupleToSposiTable(user, tablesData[0].id);
    }
  };

  // Assign guest to table
  const assignGuestToTable = async (guestId: string, tableId: string) => {
    if (!user?.id) return;
    await guestAssignmentService.assignGuestToTable(guestId, tableId, tables, guests, setTables);
  };

  // Add new table
  const addTable = async () => {
    if (!user?.id) return;
    await tableOperations.addTable(user.id, tables, setTables);
  };

  // Add custom table with name and capacity
  const addCustomTable = async (name: string, capacity: number) => {
    if (!user?.id) return;
    await tableOperations.addCustomTable(user.id, tables, name, capacity, setTables);
  };

  // Edit existing table
  const editTable = async (tableId: string, name: string, capacity: number) => {
    if (!user?.id) return;
    await tableOperations.editTable(user.id, tables, tableId, name, capacity, setTables);
  };

  // Delete table
  const deleteTable = async (tableId: string) => {
    if (!user?.id) return;
    await tableOperations.deleteTable(user.id, tables, tableId, setTables);
  };

  // Calculate table statistics
  const tableStats = tableService.calculateTableStats(tables);

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
