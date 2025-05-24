
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private readonly maxRetries = 2;
  private readonly timeoutMs = 5000; // 5 secondi timeout

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    console.log(`Fetching user role for user:`, userId);
    
    // Prima strategia: ottieni il ruolo dai metadati utente (più veloce)
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.log("Unable to get user metadata, will try database fallback");
      } else {
        // Controlla se l'utente è un fornitore dai metadati
        const isVendor = user.user_metadata?.isVendor === true || user.user_metadata?.role === 'vendor';
        const roleFromMetadata = isVendor ? 'vendor' : 'couple';
        
        console.log(`Role determined from user metadata: ${roleFromMetadata}`);
        
        // Prova a sincronizzare con il database in background (non bloccante)
        this.syncRoleToDatabase(userId, roleFromMetadata as 'couple' | 'vendor');
        
        return roleFromMetadata;
      }
    } catch (metadataError) {
      console.log('Error getting user metadata:', metadataError);
    }

    // Seconda strategia: prova a ottenere il ruolo dal database con timeout
    const roleFromDb = await this.fetchRoleFromDatabase(userId);
    if (roleFromDb) {
      console.log(`Role fetched from database: ${roleFromDb}`);
      return roleFromDb;
    }

    // Fallback finale: ruolo predefinito
    console.log('Using fallback role: couple');
    return 'couple';
  }

  private async fetchRoleFromDatabase(userId: string): Promise<string | null> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Database role fetch attempt ${attempt}/${this.maxRetries}`);
        
        // Crea una promise con timeout per la query
        const queryPromise = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .limit(1)
          .single();

        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Query timeout')), this.timeoutMs);
        });

        const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;
        
        if (error) {
          console.log(`Database query failed (attempt ${attempt}):`, error);
          continue;
        }
        
        if (data?.role) {
          return data.role;
        }
        
        console.log(`No role found in database (attempt ${attempt})`);
        return null;
        
      } catch (error: any) {
        console.log(`Database role fetch error (attempt ${attempt}):`, error.message);
        
        if (attempt === this.maxRetries) {
          console.log('All database attempts failed');
          return null;
        }
        
        // Attendi un po' prima del prossimo tentativo
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    return null;
  }

  private async syncRoleToDatabase(userId: string, role: 'couple' | 'vendor') {
    // Operazione non bloccante per sincronizzare il ruolo nel database
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
