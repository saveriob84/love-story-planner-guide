
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private retryCount: number = 0;
  private maxRetries: number = 3;

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Fetching user role (attempt ${attempt}/${this.maxRetries}) for user:`, userId);
        
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (userRoleError) {
          throw userRoleError;
        }
        
        const userRole = userRoleData?.role;
        console.log(`User role found on attempt ${attempt}:`, userRole);
        
        if (!userRole) {
          throw new Error("Nessun ruolo trovato per questo utente");
        }
        
        this.retryCount = 0; // Reset on success
        return userRole;
        
      } catch (error: any) {
        console.error(`Role fetch attempt ${attempt} failed:`, error);
        
        if (attempt === this.maxRetries) {
          throw new Error("Errore nel recupero del ruolo utente dopo tutti i tentativi");
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
    
    throw new Error("Errore nel recupero del ruolo utente");
  }

  async createUserWithRole(user: any): Promise<User | null> {
    try {
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
      
      return userData;
    } catch (error: any) {
      console.error("Error creating user with role:", error);
      return null;
    }
  }

  // Metodi semplificati per compatibilità
  notifyAuthChange(user: User | null, session: any) {
    // Metodo vuoto per compatibilità, non più necessario
  }

  cleanup() {
    // Metodo vuoto per compatibilità
  }

  isMaster(): boolean {
    return true; // Semplificato
  }

  getTabId(): string {
    return `tab_${Date.now()}`;
  }
}

export const authService = new AuthService();
