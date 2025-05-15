
import { useEffect } from "react";
import { Table } from "@/types/table";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export const useSaveTables = (tables: Table[]) => {
  const { user } = useAuth();
  const { toast } = useToast();

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
};
