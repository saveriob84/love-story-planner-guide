
import { useState, useEffect } from "react";
import { User } from "@/types/auth";
import { AuthState } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

export const useAuthState = () => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  
  // Check for logged in user on initial load and set up auth state change listener
  useEffect(() => {
    const checkLoggedInUser = async () => {
      try {
        // Get current session from Supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata.name,
              partnerName: session.user.user_metadata.partnerName,
              weddingDate: session.user.user_metadata.weddingDate 
                ? new Date(session.user.user_metadata.weddingDate) 
                : undefined,
            },
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      } catch (error) {
        console.error("Error checking logged in user:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: "Failed to restore session",
        });
      }
    };
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          setAuthState({
            user: {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata.name,
              partnerName: session.user.user_metadata.partnerName,
              weddingDate: session.user.user_metadata.weddingDate 
                ? new Date(session.user.user_metadata.weddingDate) 
                : undefined,
            },
            isAuthenticated: true,
            loading: false,
            error: null,
          });
        } else {
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      }
    );
    
    checkLoggedInUser();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { authState, setAuthState };
};
