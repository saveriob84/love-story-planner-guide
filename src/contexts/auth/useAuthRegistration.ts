
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
        // Always create the role immediately, even if email confirmation is pending
        try {
          const roleName = credentials.isVendor ? 'vendor' : 'couple';
          console.log(`Creating user role: ${roleName} for user ID: ${data.user.id}`);
          
          // Check if role already exists
          const { data: existingRole } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', data.user.id)
            .single();
          
          if (existingRole) {
            console.log("User role already exists:", existingRole.role);
          } else {
            // Create the role using direct insert
            const { error: roleError } = await supabase
              .from('user_roles')
              .insert({
                user_id: data.user.id,
                role: roleName
              });
              
            if (roleError) {
              console.error("Error creating user role:", roleError);
              // Don't throw here - the user is created, we'll handle role creation on login if needed
            } else {
              console.log("User role created successfully:", roleName);
            }
          }
          
          // If registering as vendor, create vendor profile
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
              // Don't throw here - we'll handle vendor profile creation later if needed
            } else {
              console.log("Vendor profile created successfully");
            }
          }
          
        } catch (setupError: any) {
          console.error("Error during user setup (non-blocking):", setupError);
          // Don't block registration for setup errors
        }
        
        // Check if email confirmation is required
        if (!data.session) {
          console.log("Email confirmation required - no session created yet");
          toast({
            title: "Registrazione completata",
            description: "Controlla la tua email e clicca sul link di conferma per completare la registrazione.",
          });
          return;
        }
        
        toast({
          title: "Registrazione completata",
          description: credentials.isVendor ? 
            "Il tuo account fornitore è stato creato con successo!" :
            "Il tuo account è stato creato con successo!",
        });
        
        console.log("Registration completed successfully");
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
