
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
  
  // Function to fetch user role and create user object with timeout
  const fetchUserWithRole = async (user: any): Promise<User | null> => {
    const userId = user.id;
    console.log("fetchUserWithRole called for user:", userId);
    
    try {
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.log("Role fetch timeout, rejecting request");
          reject(new Error('Timeout'));
        }, 8000); // 8 second timeout
      });
      
      // Create the query promise
      const queryPromise = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();
      
      // Race between query and timeout
      const { data: roleData, error: roleError } = await Promise.race([
        queryPromise,
        timeoutPromise
      ]);
      
      if (roleError) {
        console.error("Error fetching user role in fetchUserWithRole:", roleError);
        return null;
      }
      
      const role = roleData?.role || 'couple'; // Default fallback
      console.log("fetchUserWithRole - User role found:", role);
      
      return {
        id: userId,
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
      if (error.message === 'Timeout') {
        console.error("Role fetch was aborted due to timeout");
      } else {
        console.error("Error processing user data in fetchUserWithRole:", error);
      }
      return null;
    }
  };
  
  // Check for logged in user on initial load and set up auth state change listener
  useEffect(() => {
    console.log("Setting up auth state listener");
    let mounted = true;
    
    // Set up auth state change listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) {
          console.log("Component unmounted, ignoring auth state change");
          return;
        }
        
        console.log("Auth state changed:", event, "Session:", session ? "exists" : "null");
        
        if (session?.user) {
          console.log("Processing authenticated user in auth state change");
          const userData = await fetchUserWithRole(session.user);
          
          if (!mounted) {
            console.log("Component unmounted during user data fetch");
            return;
          }
          
          if (userData) {
            console.log("Setting auth state with user data from state change:", {
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
            console.error("Failed to fetch user role in auth state change");
            setAuthState({
              ...initialState,
              loading: false,
              error: "Error processing user data",
            });
          }
        } else {
          console.log("No authenticated user in auth state change");
          setAuthState({
            ...initialState,
            loading: false,
          });
        }
      }
    );
    
    // Check for current session
    const checkLoggedInUser = async () => {
      if (!mounted) return;
      
      try {
        console.log("Checking for existing logged in user");
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!mounted) {
          console.log("Component unmounted during session check");
          return;
        }
        
        if (session?.user) {
          console.log("Found existing session, processing user");
          const userData = await fetchUserWithRole(session.user);
          
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
        if (!mounted) return;
        
        console.error("Error checking logged in user:", error);
        setAuthState({
          ...initialState,
          loading: false,
          error: "Failed to restore session: " + error.message,
        });
      }
    };
    
    checkLoggedInUser();
    
    // Cleanup function
    return () => {
      console.log("Cleaning up auth state listener");
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { authState, setAuthState };
};
