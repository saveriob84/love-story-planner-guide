
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuthState } from "./types";
import { useRef } from "react";

export const useAuthLogin = (
  authState: AuthState,
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { toast } = useToast();
  const loginInProgressRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Enhanced role fetching with retry logic and timeout
  const fetchUserRoleWithRetry = async (userId: string, maxRetries = 3): Promise<string> => {
    let lastError: Error | null = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempting to fetch user role (attempt ${attempt}/${maxRetries}) for user:`, userId);
        
        // Create timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new Error('Timeout')), 5000); // 5 second timeout
        });
        
        // Create the query promise
        const queryPromise = supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .maybeSingle();
        
        // Race between query and timeout
        const { data: userRoleData, error: userRoleError } = await Promise.race([
          queryPromise,
          timeoutPromise
        ]);
        
        if (userRoleError) {
          throw userRoleError;
        }
        
        const userRole = userRoleData?.role;
        console.log(`User role found on attempt ${attempt}:`, userRole);
        
        if (!userRole) {
          throw new Error("Nessun ruolo trovato per questo utente");
        }
        
        return userRole;
        
      } catch (error: any) {
        lastError = error;
        console.error(`Role fetch attempt ${attempt} failed:`, error);
        
        if (error.message === 'Timeout') {
          console.log(`Attempt ${attempt} was aborted due to timeout`);
        }
        
        // If it's the last attempt, don't wait
        if (attempt < maxRetries) {
          console.log(`Waiting before retry attempt ${attempt + 1}...`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Exponential backoff
        }
      }
    }
    
    throw lastError || new Error("Errore nel recupero del ruolo utente dopo tutti i tentativi");
  };
  
  // Login function with comprehensive error handling and debouncing
  const login = async (credentials: { email: string; password: string; isVendor?: boolean }) => {
    // Prevent concurrent login attempts
    if (loginInProgressRef.current) {
      console.log("Login already in progress, ignoring duplicate attempt");
      return;
    }
    
    console.log("Starting login process:", { 
      email: credentials.email, 
      isVendor: credentials.isVendor,
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
        userRole = await fetchUserRoleWithRetry(data.user.id);
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
      
      // Clean up abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current = null;
      }
      
      console.log("Login process completed, flags reset");
    }
  };

  // Cleanup function for component unmount
  const cleanup = () => {
    console.log("Cleaning up login state");
    loginInProgressRef.current = false;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    setAuthState(prev => ({
      ...prev,
      loading: false,
      error: null
    }));
  };

  return { login, cleanup, isLoginInProgress: () => loginInProgressRef.current };
};
