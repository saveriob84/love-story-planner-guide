
import { supabase } from "@/integrations/supabase/client";

class SessionService {
  private sessionCache: any = null;
  private roleCache: Map<string, string> = new Map();
  private isRecovering = false;

  // Salva la sessione nella cache locale
  cacheSession(session: any) {
    this.sessionCache = session;
    if (session?.user?.id) {
      // Salva anche nel localStorage come backup
      localStorage.setItem('wedding_session_backup', JSON.stringify({
        user_id: session.user.id,
        email: session.user.email,
        expires_at: session.expires_at,
        cached_at: Date.now()
      }));
    }
  }

  // Recupera la sessione dalla cache
  getCachedSession() {
    return this.sessionCache;
  }

  // Cache del ruolo utente
  cacheUserRole(userId: string, role: string) {
    this.roleCache.set(userId, role);
    localStorage.setItem(`user_role_${userId}`, role);
  }

  getCachedUserRole(userId: string): string | null {
    // Prima controlla la cache in memoria
    const memoryRole = this.roleCache.get(userId);
    if (memoryRole) return memoryRole;

    // Poi controlla localStorage
    const storageRole = localStorage.getItem(`user_role_${userId}`);
    if (storageRole) {
      this.roleCache.set(userId, storageRole);
      return storageRole;
    }

    return null;
  }

  // Recovery della sessione quando Chrome si riattiva
  async recoverSession(): Promise<boolean> {
    if (this.isRecovering) return false;
    
    this.isRecovering = true;
    console.log('Attempting session recovery...');

    try {
      // Prima prova a ottenere la sessione corrente
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (!error && session) {
        console.log('Session recovered successfully');
        this.cacheSession(session);
        this.isRecovering = false;
        return true;
      }

      // Se non c'è sessione, prova il backup
      const backup = localStorage.getItem('wedding_session_backup');
      if (backup) {
        const backupData = JSON.parse(backup);
        const isExpired = backupData.cached_at && (Date.now() - backupData.cached_at > 24 * 60 * 60 * 1000);
        
        if (!isExpired) {
          console.log('Session backup found but current session invalid');
          // Il backup esiste ma la sessione non è valida - probabilmente scaduta
          this.clearSessionData();
        }
      }

      this.isRecovering = false;
      return false;
    } catch (error) {
      console.error('Session recovery failed:', error);
      this.isRecovering = false;
      return false;
    }
  }

  // Pulisce tutti i dati di sessione
  clearSessionData() {
    this.sessionCache = null;
    this.roleCache.clear();
    localStorage.removeItem('wedding_session_backup');
    
    // Pulisce anche le cache dei ruoli
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('user_role_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Verifica se la sessione è valida
  isSessionValid(session: any): boolean {
    if (!session || !session.user) return false;
    
    const now = Date.now() / 1000;
    const expiresAt = session.expires_at;
    
    return expiresAt > now + 60; // Margine di 60 secondi
  }

  // Forza il refresh del token
  async forceRefresh(): Promise<boolean> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (!error && data.session) {
        this.cacheSession(data.session);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Force refresh failed:', error);
      return false;
    }
  }
}

export const sessionService = new SessionService();
