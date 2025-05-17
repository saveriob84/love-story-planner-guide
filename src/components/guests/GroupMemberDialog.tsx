
import { useState } from "react";
import { Guest, GroupMember } from "@/types/guest";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UserPlus, X, Baby } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

interface GroupMemberDialogProps {
  guest: Guest | null;
  onClose: () => void;
  onUpdateGuest: (id: string, updates: Partial<Guest>) => void;
}

const GroupMemberDialog = ({ guest, onClose, onUpdateGuest }: GroupMemberDialogProps) => {
  const [editGroupMember, setEditGroupMember] = useState({
    name: "",
    dietaryRestrictions: "",
    isChild: false
  });

  const handleEditGroupMember = () => {
    if (guest && editGroupMember.name.trim()) {
      const updatedGuest = { ...guest };
      updatedGuest.groupMembers.push({
        id: crypto.randomUUID(), // Use proper UUID format for compatibility with database
        name: editGroupMember.name,
        dietaryRestrictions: editGroupMember.dietaryRestrictions,
        isChild: editGroupMember.isChild
      });
      onUpdateGuest(guest.id, updatedGuest);
      setEditGroupMember({ name: "", dietaryRestrictions: "", isChild: false });
    }
  };

  const handleRemoveEditGroupMember = (guestId: string, memberId: string) => {
    if (guest) {
      const updatedGuest = { ...guest };
      updatedGuest.groupMembers = updatedGuest.groupMembers.filter(
        member => member.id !== memberId
      );
      onUpdateGuest(guestId, updatedGuest);
    }
  };

  return (
    <Dialog open={!!guest} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica membri del gruppo: {guest?.name}</DialogTitle>
          <DialogDescription>Aggiungi o rimuovi membri del gruppo e specifica se sono bambini.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {guest?.groupMembers.length ? (
            <div className="space-y-2">
              {guest.groupMembers.map(member => (
                <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{member.name}</p>
                      {member.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                    </div>
                    {member.dietaryRestrictions && (
                      <p className="text-sm text-gray-500">Dieta: {member.dietaryRestrictions}</p>
                    )}
                    {member.isChild && (
                      <p className="text-sm text-blue-500">Menù bambino</p>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveEditGroupMember(guest.id, member.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Nessun membro aggiunto.</p>
          )}

          <div className="border-t pt-4 mt-4">
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="editMemberName">Nome</Label>
                <Input
                  id="editMemberName"
                  value={editGroupMember.name}
                  onChange={(e) => setEditGroupMember({...editGroupMember, name: e.target.value})}
                  placeholder="Nome membro"
                />
              </div>
              <div>
                <Label htmlFor="editMemberDiet">Restrizioni alimentari</Label>
                <Input
                  id="editMemberDiet"
                  value={editGroupMember.dietaryRestrictions}
                  onChange={(e) => setEditGroupMember(
                    {...editGroupMember, dietaryRestrictions: e.target.value}
                  )}
                  placeholder="Vegetariano, allergie, ecc."
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="editChildMenu" 
                  checked={editGroupMember.isChild} 
                  onCheckedChange={(checked) => setEditGroupMember({
                    ...editGroupMember,
                    isChild: checked === true ? true : false
                  })} 
                />
                <Label htmlFor="editChildMenu" className="flex items-center">
                  <Baby className="h-4 w-4 mr-1 text-blue-500" /> 
                  Bambino / Menù bambino
                </Label>
              </div>
            </div>
            
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={handleEditGroupMember}
            >
              <UserPlus className="h-4 w-4 mr-2" /> 
              Aggiungi membro
            </Button>
          </div>

          <div className="flex justify-end mt-6">
            <DialogClose asChild>
              <Button variant="outline">Chiudi</Button>
            </DialogClose>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMemberDialog;
