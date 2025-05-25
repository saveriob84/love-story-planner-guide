
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
    let processingUser = false;
    
    // Function to process authenticated user
    const processAuthenticatedUser = async (session: any) => {
      if (!mounted || processingUser || !session?.user) return;
      
      processingUser = true;
      
      try {
        console.log("Processing authenticated user:", session.user.id);
        const userData = await authService.createUserWithRole(session.user);
        
        if (!mounted) {
          processingUser = false;
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
      } finally {
        processingUser = false;
      }
    };

    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        // Handle different auth events
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user) {
              console.log("User signed in, processing");
              await processAuthenticatedUser(session);
            }
            break;
            
          case 'TOKEN_REFRESHED':
            // Don't re-process user on token refresh if we already have user data
            if (session?.user && !authState.user) {
              console.log("Token refreshed and no existing user, processing");
              await processAuthenticatedUser(session);
            } else {
              console.log("Token refreshed, user already loaded");
            }
            break;
            
          case 'SIGNED_OUT':
            console.log("User signed out, clearing state");
            setAuthState({
              ...initialState,
              loading: false,
            });
            authService.notifyAuthChange(null, null);
            break;
            
          case 'PASSWORD_RECOVERY':
            // Don't change auth state for password recovery
            break;
            
          default:
            // For other events, check if we have a valid session
            if (session?.user) {
              await processAuthenticatedUser(session);
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

    // Check for existing session AFTER setting up the listener
    const initializeSession = async () => {
      try {
        console.log("Checking for existing session at app startup");
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

    // Initialize session
    initializeSession();
    
    // Cleanup function
    return () => {
      console.log("Cleaning up auth state listener");
      mounted = false;
      processingUser = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array to prevent re-initialization

  return { authState, setAuthState };
};
