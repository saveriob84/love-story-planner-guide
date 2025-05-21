
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { VendorService, ServiceImage, Vendor } from '@/types/auth';

export const useVendorServices = (categoryId?: string) => {
  const [services, setServices] = useState<VendorService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        
        // Build query
        let query = supabase
          .from('vendor_services')
          .select(`
            *,
            vendors:vendor_id (id, business_name, email, phone, website, description),
            service_images:service_images (*)
          `);
          
        // Add category filter if provided
        if (categoryId) {
          query = query.eq('category_id', categoryId);
        }

        const { data, error } = await query;

        if (error) throw error;

        if (data) {
          setServices(data.map(item => ({
            id: item.id,
            vendorId: item.vendor_id,
            categoryId: item.category_id,
            name: item.name,
            description: item.description,
            priceMin: item.price_min,
            priceMax: item.price_max,
            locationName: item.location_name,
            address: item.address,
            city: item.city,
            postalCode: item.postal_code,
            latitude: item.latitude,
            longitude: item.longitude,
            images: item.service_images?.map((img: any) => ({
              id: img.id,
              serviceId: img.service_id,
              imageUrl: img.image_url,
              displayOrder: img.display_order
            })) || [],
            vendor: item.vendors ? {
              id: item.vendors.id,
              userId: '',  // Not needed here
              businessName: item.vendors.business_name,
              email: item.vendors.email,
              phone: item.vendors.phone,
              website: item.vendors.website,
              description: item.vendors.description
            } : undefined
          })));
        }
      } catch (err: any) {
        console.error('Error fetching vendor services:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [categoryId]);

  return { services, loading, error };
};
