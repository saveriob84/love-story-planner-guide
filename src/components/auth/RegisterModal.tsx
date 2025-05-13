
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const RegisterModal = ({ isOpen, onClose, onLoginClick }: RegisterModalProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [weddingDate, setWeddingDate] = useState<Date | undefined>(undefined);
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
    
    setIsLoading(true);
    
    try {
      await register({ 
        email, 
        password, 
        name, 
        partnerName, 
        weddingDate 
      });
      onClose();
      navigate("/dashboard");
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
          <DialogTitle className="font-serif text-2xl text-wedding-navy text-center">Crea un account</DialogTitle>
          <DialogDescription className="text-center">
            Inizia a pianificare il tuo matrimonio oggi
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 p-3 rounded-md text-sm text-red-800">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reg-email">Email</Label>
            <Input 
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="la.tua.email@esempio.com"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reg-name">Il tuo nome</Label>
              <Input 
                id="reg-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Il tuo nome"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-partner-name">Nome partner</Label>
              <Input 
                id="reg-partner-name"
                type="text"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                placeholder="Il nome del/la partner"
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Data del matrimonio (se già definita)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !weddingDate && "text-muted-foreground"
                  )}
                  disabled={isLoading}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {weddingDate ? format(weddingDate, "PP") : <span>Seleziona una data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={weddingDate}
                  onSelect={setWeddingDate}
                  initialFocus
                  disabled={(date) => date < new Date()}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reg-password">Password</Label>
            <Input 
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimo 6 caratteri"
              required
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="reg-confirm-password">Conferma password</Label>
            <Input 
              id="reg-confirm-password"
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
            className="w-full bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
            disabled={isLoading}
          >
            {isLoading ? "Registrazione in corso..." : "Registrati"}
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

export default RegisterModal;
