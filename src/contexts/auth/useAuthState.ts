
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { AuthState } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { authService } from "@/services/authService";
import { useAuthDebounce } from "@/hooks/useAuthDebounce";

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  // Debounced state setter to prevent rapid updates
  const debouncedSetAuthState = useAuthDebounce((newState: AuthState) => {
    setAuthState(newState);
  }, 100);

  // Check for logged in user on initial load and set up auth state change listener
  useEffect(() => {
    console.log("Setting up optimized auth state listener");
    let mounted = true;
    let isInitialized = false;
    
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log("Component unmounted, ignoring auth state change");
          return;
        }
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null", "Tab:", authService.getTabId());
        
        // Prevent race conditions with session lock
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          authService.setSessionLock(true);
        }
        
        try {
          if (session?.user) {
            console.log("Processing authenticated user in auth state change");
            const userData = await authService.createUserWithRole(session.user);
            
            if (!mounted) {
              console.log("Component unmounted during user data fetch");
              return;
            }
            
            if (userData) {
              console.log("Setting auth state with user data from state change:", {
                id: userData.id,
                email: userData.email,
                role: userData.role,
                tabId: authService.getTabId()
              });
              
              const newState = {
                user: userData,
                isAuthenticated: true,
                loading: false,
                error: null,
              };
              
              setAuthState(newState);
              authService.notifyAuthChange(userData, session);
            } else {
              console.error("Failed to fetch user role in auth state change");
              setAuthState({
                ...initialState,
                loading: false,
                error: "Error processing user data",
              });
            }
          } else {
            console.log("No authenticated user in auth state change");
            const newState = {
              ...initialState,
              loading: false,
            };
            setAuthState(newState);
            authService.notifyAuthChange(null, null);
          }
        } finally {
          authService.setSessionLock(false);
        }
      }
    );
    
    // Check for current session with retry logic
    const checkLoggedInUser = async (retryCount = 0) => {
      if (!mounted) return;
      
      try {
        console.log("Checking for existing logged in user, attempt:", retryCount + 1);
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        if (!mounted) {
          console.log("Component unmounted during session check");
          return;
        }
        
        if (session?.user) {
          console.log("Found existing session, processing user");
          const userData = await authService.createUserWithRole(session.user);
          
          if (!mounted) {
            console.log("Component unmounted during existing session user data fetch");
            return;
          }
          
          if (userData) {
            console.log("Setting auth state with existing session user data:", {
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
            isInitialized = true;
          } else {
            console.error("Failed to fetch user role for existing session");
            setAuthState({
              ...initialState,
              loading: false,
              error: "Error processing existing session",
            });
          }
        } else {
          console.log("No existing session found");
          setAuthState({
            ...initialState,
            loading: false,
          });
          isInitialized = true;
        }
      } catch (error: any) {
        if (!mounted) return;
        
        console.error("Error checking logged in user:", error);
        
        // Retry logic with exponential backoff
        if (retryCount < 2) {
          console.log(`Retrying session check in ${(retryCount + 1) * 1000}ms`);
          setTimeout(() => {
            checkLoggedInUser(retryCount + 1);
          }, (retryCount + 1) * 1000);
          return;
        }
        
        setAuthState({
          ...initialState,
          loading: false,
          error: "Failed to restore session: " + error.message,
        });
      }
    };
    
    // Delay initial check to allow for tab coordination
    setTimeout(() => {
      if (mounted) {
        checkLoggedInUser();
      }
    }, authService.isMaster() ? 0 : 200);
    
    // Cleanup function
    return () => {
      console.log("Cleaning up optimized auth state listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { authState, setAuthState };
};
