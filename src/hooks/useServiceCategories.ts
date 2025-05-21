
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ServiceCategory } from '@/types/auth';

export const useServiceCategories = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('service_categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;

        if (data) {
          setCategories(data.map(category => ({
            id: category.id,
            name: category.name,
            description: category.description || '',
            icon: category.icon || '',
            displayOrder: category.display_order
          })));
        }
      } catch (err: any) {
        console.error('Error fetching service categories:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};
