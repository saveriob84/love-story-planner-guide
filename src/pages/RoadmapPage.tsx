
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layouts/MainLayout';
import { useAuth } from '@/contexts/auth/AuthContext';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { useVendorServices } from '@/hooks/useVendorServices';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, MapPin, Euro, Phone, Mail, Globe } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { ServiceCategory, VendorService } from '@/types/auth';

const RoadmapPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const { categories, loading: loadingCategories } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { services, loading: loadingServices } = useVendorServices(selectedCategory || undefined);

  // Redirect if not authenticated
  if (!loading && !isAuthenticated) {
    navigate('/');
    return null;
  }

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Roadmap del matrimonio
          </h1>
          <p className="text-gray-500 mt-2">
            Scegli i fornitori per organizzare il tuo matrimonio passo dopo passo
          </p>
        </div>

        {loadingCategories ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-64 w-full" />
              ))}
            </div>
          </div>
        ) : (
          <Tabs 
            defaultValue={categories[0]?.id} 
            className="w-full"
            onValueChange={(value) => handleCategorySelect(value)}
          >
            <TabsList className="mb-6 flex overflow-auto pb-2">
              {categories.map((category) => (
                <TabsTrigger 
                  key={category.id} 
                  value={category.id}
                  className="min-w-fit"
                >
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map((category) => (
              <TabsContent key={category.id} value={category.id}>
                <div className="mb-6">
                  <h2 className="font-serif text-2xl font-bold text-wedding-navy mb-2">
                    {category.name}
                  </h2>
                  {category.description && (
                    <p className="text-gray-500">{category.description}</p>
                  )}
                </div>

                {loadingServices ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-64 w-full" />
                    ))}
                  </div>
                ) : services.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {services.map((service) => (
                      <ServiceCard key={service.id} service={service} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4 border border-dashed rounded-lg">
                    <h3 className="text-xl font-medium text-wedding-navy mb-2">
                      Nessun servizio disponibile
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Non ci sono ancora fornitori in questa categoria.
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};

// Service Card Component
const ServiceCard = ({ service }: { service: VendorService }) => {
  return (
    <Card className="overflow-hidden">
      <div className="w-full h-48 relative">
        {service.images && service.images.length > 0 ? (
          <AspectRatio ratio={16/9}>
            <img
              src={service.images[0].imageUrl}
              alt={service.name}
              className="object-cover w-full h-full"
            />
          </AspectRatio>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
            Nessuna immagine disponibile
          </div>
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-wedding-navy">{service.name}</CardTitle>
        <CardDescription>{service.vendorId}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {service.description && (
          <p className="text-sm text-gray-500 line-clamp-2">{service.description}</p>
        )}
        {(service.city || service.address) && (
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5 text-wedding-blush" />
            <span className="text-sm">
              {service.city && service.address 
                ? `${service.address}, ${service.city}` 
                : service.city || service.address}
            </span>
          </div>
        )}
        {(service.priceMin || service.priceMax) && (
          <div className="flex items-start gap-2">
            <Euro className="h-4 w-4 mt-0.5 text-wedding-blush" />
            <span className="text-sm">
              {service.priceMin && service.priceMax 
                ? `€${service.priceMin} - €${service.priceMax}` 
                : service.priceMin 
                  ? `Da €${service.priceMin}` 
                  : `Fino a €${service.priceMax}`}
            </span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Mail className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-full">
            <Globe className="h-4 w-4" />
          </Button>
        </div>
        <Button size="sm" className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90">
          Dettagli <ChevronRight className="ml-1 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RoadmapPage;
