
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlusCircle, Search, Users, UserCheck, UserX, Mail, UserPlus, X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog";

// Guest interface
interface GroupMember {
  id: string;
  name: string;
  dietaryRestrictions?: string;
}

interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  rsvp: "pending" | "confirmed" | "declined";
  plusOne: boolean;
  dietaryRestrictions: string;
  notes: string;
  groupMembers: GroupMember[];  // Aggiungiamo i membri del gruppo
}

const GuestsPage = () => {
  const { user } = useAuth();
  const [guests, setGuests] = useState<Guest[]>(() => {
    // Try to load from localStorage
    const savedGuests = localStorage.getItem(`wedding_guests_${user?.id}`);
    return savedGuests ? JSON.parse(savedGuests) : [];
  });
  
  const [searchTerm, setSearchTerm] = useState("");
  
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
    dietaryRestrictions: ""
  });
  
  // Save guests to localStorage whenever the list changes
  useEffect(() => {
    if (user?.id) {
      localStorage.setItem(`wedding_guests_${user.id}`, JSON.stringify(guests));
    }
  }, [guests, user?.id]);

  // Aggiungi membro al gruppo temporaneo
  const handleAddGroupMember = () => {
    if (tempGroupMember.name.trim()) {
      setNewGuest({
        ...newGuest,
        groupMembers: [
          ...newGuest.groupMembers,
          {
            id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            name: tempGroupMember.name,
            dietaryRestrictions: tempGroupMember.dietaryRestrictions
          }
        ]
      });
      setTempGroupMember({ name: "", dietaryRestrictions: "" });
    }
  };

  // Rimuovi membro dal gruppo temporaneo
  const handleRemoveGroupMember = (id: string) => {
    setNewGuest({
      ...newGuest,
      groupMembers: newGuest.groupMembers.filter(member => member.id !== id)
    });
  };
  
  // Add new guest
  const handleAddGuest = () => {
    if (newGuest.name) {
      const guest: Guest = {
        id: `guest-${Date.now()}`,
        name: newGuest.name,
        email: newGuest.email,
        phone: newGuest.phone,
        relationship: newGuest.relationship,
        rsvp: "pending",
        plusOne: newGuest.plusOne,
        dietaryRestrictions: newGuest.dietaryRestrictions,
        notes: newGuest.notes,
        groupMembers: newGuest.groupMembers
      };
      
      setGuests([...guests, guest]);
      
      // Reset form
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
    }
  };

  // Update guest
  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(guests.map(guest => 
      guest.id === id ? { ...guest, ...updates } : guest
    ));
  };

  // Remove guest
  const removeGuest = (id: string) => {
    if (confirm("Sei sicuro di voler rimuovere questo ospite?")) {
      setGuests(guests.filter(guest => guest.id !== id));
    }
  };

  // Edit group members
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [editGroupMember, setEditGroupMember] = useState({
    name: "",
    dietaryRestrictions: ""
  });

  const handleEditGroupMember = () => {
    if (editingGuest && editGroupMember.name.trim()) {
      const updatedGuest = { ...editingGuest };
      updatedGuest.groupMembers.push({
        id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: editGroupMember.name,
        dietaryRestrictions: editGroupMember.dietaryRestrictions
      });
      updateGuest(editingGuest.id, updatedGuest);
      setEditGroupMember({ name: "", dietaryRestrictions: "" });
    }
  };

  const handleRemoveEditGroupMember = (guestId: string, memberId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (guest) {
      const updatedGuest = { ...guest };
      updatedGuest.groupMembers = updatedGuest.groupMembers.filter(
        member => member.id !== memberId
      );
      updateGuest(guestId, updatedGuest);
    }
  };
  
  // Filter guests based on search and tab
  const filteredGuests = (rsvpFilter?: Guest["rsvp"]) => {
    return guests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
      return rsvpFilter 
        ? matchesSearch && guest.rsvp === rsvpFilter
        : matchesSearch;
    });
  };
  
  // Guest statistics
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.rsvp === "confirmed").length;
  const pendingGuests = guests.filter(g => g.rsvp === "pending").length;
  const declinedGuests = guests.filter(g => g.rsvp === "declined").length;
  
  // Plus ones and group members calculation
  const totalGroupMembers = guests.reduce((total, guest) => {
    return total + (guest.rsvp === "confirmed" ? guest.groupMembers.length : 0);
  }, 0);

  const plusOnes = guests.reduce((total, guest) => {
    return total + (guest.plusOne && guest.rsvp === "confirmed" ? 1 : 0);
  }, 0);
  
  // Total attending
  const totalAttending = confirmedGuests + plusOnes + totalGroupMembers;

  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Lista Ospiti
          </h1>
          <p className="text-gray-500 mt-2">
            Gestisci gli invitati al tuo matrimonio
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Totale Invitati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-wedding-navy mr-2" />
                <span className="text-3xl font-bold text-wedding-navy">{totalGuests}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">nuclei familiari/singoli</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Confermati</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserCheck className="h-5 w-5 text-green-600 mr-2" />
                <span className="text-3xl font-bold text-green-600">{confirmedGuests}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {totalAttending} persone in totale
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">In Attesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Users className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-3xl font-bold text-amber-500">{pendingGuests}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">risposte attese</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Non Partecipanti</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <UserX className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-3xl font-bold text-red-500">{declinedGuests}</span>
              </div>
              <p className="text-sm text-gray-500 mt-1">hanno declinato</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Add New Guest Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aggiungi nuovo ospite</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="name">Nome e Cognome*</Label>
                <Input
                  id="name"
                  value={newGuest.name}
                  onChange={(e) => setNewGuest({...newGuest, name: e.target.value})}
                  placeholder="Nome Cognome"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newGuest.email}
                  onChange={(e) => setNewGuest({...newGuest, email: e.target.value})}
                  placeholder="email@esempio.com"
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Telefono</Label>
                <Input
                  id="phone"
                  value={newGuest.phone}
                  onChange={(e) => setNewGuest({...newGuest, phone: e.target.value})}
                  placeholder="+39 123 456 7890"
                />
              </div>
              
              <div>
                <Label htmlFor="relationship">Relazione</Label>
                <Select 
                  value={newGuest.relationship}
                  onValueChange={(value) => setNewGuest({...newGuest, relationship: value})}
                >
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
                <input
                  type="checkbox"
                  id="plusOne"
                  checked={newGuest.plusOne}
                  onChange={(e) => setNewGuest({...newGuest, plusOne: e.target.checked})}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="plusOne">Permetti accompagnatore (+1)</Label>
              </div>
            </div>
            
            <div className="mt-4">
              <Label htmlFor="dietaryRestrictions">Restrizioni alimentari</Label>
              <Input
                id="dietaryRestrictions"
                value={newGuest.dietaryRestrictions}
                onChange={(e) => setNewGuest({...newGuest, dietaryRestrictions: e.target.value})}
                placeholder="Vegetariano, allergie, ecc."
              />
            </div>
            
            <div className="mt-4">
              <Label htmlFor="notes">Note</Label>
              <Input
                id="notes"
                value={newGuest.notes}
                onChange={(e) => setNewGuest({...newGuest, notes: e.target.value})}
                placeholder="Note aggiuntive"
              />
            </div>

            {/* Membri del gruppo */}
            <div className="mt-6">
              <div className="flex justify-between items-center mb-2">
                <Label>Membri del gruppo</Label>
              </div>
              
              <div className="border rounded-md p-4">
                {newGuest.groupMembers.length > 0 ? (
                  <div className="space-y-3 mb-4">
                    {newGuest.groupMembers.map(member => (
                      <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium">{member.name}</p>
                          {member.dietaryRestrictions && (
                            <p className="text-sm text-gray-500">Dieta: {member.dietaryRestrictions}</p>
                          )}
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleRemoveGroupMember(member.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-4">Aggiungi membri del gruppo (famiglia, bambini, ecc.)</p>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="memberName">Nome</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="memberName"
                        value={tempGroupMember.name}
                        onChange={(e) => setTempGroupMember({...tempGroupMember, name: e.target.value})}
                        placeholder="Nome membro"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="memberDiet">Restrizioni alimentari</Label>
                    <Input
                      id="memberDiet"
                      value={tempGroupMember.dietaryRestrictions}
                      onChange={(e) => setTempGroupMember(
                        {...tempGroupMember, dietaryRestrictions: e.target.value}
                      )}
                      placeholder="Vegetariano, allergie, ecc."
                    />
                  </div>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-4"
                  onClick={handleAddGroupMember}
                >
                  <UserPlus className="h-4 w-4 mr-2" /> 
                  Aggiungi membro
                </Button>
              </div>
            </div>
            
            <Button 
              className="mt-6 bg-wedding-navy hover:bg-wedding-navy/80"
              onClick={handleAddGuest}
            >
              <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi ospite
            </Button>
          </CardContent>
        </Card>
        
        {/* Guests List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-wedding-navy">I tuoi ospiti</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Cerca ospiti..." 
                className="pl-10 w-full max-w-xs"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tutti ({totalGuests})</TabsTrigger>
              <TabsTrigger value="confirmed">Confermati ({confirmedGuests})</TabsTrigger>
              <TabsTrigger value="pending">In attesa ({pendingGuests})</TabsTrigger>
              <TabsTrigger value="declined">Non partecipano ({declinedGuests})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <GuestList 
                guests={filteredGuests()} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
            
            <TabsContent value="confirmed">
              <GuestList 
                guests={filteredGuests("confirmed")} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <GuestList 
                guests={filteredGuests("pending")} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
            
            <TabsContent value="declined">
              <GuestList 
                guests={filteredGuests("declined")} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog per modificare i membri del gruppo */}
      <Dialog open={!!editingGuest} onOpenChange={(open) => !open && setEditingGuest(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica membri del gruppo: {editingGuest?.name}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            {editingGuest?.groupMembers.length ? (
              <div className="space-y-2">
                {editingGuest.groupMembers.map(member => (
                  <div key={member.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium">{member.name}</p>
                      {member.dietaryRestrictions && (
                        <p className="text-sm text-gray-500">Dieta: {member.dietaryRestrictions}</p>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveEditGroupMember(editingGuest.id, member.id)}
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
    </MainLayout>
  );
};

// Guest list component
const GuestList = ({ 
  guests, 
  onUpdate, 
  onRemove,
  onEditMembers
}: { 
  guests: Guest[], 
  onUpdate: (id: string, updates: Partial<Guest>) => void, 
  onRemove: (id: string) => void,
  onEditMembers: (guest: Guest) => void
}) => {
  if (guests.length === 0) {
    return <p className="text-gray-500">Nessun ospite trovato.</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 text-left">
            <th className="px-4 py-2 border-b">Nome</th>
            <th className="px-4 py-2 border-b">Contatto</th>
            <th className="px-4 py-2 border-b">Relazione</th>
            <th className="px-4 py-2 border-b">RSVP</th>
            <th className="px-4 py-2 border-b">Gruppo</th>
            <th className="px-4 py-2 border-b">Azioni</th>
          </tr>
        </thead>
        <tbody>
          {guests.map(guest => (
            <tr key={guest.id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">{guest.name}</td>
              <td className="px-4 py-3">
                {guest.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-3 w-3 mr-1" /> {guest.email}
                  </div>
                )}
                {guest.phone && <div className="text-sm text-gray-600 mt-1">{guest.phone}</div>}
              </td>
              <td className="px-4 py-3">
                <span className="capitalize">{guest.relationship.replace(/-/g, ' ')}</span>
              </td>
              <td className="px-4 py-3">
                <Select 
                  value={guest.rsvp} 
                  onValueChange={(value: "pending" | "confirmed" | "declined") => 
                    onUpdate(guest.id, { rsvp: value })
                  }
                >
                  <SelectTrigger className="h-8 w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">In attesa</SelectItem>
                    <SelectItem value="confirmed">Confermato</SelectItem>
                    <SelectItem value="declined">Non partecipa</SelectItem>
                  </SelectContent>
                </Select>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8"
                    onClick={() => onEditMembers(guest)}
                  >
                    <UserPlus className="h-4 w-4 mr-1" />
                    {guest.groupMembers.length > 0 
                      ? `${guest.name} +${guest.groupMembers.length}` 
                      : "Aggiungi"}
                  </Button>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      // Simple implementation, in a real app you might want a modal
                      const notes = prompt("Note su questo ospite:", guest.notes);
                      if (notes !== null) {
                        onUpdate(guest.id, { notes });
                      }
                    }}
                  >
                    Note
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => onRemove(guest.id)}
                  >
                    Rimuovi
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GuestsPage;
