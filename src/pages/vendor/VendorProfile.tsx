
import { useEffect } from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useVendorProfile } from "@/hooks/vendor/useVendorProfile";
import VendorProfileHeader from "@/components/vendor/VendorProfileHeader";
import VendorBusinessInfoCard from "@/components/vendor/VendorBusinessInfoCard";
import VendorContactInfoCard from "@/components/vendor/VendorContactInfoCard";
import VendorLogoCard from "@/components/vendor/VendorLogoCard";

const VendorProfile = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const navigate = useNavigate();
  const {
    profileData,
    isLoading,
    isSaving,
    handleInputChange,
    handleSave
  } = useVendorProfile(user?.id);

  // Redirect if user is not authenticated or not a vendor
  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== 'vendor')) {
      navigate('/');
    }
  }, [isAuthenticated, loading, navigate, user]);

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
      <VendorProfileHeader onLogout={logout} />

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <VendorBusinessInfoCard 
            profileData={profileData}
            onInputChange={handleInputChange}
          />

          <VendorContactInfoCard 
            profileData={profileData}
            onInputChange={handleInputChange}
          />

          <VendorLogoCard 
            profileData={profileData}
            onInputChange={handleInputChange}
          />

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
