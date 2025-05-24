
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VendorProfileHeaderProps {
  onLogout: () => void;
}

const VendorProfileHeader = ({ onLogout }: VendorProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
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
          onClick={onLogout}
          className="mt-4 md:mt-0 text-white border-white hover:bg-white/10"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>
    </header>
  );
};

export default VendorProfileHeader;
