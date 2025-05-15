
import { useState, useEffect } from "react";
import { Table } from "@/types/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useTablesState = () => {
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

  return {
    tables,
    setTables,
    isLoading
  };
};
