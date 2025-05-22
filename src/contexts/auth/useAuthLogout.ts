
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";

export const useAuthLogout = (
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  
  // Logout function using Supabase auth
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive",
      });
      return;
    }
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
    
    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo.",
    });
  };

  return { logout };
};
