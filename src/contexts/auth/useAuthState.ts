
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { AuthState } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);

  useEffect(() => {
    console.log("Setting up auth state management");
    let mounted = true;
    
    // Funzione per processare l'utente autenticato
    const processAuthenticatedUser = async (session: any) => {
      if (!mounted) return;
      
      try {
        console.log("Processing authenticated user:", session.user.id);
        const userData = await authService.createUserWithRole(session.user);
        
        if (!mounted) return;
        
        if (userData) {
          console.log("Setting auth state with user data:", {
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
          
          setAuthState({
            user: userData,
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          console.error("Failed to fetch user role");
          setAuthState({
            ...initialState,
            loading: false,
            error: "Error processing user data",
          });
        }
      } catch (error: any) {
        console.error("Error processing authenticated user:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: error.message,
        });
      }
    };

    // 1. PRIMA: Controlla sessione esistente
    const checkExistingSession = async () => {
      try {
        console.log("Checking for existing session at app boot");
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!mounted) return;
        
        if (session?.user) {
          console.log("Found existing session, processing user");
          await processAuthenticatedUser(session);
        } else {
          console.log("No existing session found");
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      } catch (error: any) {
        if (!mounted) return;
        console.error("Error checking existing session:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: "Failed to restore session: " + error.message,
        });
      }
    };

    // 2. DOPO: Setup listener per futuri cambi di stato
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        // Evita di processare di nuovo la sessione iniziale se già gestita
        if (event === 'INITIAL_SESSION') {
          return;
        }
        
        if (session?.user) {
          await processAuthenticatedUser(session);
          authService.notifyAuthChange(authState.user, session);
        } else {
          console.log("No user in auth state change, logging out");
          setAuthState({
            ...initialState,
            loading: false,
          });
          authService.notifyAuthChange(null, null);
        }
      }
    );
    
    // Avvia il controllo della sessione esistente
    checkExistingSession();
    
    // Cleanup function
    return () => {
      console.log("Cleaning up auth state listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { authState, setAuthState };
};
