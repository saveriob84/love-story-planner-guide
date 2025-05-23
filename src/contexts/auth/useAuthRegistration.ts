
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
    try {
      // Create user metadata based on user type
      const userMetadata = credentials.isVendor ? {
        name: credentials.name,
        businessName: credentials.businessName,
        isVendor: true,
        role: 'vendor' // Add role directly to metadata
      } : {
        name: credentials.name,
        partnerName: credentials.partnerName,
        weddingDate: credentials.weddingDate?.toISOString(),
        role: 'couple' // Add role directly to metadata
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
        try {
          // Use a direct SQL RPC call to bypass RLS
          const { error: roleError } = await supabase.rpc(
            'create_user_role', 
            { 
              user_id: data.user.id, 
              role_name: credentials.isVendor ? 'vendor' : 'couple' 
            } as CreateUserRoleParams
          );
            
          if (roleError) {
            console.error("Error setting user role:", roleError);
            throw new Error("Errore nell'impostazione del ruolo utente");
          }
          
          // If registering as vendor, add vendor profile
          if (credentials.isVendor && credentials.businessName) {
            try {
              // Create vendor profile with the RLS policy in mind
              const { error: vendorError } = await supabase.rpc(
                'create_vendor_profile', 
                {
                  user_id: data.user.id,
                  business_name: credentials.businessName,
                  email_address: credentials.email,
                  phone_number: credentials.phone || null,
                  website_url: credentials.website || null,
                  vendor_description: credentials.description || null
                } as CreateVendorProfileParams
              );
              
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
        } catch (error: any) {
          // If there was an error setting up the user, clean up by deleting the auth account
          if (data.user?.id) {
            await supabase.auth.admin.deleteUser(data.user.id)
              .catch(e => console.error("Error cleaning up user after failed setup:", e));
          }
          throw error;
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
