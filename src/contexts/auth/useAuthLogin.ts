
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";
import { useRef } from "react";
import { authService } from "@/services/authService";
import { sessionService } from "@/services/sessionService";

export const useAuthLogin = (
  authState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  const loginInProgressRef = useRef(false);
  
  const login = async (credentials: { email: string; password: string; isVendor?: boolean }) => {
    if (loginInProgressRef.current) {
      console.log("Login already in progress, ignoring duplicate attempt");
      return;
    }
    
    console.log("Starting login process:", { 
      email: credentials.email, 
      isVendor: credentials.isVendor,
      timestamp: new Date().toISOString()
    });
    
    loginInProgressRef.current = true;
    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      // Pulisce la cache precedente
      sessionService.clearSessionData();
      
      // Autenticazione con Supabase
      console.log("Authenticating with Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) {
        console.error("Supabase authentication error:", error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error("Nessun utente restituito dall'autenticazione");
      }
      
      console.log("User authenticated successfully:", data.user.id);
      
      // Cache immediatamente la sessione
      if (data.session) {
        sessionService.cacheSession(data.session);
      }
      
      // Fetch e validazione del ruolo
      let userRole: string;
      try {
        userRole = await authService.fetchUserRoleWithRetry(data.user.id);
      } catch (roleError: any) {
        console.error("Failed to fetch user role:", roleError);
        userRole = 'couple';
      }
      
      console.log("User role determined:", userRole);
      
      // Validazione del ruolo vs tipo di login
      if (credentials.isVendor && userRole === 'couple') {
        await supabase.auth.signOut();
        throw new Error("Questo account è registrato come coppia. Usa il login normale.");
      }
      
      if (!credentials.isVendor && userRole === 'vendor') {
        await supabase.auth.signOut();
        throw new Error("Questo account è registrato come fornitore. Usa il login fornitori.");
      }
      
      console.log("Login successful, role validation passed");
      
      toast({
        title: "Login effettuato",
        description: credentials.isVendor ? 
          "Benvenuto nel tuo portale fornitori!" : 
          "Benvenuto nel tuo wedding planner personale!",
      });
      
      // L'auth state verrà aggiornato dal listener onAuthStateChange
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));
      
    } catch (error: any) {
      console.error("Login process failed:", error);
      
      sessionService.clearSessionData();
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error.message,
        isAuthenticated: false,
        user: null
      }));
      
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    } finally {
      loginInProgressRef.current = false;
      console.log("Login process completed");
    }
  };

  const cleanup = () => {
    console.log("Cleaning up login state");
    loginInProgressRef.current = false;
    sessionService.clearSessionData();
    
    setAuthState(prev => ({
      ...prev,
      loading: false,
      error: null
    }));
  };

  return { login, cleanup, isLoginInProgress: () => loginInProgressRef.current };
};
