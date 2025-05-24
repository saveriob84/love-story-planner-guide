import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Fetching user role (attempt ${attempt}/${this.maxRetries}) for user:`, userId);
        
        // Try direct query first with a shorter timeout
        console.log('Trying direct query to user_roles table...');
        
        const { data: directData, error: directError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (directData?.role) {
          console.log(`Role found via direct query: ${directData.role}`);
          this.retryCount = 0;
          return directData.role;
        }
        
        if (directError) {
          console.log('Direct query error:', directError);
        } else {
          console.log('Direct query returned no data');
        }
        
        // If no role found, create one based on user metadata
        console.log(`No role found for user ${userId}, attempting to create role`);
        
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError || !user) {
          throw new Error("Unable to get user metadata");
        }
        
        const isVendor = user.user_metadata?.isVendor === true || user.user_metadata?.role === 'vendor';
        const defaultRole = isVendor ? 'vendor' : 'couple';
        
        console.log(`Creating role for user ${userId} with role: ${defaultRole}`);
        
        // Try to create role using direct insert
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: defaultRole });
        
        if (insertError) {
          console.error(`Error creating role on attempt ${attempt}:`, insertError);
          throw insertError;
        }
        
        console.log(`Role created successfully for user ${userId}: ${defaultRole}`);
        this.retryCount = 0;
        return defaultRole;
        
      } catch (error: any) {
        console.error(`Role fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          // As a last resort, return a default role based on user metadata
          const { data: { user } } = await supabase.auth.getUser();
          const isVendor = user?.user_metadata?.isVendor === true || user?.user_metadata?.role === 'vendor';
          const fallbackRole = isVendor ? 'vendor' : 'couple';
          console.log(`Using fallback role: ${fallbackRole}`);
          return fallbackRole;
        }
        
        // Wait before retry
        const delay = Math.min(1000 * attempt, 3000);
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // Final fallback
    return 'couple';
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
