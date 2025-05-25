
import { AuthState } from "./types";
import { useAuthLogin } from "./useAuthLogin";
import { useAuthRegistration } from "./useAuthRegistration";
import { useAuthLogout } from "./useAuthLogout";
import { useAuthUserUpdate } from "./useAuthUserUpdate";
import { useEffect, useRef } from "react";
import { authService } from "@/services/authService";
import { sessionService } from "@/services/sessionService";

export const useAuthActions = (
  authState: AuthState, 
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const cleanupExecutedRef = useRef(false);
  const { login, cleanup: loginCleanup } = useAuthLogin(authState, setAuthState);
  const { register } = useAuthRegistration(authState, setAuthState);
  const { logout } = useAuthLogout(setAuthState);
  const { updateUser } = useAuthUserUpdate(authState, setAuthState);
  
  useEffect(() => {
    return () => {
      if (!cleanupExecutedRef.current) {
        console.log("Cleaning up auth actions and services");
        cleanupExecutedRef.current = true;
        loginCleanup();
        authService.cleanup();
        sessionService.clearSessionData();
      }
    };
  }, []);
  
  return {
    login,
    register,
    logout,
    updateUser
  };
};
