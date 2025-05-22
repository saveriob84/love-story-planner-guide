
export interface User {
  id: string;
  email: string;
  name?: string;
  partnerName?: string;
  weddingDate?: Date;
  role?: 'couple' | 'vendor';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
  isVendor?: boolean;
}

export interface RegisterCredentials {
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
}
