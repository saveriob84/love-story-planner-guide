
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";
import { useRef } from "react";
import { authService } from "@/services/authService";

export const useAuthLogin = (
  authState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  const loginInProgressRef = useRef(false);
  
  // Login function with comprehensive error handling and optimized flow
  const login = async (credentials: { email: string; password: string; isVendor?: boolean }) => {
    // Prevent concurrent login attempts
    if (loginInProgressRef.current) {
      console.log("Login already in progress, ignoring duplicate attempt");
      return;
    }
    
    console.log("Starting optimized login process:", { 
      email: credentials.email, 
      isVendor: credentials.isVendor,
      tabId: authService.getTabId(),
      isMaster: authService.isMaster(),
      timestamp: new Date().toISOString()
    });
    
    // Set login in progress flag and loading state
    loginInProgressRef.current = true;
    setAuthState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));
    
    try {
      // Step 1: Authenticate with Supabase
      console.log("Step 1: Authenticating with Supabase");
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
      
      console.log("Step 2: User authenticated successfully:", data.user.id);
      
      // Step 2: Fetch and validate user role
      let userRole: string;
      try {
        userRole = await authService.fetchUserRoleWithRetry(data.user.id);
      } catch (roleError: any) {
        console.error("Failed to fetch user role, signing out:", roleError);
        await supabase.auth.signOut();
        throw new Error("Errore nel recupero del ruolo utente. Riprova più tardi.");
      }
      
      console.log("Step 3: User role validated:", userRole);
      
      // Step 3: Validate role matches login type
      if (credentials.isVendor && userRole === 'couple') {
        await supabase.auth.signOut();
        throw new Error("Questo account è registrato come coppia. Usa il login normale.");
      }
      
      if (!credentials.isVendor && userRole === 'vendor') {
        await supabase.auth.signOut();
        throw new Error("Questo account è registrato come fornitore. Usa il login fornitori.");
      }
      
      console.log("Step 4: Login successful, role validation passed");
      
      // Success toast
      toast({
        title: "Login effettuato",
        description: credentials.isVendor ? 
          "Benvenuto nel tuo portale fornitori!" : 
          "Benvenuto nel tuo wedding planner personale!",
      });
      
      // The auth state will be updated by the onAuthStateChange listener
      // Just reset loading state here
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: null
      }));
      
    } catch (error: any) {
      console.error("Login process failed:", error);
      
      // Always reset loading state and login flag on error
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
      // Always reset the login in progress flag
      loginInProgressRef.current = false;
      console.log("Login process completed, flags reset");
    }
  };

  // Cleanup function for component unmount
  const cleanup = () => {
    console.log("Cleaning up login state");
    loginInProgressRef.current = false;
    
    setAuthState(prev => ({
      ...prev,
      loading: false,
      error: null
    }));
  };

  return { login, cleanup, isLoginInProgress: () => loginInProgressRef.current };
};
