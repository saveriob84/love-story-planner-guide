
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
  
  // Prepare the members array with the group leader included
  const allMembers = [
    // Include the group leader as first element
    {
      id: guest.id,
      name: guest.name,
      isChild: false
    },
    // Then include all group members
    ...guest.groupMembers
  ];
  
  // Count unassigned members for the button label
  const unassignedCount = allMembers.filter(member => !assignedGroupMemberIds.has(member.id)).length;
  
  // Don't show the dialog if there are no members to assign
  if (unassignedCount === 0) {
    return null;
  }
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Gruppo ({unassignedCount})
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aggiungi membri del gruppo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p>Seleziona i membri del gruppo di {guest.name} da aggiungere al tavolo:</p>
          <div className="space-y-2">
            {allMembers.map((member) => {
              // Check if this member is already assigned using the map
              const isAssigned = assignedGroupMemberIds.has(member.id);
              
              return (
                <div key={member.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                  <div className="flex items-center">
                    <p className="font-medium">{member.name}</p>
                    {member.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                    {member.id === guest.id && <span className="ml-2 text-xs text-gray-500">(capogruppo)</span>}
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
                        // We don't close the dialog after adding a member
                        // so the user can add multiple members consecutively
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
