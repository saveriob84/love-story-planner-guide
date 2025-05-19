
import { useState, useEffect } from "react";
import { Table } from "@/types/table";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { migrationService } from "../services/migrationService";
import { tableService } from "../services/tableService";
import { tableOperations } from "../services/tableOperations";

/**
 * Core table functionality: loading tables and handling default table creation
 */
export const useTableCore = () => {
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

  return {
    tables,
    setTables,
    isLoading,
    toast
  };
};
