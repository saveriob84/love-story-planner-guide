
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthState, LoginCredentials, RegisterCredentials } from "@/types/auth";
import { useToast } from "@/hooks/use-toast";

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
        // Check localStorage for user data (to be replaced with Supabase auth session)
        const userData = localStorage.getItem("weddingPlannerUser");
        
        if (userData) {
          try {
            const user = JSON.parse(userData);
            setAuthState({
              user,
              isAuthenticated: true,
              loading: false,
              error: null,
            });
          } catch (error) {
            console.error("Failed to parse user data:", error);
            // Invalid JSON in localStorage, clear it
            localStorage.removeItem("weddingPlannerUser");
            setAuthState({
              ...initialState,
              loading: false,
              error: "Session data corrupted",
            });
          }
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
    
    checkLoggedInUser();
  }, []);
  
  // Login function (to be replaced with Supabase auth)
  const login = async (credentials: LoginCredentials) => {
    try {
      // In a real app, this would be an API call
      // Mock login for demo purposes
      // Check local storage for matching registered user
      let users = [];
      try {
        const usersJson = localStorage.getItem('weddingPlannerUsers');
        users = usersJson ? JSON.parse(usersJson) : [];
      } catch (error) {
        console.error("Failed to parse users data:", error);
        users = [];
      }
      
      const user = users.find((u: any) => 
        u.email === credentials.email && u.password === credentials.password
      );
      
      if (user) {
        const { password, ...userWithoutPassword } = user;
        
        // Store the logged-in user
        localStorage.setItem("weddingPlannerUser", JSON.stringify(userWithoutPassword));
        
        setAuthState({
          user: userWithoutPassword,
          isAuthenticated: true,
          loading: false,
          error: null,
        });
        
        toast({
          title: "Login effettuato",
          description: "Benvenuto nel tuo wedding planner personale!",
        });
      } else {
        throw new Error("Email o password non validi");
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
  
  // Register function (to be replaced with Supabase auth)
  const register = async (credentials: RegisterCredentials) => {
    try {
      // In a real app, this would be an API call
      // Here we're storing in localStorage for demo purposes
      
      // Get existing users or create empty array
      let users = [];
      try {
        const usersJson = localStorage.getItem('weddingPlannerUsers');
        users = usersJson ? JSON.parse(usersJson) : [];
      } catch (error) {
        console.error("Failed to parse users data:", error);
        users = [];
      }
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === credentials.email);
      if (existingUser) {
        throw new Error("Un utente con questa email esiste già");
      }
      
      // Create new user
      const newUser = {
        id: `user-${Date.now()}`,
        email: credentials.email,
        password: credentials.password, // NEVER do this in production!
        name: credentials.name || "",
        partnerName: credentials.partnerName || "",
        weddingDate: credentials.weddingDate || null,
        createdAt: new Date().toISOString()
      };
      
      // Add to users array and save
      users.push(newUser);
      localStorage.setItem('weddingPlannerUsers', JSON.stringify(users));
      
      // Login the user (without password)
      const { password, ...userWithoutPassword } = newUser;
      localStorage.setItem("weddingPlannerUser", JSON.stringify(userWithoutPassword));
      
      setAuthState({
        user: userWithoutPassword,
        isAuthenticated: true,
        loading: false,
        error: null,
      });
      
      toast({
        title: "Registrazione completata",
        description: "Il tuo account è stato creato con successo!",
      });
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
  
  // Logout function (to be replaced with Supabase auth)
  const logout = () => {
    localStorage.removeItem("weddingPlannerUser");
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
  
  // Update user data (to be replaced with Supabase functions)
  const updateUser = (userData: Partial<User>) => {
    if (!authState.user) return;
    
    const updatedUser = {
      ...authState.user,
      ...userData,
    };
    
    // Update in state
    setAuthState({
      ...authState,
      user: updatedUser,
    });
    
    try {
      // Update in localStorage
      localStorage.setItem("weddingPlannerUser", JSON.stringify(updatedUser));
      
      // Update in users array
      const usersJson = localStorage.getItem('weddingPlannerUsers');
      if (usersJson) {
        const users = JSON.parse(usersJson);
        const updatedUsers = users.map((u: any) => {
          if (u.id === updatedUser.id) {
            return { ...u, ...userData, password: u.password };
          }
          return u;
        });
        
        localStorage.setItem('weddingPlannerUsers', JSON.stringify(updatedUsers));
      }
      
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state aggiornate con successo.",
      });
    } catch (error) {
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
