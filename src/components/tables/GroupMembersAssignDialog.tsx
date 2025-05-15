
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
            {guest.groupMembers.map((member) => (
              <div key={member.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                <div className="flex items-center">
                  <p className="font-medium">{member.name}</p>
                  {member.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                </div>
                <Button 
                  size="sm"
                  onClick={() => {
                    onAddGroupMember(table.id, guest.id, member);
                    toast({
                      title: "Membro aggiunto",
                      description: `${member.name} è stato aggiunto a ${table.name}`
                    });
                  }}
                >
                  Aggiungi
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GroupMembersAssignDialog;
