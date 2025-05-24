
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private readonly maxRetries = 3;
  private readonly timeoutMs = 5000;

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    console.log(`Fetching user role for user:`, userId);
    
    // Strategy 1: Try database first with timeout
    try {
      const roleFromDb = await this.fetchRoleFromDatabaseWithTimeout(userId);
      if (roleFromDb) {
        console.log(`Role fetched from database: ${roleFromDb}`);
        return roleFromDb;
      }
    } catch (dbError) {
      console.log('Database role fetch failed:', dbError);
    }

    // Strategy 2: Get role from user metadata as fallback
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && user) {
        const isVendor = user.user_metadata?.isVendor === true || user.user_metadata?.role === 'vendor';
        const roleFromMetadata = isVendor ? 'vendor' : 'couple';
        
        console.log(`Role determined from user metadata: ${roleFromMetadata}`);
        
        // Start background sync to update database
        this.syncRoleToDatabase(userId, roleFromMetadata as 'couple' | 'vendor');
        
        return roleFromMetadata;
      }
    } catch (metadataError) {
      console.log('Error getting user metadata:', metadataError);
    }

    // Final fallback: default role
    console.log('Using fallback role: couple');
    return 'couple';
  }

  private async fetchRoleFromDatabaseWithTimeout(userId: string): Promise<string | null> {
    return new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => {
        console.log('Database query timeout');
        resolve(null);
      }, this.timeoutMs);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .limit(1)
          .single();
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.log('Database query error:', error);
          resolve(null);
          return;
        }
        
        resolve(data?.role || null);
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.log('Database fetch error:', error.message);
        resolve(null);
      }
    });
  }

  private async syncRoleToDatabase(userId: string, role: 'couple' | 'vendor') {
    // Non-blocking operation to sync role to database
    setTimeout(async () => {
      try {
        console.log(`Syncing role ${role} to database for user ${userId}`);
        
        const { error } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: userId, 
            role: role 
          });
        
        if (error) {
          console.log('Role sync failed (non-critical):', error);
        } else {
          console.log('Role synced to database successfully');
        }
      } catch (error) {
        console.log('Role sync error (non-critical):', error);
      }
    }, 100);
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
      
      // Return a fallback user object to prevent app crashes
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name,
        partnerName: user.user_metadata?.partnerName,
        weddingDate: user.user_metadata?.weddingDate 
          ? new Date(user.user_metadata.weddingDate) 
          : undefined,
        role: 'couple',
        businessName: user.user_metadata?.businessName,
      };
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
