
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";

interface VendorRegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const VendorRegisterModal = ({ isOpen, onClose, onLoginClick }: VendorRegisterModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validation
    if (password !== confirmPassword) {
      setError("Le password non corrispondono");
      return;
    }
    
    if (password.length < 6) {
      setError("La password deve essere di almeno 6 caratteri");
      return;
    }

    if (!businessName) {
      setError("Il nome dell'attività è obbligatorio");
      return;
    }
    
    setIsLoading(true);
    
    try {
      await register({ 
        email, 
        password, 
        role: 'vendor',
        businessName
      });
      onClose();
      navigate("/vendor-dashboard");
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante la registrazione.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-wedding-navy text-center">Registrazione Fornitore</DialogTitle>
          <DialogDescription className="text-center">
            Crea un account per promuovere i tuoi servizi
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vendor-email">Email</Label>
            <Input 
              id="vendor-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la.tua.email@esempio.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-business-name">Nome attività</Label>
            <Input 
              id="vendor-business-name"
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Nome della tua attività"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-description">Descrizione attività</Label>
            <Textarea 
              id="vendor-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Breve descrizione della tua attività"
              className="resize-none h-20"
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor-phone">Telefono</Label>
              <Input 
                id="vendor-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+39 123 456 7890"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="vendor-website">Sito web</Label>
              <Input 
                id="vendor-website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="www.tuosito.it"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-password">Password</Label>
            <Input 
              id="vendor-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caratteri"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="vendor-confirm-password">Conferma password</Label>
            <Input 
              id="vendor-confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Conferma la password"
              required
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-wedding-sage text-white hover:bg-wedding-sage/90"
            disabled={isLoading}
          >
            {isLoading ? "Registrazione in corso..." : "Registrati come fornitore"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Hai già un account?{" "}
            <button 
              onClick={onLoginClick}
              className="text-wedding-blush hover:underline font-medium"
              type="button"
            >
              Accedi
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorRegisterModal;
