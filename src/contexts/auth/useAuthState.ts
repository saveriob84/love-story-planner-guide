
import { useState, useEffect, useRef } from "react";
import { User } from "@/types/auth";
import { AuthState } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { sessionService } from "@/services/sessionService";

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const processingUserRef = useRef(false);
  const initializationCompleteRef = useRef(false);

  useEffect(() => {
    console.log("Setting up auth state management");
    let mounted = true;
    
    // Funzione ottimizzata per processare l'utente autenticato
    const processAuthenticatedUser = async (session: any, skipIfExists = false) => {
      if (!mounted || processingUserRef.current || !session?.user) return;
      
      // Skip se l'utente è già caricato e la sessione è la stessa
      if (skipIfExists && authState.user?.id === session.user.id) {
        console.log("User already loaded, skipping processing");
        return;
      }
      
      processingUserRef.current = true;
      
      try {
        console.log("Processing authenticated user:", session.user.id);
        
        // Verifica se la sessione è valida
        if (!sessionService.isSessionValid(session)) {
          console.log("Session is expired, attempting refresh");
          const refreshed = await sessionService.forceRefresh();
          if (!refreshed) {
            console.log("Could not refresh expired session");
            setAuthState({
              ...initialState,
              loading: false,
              error: "Sessione scaduta",
            });
            processingUserRef.current = false;
            return;
          }
        }
        
        const userData = await authService.createUserWithRole(session.user);
        
        if (!mounted) {
          processingUserRef.current = false;
          return;
        }
        
        if (userData) {
          console.log("Setting auth state with user data:", {
            id: userData.id,
            email: userData.email,
            role: userData.role
          });
          
          const newAuthState = {
            user: userData,
            isAuthenticated: true,
            loading: false,
            error: null,
          };
          
          setAuthState(newAuthState);
          authService.notifyAuthChange(userData, session);
          
          console.log("Auth state updated successfully with user:", userData.email);
        } else {
          console.error("Failed to create user data");
          setAuthState({
            ...initialState,
            loading: false,
            error: "Errore nel caricamento dei dati utente",
          });
        }
      } catch (error: any) {
        console.error("Error processing authenticated user:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: error.message,
        });
      } finally {
        processingUserRef.current = false;
      }
    };

    // Listener per eventi di auth ottimizzato
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log("User signed in, processing");
              await processAuthenticatedUser(session);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            // Solo aggiorna la cache della sessione senza riprocessare l'utente
            if (session?.user) {
              console.log("Token refreshed, updating session cache");
              sessionService.cacheSession(session);
              
              // Solo se non abbiamo dati utente, riprocessa
              if (!authState.user) {
                console.log("No user data, processing after token refresh");
                await processAuthenticatedUser(session);
              }
            }
            break;
            
          case 'SIGNED_OUT':
            console.log("User signed out, clearing state");
            sessionService.clearSessionData();
            setAuthState({
              ...initialState,
              loading: false,
            });
            authService.notifyAuthChange(null, null);
            break;
            
          case 'PASSWORD_RECOVERY':
            // Non cambiare lo stato auth per il recovery password
            break;
            
          default:
            if (session?.user) {
              await processAuthenticatedUser(session, true);
            } else {
              setAuthState({
                ...initialState,
                loading: false,
              });
              authService.notifyAuthChange(null, null);
            }
        }
      }
    );

    // Inizializzazione della sessione con recovery
    const initializeSession = async () => {
      try {
        console.log("Checking for existing session at app startup");
        
        // Prima prova la session recovery
        const recovered = await sessionService.recoverSession();
        if (recovered) {
          console.log("Session recovered, getting fresh session");
        }
        
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
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
        
        initializationCompleteRef.current = true;
      } catch (error: any) {
        if (!mounted) return;
        console.error("Error checking existing session:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: "Errore nel caricamento della sessione: " + error.message,
        });
        initializationCompleteRef.current = true;
      }
    };

    // Event listener per quando Chrome si riattiva
    const handleVisibilityChange = () => {
      if (!document.hidden && initializationCompleteRef.current && authState.isAuthenticated) {
        console.log("Tab became visible, verifying session");
        setTimeout(async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session && authState.isAuthenticated) {
              console.log("Session lost while tab was hidden");
              sessionService.clearSessionData();
              setAuthState({
                ...initialState,
                loading: false,
                error: "Sessione persa, effettua nuovamente il login",
              });
            }
          } catch (error) {
            console.error("Error checking session on visibility change:", error);
          }
        }, 100);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Inizializza la sessione
    initializeSession();
    
    // Cleanup
    return () => {
      console.log("Cleaning up auth state listener");
      mounted = false;
      processingUserRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array

  return { authState, setAuthState };
};
