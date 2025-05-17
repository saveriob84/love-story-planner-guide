
import { useState } from "react";
import { Guest } from "@/types/guest";
import { TableGuest, Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";

export const useTableArrangement = (guests: Guest[]) => {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([ 
    { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
    { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
    { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
  ]);

  // Assign guest to table (works for both main guests and group members)
  const assignGuestToTable = (guestId: string, tableId: string) => {
    console.log("Assigning guest", guestId, "to table", tableId);
    
    // First check if it's a main guest or a group member
    let targetGuest: TableGuest | undefined;
    
    // Find among main guests
    const mainGuest = guests.find(g => g.id === guestId);
    if (mainGuest) {
      targetGuest = {
        id: mainGuest.id,
        name: mainGuest.name,
        dietaryRestrictions: mainGuest.dietaryRestrictions
      };
    } else {
      // If not a main guest, look among group members
      for (const guest of guests) {
        const groupMember = guest.groupMembers.find(m => m.id === guestId);
        if (groupMember) {
          targetGuest = {
            id: groupMember.id,
            name: groupMember.name,
            dietaryRestrictions: groupMember.dietaryRestrictions,
            isGroupMember: true,
            parentGuestId: guest.id
          };
          console.log("Found group member", groupMember.name);
          break;
        }
      }
    }
    
    if (!targetGuest) {
      console.log("Guest not found:", guestId);
      return;
    }
    
    console.log("Target guest", targetGuest);
    
    // Remove guest from any existing table
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g.id !== guestId)
    }));
    
    // Add guest to new table if tableId is provided and not "unassigned"
    if (tableId && tableId !== "unassigned") {
      const targetTable = updatedTables.find(t => t.id === tableId);
      if (targetTable && targetTable.guests.length < targetTable.capacity) {
        targetTable.guests = [...targetTable.guests, targetGuest];
        toast({
          title: "Ospite assegnato",
          description: `${targetGuest.name} è stato assegnato a ${targetTable.name}`,
        });
      }
    } else {
      toast({
        title: "Ospite rimosso",
        description: `${targetGuest.name} è stato rimosso dal tavolo`,
      });
    }
    
    setTables(updatedTables);
  };

  // Add new table
  const addTable = () => {
    const newId = `table${tables.length + 1}`;
    const newTable = {
      id: newId,
      name: `Tavolo ${tables.length + 1}`,
      capacity: 8,
      guests: []
    };
    setTables([...tables, newTable]);
    toast({
      title: "Tavolo aggiunto",
      description: `${newTable.name} è stato aggiunto con successo`,
    });
  };

  // Add custom table with name and capacity
  const addCustomTable = (name: string, capacity: number) => {
    const newId = `table${tables.length + 1}`;
    const newTable = {
      id: newId,
      name,
      capacity,
      guests: []
    };
    setTables([...tables, newTable]);
    toast({
      title: "Tavolo personalizzato aggiunto",
      description: `${name} è stato aggiunto con successo`,
    });
  };

  // Edit existing table
  const editTable = (tableId: string, name: string, capacity: number) => {
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        // If new capacity is less than current guests, don't allow the change
        if (capacity < table.guests.length) {
          toast({
            title: "Errore",
            description: `Non puoi ridurre la capacità a ${capacity} perché ci sono già ${table.guests.length} ospiti assegnati.`,
            variant: "destructive",
          });
          return table;
        }
        
        return {
          ...table,
          name,
          capacity
        };
      }
      return table;
    });
    
    setTables(updatedTables);
    toast({
      title: "Tavolo modificato",
      description: `Il tavolo è stato aggiornato con successo`,
    });
  };

  // Delete table
  const deleteTable = (tableId: string) => {
    const tableToDelete = tables.find(t => t.id === tableId);
    if (!tableToDelete) return;
    
    const hasGuests = tableToDelete.guests.length > 0;
    
    const updatedTables = tables.filter(table => table.id !== tableId);
    setTables(updatedTables);
    
    toast({
      title: "Tavolo eliminato",
      description: hasGuests 
        ? `${tableToDelete.name} è stato eliminato e ${tableToDelete.guests.length} ospiti sono stati rimossi dal tavolo` 
        : `${tableToDelete.name} è stato eliminato con successo`,
    });
  };

  // Calculate table statistics
  const tableStats = {
    totalTables: tables.length,
    assignedGuests: tables.reduce((sum, table) => sum + table.guests.length, 0),
    availableSeats: tables.reduce((sum, table) => sum + table.capacity, 0),
  };

  return {
    tables,
    assignGuestToTable,
    addTable,
    addCustomTable,
    editTable,
    deleteTable,
    tableStats
  };
};
