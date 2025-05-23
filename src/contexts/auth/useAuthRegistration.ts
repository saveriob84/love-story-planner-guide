
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";
import { CreateUserRoleParams, CreateVendorProfileParams } from "./authTypes";

export const useAuthRegistration = (
  authState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  
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
    console.log("Starting registration for:", { 
      email: credentials.email, 
      isVendor: credentials.isVendor,
      businessName: credentials.businessName 
    });
    
    try {
      // Create user metadata based on user type
      const userMetadata = credentials.isVendor ? {
        name: credentials.name,
        businessName: credentials.businessName,
        isVendor: true,
        role: 'vendor'
      } : {
        name: credentials.name,
        partnerName: credentials.partnerName,
        weddingDate: credentials.weddingDate?.toISOString(),
        role: 'couple'
      };
      
      console.log("User metadata:", userMetadata);
      
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: userMetadata,
        },
      });
      
      if (error) {
        console.error("Supabase auth error:", error);
        throw error;
      }
      
      console.log("User created:", data.user?.id);
      
      if (data.user) {
        try {
          // Set the user role using explicit parameter names to avoid ambiguity
          const roleName = credentials.isVendor ? 'vendor' : 'couple';
          console.log(`Setting user role: ${roleName} for user ID: ${data.user.id}`);
          
          // Insert user role directly to avoid function parameter conflicts
          const { error: roleError } = await supabase
            .from('user_roles')
            .insert({
              user_id: data.user.id,
              role: roleName
            });
            
          if (roleError) {
            console.error("Error setting user role:", roleError);
            throw new Error("Errore nell'impostazione del ruolo utente: " + roleError.message);
          }
          
          console.log("User role set successfully");
          
          // If registering as vendor, add vendor profile
          if (credentials.isVendor && credentials.businessName) {
            console.log("Creating vendor profile for:", credentials.businessName);
            const { error: vendorError } = await supabase
              .from('vendors')
              .insert({
                user_id: data.user.id,
                business_name: credentials.businessName,
                email: credentials.email,
                phone: credentials.phone || null,
                website: credentials.website || null,
                description: credentials.description || null
              });
            
            if (vendorError) {
              console.error("Error creating vendor profile:", vendorError);
              throw new Error("Errore nella creazione del profilo fornitore: " + vendorError.message);
            }
            
            console.log("Vendor profile created successfully");
          }
          
          toast({
            title: "Registrazione completata",
            description: credentials.isVendor ? 
              "Il tuo account fornitore è stato creato con successo!" :
              "Il tuo account è stato creato con successo!",
          });
          
          console.log("Registration completed successfully");
          
        } catch (setupError: any) {
          console.error("Error during user setup:", setupError);
          
          // If there's an error in setup, clean up by signing out the user
          console.log("Attempting to clean up user due to setup error");
          await supabase.auth.signOut();
          
          throw new Error(setupError.message || "Errore durante la configurazione dell'account");
        }
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

  return { register };
};
