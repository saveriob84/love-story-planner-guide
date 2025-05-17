
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Guest } from "@/types/guest";
import { Mail, Phone, Check, X, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface GuestListPrintProps {
  guests: Guest[];
  stats: {
    totalGuests: number;
    confirmedGuests: number;
    pendingGuests: number;
    declinedGuests: number;
    totalAttending: number;
    totalGroupMembers: number;
    plusOnes: number;
  };
}

const GuestListPrint = ({ guests, stats }: GuestListPrintProps) => {
  const getRsvpIcon = (rsvp: Guest["rsvp"]) => {
    switch (rsvp) {
      case "confirmed":
        return <Check className="h-4 w-4 text-green-600" />;
      case "declined":
        return <X className="h-4 w-4 text-red-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-amber-600" />;
      default:
        return null;
    }
  };

  const getRsvpText = (rsvp: Guest["rsvp"]) => {
    switch (rsvp) {
      case "confirmed":
        return "Confermato";
      case "declined":
        return "Non partecipa";
      case "pending":
        return "In attesa";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6 py-2 font-serif">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-wedding-navy">Lista Invitati</h1>
        <p className="text-gray-500 mt-2 font-sans">
          Gestisci facilmente tutti i dettagli dei tuoi invitati: partecipazioni, preferenze e conferme.
        </p>
        
        <div className="flex justify-center gap-4 mt-4">
          <div className="text-center px-4 py-2 bg-wedding-blush/10 rounded-md">
            <p className="font-bold text-lg">{stats.totalGuests}</p>
            <p className="text-sm text-gray-600">Totale invitati</p>
          </div>
          <div className="text-center px-4 py-2 bg-green-100 rounded-md">
            <p className="font-bold text-lg">{stats.confirmedGuests}</p>
            <p className="text-sm text-gray-600">Confermati</p>
          </div>
          <div className="text-center px-4 py-2 bg-amber-100 rounded-md">
            <p className="font-bold text-lg">{stats.pendingGuests}</p>
            <p className="text-sm text-gray-600">In attesa</p>
          </div>
          <div className="text-center px-4 py-2 bg-red-100 rounded-md">
            <p className="font-bold text-lg">{stats.declinedGuests}</p>
            <p className="text-sm text-gray-600">Non partecipano</p>
          </div>
        </div>
      </div>
      
      <div className="overflow-auto rounded-md border">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="font-serif">Nome e cognome</TableHead>
              <TableHead className="font-serif">Contatti</TableHead>
              <TableHead className="font-serif">Relazione</TableHead>
              <TableHead className="font-serif">Membri gruppo</TableHead>
              <TableHead className="font-serif">RSVP</TableHead>
              <TableHead className="font-serif">Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {guests.map((guest) => (
              <TableRow key={guest.id} className="border-b">
                <TableCell className="font-medium font-serif">
                  {guest.name}
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {guest.email && (
                      <div className="flex items-center text-sm">
                        <Mail className="h-3 w-3 mr-1 text-gray-400" /> {guest.email}
                      </div>
                    )}
                    {guest.phone && (
                      <div className="flex items-center text-sm">
                        <Phone className="h-3 w-3 mr-1 text-gray-400" /> {guest.phone}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="capitalize">{guest.relationship.replace(/-/g, ' ')}</span>
                </TableCell>
                <TableCell>
                  {guest.groupMembers.length > 0 ? (
                    <div className="space-y-1">
                      {guest.groupMembers.map((member) => (
                        <div key={member.id} className="text-sm flex items-center gap-1">
                          <span>{member.name}</span>
                          {member.isChild && (
                            <Badge variant="outline" className="text-xs">Bambino</Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-sm">Nessuno</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    {getRsvpIcon(guest.rsvp)}
                    <span className="ml-1">{getRsvpText(guest.rsvp)}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {guest.dietaryRestrictions && (
                    <div className="text-sm mb-1">
                      <span className="font-medium">Dieta:</span> {guest.dietaryRestrictions}
                    </div>
                  )}
                  {guest.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Note:</span> {guest.notes}
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="text-center text-sm text-gray-500 mt-4 font-sans">
        <p>Totale partecipanti confermati: {stats.totalAttending} persone</p>
      </div>
    </div>
  );
};

export default GuestListPrint;
