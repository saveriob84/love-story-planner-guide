
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

class AuthService {
  private tabId: string;
  private isMasterTab: boolean = false;
  private masterTabChannel: BroadcastChannel | null = null;
  private authChannel: BroadcastChannel | null = null;
  private sessionLock: boolean = false;
  private retryCount: number = 0;
  private maxRetries: number = 3;

  constructor() {
    this.tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.initializeTabCoordination();
  }

  private initializeTabCoordination() {
    if (typeof window === 'undefined') return;

    // Set up master tab coordination
    this.masterTabChannel = new BroadcastChannel('auth_master_tab');
    this.authChannel = new BroadcastChannel('auth_state');

    // Check if there's already a master tab
    this.masterTabChannel.postMessage({ type: 'PING', tabId: this.tabId });

    let responseReceived = false;
    const masterTimeout = setTimeout(() => {
      if (!responseReceived) {
        this.becomeMasterTab();
      }
    }, 100);

    this.masterTabChannel.onmessage = (event) => {
      const { type, tabId } = event.data;
      
      if (type === 'PING' && tabId !== this.tabId) {
        responseReceived = true;
        clearTimeout(masterTimeout);
        this.masterTabChannel?.postMessage({ type: 'PONG', tabId: this.tabId });
      }
      
      if (type === 'MASTER_CHANGED' && tabId !== this.tabId) {
        this.isMasterTab = false;
      }
    };

    // Listen for auth state changes from other tabs
    this.authChannel.onmessage = (event) => {
      const { type, user, session } = event.data;
      if (type === 'AUTH_STATE_CHANGED') {
        this.handleExternalAuthChange(user, session);
      }
    };

    // Handle tab close
    window.addEventListener('beforeunload', () => {
      if (this.isMasterTab) {
        this.masterTabChannel?.postMessage({ type: 'MASTER_LEAVING', tabId: this.tabId });
      }
    });
  }

  private becomeMasterTab() {
    this.isMasterTab = true;
    console.log(`Tab ${this.tabId} became master tab`);
    this.masterTabChannel?.postMessage({ type: 'MASTER_CHANGED', tabId: this.tabId });
  }

  private handleExternalAuthChange(user: User | null, session: any) {
    // Only non-master tabs should react to external auth changes
    if (!this.isMasterTab && !this.sessionLock) {
      console.log('Received auth state change from master tab:', { user: user?.id });
      // This will be handled by the auth context
    }
  }

  private broadcastAuthChange(user: User | null, session: any) {
    if (this.isMasterTab) {
      this.authChannel?.postMessage({
        type: 'AUTH_STATE_CHANGED',
        user,
        session,
        tabId: this.tabId
      });
    }
  }

  async fetchUserRoleWithRetry(userId: string): Promise<string> {
    for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
      try {
        console.log(`Fetching user role (attempt ${attempt}/${this.maxRetries}) for user:`, userId);
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);
        
        const { data: userRoleData, error: userRoleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        clearTimeout(timeoutId);
        
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

  setSessionLock(locked: boolean) {
    this.sessionLock = locked;
  }

  notifyAuthChange(user: User | null, session: any) {
    this.broadcastAuthChange(user, session);
  }

  cleanup() {
    this.masterTabChannel?.close();
    this.authChannel?.close();
  }

  isMaster(): boolean {
    return this.isMasterTab;
  }

  getTabId(): string {
    return this.tabId;
  }
}

export const authService = new AuthService();
