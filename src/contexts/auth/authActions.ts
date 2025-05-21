
import { AuthState } from "./types";
import { User } from "@/types/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthActions = (
  authState: AuthState, 
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  
  // Login function using Supabase auth
  const login = async (credentials: { email: string; password: string }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Login effettuato",
          description: "Benvenuto nel tuo wedding planner personale!",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthState({
        ...authState,
        error: error.message,
      });
      
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  // Register function using Supabase auth
  const register = async (credentials: { 
    email: string; 
    password: string; 
    name?: string; 
    partnerName?: string; 
    weddingDate?: Date;
    role?: 'couple' | 'vendor';
    businessName?: string;
  }) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            partnerName: credentials.partnerName,
            weddingDate: credentials.weddingDate?.toISOString(),
            role: credentials.role || 'couple',
            businessName: credentials.businessName,
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user && credentials.role === 'vendor' && credentials.businessName) {
        // Create vendor profile if registering as vendor
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: data.user.id,
            business_name: credentials.businessName,
            email: credentials.email,
          });
          
        if (vendorError) {
          console.error("Error creating vendor profile:", vendorError);
          throw vendorError;
        }
        
        // Set vendor role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: 'vendor'
          });
          
        if (roleError) {
          console.error("Error setting vendor role:", roleError);
          throw roleError;
        }
      }
      
      if (data.user) {
        toast({
          title: "Registrazione completata",
          description: "Il tuo account è stato creato con successo!",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthState({
        ...authState,
        error: error.message,
      });
      
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
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

  // Get current user role
  const getCurrentRole = async (): Promise<'couple' | 'vendor' | undefined> => {
    if (!authState.user) return undefined;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', authState.user.id)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        return 'couple'; // Default to couple if error
      }

      return data.role as 'couple' | 'vendor';
    } catch (error) {
      console.error("Error in getCurrentRole:", error);
      return 'couple'; // Default to couple if error
    }
  };

  // Check if current user is a vendor
  const isVendor = async (): Promise<boolean> => {
    const role = await getCurrentRole();
    return role === 'vendor';
  };

  // Check if current user is a couple
  const isCouple = async (): Promise<boolean> => {
    const role = await getCurrentRole();
    return role === 'couple';
  };

  return {
    login,
    register,
    logout,
    updateUser,
    getCurrentRole,
    isVendor,
    isCouple
  };
};
