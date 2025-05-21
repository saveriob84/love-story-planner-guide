
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth/AuthContext';
import MainLayout from '@/components/layouts/MainLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { useVendorServices } from '@/hooks/useVendorServices';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Globe, Mail, Phone } from 'lucide-react';

const RoadmapPage = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { categories, loading: isLoadingCategories } = useServiceCategories();
  const { services, loading: isLoadingServices } = useVendorServices(activeCategory);
  
  useEffect(() => {
    // Redirect if not authenticated
    if (!loading && !isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate]);

  useEffect(() => {
    // Set the first category as active when categories are loaded
    if (categories && categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0].id);
    }
  }, [categories, activeCategory]);

  if (loading || isLoadingCategories) {
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
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">Roadmap</h1>
          <p className="text-gray-500 mt-2">
            Scopri e contatta i fornitori per realizzare il matrimonio dei tuoi sogni
          </p>
        </div>

        {/* Categories Tabs */}
        <div className="mb-8">
          <div className="flex overflow-x-auto pb-2 scrollbar-hide">
            <div className="flex space-x-2">
              {categories?.map((category) => (
                <Button
                  key={category.id}
                  variant={activeCategory === category.id ? "default" : "outline"}
                  className={
                    activeCategory === category.id
                      ? "bg-wedding-sage text-white hover:bg-wedding-sage/90"
                      : "text-gray-600"
                  }
                  onClick={() => setActiveCategory(category.id)}
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        {isLoadingServices ? (
          <div className="text-center py-12">
            <p>Caricamento servizi...</p>
          </div>
        ) : services && services.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">Nessun fornitore disponibile per questa categoria.</p>
            {user?.role === 'vendor' && (
              <Button
                className="mt-4 bg-wedding-sage text-white hover:bg-wedding-sage/90"
                onClick={() => navigate('/vendor-dashboard')}
              >
                Aggiungi il tuo servizio
              </Button>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

// ServiceCard component for displaying individual services
const ServiceCard = ({ service }) => {
  // Format price range for display
  const formatPrice = () => {
    if (service.price_min && service.price_max) {
      return `€${service.price_min} - €${service.price_max}`;
    } else if (service.price_min) {
      return `da €${service.price_min}`;
    } else if (service.price_max) {
      return `fino a €${service.price_max}`;
    }
    return 'Prezzo su richiesta';
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-48 relative">
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">Immagine non disponibile</span>
        </div>
      </div>
      <CardHeader>
        <CardTitle className="text-wedding-navy">{service.name}</CardTitle>
        <CardDescription>{service.business_name || "Fornitore"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        {service.description && (
          <p className="text-gray-600 line-clamp-2">{service.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2">
          {service.city && (
            <Badge variant="outline" className="text-xs">
              {service.city}
            </Badge>
          )}
          <Badge variant="secondary" className="text-xs">
            {formatPrice()}
          </Badge>
        </div>
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
