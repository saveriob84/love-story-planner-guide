
import { Table } from "@/types/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Service for localStorage operations and migration
export const localStorageService = {
  // Load tables from localStorage
  loadFromLocalStorage: (userId: string | undefined): Table[] => {
    try {
      if (!userId) return [];
      
      const savedTables = localStorage.getItem(`wedding_tables_${userId}`);
      if (savedTables) {
        return JSON.parse(savedTables);
      }
      
      // Default tables if nothing in localStorage
      return [
        { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
        { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
        { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
      ];
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      
      // Set default tables if everything else fails
      return [
        { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
        { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
        { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
      ];
    }
  },
  
  // Migrate tables from localStorage to Supabase
  migrateLocalStorageToSupabase: async (userId: string, localTables: Table[]) => {
    if (!userId || localTables.length === 0) return;
    const { toast } = useToast();
    
    try {
      toast({
        title: "Migrazione dati",
        description: "Sto migrando i tavoli al nuovo database...",
      });
      
      // First insert all tables
      for (const table of localTables) {
        const { data: insertedTable, error } = await supabase
          .from('tables')
          .insert({
            name: table.name,
            capacity: table.capacity,
            profile_id: userId,
            is_special: table.isSpecial || false
          })
          .select()
          .single();
        
        if (error) {
          console.error('Error migrating table:', error);
          continue;
        }
        
        // If the table has guests, insert assignments
        if (table.guests && table.guests.length > 0) {
          for (const guest of table.guests) {
            // Determine if it's a main guest or group member
            if (guest.isGroupMember) {
              await supabase
                .from('table_assignments')
                .insert({
                  table_id: insertedTable.id,
                  group_member_id: guest.id
                });
            } else {
              await supabase
                .from('table_assignments')
                .insert({
                  table_id: insertedTable.id,
                  guest_id: guest.id
                });
            }
          }
        }
      }
      
      toast({
        title: "Migrazione completata",
        description: "I tuoi tavoli sono stati migrati con successo!",
      });
      
      // Clear localStorage after successful migration
      localStorage.removeItem(`wedding_tables_${userId}`);
      
      // Return the migrated tables
      const { data } = await supabase
        .from('tables')
        .select('*')
        .eq('profile_id', userId);
      
      return data;
    } catch (error) {
      console.error('Error during table migration:', error);
      toast({
        title: "Errore di migrazione",
        description: "Si è verificato un errore durante la migrazione dei tavoli.",
        variant: "destructive",
      });
      return null;
    }
  }
};
