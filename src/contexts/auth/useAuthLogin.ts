
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
        
        // Check user role
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', data.user.id)
          .maybeSingle();
          
        console.log("User role query result:", { userRoleData, userRoleError });
        
        let userRole = userRoleData?.role;
        
        if (!userRoleData) {
          console.log("No role found, creating default role based on login type");
          
          // Create role based on login context
          const defaultRole = credentials.isVendor ? 'vendor' : 'couple';
          console.log(`Creating default role: ${defaultRole}`);
          
          const { error: createRoleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: defaultRole
            });
          
          if (createRoleError) {
            console.error("Error creating default role:", createRoleError);
            await supabase.auth.signOut();
            throw new Error("Errore nella configurazione dell'account. Contatta il supporto.");
          }
          
          userRole = defaultRole;
          console.log("Default role created successfully:", defaultRole);
          
          // If creating vendor role, check if vendor profile exists
          if (credentials.isVendor) {
            const { data: vendorData } = await supabase
              .from('vendors')
              .select('id')
              .eq('user_id', data.user.id)
              .maybeSingle();
            
            if (!vendorData) {
              console.log("Vendor role created but no vendor profile found, creating basic profile");
              const { error: vendorProfileError } = await supabase
                .from('vendors')
                .insert({
                  user_id: data.user.id,
                  business_name: data.user.user_metadata?.businessName || 'Nome Attività',
                  email: data.user.email || ''
                });
              
              if (vendorProfileError) {
                console.error("Error creating vendor profile:", vendorProfileError);
                // Don't throw here - profile can be created later
              }
            }
          }
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
