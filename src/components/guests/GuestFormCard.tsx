import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { GroupMember } from "@/types/guest";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, UserPlus, X, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
interface GuestFormCardProps {
  onAddGuest: (guestData: {
    name: string;
    email: string;
    phone: string;
    relationship: string;
    plusOne: boolean;
    dietaryRestrictions: string;
    notes: string;
    groupMembers: GroupMember[];
  }) => void;
}
const GuestFormCard = ({
  onAddGuest
}: GuestFormCardProps) => {
  const {
    toast
  } = useToast();
  const [newGuest, setNewGuest] = useState({
    name: "",
    email: "",
    phone: "",
    relationship: "amici",
    plusOne: false,
    dietaryRestrictions: "",
    notes: "",
    groupMembers: [] as GroupMember[]
  });
  const [tempGroupMember, setTempGroupMember] = useState({
    name: "",
    dietaryRestrictions: "",
    isChild: false
  });

  // Aggiungi membro al gruppo temporaneo
  const handleAddGroupMember = () => {
    if (tempGroupMember.name.trim()) {
      setNewGuest({
        ...newGuest,
        groupMembers: [...newGuest.groupMembers, {
          id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: tempGroupMember.name,
          dietaryRestrictions: tempGroupMember.dietaryRestrictions,
          isChild: tempGroupMember.isChild
        }]
      });
      setTempGroupMember({
        name: "",
        dietaryRestrictions: "",
        isChild: false
      });
    }
  };

  // Rimuovi membro dal gruppo temporaneo
  const handleRemoveGroupMember = (id: string) => {
    setNewGuest({
      ...newGuest,
      groupMembers: newGuest.groupMembers.filter(member => member.id !== id)
    });
  };
  const handleAddGuest = () => {
    if (!newGuest.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome dell'ospite è obbligatorio.",
        variant: "destructive"
      });
      return;
    }

    // Call the onAddGuest function without checking its return value
    onAddGuest(newGuest);

    // Reset form after adding guest
    setNewGuest({
      name: "",
      email: "",
      phone: "",
      relationship: "amici",
      plusOne: false,
      dietaryRestrictions: "",
      notes: "",
      groupMembers: []
    });

    // Show success toast
    toast({
      title: "Ospite aggiunto",
      description: "L'ospite è stato aggiunto con successo."
    });
  };
  return <Card className="mb-8">
      <CardHeader>
        <CardTitle>Aggiungi nuovo ospite</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="name">Nome e Cognome*</Label>
            <Input id="name" value={newGuest.name} onChange={e => setNewGuest({
            ...newGuest,
            name: e.target.value
          })} placeholder="Nome Cognome" required />
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={newGuest.email} onChange={e => setNewGuest({
            ...newGuest,
            email: e.target.value
          })} placeholder="email@esempio.com" />
          </div>
          
          <div>
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" value={newGuest.phone} onChange={e => setNewGuest({
            ...newGuest,
            phone: e.target.value
          })} placeholder="+39 123 456 7890" />
          </div>
          
          <div>
            <Label htmlFor="relationship">Relazione</Label>
            <Select value={newGuest.relationship} onValueChange={value => setNewGuest({
            ...newGuest,
            relationship: value
          })}>
              <SelectTrigger>
                <SelectValue placeholder="Seleziona..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="famiglia-sposo">Famiglia Sposo</SelectItem>
                <SelectItem value="famiglia-sposa">Famiglia Sposa</SelectItem>
                <SelectItem value="amici">Amici</SelectItem>
                <SelectItem value="colleghi">Colleghi</SelectItem>
                <SelectItem value="altro">Altro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center space-x-2 mt-8">
            <input type="checkbox" id="plusOne" checked={newGuest.plusOne} onChange={e => setNewGuest({
            ...newGuest,
            plusOne: e.target.checked
          })} className="h-4 w-4 rounded border-gray-300" />
            <Label htmlFor="plusOne">Permetti accompagnatore (+1)</Label>
          </div>
        </div>
        
        <div className="mt-4">
          <Label htmlFor="dietaryRestrictions">Restrizioni alimentari</Label>
          <Input id="dietaryRestrictions" value={newGuest.dietaryRestrictions} onChange={e => setNewGuest({
          ...newGuest,
          dietaryRestrictions: e.target.value
        })} placeholder="Vegetariano, allergie, ecc." />
        </div>
        
        <div className="mt-4">
          <Label htmlFor="notes">Note</Label>
          <Input id="notes" value={newGuest.notes} onChange={e => setNewGuest({
          ...newGuest,
          notes: e.target.value
        })} placeholder="Note aggiuntive" />
        </div>

        {/* Membri del gruppo */}
        <div className="mt-6">
          <div className="flex justify-between items-center mb-2">
            <Label>Membri del gruppo</Label>
          </div>
          
          <div className="border rounded-md p-4">
            {newGuest.groupMembers.length > 0 ? <div className="space-y-3 mb-4">
                {newGuest.groupMembers.map(member => <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <div className="flex items-center">
                        <p className="font-medium">{member.name}</p>
                        {member.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                      </div>
                      {member.dietaryRestrictions && <p className="text-sm text-gray-500">
                        Dieta: {member.dietaryRestrictions}
                      </p>}
                      {member.isChild && <p className="text-sm text-blue-500">
                        Menù bambino
                      </p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleRemoveGroupMember(member.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>)}
              </div> : <p className="text-gray-500 text-sm mb-4">Aggiungi membri del gruppo (famiglia, bambini, ecc.)</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="memberName">Nome</Label>
                <div className="flex space-x-2">
                  <Input id="memberName" value={tempGroupMember.name} onChange={e => setTempGroupMember({
                  ...tempGroupMember,
                  name: e.target.value
                })} placeholder="Nome membro" />
                </div>
              </div>
              <div>
                <Label htmlFor="memberDiet">Restrizioni alimentari</Label>
                <Input id="memberDiet" value={tempGroupMember.dietaryRestrictions} onChange={e => setTempGroupMember({
                ...tempGroupMember,
                dietaryRestrictions: e.target.value
              })} placeholder="Vegetariano, allergie, ecc." />
              </div>
            </div>

            <div className="flex items-center space-x-2 mt-4">
              <Checkbox id="childMenu" checked={tempGroupMember.isChild} onCheckedChange={checked => setTempGroupMember({
              ...tempGroupMember,
              isChild: checked === true ? true : false
            })} />
              <Label htmlFor="childMenu" className="flex items-center">
                <Baby className="h-4 w-4 mr-1 text-blue-500" /> 
                Bambino / Menù bambino
              </Label>
            </div>
            
            <Button variant="outline" size="sm" className="mt-4" onClick={handleAddGroupMember}>
              <UserPlus className="h-4 w-4 mr-2" /> 
              Aggiungi membro
            </Button>
          </div>
        </div>
        
        <Button onClick={handleAddGuest} className="mt-6 text-zinc-950 bg-[#ee4444]/[0.84]">
          <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi ospite
        </Button>
      </CardContent>
    </Card>;
};
export default GuestFormCard;