
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, UserPlus, Table } from "lucide-react";
import { Link } from "react-router-dom";

interface GuestListProps { 
  guests: Guest[];
  onUpdate: (id: string, updates: Partial<Guest>) => void;
  onRemove: (id: string) => void;
  onEditMembers: (guest: Guest) => void;
}

const GuestList = ({ guests, onUpdate, onRemove, onEditMembers }: GuestListProps) => {
  if (guests.length === 0) {
    return <p className="text-gray-500">Nessun ospite trovato.</p>;
  }
  
  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/tables">
            <Table className="mr-2 h-4 w-4" />
            Gestisci Tavoli
          </Link>
        </Button>
      </div>
      
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

export default GuestList;
