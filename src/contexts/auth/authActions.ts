
import { AuthState } from "./types";
import { useAuthLogin } from "./useAuthLogin";
import { useAuthRegistration } from "./useAuthRegistration";
import { useAuthLogout } from "./useAuthLogout";
import { useAuthUserUpdate } from "./useAuthUserUpdate";
import { useEffect } from "react";

export const useAuthActions = (
  authState: AuthState, 
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { login, cleanup: loginCleanup } = useAuthLogin(authState, setAuthState);
  const { register } = useAuthRegistration(authState, setAuthState);
  const { logout } = useAuthLogout(setAuthState);
  const { updateUser } = useAuthUserUpdate(authState, setAuthState);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("Cleaning up auth actions");
      loginCleanup();
    };
  }, [loginCleanup]);
  
  return {
    login,
    register,
    logout,
    updateUser
  };
};
