
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface VendorLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const VendorLoginModal = ({ isOpen, onClose, onRegisterClick }: VendorLoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await login({ email, password, isVendor: true });
      onClose();
      navigate("/vendor/dashboard");
    } catch (err: any) {
      console.error("Vendor login modal error:", err);
      setError(err.message || "Si è verificato un errore durante il login.");
    } finally {
      // Always reset loading state
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form state when closing
    setEmail("");
    setPassword("");
    setError("");
    setIsLoading(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-wedding-navy text-center">Area Fornitori</DialogTitle>
          <DialogDescription className="text-center">
            Accedi al tuo account fornitore
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
            <div className="flex justify-between items-center">
              <Label htmlFor="vendor-password">Password</Label>
              <a href="#" className="text-xs text-wedding-blush hover:underline">
                Password dimenticata?
              </a>
            </div>
            <Input 
              id="vendor-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="La tua password"
              required
              disabled={isLoading}
            />
          </div>
          
          <Button 
            type="submit"
            className="w-full bg-wedding-navy text-white hover:bg-wedding-navy/90"
            disabled={isLoading}
          >
            {isLoading ? "Accesso in corso..." : "Accedi come Fornitore"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Non hai ancora un account fornitore?{" "}
            <button 
              onClick={onRegisterClick}
              className="text-wedding-navy hover:underline font-medium"
              type="button"
              disabled={isLoading}
            >
              Registrati
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorLoginModal;
