
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterClick: () => void;
}

const LoginModal = ({ isOpen, onClose, onRegisterClick }: LoginModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) {
      console.log("Login already in progress, ignoring submit");
      return;
    }
    
    setError("");
    setIsLoading(true);
    
    try {
      await login({ email, password });
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      console.error("Login modal error:", err);
      setError(err.message || "Si è verificato un errore durante il login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return; // Prevent closing during loading
    
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
          <DialogTitle className="font-serif text-2xl text-wedding-navy text-center">Benvenuto</DialogTitle>
          <DialogDescription className="text-center">
            Accedi al tuo account per continuare la pianificazione
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input 
              id="email"
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
              <Label htmlFor="password">Password</Label>
              <a href="#" className="text-xs text-wedding-blush hover:underline">
                Password dimenticata?
              </a>
            </div>
            <Input 
              id="password"
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
            className="w-full bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
            disabled={isLoading}
          >
            {isLoading ? "Accesso in corso..." : "Accedi"}
          </Button>
        </form>
        
        <div className="mt-4 text-center text-sm">
          <p>
            Non hai ancora un account?{" "}
            <button 
              onClick={onRegisterClick}
              className="text-wedding-blush hover:underline font-medium"
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

export default LoginModal;
