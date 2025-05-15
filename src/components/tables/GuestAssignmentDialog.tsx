
import { Table } from "@/types/table";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
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

  // Filter guests based on search, already assigned status, and RSVP confirmation
  const filteredGuests = guests.filter(guest => {
    // Filter by search term
    const matchesSearch = 
      guest.name.toLowerCase().includes(searchGuest.toLowerCase()) || 
      guest.groupMembers.some(m => m.name.toLowerCase().includes(searchGuest.toLowerCase()));
    
    // Check if guest is confirmed
    const isConfirmed = guest.rsvp === "confirmed";
    
    // Check if guest is already assigned
    const isGuestAssigned = assignedGuestIds.has(guest.id);
    
    // Check if all group members are already assigned
    const allMembersAssigned = guest.groupMembers.length > 0 && 
      guest.groupMembers.every(member => assignedGroupMemberIds.has(member.id));
    
    // If guest is assigned and all members are assigned, hide completely
    if (isGuestAssigned && (guest.groupMembers.length === 0 || allMembersAssigned)) {
      return false;
    }
    
    // Show the guest if they match the search and are confirmed
    return matchesSearch && isConfirmed;
  });

  return (
    <Dialog open={!!table} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Assegna Ospiti a {table.name}</DialogTitle>
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
                    // Check if the guest is already assigned
                    const isGuestAssigned = assignedGuestIds.has(guest.id);
                    
                    // Calculate how many group members are already assigned
                    const assignedMembers = guest.groupMembers.filter(member => 
                      assignedGroupMemberIds.has(member.id)
                    ).length;
                    
                    // Calculate how many group members are not yet assigned
                    const unassignedMembers = guest.groupMembers.length - assignedMembers;
                    
                    // Show in the UI how many members are available to assign
                    const availableMembersCount = isGuestAssigned ? 
                      unassignedMembers : 
                      unassignedMembers + 1;
                    
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
                            {!isGuestAssigned && (
                              <Button 
                                size="sm"
                                onClick={() => {
                                  onAddGuestToTable(table.id, guest);
                                  // Close the dialog after adding a guest
                                  onClose();
                                }}
                              >
                                {guest.groupMembers.length > 0 ? 
                                  `Aggiungi gruppo (${availableMembersCount})` : 
                                  'Aggiungi'}
                              </Button>
                            )}
                            
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
