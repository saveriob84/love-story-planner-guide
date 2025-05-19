
import { Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";
import { tableDataService } from "./tableDataService";
import { User } from "@/types/auth";
import { tableService } from "./tableService";

// Service for table management operations
export const tableOperations = {
  // Create default tables if none exist
  createDefaultTables: async (userId: string | undefined, updateTables: (tables: Table[]) => void) => {
    const { toast } = useToast();
    if (!userId) return;
    
    try {
      const data = await tableService.createDefaultTables(userId);
      
      // If we know user names, create and assign them to the "Sposi" table
      if (data && data[0]?.id) {
        const sposiTableId = data[0].id;
        // Note: We've removed the addCoupleToSposiTable call here as it requires user object
      }
      
      // Format and set the tables
      const formattedTables = (data || []).map((table: any) => ({
        id: table.id,
        name: table.name,
        capacity: table.capacity,
        guests: [],
        isSpecial: table.is_special || false
      }));
      
      updateTables(formattedTables);
    } catch (error) {
      console.error('Error creating default tables:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare i tavoli predefiniti.',
        variant: 'destructive',
      });
    }
  },
  
  // Add new table
  addTable: async (userId: string | undefined, tables: Table[], updateTables: (tables: Table[]) => void) => {
    const { toast } = useToast();
    if (!userId) return;
    
    try {
      const newName = `Tavolo ${tables.length}`;
      
      const data = await tableDataService.addTable(userId, newName, 8);
      
      const newTable: Table = {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        guests: [],
        isSpecial: data.is_special
      };
      
      updateTables([...tables, newTable]);
      
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
  },

  // Add custom table with name and capacity
  addCustomTable: async (
    userId: string | undefined, 
    tables: Table[], 
    name: string, 
    capacity: number,
    updateTables: (tables: Table[]) => void
  ) => {
    const { toast } = useToast();
    if (!userId) return;
    
    try {
      const data = await tableDataService.addTable(userId, name, capacity);
      
      const newTable: Table = {
        id: data.id,
        name: data.name,
        capacity: data.capacity,
        guests: [],
        isSpecial: data.is_special
      };
      
      updateTables([...tables, newTable]);
      
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
  },

  // Edit existing table
  editTable: async (
    userId: string | undefined,
    tables: Table[],
    tableId: string, 
    name: string, 
    capacity: number,
    updateTables: (tables: Table[]) => void
  ) => {
    const { toast } = useToast();
    if (!userId) return;
    
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
      await tableDataService.editTable(userId, tableId, name, capacity);
      
      // Update local state
      const updatedTables = tables.map(table => 
        table.id === tableId ? { ...table, name, capacity } : table
      );
      
      updateTables(updatedTables);
      
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
  },

  // Delete table
  deleteTable: async (
    userId: string | undefined, 
    tables: Table[], 
    tableId: string,
    updateTables: (tables: Table[]) => void
  ) => {
    const { toast } = useToast();
    if (!userId) return;
    
    try {
      const tableToDelete = tables.find(t => t.id === tableId);
      if (!tableToDelete) return;
      
      const hasGuests = tableToDelete.guests.length > 0;
      
      // Delete from Supabase (assignments will cascade delete)
      await tableDataService.deleteTable(userId, tableId);
      
      // Update local state
      const updatedTables = tables.filter(table => table.id !== tableId);
      updateTables(updatedTables);
      
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
  },
  
  // Setup for adding couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    if (user.name && sposiTableId) {
      await tableService.addCoupleToSposiTable(user, sposiTableId);
    }
  }
};
