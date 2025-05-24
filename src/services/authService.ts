
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private retryCount: number = 0;
  private maxRetries: number = 2;

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    console.log(`Fetching user role for user:`, userId);
    
    try {
      // Get user metadata directly from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log("Unable to get user metadata, using default role");
        return 'couple';
      }
      
      // Check if user is vendor from metadata
      const isVendor = user.user_metadata?.isVendor === true || user.user_metadata?.role === 'vendor';
      const roleFromMetadata = isVendor ? 'vendor' : 'couple';
      
      console.log(`Role determined from user metadata: ${roleFromMetadata}`);
      
      // Try to query user_roles table only as a secondary check
      try {
        console.log('Trying quick check of user_roles table...');
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .limit(1)
          .single();
        
        if (roleData?.role) {
          console.log(`Role confirmed from database: ${roleData.role}`);
          return roleData.role;
        }
      } catch (dbError) {
        console.log('Database role check failed, using metadata role:', dbError);
      }
      
      // Use role from metadata as primary source
      console.log(`Using role from user metadata: ${roleFromMetadata}`);
      
      // Try to insert role in database for future use (non-blocking)
      setTimeout(() => {
        this.insertUserRoleAsync(userId, roleFromMetadata);
      }, 100);
      
      return roleFromMetadata;
      
    } catch (error: any) {
      console.error("Error in fetchUserRoleWithRetry:", error);
      
      // Final fallback - return couple role
      return 'couple';
    }
  }

  private async insertUserRoleAsync(userId: string, role: string) {
    try {
      console.log(`Attempting to insert role ${role} for user ${userId} in background`);
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role: role });
      
      if (error) {
        console.log('Background role insert failed (non-critical):', error);
      } else {
        console.log('Background role insert successful');
      }
    } catch (error) {
      console.log('Background role insert error (non-critical):', error);
    }
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
