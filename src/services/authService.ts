
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Fetching user role (attempt ${attempt}/${this.maxRetries}) for user:`, userId);
        
        // Use RPC call to the database function which bypasses RLS issues
        const { data: roleData, error: roleError } = await supabase.rpc('get_user_role_safe', {
          p_user_id: userId
        });
        
        if (roleError) {
          console.error(`Role fetch error on attempt ${attempt}:`, roleError);
          throw roleError;
        }
        
        if (roleData) {
          console.log(`User role found on attempt ${attempt}:`, roleData);
          this.retryCount = 0; // Reset on success
          return roleData;
        }
        
        // If no role found, try to create one based on user metadata
        console.log(`No role found for user ${userId}, attempting to fetch user metadata`);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error("Impossibile recuperare i metadati utente");
        }
        
        const isVendor = user.user_metadata?.isVendor === true || user.user_metadata?.role === 'vendor';
        const defaultRole = isVendor ? 'vendor' : 'couple';
        
        console.log(`Creating role for user ${userId} with role: ${defaultRole}`);
        
        // Use the existing create_user_role function
        const { error: createError } = await supabase.rpc('create_user_role', {
          user_id: userId,
          role_name: defaultRole
        });
        
        if (createError) {
          console.error(`Error creating role on attempt ${attempt}:`, createError);
          throw createError;
        }
        
        console.log(`Role created successfully for user ${userId}: ${defaultRole}`);
        this.retryCount = 0; // Reset on success
        return defaultRole;
        
      } catch (error: any) {
        console.error(`Role fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          throw new Error(`Errore nel recupero del ruolo utente dopo ${this.maxRetries} tentativi: ${error.message}`);
        }
        
        // Exponential backoff with jitter
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000) + Math.random() * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw new Error("Errore nel recupero del ruolo utente");
  }

  async createUserWithRole(user: any): Promise<User | null> {
    try {
      console.log("Creating user with role for user:", user.id);
      const userRole = await this.fetchUserRoleWithRetry(user.id);
      
      const userData: User = {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name,
        partnerName: user.user_metadata?.partnerName,
        weddingDate: user.user_metadata?.weddingDate 
          ? new Date(user.user_metadata.weddingDate) 
          : undefined,
        role: userRole as 'couple' | 'vendor',
        businessName: user.user_metadata?.businessName,
      };
      
      console.log("User data created successfully:", {
        id: userData.id,
        email: userData.email,
        role: userData.role
      });
      
      return userData;
    } catch (error: any) {
      console.error("Error creating user with role:", error);
      return null;
    }
  }

  notifyAuthChange(user: User | null, session: any) {
    console.log("Auth change notification:", {
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      hasSession: !!session
    });
  }

  cleanup() {
    console.log("AuthService cleanup called");
  }

  isMaster(): boolean {
    return true;
  }

  getTabId(): string {
    return `tab_${Date.now()}`;
  }
}

export const authService = new AuthService();
