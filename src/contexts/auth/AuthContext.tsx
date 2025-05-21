
import { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthState } from "./useAuthState";
import { useAuthActions } from "./authActions";

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { authState, setAuthState } = useAuthState();
  const { login, register, logout, updateUser, getCurrentRole, isVendor, isCouple } = useAuthActions(authState, setAuthState);
  
  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateUser,
    getCurrentRole,
    isVendor,
    isCouple
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
