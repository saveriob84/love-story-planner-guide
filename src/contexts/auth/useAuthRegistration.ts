
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
      
      if (data.user && data.session) {
        // User is confirmed and has a session - create role and profile immediately
        console.log("User confirmed immediately, creating role and profile");
        await createUserRoleAndProfile(data.user.id, credentials);
        
        toast({
          title: "Registrazione completata",
          description: credentials.isVendor ? 
            "Il tuo account fornitore è stato creato con successo!" :
            "Il tuo account è stato creato con successo!",
        });
      } else if (data.user && !data.session) {
        // Email confirmation required
        console.log("Email confirmation required - no session created yet");
        toast({
          title: "Registrazione completata",
          description: "Controlla la tua email e clicca sul link di conferma per completare la registrazione.",
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

  const createUserRoleAndProfile = async (userId: string, credentials: any) => {
    try {
      const roleName = credentials.isVendor ? 'vendor' : 'couple';
      console.log(`Creating user role: ${roleName} for user ID: ${userId}`);
      
      // Create the role
      const { error: roleError } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: roleName
        });
        
      if (roleError) {
        console.error("Error creating user role:", roleError);
        throw new Error("Errore nella creazione del ruolo utente");
      }
      
      console.log("User role created successfully:", roleName);
      
      // If registering as vendor, create vendor profile
      if (credentials.isVendor && credentials.businessName) {
        console.log("Creating vendor profile for:", credentials.businessName);
        const { error: vendorError } = await supabase
          .from('vendors')
          .insert({
            user_id: userId,
            business_name: credentials.businessName,
            email: credentials.email,
            phone: credentials.phone || null,
            website: credentials.website || null,
            description: credentials.description || null
          });
        
        if (vendorError) {
          console.error("Error creating vendor profile:", vendorError);
          throw new Error("Errore nella creazione del profilo fornitore");
        }
        
        console.log("Vendor profile created successfully");
      }
      
    } catch (error: any) {
      console.error("Error during user setup:", error);
      throw error;
    }
  };

  return { register };
};
