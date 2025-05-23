
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
  
  // Function to fetch user role and create user object
  const fetchUserWithRole = async (user: any): Promise<User | null> => {
    try {
      console.log("Fetching role for user:", user.id);
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (roleError) {
        console.error("Error fetching user role:", roleError);
        return null;
      }
      
      const role = roleData?.role || 'couple'; // Default fallback
      console.log("User role found:", role);
      
      return {
        id: user.id,
        email: user.email || '',
        name: user.user_metadata?.name,
        partnerName: user.user_metadata?.partnerName,
        weddingDate: user.user_metadata?.weddingDate 
          ? new Date(user.user_metadata.weddingDate) 
          : undefined,
        role: role as 'couple' | 'vendor',
        businessName: user.user_metadata?.businessName,
      };
    } catch (error: any) {
      console.error("Error processing user data:", error);
      return null;
    }
  };
  
  // Check for logged in user on initial load and set up auth state change listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        if (session?.user) {
          const userData = await fetchUserWithRole(session.user);
          
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
        } else {
          console.log("No authenticated user");
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      }
    );
    
    // Check for current session
    const checkLoggedInUser = async () => {
      try {
        console.log("Checking for logged in user");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const userData = await fetchUserWithRole(session.user);
          
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
