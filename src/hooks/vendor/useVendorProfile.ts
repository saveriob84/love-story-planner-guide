
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { VendorProfileData } from "@/types/vendor";

export const useVendorProfile = (userId: string | undefined) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<VendorProfileData>({
    business_name: '',
    ragione_sociale: '',
    codice_fiscale: '',
    partita_iva: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    logo_url: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load vendor profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', userId as any)
          .single();

        if (error) {
          console.error('Error loading profile:', error);
          toast({
            title: "Errore",
            description: "Impossibile caricare il profilo",
            variant: "destructive",
          });
          return;
        }

        if (data) {
          setProfileData({
            business_name: (data as any).business_name || '',
            ragione_sociale: (data as any).ragione_sociale || '',
            codice_fiscale: (data as any).codice_fiscale || '',
            partita_iva: (data as any).partita_iva || '',
            email: (data as any).email || '',
            phone: (data as any).phone || '',
            website: (data as any).website || '',
            description: (data as any).description || '',
            logo_url: (data as any).logo_url || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error);
        toast({
          title: "Errore",
          description: "Errore nel caricamento del profilo",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [userId, toast]);

  const handleInputChange = (field: keyof VendorProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!userId) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('vendors')
        .update({
          business_name: profileData.business_name,
          ragione_sociale: profileData.ragione_sociale,
          codice_fiscale: profileData.codice_fiscale,
          partita_iva: profileData.partita_iva,
          email: profileData.email,
          phone: profileData.phone,
          website: profileData.website,
          description: profileData.description,
          logo_url: profileData.logo_url
        } as any)
        .eq('user_id', userId as any);

      if (error) {
        console.error('Error updating profile:', error);
        toast({
          title: "Errore",
          description: "Impossibile salvare il profilo",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Profilo aggiornato",
        description: "Le modifiche sono state salvate con successo",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Errore",
        description: "Errore nel salvataggio del profilo",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profileData,
    isLoading,
    isSaving,
    handleInputChange,
    handleSave
  };
};
