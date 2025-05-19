
import { Table } from "@/types/table";
import { localStorageService } from "./localStorageService";
import { useToast } from "@/hooks/use-toast";
import { formatTablesWithGuests } from "../utils/tableFormatter";
import { tableDataService } from "./tableDataService";
import { sposiTableService } from "./sposiTableService";

// Service for handling data migration and initial loading
export const migrationService = {
  // Load tables from Supabase or create defaults if needed
  loadTableData: async (
    userId: string | undefined, 
    updateTables: (tables: Table[]) => void,
    createDefaultTables: () => Promise<void>
  ) => {
    const { toast } = useToast();
    if (!userId) return false;

    try {
      // First, check if Sposi table exists and create it if not
      await sposiTableService.createSposiTableIfNotExists(userId);
      
      // Fetch tables
      const tablesData = await tableDataService.fetchTables(userId);

      if (!tablesData || tablesData.length === 0) {
        // If no tables exist, create default ones
        await createDefaultTables();
        return true;
      }

      // Fetch all assignments
      const assignmentsData = await tableDataService.fetchAssignments();

      // Format tables with their guests
      const formattedTables = formatTablesWithGuests(tablesData, assignmentsData);
      updateTables(formattedTables);
      
      return true;
    } catch (error) {
      console.error('Error loading tables:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile caricare i tavoli.',
        variant: 'destructive',
      });
      
      return false;
    }
  },

  // Fall back to localStorage data and potentially migrate it to Supabase
  loadFromLocalStorageFallback: async (userId: string | undefined, updateTables: (tables: Table[]) => void) => {
    if (!userId) return;
    
    const { toast } = useToast();
    
    // Try localStorage as fallback
    const localTables = localStorageService.loadFromLocalStorage(userId);
    updateTables(localTables);
    
    // If we have tables, migrate them to Supabase
    if (localTables && localTables.length > 0) {
      migrationService.migrateLocalStorageToSupabase(userId, localTables, updateTables);
    }
  },

  // Migrate tables from localStorage to Supabase
  migrateLocalStorageToSupabase: async (
    userId: string, 
    localTables: Table[],
    updateTables: (tables: Table[]) => void
  ) => {
    if (!userId) return;
    
    try {
      const migratedData = await localStorageService.migrateLocalStorageToSupabase(userId, localTables);
      
      if (migratedData) {
        const updatedTables = migratedData.map((table: any) => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          guests: [],
          isSpecial: table.is_special || false
        }));
        
        updateTables(updatedTables);
      }
    } catch (error) {
      console.error('Error during table migration:', error);
    }
  }
};
