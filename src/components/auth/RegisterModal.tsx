
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import VendorRegisterModal from "./VendorRegisterModal";

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginClick: () => void;
}

const RegisterModal = ({ isOpen, onClose, onLoginClick }: RegisterModalProps) => {
  const [activeTab, setActiveTab] = useState<'couple' | 'vendor'>('couple');
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Couple registration fields
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
  
  const handleCoupleSubmit = async (e: React.FormEvent) => {
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
        weddingDate,
        role: 'couple'
      });
      onClose();
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.message || "Si è verificato un errore durante la registrazione.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenVendorModal = () => {
    setIsVendorModalOpen(true);
  };
  
  return (
    <>
      <Dialog open={isOpen && !isVendorModalOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl text-wedding-navy text-center">Crea un account</DialogTitle>
            <DialogDescription className="text-center">
              Scegli il tipo di account che vuoi creare
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="couple" className="w-full" onValueChange={(v) => setActiveTab(v as 'couple' | 'vendor')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="couple">Sposi</TabsTrigger>
              <TabsTrigger value="vendor">Fornitori</TabsTrigger>
            </TabsList>
            
            <TabsContent value="couple" className="pt-4">
              {error && (
                <div className="bg-red-50 p-3 rounded-md text-sm text-red-800 mb-4">
                  {error}
                </div>
              )}
              
              <form onSubmit={handleCoupleSubmit} className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="vendor" className="pt-4">
              <div className="text-center">
                <h3 className="text-lg font-medium mb-2">Vuoi promuovere i tuoi servizi?</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Crea un account fornitore per poter inserire i tuoi servizi nel catalogo e farti trovare dalle coppie.
                </p>
                
                <Button 
                  onClick={handleOpenVendorModal}
                  className="w-full bg-wedding-sage text-white hover:bg-wedding-sage/90"
                >
                  Registrati come fornitore
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
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
      
      <VendorRegisterModal 
        isOpen={isVendorModalOpen} 
        onClose={() => setIsVendorModalOpen(false)}
        onLoginClick={onLoginClick}
      />
    </>
  );
};

export default RegisterModal;
