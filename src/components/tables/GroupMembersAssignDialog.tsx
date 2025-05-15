
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
import { useState, useEffect } from "react";

interface GroupMembersAssignDialogProps {
  guest: Guest;
  table: Table;
  onAddGroupMember: (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => void;
}

const GroupMembersAssignDialog = ({ 
  guest, 
  table,
  onAddGroupMember
}: GroupMembersAssignDialogProps) => {
  const { toast } = useToast();
  const [assignedMemberIds, setAssignedMemberIds] = useState<Set<string>>(new Set());
  
  // Check which members are already assigned to any table
  useEffect(() => {
    const assignedIds = new Set<string>();
    table.guests.forEach(tableGuest => {
      // Check if this is a group member and extract the member ID
      if (tableGuest.id.includes(`table-guest-${guest.id}`)) {
        const memberName = tableGuest.name;
        // Find the matching group member by name
        guest.groupMembers.forEach(member => {
          if (member.name === memberName) {
            assignedIds.add(member.id);
          }
        });
      }
    });
    setAssignedMemberIds(assignedIds);
  }, [table.guests, guest]);
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Gruppo
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
              const isAssigned = assignedMemberIds.has(member.id);
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
                        setAssignedMemberIds(prev => new Set([...prev, member.id]));
                        toast({
                          title: "Membro aggiunto",
                          description: `${member.name} è stato aggiunto a ${table.name}`
                        });
                      }
                    }}
                  >
                    {isAssigned ? 'Aggiunto' : 'Aggiungi'}
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
