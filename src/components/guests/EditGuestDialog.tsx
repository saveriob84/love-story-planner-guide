
import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditGuestDialogProps {
  guest: Guest | null;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Guest>) => void;
}

const EditGuestDialog = ({ guest, onClose, onUpdate }: EditGuestDialogProps) => {
  const [editedGuest, setEditedGuest] = useState<Partial<Guest>>({});

  // Initialize form when guest changes - fixed to use useEffect instead of useState
  useEffect(() => {
    if (guest) {
      setEditedGuest({ ...guest });
    }
  }, [guest]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (guest && editedGuest) {
      onUpdate(guest.id, editedGuest);
      onClose();
    }
  };

  if (!guest) return null;

  return (
    <Dialog open={!!guest} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Modifica Ospite</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input 
                id="name"
                value={editedGuest.name || guest.name} 
                onChange={(e) => setEditedGuest({...editedGuest, name: e.target.value})}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="relationship">Relazione</Label>
              <Select 
                value={editedGuest.relationship || guest.relationship}
                onValueChange={(value) => setEditedGuest({...editedGuest, relationship: value})}
              >
                <SelectTrigger id="relationship">
                  <SelectValue placeholder="Seleziona..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="amico-sposo">Amico Sposo</SelectItem>
                  <SelectItem value="amico-sposa">Amico Sposa</SelectItem>
                  <SelectItem value="parente-sposo">Parente Sposo</SelectItem>
                  <SelectItem value="parente-sposa">Parente Sposa</SelectItem>
                  <SelectItem value="collega">Collega</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email" 
                value={editedGuest.email || guest.email || ''} 
                onChange={(e) => setEditedGuest({...editedGuest, email: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input 
                id="phone"
                value={editedGuest.phone || guest.phone || ''} 
                onChange={(e) => setEditedGuest({...editedGuest, phone: e.target.value})}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="dietary">Restrizioni alimentari</Label>
              <Input 
                id="dietary"
                value={editedGuest.dietaryRestrictions || guest.dietaryRestrictions || ''} 
                onChange={(e) => setEditedGuest({...editedGuest, dietaryRestrictions: e.target.value})}
              />
            </div>
            
            <div className="space-y-2 col-span-2">
              <Label htmlFor="notes">Note</Label>
              <Input 
                id="notes"
                value={editedGuest.notes || guest.notes || ''} 
                onChange={(e) => setEditedGuest({...editedGuest, notes: e.target.value})}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Annulla</Button>
            <Button type="submit">Salva Modifiche</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EditGuestDialog;
