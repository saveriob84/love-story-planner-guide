
import { User } from "@/types/auth";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: { email: string; password: string }) => Promise<void>;
  register: (credentials: { 
    email: string; 
    password: string; 
    name?: string; 
    partnerName?: string; 
    weddingDate?: Date;
    role?: 'couple' | 'vendor';
    businessName?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  getCurrentRole: () => Promise<'couple' | 'vendor' | undefined>;
  isVendor: () => Promise<boolean>;
  isCouple: () => Promise<boolean>;
}
