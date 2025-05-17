import { useState, FormEvent } from 'react';
import MainLayout from "@/components/layouts/MainLayout";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    partnerName: user?.partnerName || '',
  });
  
  const [weddingDate, setWeddingDate] = useState<Date | undefined>(
    user?.weddingDate ? new Date(user.weddingDate) : undefined
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      updateUser({
        ...formData,
        weddingDate: weddingDate,
      });
      
      toast({
        title: "Profilo aggiornato",
        description: "Le tue informazioni sono state salvate con successo.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Non è stato possibile aggiornare il profilo.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Il tuo profilo
          </h1>
          <p className="text-gray-500 mt-2">
            Gestisci le informazioni del tuo account e del tuo matrimonio
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-wedding-navy mb-4">
                Informazioni personali
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Il tuo nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Il tuo nome"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="partnerName">Nome del partner</Label>
                    <Input
                      id="partnerName"
                      value={formData.partnerName}
                      onChange={(e) => setFormData({ ...formData, partnerName: e.target.value })}
                      placeholder="Il nome del tuo partner"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Data del matrimonio</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !weddingDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {weddingDate ? format(weddingDate, "PP") : <span>Seleziona una data</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={weddingDate}
                        onSelect={setWeddingDate}
                        disabled={(date) => date < new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <Button 
                  type="submit" 
                  className="bg-wedding-blush text-wedding-navy hover:bg-wedding-blush/90"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Salvataggio..." : "Salva modifiche"}
                </Button>
              </form>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm mt-6">
              <h2 className="font-serif text-xl font-semibold text-wedding-navy mb-4">
                Account
              </h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-700 mt-1">{user?.email}</p>
                </div>
                
                <Separator />
                
                <div>
                  <Label>Password</Label>
                  <p className="text-gray-700 mt-1">••••••••</p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-wedding-blush"
                  >
                    Cambia password
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h2 className="font-serif text-xl font-semibold text-wedding-navy mb-4">
                Il tuo matrimonio
              </h2>
              
              {weddingDate ? (
                <div className="text-center">
                  <div className="bg-wedding-blush/10 py-4 px-6 rounded-lg mb-4">
                    <p className="text-sm uppercase text-wedding-navy/70 font-medium">
                      Data del matrimonio
                    </p>
                    <p className="font-serif text-2xl font-bold text-wedding-navy mt-1">
                      {format(weddingDate, "d MMMM yyyy")}
                    </p>
                  </div>
                  
                  <div className="bg-wedding-sage/10 py-3 px-4 rounded-lg">
                    <p className="text-sm text-wedding-navy/70">Mancano</p>
                    <p className="font-serif text-3xl font-bold text-wedding-navy mt-1">
                      {Math.max(0, Math.floor((weddingDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))}
                    </p>
                    <p className="text-sm text-wedding-navy/70">giorni</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">
                    Imposta la data del tuo matrimonio per visualizzare il conto alla rovescia!
                  </p>
                </div>
              )}
              
              <Separator className="my-6" />
              
              <div>
                <h3 className="font-medium mb-2">Progressi</h3>
                <div className="bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-wedding-blush h-full rounded-full" style={{ width: '25%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  25% della pianificazione completata
                </p>
              </div>
              
              <div className="mt-6">
                <Button 
                  variant="outline" 
                  className="w-full border-wedding-blush text-wedding-blush hover:bg-wedding-blush/5"
                  onClick={() => window.location.href = '/checklist'}
                >
                  Vai alla checklist
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
