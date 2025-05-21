
export interface User {
  id: string;
  email: string;
  name?: string;
  partnerName?: string;
  weddingDate?: Date;
  role?: 'couple' | 'vendor';
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  description?: string;
  phone?: string;
  email: string;
  website?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  logoUrl?: string;
}

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  displayOrder: number;
}

export interface VendorService {
  id: string;
  vendorId: string;
  categoryId: string;
  name: string;
  description?: string;
  priceMin?: number;
  priceMax?: number;
  locationName?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  images?: ServiceImage[];
}

export interface ServiceImage {
  id: string;
  serviceId: string;
  imageUrl: string;
  displayOrder: number;
}
