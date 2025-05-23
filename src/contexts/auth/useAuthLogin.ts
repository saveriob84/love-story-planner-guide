
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
        
        // Check if user is the correct role type
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
          
        if (userRoleError) {
          console.error("Error fetching user role:", userRoleError);
          
          // If role doesn't exist and trying to login as vendor, that's an error
          if (credentials.isVendor) {
            await supabase.auth.signOut();
            throw new Error("Questo account non è registrato come fornitore. Usa il login normale.");
          }
          
          // If no role found for normal login, assume it's a couple (for backward compatibility)
          console.log("No role found, assuming couple for backward compatibility");
        } else {
          const userRole = userRoleData?.role;
          console.log("User role found:", userRole);
          
          // If trying to login as vendor but user is couple or vice versa
          if (
            (credentials.isVendor && userRole === 'couple') || 
            (!credentials.isVendor && userRole === 'vendor')
          ) {
            // Sign out the user since they're using the wrong login form
            await supabase.auth.signOut();
            
            const errorMessage = credentials.isVendor ? 
              "Questo account non è registrato come fornitore. Usa il login normale." : 
              "Questo account è registrato come fornitore. Usa il login fornitori.";
            
            console.log("Role mismatch:", errorMessage);
            throw new Error(errorMessage);
          }
        }
        
        toast({
          title: "Login effettuato",
          description: credentials.isVendor ? 
            "Benvenuto nel tuo portale fornitori!" : 
            "Benvenuto nel tuo wedding planner personale!",
        });
        
        console.log("Login successful");
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

  return { login };
};
