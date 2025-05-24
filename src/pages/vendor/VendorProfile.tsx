
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, LogOut, Upload } from "lucide-react";

interface VendorProfileData {
  business_name: string;
  ragione_sociale: string;
  codice_fiscale: string;
  partita_iva: string;
  email: string;
  phone: string;
  website: string;
  description: string;
  logo_url: string;
}

const VendorProfile = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
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

  // Redirect if user is not authenticated or not a vendor
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'vendor')) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate, user]);

  // Load vendor profile data
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
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
            business_name: data.business_name || '',
            ragione_sociale: data.ragione_sociale || '',
            codice_fiscale: data.codice_fiscale || '',
            partita_iva: data.partita_iva || '',
            email: data.email || '',
            phone: data.phone || '',
            website: data.website || '',
            description: data.description || '',
            logo_url: data.logo_url || ''
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
  }, [user?.id, toast]);

  const handleInputChange = (field: keyof VendorProfileData, value: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!user?.id) return;

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
        })
        .eq('user_id', user.id);

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

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-wedding-navy text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/vendor/dashboard')}
              className="mr-4 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Profilo Fornitore</h1>
              <p className="text-gray-200">Gestisci le informazioni della tua attività</p>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={logout}
            className="mt-4 md:mt-0 text-white border-white hover:bg-white/10"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Dati Anagrafici */}
          <Card>
            <CardHeader>
              <CardTitle>Dati Anagrafici</CardTitle>
              <CardDescription>
                Informazioni legali e identificative della tua attività
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="business_name">Nome Attività *</Label>
                  <Input
                    id="business_name"
                    value={profileData.business_name}
                    onChange={(e) => handleInputChange('business_name', e.target.value)}
                    placeholder="Es. Wedding Dreams"
                  />
                </div>
                <div>
                  <Label htmlFor="ragione_sociale">Ragione Sociale</Label>
                  <Input
                    id="ragione_sociale"
                    value={profileData.ragione_sociale}
                    onChange={(e) => handleInputChange('ragione_sociale', e.target.value)}
                    placeholder="Es. Wedding Dreams S.r.l."
                  />
                </div>
                <div>
                  <Label htmlFor="codice_fiscale">Codice Fiscale</Label>
                  <Input
                    id="codice_fiscale"
                    value={profileData.codice_fiscale}
                    onChange={(e) => handleInputChange('codice_fiscale', e.target.value)}
                    placeholder="Es. 12345678901"
                  />
                </div>
                <div>
                  <Label htmlFor="partita_iva">Partita IVA</Label>
                  <Input
                    id="partita_iva"
                    value={profileData.partita_iva}
                    onChange={(e) => handleInputChange('partita_iva', e.target.value)}
                    placeholder="Es. 01234567890"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contatti e Info */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni di Contatto</CardTitle>
              <CardDescription>
                Dati inseriti durante la registrazione
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="info@weddingdreams.it"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefono</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+39 123 456 7890"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="website">Sito Web</Label>
                  <Input
                    id="website"
                    value={profileData.website}
                    onChange={(e) => handleInputChange('website', e.target.value)}
                    placeholder="https://www.weddingdreams.it"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Descrizione Attività</Label>
                <Textarea
                  id="description"
                  value={profileData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descrivi la tua attività e i servizi offerti..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo Aziendale</CardTitle>
              <CardDescription>
                Carica il logo della tua attività
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logo_url">URL Logo</Label>
                  <Input
                    id="logo_url"
                    value={profileData.logo_url}
                    onChange={(e) => handleInputChange('logo_url', e.target.value)}
                    placeholder="https://esempio.com/logo.png"
                  />
                </div>
                {profileData.logo_url && (
                  <div className="border rounded-lg p-4">
                    <p className="text-sm text-gray-600 mb-2">Anteprima logo:</p>
                    <img 
                      src={profileData.logo_url} 
                      alt="Logo preview" 
                      className="h-20 w-auto object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end space-x-4">
            <Button 
              variant="outline" 
              onClick={() => navigate('/vendor/dashboard')}
            >
              Annulla
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Salvataggio..." : "Salva Modifiche"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VendorProfile;
