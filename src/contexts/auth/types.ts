
import { User } from "@/types/auth";

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface AuthContextType extends AuthState {
  login: (credentials: { 
    email: string; 
    password: string;
    isVendor?: boolean;
  }) => Promise<void>;
  register: (credentials: { 
    email: string; 
    password: string; 
    name?: string; 
    partnerName?: string; 
    weddingDate?: Date;
    isVendor?: boolean;
    businessName?: string;
    phone?: string;
    website?: string;
    description?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}
