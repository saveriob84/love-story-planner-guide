
import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthContext";
import { tableDataService } from "./services/tableDataService";
import { assignmentService } from "./services/assignmentService";
import { localStorageService } from "./services/localStorageService";
import { tableService } from "./services/tableService";
import { formatTablesWithGuests } from "./utils/tableFormatter";
import { UseTableArrangementReturn } from "./types";

export const useTableArrangement = (guests: Guest[]): UseTableArrangementReturn => {
  const { toast } = useToast();
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
        // First, check if Sposi table exists and create it if not
        await tableDataService.createSposiTableIfNotExists(user.id);
        
        // Fetch tables
        const tablesData = await tableDataService.fetchTables(user.id);

        if (!tablesData || tablesData.length === 0) {
          // If no tables exist, create default ones
          await createDefaultTables();
          return;
        }

        // Fetch all assignments
        const assignmentsData = await tableDataService.fetchAssignments();

        // Format tables with their guests
        const formattedTables = formatTablesWithGuests(tablesData, assignmentsData);
        setTables(formattedTables);
      } catch (error) {
        console.error('Error loading tables:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare i tavoli.',
          variant: 'destructive',
        });
        
        // If we couldn't load from Supabase, try localStorage as fallback
        const localTables = localStorageService.loadFromLocalStorage(user.id);
        setTables(localTables);
        
        // If we have tables, migrate them to Supabase
        if (localTables && localTables.length > 0) {
          migrateLocalStorageToSupabase(localTables);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTables();
  }, [user?.id, toast]);

  // Create default tables if none exist
  const createDefaultTables = async () => {
    if (!user?.id) return;
    
    try {
      const data = await tableService.createDefaultTables(user.id);
      
      // If we know user names, create and assign them to the "Sposi" table
      if (data && user.name && data[0].id) {
        const sposiTableId = data[0].id;
        await tableService.addCoupleToSposiTable(user, sposiTableId);
      }
      
      // Format and set the tables
      const formattedTables = (data || []).map((table: any) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        guests: [],
        isSpecial: table.is_special || false
      }));
      
      setTables(formattedTables);
    } catch (error) {
      console.error('Error creating default tables:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare i tavoli predefiniti.',
        variant: 'destructive',
      });
      
      // Fallback to localStorage
      const localTables = localStorageService.loadFromLocalStorage(user?.id);
      setTables(localTables);
    }
  };

  // Migrate tables from localStorage to Supabase
  const migrateLocalStorageToSupabase = async (localTables: Table[]) => {
    if (!user?.id) return;
    
    try {
      const migratedData = await localStorageService.migrateLocalStorageToSupabase(user.id, localTables);
      
      if (migratedData) {
        const updatedTables = migratedData.map((table: any) => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          guests: [],
          isSpecial: table.is_special || false
        }));
        
        setTables(updatedTables);
      }
    } catch (error) {
      console.error('Error during table migration:', error);
    }
  };

  // Assign guest to table
  const assignGuestToTable = async (guestId: string, tableId: string) => {
    if (!user?.id) return;
    
    try {
      console.log("Assigning guest", guestId, "to table", tableId);
      
      // First, remove any existing assignment for this guest
      const isGroupMember = assignmentService.checkIfGroupMember(guests, guestId);
      await assignmentService.removeExistingAssignment(guestId, isGroupMember);
      
      // If tableId is "unassigned", we're done
      if (tableId === "unassigned") {
        // Update local state
        const updatedTables = tables.map(table => ({
          ...table,
          guests: table.guests.filter(g => g.id !== guestId)
        }));
        setTables(updatedTables);
        
        toast({
          title: "Ospite rimosso",
          description: "L'ospite è stato rimosso dal tavolo",
        });
        return;
      }
      
      // Find the target table
      const targetTable = tables.find(t => t.id === tableId);
      if (!targetTable) {
        console.log("Table not found:", tableId);
        return;
      }
      
      // Check if table is full
      if (targetTable.guests.length >= targetTable.capacity) {
        toast({
          title: "Tavolo pieno",
          description: `${targetTable.name} ha raggiunto la sua capacità massima`,
          variant: "destructive",
        });
        return;
      }
      
      // Insert the assignment in Supabase
      await assignmentService.createAssignment(tableId, guestId, isGroupMember);
      
      // Find guest details
      const guestInfo = assignmentService.findGuestInfo(guests, guestId, isGroupMember);
      
      if (!guestInfo) {
        console.log("Guest not found:", guestId);
        return;
      }
      
      // Update local state
      const updatedTables = tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            guests: [...table.guests.filter(g => g.id !== guestId), guestInfo]
          };
        }
        return {
          ...table,
          guests: table.guests.filter(g => g.id !== guestId)
        };
      });
      
      setTables(updatedTables);
      
      toast({
        title: "Ospite assegnato",
        description: `${guestInfo.name} è stato assegnato a ${targetTable.name}`,
      });
    } catch (error) {
      console.error("Error in assignGuestToTable:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'assegnazione dell'ospite",
        variant: "destructive",
      });
    }
  };

  // Add new table
  const addTable = async () => {
    if (!user?.id) return;
    
    try {
      const newName = `Tavolo ${tables.length}`;
      
      const data = await tableDataService.addTable(user.id, newName, 8);
      
      const newTable: Table = {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        guests: [],
        isSpecial: data.is_special
      };
      
      setTables([...tables, newTable]);
      
      toast({
        title: "Tavolo aggiunto",
        description: `${newName} è stato aggiunto con successo`,
      });
    } catch (error) {
      console.error("Error in addTable:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il tavolo",
        variant: "destructive",
      });
    }
  };

  // Add custom table with name and capacity
  const addCustomTable = async (name: string, capacity: number) => {
    if (!user?.id) return;
    
    try {
      const data = await tableDataService.addTable(user.id, name, capacity);
      
      const newTable: Table = {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        guests: [],
        isSpecial: data.is_special
      };
      
      setTables([...tables, newTable]);
      
      toast({
        title: "Tavolo personalizzato aggiunto",
        description: `${name} è stato aggiunto con successo`,
      });
    } catch (error) {
      console.error("Error in addCustomTable:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere il tavolo personalizzato",
        variant: "destructive",
      });
    }
  };

  // Edit existing table
  const editTable = async (tableId: string, name: string, capacity: number) => {
    if (!user?.id) return;
    
    try {
      // Find the table to check current guest count
      const table = tables.find(t => t.id === tableId);
      if (!table) return;
      
      // If new capacity is less than current guests, don't allow the change
      if (capacity < table.guests.length) {
        toast({
          title: "Errore",
          description: `Non puoi ridurre la capacità a ${capacity} perché ci sono già ${table.guests.length} ospiti assegnati.`,
          variant: "destructive",
        });
        return;
      }
      
      // Update in Supabase
      await tableDataService.editTable(user.id, tableId, name, capacity);
      
      // Update local state
      const updatedTables = tables.map(table => 
        table.id === tableId ? { ...table, name, capacity } : table
      );
      
      setTables(updatedTables);
      
      toast({
        title: "Tavolo modificato",
        description: `Il tavolo è stato aggiornato con successo`,
      });
    } catch (error) {
      console.error("Error in editTable:", error);
      toast({
        title: "Errore",
        description: "Impossibile modificare il tavolo",
        variant: "destructive",
      });
    }
  };

  // Delete table
  const deleteTable = async (tableId: string) => {
    if (!user?.id) return;
    
    try {
      const tableToDelete = tables.find(t => t.id === tableId);
      if (!tableToDelete) return;
      
      const hasGuests = tableToDelete.guests.length > 0;
      
      // Delete from Supabase (assignments will cascade delete)
      await tableDataService.deleteTable(user.id, tableId);
      
      // Update local state
      const updatedTables = tables.filter(table => table.id !== tableId);
      setTables(updatedTables);
      
      toast({
        title: "Tavolo eliminato",
        description: hasGuests 
          ? `${tableToDelete.name} è stato eliminato e ${tableToDelete.guests.length} ospiti sono stati rimossi dal tavolo` 
          : `${tableToDelete.name} è stato eliminato con successo`,
      });
    } catch (error) {
      console.error("Error in deleteTable:", error);
      toast({
        title: "Errore",
        description: "Impossibile eliminare il tavolo",
        variant: "destructive",
      });
    }
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
