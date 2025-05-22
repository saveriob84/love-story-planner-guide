
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
  const login = async (credentials: { email: string; password: string; isVendor?: boolean }) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Check if user is the correct role type
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
          
        if (userRoleError) {
          console.error("Error fetching user role:", userRoleError);
        }
        
        const userRole = userRoleData?.role;
        
        // If trying to login as vendor but user is couple or vice versa
        if (
          (credentials.isVendor && userRole === 'couple') || 
          (!credentials.isVendor && userRole === 'vendor')
        ) {
          // Sign out the user since they're using the wrong login form
          await supabase.auth.signOut();
          
          throw new Error(
            credentials.isVendor ? 
              "Questo account non è registrato come fornitore. Usa il login normale." : 
              "Questo account è registrato come fornitore. Usa il login fornitori."
          );
        }
        
        toast({
          title: "Login effettuato",
          description: credentials.isVendor ? 
            "Benvenuto nel tuo portale fornitori!" : 
            "Benvenuto nel tuo wedding planner personale!",
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
    isVendor?: boolean;
    businessName?: string;
    phone?: string;
    website?: string;
    description?: string;
  }) => {
    try {
      // Create user metadata based on user type
      const userMetadata = credentials.isVendor ? {
        name: credentials.name,
        businessName: credentials.businessName,
        isVendor: true,
      } : {
        name: credentials.name,
        partnerName: credentials.partnerName,
        weddingDate: credentials.weddingDate?.toISOString(),
      };
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: userMetadata,
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        // First, update the user_roles table to set role as 'vendor' or 'couple'
        const role = credentials.isVendor ? 'vendor' : 'couple';
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: data.user.id,
            role: role
          });
          
        if (roleError) {
          console.error("Error setting user role:", roleError);
          throw new Error("Errore nell'impostazione del ruolo utente");
        }
        
        // If registering as vendor, add vendor profile
        if (credentials.isVendor && credentials.businessName) {
          try {
            // Create vendor profile with the RLS policy in mind
            const { error: vendorError } = await supabase
              .from('vendors')
              .insert({
                user_id: data.user.id,
                business_name: credentials.businessName,
                email: credentials.email,
                phone: credentials.phone || null,
                website: credentials.website || null,
                description: credentials.description || null,
              });
            
            if (vendorError) {
              console.error("Error creating vendor profile:", vendorError);
              throw new Error("Errore nella creazione del profilo fornitore");
            }
          } catch (err) {
            console.error("Vendor profile creation caught error:", err);
            throw err;
          }
        }
        
        toast({
          title: "Registrazione completata",
          description: credentials.isVendor ? 
            "Il tuo account fornitore è stato creato con successo!" :
            "Il tuo account è stato creato con successo!",
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

  return {
    login,
    register,
    logout,
    updateUser
  };
};
