
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

// Initial auth state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
};

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>(initialState);
  const { toast } = useToast();
  
  // Check for logged in user on initial load
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
  
  // Login function using Supabase auth
  const login = async (credentials: LoginCredentials) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Login effettuato",
          description: "Benvenuto nel tuo wedding planner personale!",
        });
      }
    } catch (error: any) {
      console.error("Login error:", error);
      setAuthState({
        ...authState,
        error: error.message,
      });
      
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  // Register function using Supabase auth
  const register = async (credentials: RegisterCredentials) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name,
            partnerName: credentials.partnerName,
            weddingDate: credentials.weddingDate?.toISOString(),
          },
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast({
          title: "Registrazione completata",
          description: "Il tuo account è stato creato con successo!",
        });
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setAuthState({
        ...authState,
        error: error.message,
      });
      
      toast({
        title: "Errore",
        description: error.message,
        variant: "destructive",
      });
      
      throw error;
    }
  };
  
  // Logout function using Supabase auth
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Logout error:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante il logout.",
        variant: "destructive",
      });
      return;
    }
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
    });
    
    toast({
      title: "Logout effettuato",
      description: "Hai effettuato il logout con successo.",
    });
  };
  
  // Update user data using Supabase auth
  const updateUser = async (userData: Partial<User>) => {
    if (!authState.user) return;
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        data: {
          name: userData.name,
          partnerName: userData.partnerName,
          weddingDate: userData.weddingDate?.toISOString(),
        },
      });
      
      if (error) throw error;
      
      if (data.user) {
        const updatedUser = {
          ...authState.user,
          ...userData,
        };
        
        setAuthState({
          ...authState,
          user: updatedUser,
        });
        
        toast({
          title: "Profilo aggiornato",
          description: "Le tue informazioni sono state aggiornate con successo.",
        });
      }
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante l'aggiornamento del profilo.",
        variant: "destructive",
      });
    }
  };
  
  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
