
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/auth/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Settings, List, CalendarIcon, PenTool } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Vendor, VendorService } from '@/types/auth';

const VendorDashboardPage = () => {
  const { user, isAuthenticated, loading, isVendor } = useAuth();
  const navigate = useNavigate();
  const [vendorProfile, setVendorProfile] = useState<Vendor | null>(null);
  const [services, setServices] = useState<VendorService[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingServices, setLoadingServices] = useState(true);
  
  useEffect(() => {
    const checkUserAndRedirect = async () => {
      if (!loading && isAuthenticated) {
        const isUserVendor = await isVendor();
        if (!isUserVendor) {
          navigate('/');
        }
      } else if (!loading && !isAuthenticated) {
        navigate('/');
      }
    };
    
    checkUserAndRedirect();
  }, [isAuthenticated, loading, isVendor, navigate]);
  
  useEffect(() => {
    const fetchVendorProfile = async () => {
      if (!user?.id) return;
      
      try {
        setLoadingProfile(true);
        const { data, error } = await supabase
          .from('vendors')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          setVendorProfile({
            id: data.id,
            userId: data.user_id,
            businessName: data.business_name,
            description: data.description || undefined,
            email: data.email,
            phone: data.phone || undefined,
            website: data.website || undefined,
            address: data.address || undefined,
            city: data.city || undefined,
            postalCode: data.postal_code || undefined,
            logoUrl: data.logo_url || undefined
          });
          
          // Fetch services for this vendor
          const { data: servicesData, error: servicesError } = await supabase
            .from('vendor_services')
            .select(`
              *,
              service_images (*)
            `)
            .eq('vendor_id', data.id);
            
          if (servicesError) throw servicesError;
          
          if (servicesData) {
            setServices(servicesData.map(item => ({
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
              })) || []
            })));
          }
        }
      } catch (error) {
        console.error('Error fetching vendor profile:', error);
      } finally {
        setLoadingProfile(false);
        setLoadingServices(false);
      }
    };
    
    fetchVendorProfile();
  }, [user?.id]);
  
  if (loading || loadingProfile) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p>Caricamento...</p>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Dashboard Fornitore
          </h1>
          {vendorProfile && (
            <p className="text-gray-500 mt-2">
              Benvenuto, {vendorProfile.businessName}
            </p>
          )}
        </div>
        
        <Tabs defaultValue="services" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="services" className="flex items-center gap-2">
              <List className="h-4 w-4" /> Servizi
            </TabsTrigger>
            <TabsTrigger value="calendar" className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" /> Calendario
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Settings className="h-4 w-4" /> Profilo
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="services">
            <div className="mb-6 flex justify-between items-center">
              <h2 className="font-serif text-2xl font-bold text-wedding-navy">I tuoi servizi</h2>
              <Button className="bg-wedding-sage hover:bg-wedding-sage/90">
                <PlusCircle className="h-4 w-4 mr-2" /> Nuovo servizio
              </Button>
            </div>
            
            {loadingServices ? (
              <p>Caricamento servizi...</p>
            ) : services.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((service) => (
                  <Card key={service.id}>
                    <div className="w-full h-40 bg-gray-100 relative">
                      {service.images && service.images.length > 0 ? (
                        <img
                          src={service.images[0].imageUrl}
                          alt={service.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <PenTool className="h-10 w-10 text-gray-300" />
                        </div>
                      )}
                      <Button 
                        size="icon"
                        variant="ghost"
                        className="absolute top-2 right-2 bg-white/80 hover:bg-white"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                    <CardHeader>
                      <CardTitle>{service.name}</CardTitle>
                      {service.description && (
                        <CardDescription className="line-clamp-2">{service.description}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm">
                        {service.city && <span className="block">Località: {service.city}</span>}
                        {(service.priceMin || service.priceMax) && (
                          <span className="block">
                            Prezzo: {service.priceMin && `da €${service.priceMin}`} 
                            {service.priceMin && service.priceMax && ' '}
                            {service.priceMax && `fino a €${service.priceMax}`}
                          </span>
                        )}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full">
                        Modifica servizio
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle>Nessun servizio</CardTitle>
                  <CardDescription>
                    Non hai ancora aggiunto nessun servizio da promuovere
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500">
                    Aggiungi il tuo primo servizio per iniziare a promuoverlo alle coppie
                  </p>
                </CardContent>
                <CardFooter>
                  <Button className="bg-wedding-sage hover:bg-wedding-sage/90 w-full">
                    <PlusCircle className="h-4 w-4 mr-2" /> Crea il tuo primo servizio
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="calendar">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-wedding-navy">Calendario</h2>
              <p className="text-gray-500 mt-2">
                Questa funzionalità sarà disponibile prossimamente
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="profile">
            <div className="mb-6">
              <h2 className="font-serif text-2xl font-bold text-wedding-navy">Profilo</h2>
            </div>
            
            {vendorProfile && (
              <Card>
                <CardHeader>
                  <CardTitle>{vendorProfile.businessName}</CardTitle>
                  {vendorProfile.description && (
                    <CardDescription>{vendorProfile.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Email</h3>
                      <p>{vendorProfile.email}</p>
                    </div>
                    {vendorProfile.phone && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-1">Telefono</h3>
                        <p>{vendorProfile.phone}</p>
                      </div>
                    )}
                  </div>
                  
                  {vendorProfile.website && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Sito web</h3>
                      <p>{vendorProfile.website}</p>
                    </div>
                  )}
                  
                  {(vendorProfile.address || vendorProfile.city) && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Indirizzo</h3>
                      <p>
                        {vendorProfile.address}
                        {vendorProfile.address && vendorProfile.city && ', '}
                        {vendorProfile.city}
                        {(vendorProfile.address || vendorProfile.city) && vendorProfile.postalCode && ' '}
                        {vendorProfile.postalCode}
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
                    <Settings className="h-4 w-4 mr-2" /> Modifica profilo
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default VendorDashboardPage;
