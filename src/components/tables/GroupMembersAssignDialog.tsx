
import { Table } from "@/types/table";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface GroupMembersAssignDialogProps {
  guest: Guest;
  table: Table;
  onAddGroupMember: (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => void;
  assignedGroupMemberIds: Map<string, string>;
}

const GroupMembersAssignDialog = ({ 
  guest, 
  table,
  onAddGroupMember,
  assignedGroupMemberIds
}: GroupMembersAssignDialogProps) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  
  // Filter out already assigned members
  const unassignedMembers = guest.groupMembers.filter(member => !assignedGroupMemberIds.has(member.id));
  
  // If all members are assigned, don't show the dialog button
  if (unassignedMembers.length === 0) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Gruppo ({unassignedMembers.length})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi membri del gruppo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Seleziona i membri del gruppo di {guest.name} da aggiungere al tavolo:</p>
          <div className="space-y-2">
            {guest.groupMembers.map((member) => {
              // Check if this member is already assigned anywhere
              const isAssigned = assignedGroupMemberIds.has(member.id);
              
              return (
                <div key={member.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <p className="font-medium">{member.name}</p>
                    {member.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                  </div>
                  <Button 
                    size="sm"
                    disabled={isAssigned}
                    variant={isAssigned ? "outline" : "default"}
                    onClick={() => {
                      if (!isAssigned) {
                        onAddGroupMember(table.id, guest.id, member);
                        toast({
                          title: "Membro aggiunto",
                          description: `${member.name} è stato aggiunto a ${table.name}`
                        });
                        // Non chiudiamo il dialogo dopo l'aggiunta di un membro
                        // così l'utente può aggiungere più membri consecutivamente
                      }
                    }}
                  >
                    {isAssigned ? 'Già assegnato' : 'Aggiungi'}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersAssignDialog;
