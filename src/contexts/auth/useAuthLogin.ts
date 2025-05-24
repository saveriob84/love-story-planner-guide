
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";

export const useAuthLogin = (
  authState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  
  // Login function using Supabase auth
  const login = async (credentials: { email: string; password: string; isVendor?: boolean }) => {
    console.log("Login attempt:", { 
      email: credentials.email, 
      isVendor: credentials.isVendor 
    });
    
    // Set loading state immediately
    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error("Login error:", error);
        throw error;
      }
      
      if (data.user) {
        console.log("User logged in:", data.user.id);
        
        // Check user role from database with timeout
        const rolePromise = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();
          
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout durante il controllo del ruolo utente')), 10000)
        );
        
        const { data: userRoleData, error: userRoleError } = await Promise.race([
          rolePromise,
          timeoutPromise
        ]) as any;
          
        console.log("User role query result:", { userRoleData, userRoleError });
        
        if (userRoleError) {
          console.error("Error fetching user role:", userRoleError);
          await supabase.auth.signOut();
          throw new Error("Errore nel recupero del ruolo utente");
        }
        
        const userRole = userRoleData?.role;
        
        if (!userRole) {
          console.log("No role found for user, this should not happen with the new trigger");
          await supabase.auth.signOut();
          throw new Error("Nessun ruolo trovato per questo utente. Contatta il supporto.");
        }
        
        // Validate role matches login type
        if (credentials.isVendor && userRole === 'couple') {
          await supabase.auth.signOut();
          throw new Error("Questo account è registrato come coppia. Usa il login normale.");
        }
        
        if (!credentials.isVendor && userRole === 'vendor') {
          await supabase.auth.signOut();
          throw new Error("Questo account è registrato come fornitore. Usa il login fornitori.");
        }
        
        toast({
          title: "Login effettuato",
          description: credentials.isVendor ? 
            "Benvenuto nel tuo portale fornitori!" : 
            "Benvenuto nel tuo wedding planner personale!",
        });
        
        console.log("Login successful with role:", userRole);
        
        // Reset loading state on success - the auth state change will handle the rest
        setAuthState(prev => ({
          ...prev,
          loading: false,
          error: null
        }));
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Always reset loading state on error
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        isAuthenticated: false,
        user: null
      }));
      
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  return { login };
};
