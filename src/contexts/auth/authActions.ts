
import { AuthState } from "./types";
import { useAuthLogin } from "./useAuthLogin";
import { useAuthRegistration } from "./useAuthRegistration";
import { useAuthLogout } from "./useAuthLogout";
import { useAuthUserUpdate } from "./useAuthUserUpdate";
import { useEffect, useRef } from "react";

export const useAuthActions = (
  authState: AuthState, 
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const mountedRef = useRef(true);
  const { login, cleanup: loginCleanup } = useAuthLogin(authState, setAuthState);
  const { register } = useAuthRegistration(authState, setAuthState);
  const { logout } = useAuthLogout(setAuthState);
  const { updateUser } = useAuthUserUpdate(authState, setAuthState);
  
  // Cleanup on unmount - but only once
  useEffect(() => {
    return () => {
      if (mountedRef.current) {
        console.log("Cleaning up auth actions");
        mountedRef.current = false;
        loginCleanup();
      }
    };
  }, []); // Empty dependency array to run only once
  
  return {
    login,
    register,
    logout,
    updateUser
  };
};
