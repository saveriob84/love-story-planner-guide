
import { useState, useEffect } from "react";
import { Table, TableGuest } from "@/types/table";
import { Guest } from "@/types/guest";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useTables = () => {
  const { user } = useAuth();
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load tables from localStorage
  useEffect(() => {
    const loadTables = () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          // Initialize with default bride and groom table
          const defaultTable = {
            id: "table-sposi",
            name: "Tavolo Sposi",
            capacity: 2,
            guests: []
          };
          
          const savedTables = localStorage.getItem(`wedding_tables_${user.id}`);
          if (savedTables) {
            const parsedTables = JSON.parse(savedTables);
            setTables(Array.isArray(parsedTables) ? parsedTables : [defaultTable]);
          } else {
            // Set default tables if none exist
            setTables([defaultTable]);
          }
        }
      } catch (error) {
        console.error("Error loading tables:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare i tavoli.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTables();
  }, [user?.id, toast]);

  // Save tables to localStorage whenever the list changes
  useEffect(() => {
    try {
      if (user?.id && tables.length > 0) {
        localStorage.setItem(`wedding_tables_${user.id}`, JSON.stringify(tables));
      }
    } catch (error) {
      console.error("Error saving tables:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare i tavoli.",
        variant: "destructive",
      });
    }
  }, [tables, user?.id, toast]);

  // Add new table
  const addTable = (name: string, capacity: number) => {
    const newTable: Table = {
      id: `table-${Date.now()}`,
      name,
      capacity,
      guests: []
    };
    
    setTables([...tables, newTable]);
    return true;
  };

  // Update table
  const updateTable = (id: string, updates: Partial<Table>) => {
    setTables(tables.map(table => 
      table.id === id ? { ...table, ...updates } : table
    ));
  };

  // Remove table
  const removeTable = (id: string) => {
    // Don't allow removing the bride and groom table
    if (id === "table-sposi") {
      toast({
        title: "Operazione non consentita",
        description: "Non è possibile rimuovere il tavolo degli sposi.",
        variant: "destructive",
      });
      return;
    }
    
    setTables(tables.filter(table => table.id !== id));
    toast({
      title: "Tavolo rimosso",
      description: "Il tavolo è stato rimosso con successo.",
    });
  };

  // Add guest to table
  const addGuestToTable = (tableId: string, guest: Guest) => {
    // First, remove the guest from any other table they might be in
    const updatedTables = tables.map(table => {
      return {
        ...table,
        guests: table.guests.filter(g => g.guestId !== guest.id)
      };
    });
    
    // Then add them to the selected table
    const finalTables = updatedTables.map(table => {
      if (table.id === tableId) {
        // Check if the table is already at capacity
        if (table.guests.length >= table.capacity) {
          toast({
            title: "Tavolo pieno",
            description: `Il tavolo ${table.name} ha già raggiunto la capacità massima.`,
            variant: "destructive",
          });
          return table;
        }
        
        return {
          ...table,
          guests: [
            ...table.guests,
            {
              id: `table-guest-${Date.now()}`,
              guestId: guest.id,
              name: guest.name,
              isChild: false
            }
          ]
        };
      }
      return table;
    });
    
    setTables(finalTables);
  };

  // Add group member to table
  const addGroupMemberToTable = (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => {
    // First, remove the member from any other table they might be in
    const updatedTables = tables.map(table => {
      return {
        ...table,
        guests: table.guests.filter(g => g.id !== member.id)
      };
    });
    
    // Then add them to the selected table
    const finalTables = updatedTables.map(table => {
      if (table.id === tableId) {
        // Check if the table is already at capacity
        if (table.guests.length >= table.capacity) {
          toast({
            title: "Tavolo pieno",
            description: `Il tavolo ${table.name} ha già raggiunto la capacità massima.`,
            variant: "destructive",
          });
          return table;
        }
        
        return {
          ...table,
          guests: [
            ...table.guests,
            {
              id: `table-guest-${member.id}`,
              guestId: guestId, // Parent guest ID
              name: member.name,
              isChild: member.isChild
            }
          ]
        };
      }
      return table;
    });
    
    setTables(finalTables);
  };

  // Remove guest from table
  const removeGuestFromTable = (tableId: string, guestInstanceId: string) => {
    setTables(tables.map(table => {
      if (table.id === tableId) {
        return {
          ...table,
          guests: table.guests.filter(g => g.id !== guestInstanceId)
        };
      }
      return table;
    }));
  };

  // Calculate stats
  const totalTables = tables.length;
  const totalSeats = tables.reduce((total, table) => total + table.capacity, 0);
  const occupiedSeats = tables.reduce((total, table) => total + table.guests.length, 0);
  const availableSeats = totalSeats - occupiedSeats;
  
  // Get assigned guests IDs (to filter out already assigned guests)
  const assignedGuestIds = new Set();
  tables.forEach(table => {
    table.guests.forEach(guest => {
      assignedGuestIds.add(guest.guestId);
    });
  });

  return {
    tables,
    isLoading,
    addTable,
    updateTable,
    removeTable,
    addGuestToTable,
    addGroupMemberToTable,
    removeGuestFromTable,
    stats: {
      totalTables,
      totalSeats,
      occupiedSeats,
      availableSeats
    },
    assignedGuestIds
  };
};
