
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";
import { User } from "@/types/auth";

export const useAuthUserUpdate = (
  authState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  
  // Update user data using Supabase auth
  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) return;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          partnerName: userData.partnerName,
          weddingDate: userData.weddingDate?.toISOString(),
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const updatedUser = {
          ...authState.user,
          ...userData,
        };
        
        setAuthState({
          ...authState,
          user: updatedUser,
        });
        
        toast({
          title: "Profilo aggiornato",
          description: "Le tue informazioni sono state aggiornate con successo.",
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del profilo.",
        variant: "destructive",
      });
    }
  };

  return { updateUser };
};
