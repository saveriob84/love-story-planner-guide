
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";
import { sessionService } from "./sessionService";

class AuthService {
  private readonly maxRetries = 1;
  private readonly timeoutMs = 5000; // Ridotto a 5 secondi

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    console.log(`Fetching user role for user:`, userId);
    
    // Prima controlla la cache
    const cachedRole = sessionService.getCachedUserRole(userId);
    if (cachedRole) {
      console.log(`Role from cache: ${cachedRole}`);
      return cachedRole;
    }
    
    // Strategia 1: Prova il database con timeout ridotto
    try {
      const roleFromDb = await this.fetchRoleFromDatabaseWithTimeout(userId);
      if (roleFromDb) {
        console.log(`Role fetched from database: ${roleFromDb}`);
        sessionService.cacheUserRole(userId, roleFromDb);
        return roleFromDb;
      }
    } catch (dbError) {
      console.log('Database role fetch failed, using fallback:', dbError);
    }

    // Strategia 2: Usa i metadata dell'utente
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (!userError && user) {
        const isVendor = user.user_metadata?.isVendor === true || user.user_metadata?.role === 'vendor';
        const roleFromMetadata = isVendor ? 'vendor' : 'couple';
        
        console.log(`Role determined from user metadata: ${roleFromMetadata}`);
        
        // Cache il ruolo e sincronizza in background
        sessionService.cacheUserRole(userId, roleFromMetadata);
        this.syncRoleToDatabase(userId, roleFromMetadata as 'couple' | 'vendor');
        
        return roleFromMetadata;
      }
    } catch (metadataError) {
      console.log('Error getting user metadata:', metadataError);
    }

    // Fallback finale
    console.log('Using fallback role: couple');
    const fallbackRole = 'couple';
    sessionService.cacheUserRole(userId, fallbackRole);
    return fallbackRole;
  }

  private async fetchRoleFromDatabaseWithTimeout(userId: string): Promise<string | null> {
    return new Promise(async (resolve) => {
      const timeoutId = setTimeout(() => {
        console.log('Database query timeout after', this.timeoutMs, 'ms');
        resolve(null);
      }, this.timeoutMs);

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId as any)
          .limit(1)
          .single();
        
        clearTimeout(timeoutId);
        
        if (error) {
          console.log('Database query error:', error);
          resolve(null);
          return;
        }
        
        resolve((data as any)?.role || null);
        
      } catch (error: any) {
        clearTimeout(timeoutId);
        console.log('Database fetch error:', error.message);
        resolve(null);
      }
    });
  }

  private async syncRoleToDatabase(userId: string, role: 'couple' | 'vendor') {
    // Operazione non bloccante per sincronizzare il ruolo nel database
    setTimeout(async () => {
      try {
        console.log(`Background sync: updating role ${role} for user ${userId}`);
        
        const { error } = await supabase
          .from('user_roles')
          .upsert({ 
            user_id: userId, 
            role: role 
          } as any);
        
        if (!error) {
          console.log('Background role sync completed successfully');
        }
      } catch (error) {
        console.log('Background role sync error (non-critical):', error);
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
      
      // Fallback user object con ruolo dalla cache o default
      const cachedRole = sessionService.getCachedUserRole(user.id) || 'couple';
      
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name,
        partnerName: user.user_metadata?.partnerName,
        weddingDate: user.user_metadata?.weddingDate 
          ? new Date(user.user_metadata.weddingDate) 
          : undefined,
        role: cachedRole as 'couple' | 'vendor',
        businessName: user.user_metadata?.businessName,
      };
    }
  }

  notifyAuthChange(user: User | null, session: any) {
    console.log("Auth change notification:", {
      user: user ? { id: user.id, email: user.email, role: user.role } : null,
      hasSession: !!session
    });

    // Cache la sessione se presente
    if (session) {
      sessionService.cacheSession(session);
    }
  }

  cleanup() {
    console.log("AuthService cleanup called");
    sessionService.clearSessionData();
  }

  isMaster(): boolean {
    return true;
  }

  getTabId(): string {
    return `tab_${Date.now()}`;
  }
}

export const authService = new AuthService();
