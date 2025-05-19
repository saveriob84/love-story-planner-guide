
import { useAuth } from "@/contexts/auth/AuthContext";
import { Table } from "@/types/table";
import { tableOperations } from "../services/tableOperations";

/**
 * Hook for table management operations (add, edit, delete)
 */
export const useTableManagement = (
  tables: Table[],
  setTables: React.Dispatch<React.SetStateAction<Table[]>>,
  toast: any
) => {
  const { user } = useAuth();

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

  return {
    addTable,
    addCustomTable,
    editTable,
    deleteTable
  };
};
