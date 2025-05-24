
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
    
    // Function to process authenticated user
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
          
          const newAuthState = {
            user: userData,
            isAuthenticated: true,
            loading: false,
            error: null,
          };
          
          setAuthState(newAuthState);
          
          // Pass the actual userData, not the stale authState.user
          authService.notifyAuthChange(userData, session);
          
          console.log("Auth state updated successfully with user:", userData.email);
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

    // Check for existing session at startup
    const checkExistingSession = async () => {
      try {
        console.log("Checking for existing session at app startup");
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

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        if (session?.user) {
          console.log("User found in auth state change, processing");
          await processAuthenticatedUser(session);
        } else {
          console.log("No user in auth state change, setting logged out state");
          const loggedOutState = {
            ...initialState,
            loading: false,
          };
          setAuthState(loggedOutState);
          authService.notifyAuthChange(null, null);
        }
      }
    );
    
    // Start checking for existing session
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
