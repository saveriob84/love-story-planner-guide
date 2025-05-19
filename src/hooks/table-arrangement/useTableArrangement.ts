
import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { Table } from "@/types/table";
import { useAuth } from "@/contexts/auth/AuthContext";
import { sposiTableService } from "./services/sposiTableService";
import { tableService } from "./services/tableService";
import { UseTableArrangementReturn } from "./types";
import { tableOperations } from "./services/tableOperations";
import { guestAssignmentService } from "./services/guestAssignmentService";
import { migrationService } from "./services/migrationService";
import { useToast } from "@/hooks/use-toast";

export const useTableArrangement = (guests: Guest[]): UseTableArrangementReturn => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

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
    
    try {
      const tablesData = await tableService.createDefaultTables(user.id);
      
      if (tablesData) {
        const formattedTables = (tablesData || []).map((table: any) => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          guests: [],
          isSpecial: table.is_special || false
        }));
        
        setTables(formattedTables);
        
        // If we know user names, assign to the "Sposi" table
        if (user.name && tablesData[0]?.id) {
          await tableOperations.addCoupleToSposiTable(user, tablesData[0].id);
        }
        
        toast({
          title: "Tavoli creati",
          description: "I tavoli predefiniti sono stati creati con successo",
        });
      }
    } catch (error) {
      console.error('Error creating default tables:', error);
      toast({
        title: 'Errore',
        description: 'Impossibile creare i tavoli predefiniti.',
        variant: 'destructive',
      });
    }
  };

  // Assign guest to table
  const assignGuestToTable = async (guestId: string, tableId: string) => {
    if (!user?.id) return;
    try {
      await guestAssignmentService.assignGuestToTable(guestId, tableId, tables, guests, setTables);
      toast({
        title: "Ospite assegnato",
        description: "L'ospite è stato assegnato al tavolo con successo",
      });
    } catch (error) {
      console.error("Error assigning guest to table:", error);
      toast({
        title: "Errore",
        description: "Impossibile assegnare l'ospite al tavolo",
        variant: "destructive",
      });
    }
  };

  // Add new table
  const addTable = async () => {
    if (!user?.id) return;
    try {
      const newName = `Tavolo ${tables.length}`;
      const data = await tableOperations.addTable(user.id, tables.length);
      
      if (data) {
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
      }
    } catch (error) {
      console.error("Error adding table:", error);
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
      const data = await tableOperations.addCustomTable(user.id, name, capacity);
      
      if (data) {
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
      }
    } catch (error) {
      console.error("Error adding custom table:", error);
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
      await tableOperations.editTable(user.id, tableId, name, capacity);
      
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
      console.error("Error editing table:", error);
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
      
      // Delete from Supabase
      await tableOperations.deleteTable(user.id, tableId);
      
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
      console.error("Error deleting table:", error);
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
