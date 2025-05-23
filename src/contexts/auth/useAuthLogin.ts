
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
        
        // Check if user has any role assigned
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
          
        console.log("User role query result:", { userRoleData, userRoleError });
          
        if (userRoleError || !userRoleData) {
          console.error("Error fetching user role or no role found:", userRoleError);
          
          // If no role exists, create one based on login type
          const defaultRole = credentials.isVendor ? 'vendor' : 'couple';
          console.log(`No role found, creating default role: ${defaultRole}`);
          
          const { error: createRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: defaultRole
            });
          
          if (createRoleError) {
            console.error("Error creating default role:", createRoleError);
            await supabase.auth.signOut();
            throw new Error("Account non configurato correttamente. Contatta il supporto.");
          }
          
          console.log("Default role created successfully");
          
          // If creating vendor role, check if vendor profile exists
          if (credentials.isVendor) {
            const { data: vendorData } = await supabase
              .from('vendors')
              .select('id')
              .eq('user_id', data.user.id)
              .single();
            
            if (!vendorData) {
              console.log("Vendor role created but no vendor profile found - user should complete vendor registration");
            }
          }
        } else {
          const userRole = userRoleData.role;
          console.log("User role found:", userRole);
          
          // Check if user is trying to login with the correct form
          if (credentials.isVendor && userRole === 'couple') {
            await supabase.auth.signOut();
            throw new Error("Questo account è registrato come coppia. Usa il login normale.");
          }
          
          if (!credentials.isVendor && userRole === 'vendor') {
            await supabase.auth.signOut();
            throw new Error("Questo account è registrato come fornitore. Usa il login fornitori.");
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
