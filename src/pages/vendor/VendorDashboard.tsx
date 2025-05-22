
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Layout, Store, Package, Settings } from "lucide-react";

const VendorDashboard = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect if user is not authenticated or not a vendor
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'vendor')) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-wedding-navy"></div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'vendor') {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-wedding-navy text-white py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Fornitore</h1>
            <p className="text-gray-200">Benvenuto, {user.name || 'Fornitore'}</p>
          </div>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <Button variant="outline" className="text-white border-white hover:bg-white/10">
              Il tuo profilo
            </Button>
            <Button variant="outline" className="text-white border-white hover:bg-white/10" onClick={() => navigate('/')}>
              Vai al sito
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Store className="mr-2 h-6 w-6" />
                Gestione Servizi
              </CardTitle>
              <CardDescription>
                Gestisci i tuoi servizi e le informazioni visualizzate ai clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Gestisci Servizi</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layout className="mr-2 h-6 w-6" />
                Il Tuo Profilo
              </CardTitle>
              <CardDescription>
                Modifica le informazioni sulla tua attività
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Modifica Profilo</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="mr-2 h-6 w-6" />
                Offerte Speciali
              </CardTitle>
              <CardDescription>
                Crea offerte speciali per i tuoi clienti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Gestisci Offerte</Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="mr-2 h-6 w-6" />
                Impostazioni Account
              </CardTitle>
              <CardDescription>
                Gestisci le impostazioni del tuo account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Impostazioni</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default VendorDashboard;
