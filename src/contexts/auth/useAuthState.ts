
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
    console.log("Setting up auth state listener");
    
    // Set up auth state change listener first to prevent issues
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        if (session?.user) {
          try {
            // Get user role safely
            console.log("Fetching role for user:", session.user.id);
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            let role: 'couple' | 'vendor' = 'couple'; // Default role
            
            if (roleError) {
              console.error("Error fetching user role:", roleError);
              // If no explicit role is found, default to 'couple'
              console.log("No role found in database, defaulting to 'couple'");
            } else if (roleData && roleData.role) {
              // Strict type checking for role
              if (roleData.role === 'vendor') {
                role = 'vendor';
              } else {
                role = 'couple';
              }
              console.log("User authenticated with role:", role);
            }
            
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              partnerName: session.user.user_metadata?.partnerName,
              weddingDate: session.user.user_metadata?.weddingDate 
                ? new Date(session.user.user_metadata.weddingDate) 
                : undefined,
              role: role,
              businessName: session.user.user_metadata?.businessName,
            };
            
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
          } catch (error: any) {
            console.error("Error processing authentication:", error);
            setAuthState({
              ...initialState,
              loading: false,
              error: "Error processing authentication: " + error.message,
            });
          }
        } else {
          console.log("No authenticated user");
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      }
    );
    
    // Now check for current session
    const checkLoggedInUser = async () => {
      try {
        console.log("Checking for logged in user");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          try {
            // Get user role safely
            console.log("Fetching role for existing session user:", session.user.id);
            const { data: roleData, error: roleError } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', session.user.id)
              .single();
            
            let role: 'couple' | 'vendor' = 'couple'; // Default role
            
            if (roleError) {
              console.error("Error fetching user role:", roleError);
              // If no explicit role is found, default to 'couple'
              console.log("No role found in database, defaulting to 'couple'");
            } else if (roleData && roleData.role) {
              // Strict type checking for role
              if (roleData.role === 'vendor') {
                role = 'vendor';
              } else {
                role = 'couple';
              }
              console.log("Found existing session with role:", role);
            }
            
            const userData: User = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.name,
              partnerName: session.user.user_metadata?.partnerName,
              weddingDate: session.user.user_metadata?.weddingDate 
                ? new Date(session.user.user_metadata.weddingDate) 
                : undefined,
              role: role,
              businessName: session.user.user_metadata?.businessName,
            };
            
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
          } catch (error: any) {
            console.error("Error processing user data:", error);
            setAuthState({
              ...initialState,
              loading: false,
              error: "Error processing user data: " + error.message,
            });
          }
        } else {
          console.log("No existing session found");
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      } catch (error: any) {
        console.error("Error checking logged in user:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: "Failed to restore session: " + error.message,
        });
      }
    };
    
    checkLoggedInUser();
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { authState, setAuthState };
};
