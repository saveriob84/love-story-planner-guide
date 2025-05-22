
import { AuthState } from "./types";
import { useAuthLogin } from "./useAuthLogin";
import { useAuthRegistration } from "./useAuthRegistration";
import { useAuthLogout } from "./useAuthLogout";
import { useAuthUserUpdate } from "./useAuthUserUpdate";

export const useAuthActions = (
  authState: AuthState, 
  setAuthState: React.Dispatch<React.SetStateAction<AuthState>>
) => {
  const { login } = useAuthLogin(authState, setAuthState);
  const { register } = useAuthRegistration(authState, setAuthState);
  const { logout } = useAuthLogout(setAuthState);
  const { updateUser } = useAuthUserUpdate(authState, setAuthState);
  
  return {
    login,
    register,
    logout,
    updateUser
  };
};
