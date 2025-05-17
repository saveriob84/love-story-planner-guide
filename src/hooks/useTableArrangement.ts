import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { TableGuest, Table } from "@/types/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth/AuthContext";

export const useTableArrangement = (guests: Guest[]) => {
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
        // Fetch tables
        const { data: tablesData, error: tablesError } = await supabase
          .from('tables')
          .select('*')
          .eq('profile_id', user.id);

        if (tablesError) {
          console.error('Error fetching tables:', tablesError);
          throw tablesError;
        }

        if (!tablesData || tablesData.length === 0) {
          // If no tables exist, create default ones
          await createDefaultTables();
          return;
        }

        // Fetch all assignments
        const { data: assignmentsData, error: assignmentsError } = await supabase
          .from('table_assignments')
          .select(`
            id,
            table_id,
            guest_id,
            group_member_id,
            guests:guest_id(id, name, dietary_restrictions),
            group_members:group_member_id(id, name, dietary_restrictions, is_child, guest_id)
          `);

        if (assignmentsError) {
          console.error('Error fetching table assignments:', assignmentsError);
          throw assignmentsError;
        }

        // Format tables with their guests
        const formattedTables = tablesData.map((table: any) => {
          // Find all assignments for this table
          const tableAssignments = assignmentsData?.filter((assignment: any) => 
            assignment.table_id === table.id
          ) || [];
          
          // Map assignments to TableGuest objects
          const tableGuests: TableGuest[] = tableAssignments.map((assignment: any) => {
            // If it's a main guest
            if (assignment.guest_id && assignment.guests) {
              return {
                id: assignment.guests.id,
                name: assignment.guests.name,
                dietaryRestrictions: assignment.guests.dietary_restrictions
              };
            }
            // If it's a group member
            else if (assignment.group_member_id && assignment.group_members) {
              return {
                id: assignment.group_members.id,
                name: assignment.group_members.name,
                dietaryRestrictions: assignment.group_members.dietary_restrictions,
                isGroupMember: true,
                parentGuestId: assignment.group_members.guest_id
              };
            }
            // Fallback (shouldn't happen with proper constraints)
            return {
              id: assignment.id,
              name: 'Unknown Guest',
            };
          });

          // Return the formatted table
          return {
            id: table.id,
            name: table.name,
            capacity: table.capacity,
            guests: tableGuests,
            isSpecial: table.is_special || false
          };
        });

        setTables(formattedTables);
      } catch (error) {
        console.error('Error loading tables:', error);
        toast({
          title: 'Errore',
          description: 'Impossibile caricare i tavoli.',
          variant: 'destructive',
        });
        
        // If we couldn't load from Supabase, try localStorage as fallback
        loadFromLocalStorage();
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
      // Create the Sposi table first
      const sposiTable = {
        name: 'Tavolo Sposi',
        capacity: 2,
        profile_id: user.id,
        is_special: true
      };

      // Default tables to create
      const defaultTables = [
        sposiTable,
        { name: 'Tavolo 1', capacity: 8, profile_id: user.id },
        { name: 'Tavolo 2', capacity: 8, profile_id: user.id },
        { name: 'Tavolo 3', capacity: 8, profile_id: user.id }
      ];
      
      // Insert the tables
      const { data, error } = await supabase
        .from('tables')
        .insert(defaultTables)
        .select();
      
      if (error) {
        console.error('Error creating default tables:', error);
        throw error;
      }

      // If we know user names, create and assign them to the "Sposi" table
      if (data && user.name && data[0].id) {
        const sposiTableId = data[0].id;
        
        // Create a guest entry for both partners if they don't exist yet
        const coupleNames = [];
        
        if (user.name) {
          coupleNames.push(user.name);
          
          // Insert the first partner as a guest
          const { data: guestData, error: guestError } = await supabase
            .from('guests')
            .insert({
              name: user.name,
              profile_id: user.id,
              relationship: 'Sposa/Sposo',
              rsvp: 'confirmed'
            })
            .select('id')
            .single();
            
          if (!guestError && guestData) {
            // Assign the first partner to the Sposi table
            await supabase
              .from('table_assignments')
              .insert({
                table_id: sposiTableId,
                guest_id: guestData.id
              });
          }
        }
        
        if (user.partnerName) {
          coupleNames.push(user.partnerName);
          
          // Insert the second partner as a guest
          const { data: partnerData, error: partnerError } = await supabase
            .from('guests')
            .insert({
              name: user.partnerName,
              profile_id: user.id,
              relationship: 'Sposa/Sposo',
              rsvp: 'confirmed'
            })
            .select('id')
            .single();
            
          if (!partnerError && partnerData) {
            // Assign the second partner to the Sposi table
            await supabase
              .from('table_assignments')
              .insert({
                table_id: sposiTableId,
                guest_id: partnerData.id
              });
          }
        }
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
      loadFromLocalStorage();
    }
  };

  // Fallback: Load from localStorage if Supabase fails
  const loadFromLocalStorage = () => {
    try {
      // If we still have localStorage data, use it
      if (user?.id) {
        const savedTables = localStorage.getItem(`wedding_tables_${user.id}`);
        if (savedTables) {
          const parsedTables = JSON.parse(savedTables);
          setTables(Array.isArray(parsedTables) ? parsedTables : []);
          
          // If we have tables, migrate them to Supabase
          if (parsedTables && parsedTables.length > 0) {
            migrateLocalStorageToSupabase(parsedTables);
          }
        } else {
          // Default tables if nothing in localStorage
          setTables([
            { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
            { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
            { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
          ]);
        }
      }
    } catch (error) {
      console.error('Error loading from localStorage:', error);
      // Set default tables if everything else fails
      setTables([
        { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
        { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
        { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
      ]);
    }
  };

  // Migrate tables from localStorage to Supabase
  const migrateLocalStorageToSupabase = async (localTables: Table[]) => {
    if (!user?.id || localTables.length === 0) return;
    
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
            profile_id: user.id,
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
      localStorage.removeItem(`wedding_tables_${user.id}`);
      
      // Reload tables from Supabase
      const { data: updatedTables, error } = await supabase
        .from('tables')
        .select('*')
        .eq('profile_id', user.id);
      
      if (!error && updatedTables) {
        setTables(updatedTables.map((table: any) => ({
          id: table.id,
          name: table.name,
          capacity: table.capacity,
          guests: [],
          isSpecial: table.is_special || false
        })));
      }
    } catch (error) {
      console.error('Error during table migration:', error);
      toast({
        title: "Errore di migrazione",
        description: "Si è verificato un errore durante la migrazione dei tavoli.",
        variant: "destructive",
      });
    }
  };

  // Assign guest to table
  const assignGuestToTable = async (guestId: string, tableId: string) => {
    if (!user?.id) return;
    
    try {
      console.log("Assigning guest", guestId, "to table", tableId);
      
      // First, remove any existing assignment for this guest
      await removeExistingAssignment(guestId);
      
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
      
      // Determine if it's a main guest or a group member
      const isGroupMember = checkIfGroupMember(guestId);
      
      // Insert the assignment in Supabase
      const { error } = await supabase
        .from('table_assignments')
        .insert({
          table_id: tableId,
          guest_id: isGroupMember ? null : guestId,
          group_member_id: isGroupMember ? guestId : null
        });
      
      if (error) {
        console.error("Error assigning guest to table:", error);
        toast({
          title: "Errore",
          description: "Impossibile assegnare l'ospite al tavolo",
          variant: "destructive",
        });
        return;
      }
      
      // Find guest details
      let guestInfo: TableGuest | undefined;
      
      if (isGroupMember) {
        // Look for the group member
        for (const guest of guests) {
          const member = guest.groupMembers.find(m => m.id === guestId);
          if (member) {
            guestInfo = {
              id: member.id,
              name: member.name,
              dietaryRestrictions: member.dietaryRestrictions,
              isGroupMember: true,
              parentGuestId: guest.id
            };
            break;
          }
        }
      } else {
        // Look for main guest
        const mainGuest = guests.find(g => g.id === guestId);
        if (mainGuest) {
          guestInfo = {
            id: mainGuest.id,
            name: mainGuest.name,
            dietaryRestrictions: mainGuest.dietaryRestrictions
          };
        }
      }
      
      if (!guestInfo) {
        console.log("Guest not found:", guestId);
        return;
      }
      
      // Update local state
      const updatedTables = tables.map(table => {
        if (table.id === tableId) {
          return {
            ...table,
            guests: [...table.guests.filter(g => g.id !== guestId), guestInfo!]
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

  // Helper to remove existing assignment
  const removeExistingAssignment = async (guestId: string) => {
    try {
      const isGroupMember = checkIfGroupMember(guestId);
      
      if (isGroupMember) {
        await supabase
          .from('table_assignments')
          .delete()
          .eq('group_member_id', guestId);
      } else {
        await supabase
          .from('table_assignments')
          .delete()
          .eq('guest_id', guestId);
      }
    } catch (error) {
      console.error("Error removing existing assignment:", error);
      throw error;
    }
  };

  // Check if a guest ID belongs to a group member
  const checkIfGroupMember = (guestId: string): boolean => {
    for (const guest of guests) {
      if (guest.groupMembers.some(m => m.id === guestId)) {
        return true;
      }
    }
    return false;
  };

  // Add new table
  const addTable = async () => {
    if (!user?.id) return;
    
    try {
      const newName = `Tavolo ${tables.length}`;
      
      const { data, error } = await supabase
        .from('tables')
        .insert({
          name: newName,
          capacity: 8,
          profile_id: user.id,
          is_special: false
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding table:", error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere il tavolo",
          variant: "destructive",
        });
        return;
      }
      
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
      const { data, error } = await supabase
        .from('tables')
        .insert({
          name,
          capacity,
          profile_id: user.id,
          is_special: false
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error adding custom table:", error);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere il tavolo personalizzato",
          variant: "destructive",
        });
        return;
      }
      
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
      const { error } = await supabase
        .from('tables')
        .update({ name, capacity })
        .eq('id', tableId)
        .eq('profile_id', user.id);
      
      if (error) {
        console.error("Error updating table:", error);
        toast({
          title: "Errore",
          description: "Impossibile modificare il tavolo",
          variant: "destructive",
        });
        return;
      }
      
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
      const { error } = await supabase
        .from('tables')
        .delete()
        .eq('id', tableId)
        .eq('profile_id', user.id);
      
      if (error) {
        console.error("Error deleting table:", error);
        toast({
          title: "Errore",
          description: "Impossibile eliminare il tavolo",
          variant: "destructive",
        });
        return;
      }
      
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
    tableStats,
    isLoading
  };
};
