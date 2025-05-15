
import { Table } from "@/types/table";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Users, UserRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import GroupMembersAssignDialog from "./GroupMembersAssignDialog";

interface GuestAssignmentDialogProps {
  table: Table | null;
  onClose: () => void;
  guests: Guest[];
  assignedGuestIds: Set<string>;
  assignedGroupMemberIds: Map<string, string>;
  onAddGuestToTable: (tableId: string, guest: Guest) => void;
  onAddGroupMemberToTable: (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => void;
}

const GuestAssignmentDialog = ({
  table,
  onClose,
  guests,
  assignedGuestIds,
  assignedGroupMemberIds,
  onAddGuestToTable,
  onAddGroupMemberToTable
}: GuestAssignmentDialogProps) => {
  const { toast } = useToast();
  const [searchGuest, setSearchGuest] = useState("");
  
  if (!table) return null;

  // Mostriamo tutti gli ospiti che non sono già assegnati
  const filteredGuests = guests.filter(guest => {
    // Filtra per termine di ricerca
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchGuest.toLowerCase()) || 
      guest.groupMembers.some(m => m.name.toLowerCase().includes(searchGuest.toLowerCase()));
    
    // Verifica se l'ospite è confermato
    const isConfirmed = guest.rsvp === "confirmed";
    
    // Mostra l'ospite se corrisponde alla ricerca, è confermato ed è visualizzabile
    return matchesSearch && isConfirmed;
  });

  return (
    <Dialog open={!!table} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assegna Ospiti a {table.name}</DialogTitle>
          <DialogDescription>
            Seleziona gli ospiti da assegnare a questo tavolo
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="guestSearch">Cerca Ospiti</Label>
            <Input 
              id="guestSearch" 
              placeholder="Cerca per nome..."
              value={searchGuest}
              onChange={(e) => setSearchGuest(e.target.value)}
            />
          </div>
          
          <div className="h-[400px] overflow-y-auto border rounded-md">
            {filteredGuests.length > 0 ? (
              <UITable>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Gruppo</TableHead>
                    <TableHead>Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGuests.map((guest) => {
                    // Verifica se l'ospite principale è già stato assegnato
                    const isMainGuestAssigned = assignedGuestIds.has(guest.id);
                    
                    // Conta membri del gruppo già assegnati
                    const assignedMembers = guest.groupMembers.filter(member => 
                      assignedGroupMemberIds.has(member.id)
                    ).length;
                    
                    // Calcola quanti membri del gruppo non sono ancora assegnati
                    const unassignedMembers = guest.groupMembers.length - assignedMembers;
                    
                    return (
                      <TableRow key={guest.id}>
                        <TableCell>{guest.name}</TableCell>
                        <TableCell>
                          {guest.groupMembers.length > 0 && (
                            <div className="flex items-center">
                              <Users className="h-4 w-4 mr-1" /> 
                              <span>
                                {guest.name} + {guest.groupMembers.length} 
                                {guest.groupMembers.some(m => m.isChild) ? ' (include bambini)' : ''}
                              </span>
                            </div>
                          )}
                          {guest.groupMembers.length === 0 && (
                            <div className="flex items-center text-gray-500">
                              <UserRound className="h-4 w-4 mr-1" /> Singolo
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button 
                              size="sm"
                              disabled={isMainGuestAssigned}
                              onClick={() => {
                                if (!isMainGuestAssigned) {
                                  onAddGuestToTable(table.id, guest);
                                  // Chiude il dialogo dopo aver aggiunto un ospite
                                  onClose();
                                }
                              }}
                            >
                              {isMainGuestAssigned ? 'Già assegnato' : 
                                (guest.groupMembers.length > 0 ? 
                                  `Aggiungi gruppo` : 
                                  'Aggiungi')}
                            </Button>
                            
                            {unassignedMembers > 0 && (
                              <GroupMembersAssignDialog 
                                guest={guest} 
                                table={table}
                                onAddGroupMember={onAddGroupMemberToTable}
                                assignedGroupMemberIds={assignedGroupMemberIds}
                              />
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </UITable>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Nessun ospite disponibile da assegnare</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GuestAssignmentDialog;
