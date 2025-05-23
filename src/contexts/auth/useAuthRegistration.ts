
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";

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
        role: 'vendor',
        phone: credentials.phone,
        website: credentials.website,
        description: credentials.description
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
        // User is confirmed immediately - role and profile are created by the database trigger
        console.log("User confirmed immediately, role and profile created by database trigger");
        
        toast({
          title: "Registrazione completata",
          description: credentials.isVendor ? 
            "Il tuo account fornitore è stato creato con successo!" :
            "Il tuo account è stato creato con successo!",
        });
      } else if (data.user && !data.session) {
        // Email confirmation required - role and profile will be created when user confirms
        console.log("Email confirmation required - role will be created when user confirms email");
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

  return { register };
};
