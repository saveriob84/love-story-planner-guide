
import { Table } from "@/types/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface EditTableDialogProps {
  table: Table | null;
  onClose: () => void;
  onSave: () => void;
  onChange: (updates: Partial<Table>) => void;
}

const EditTableDialog = ({ table, onClose, onSave, onChange }: EditTableDialogProps) => {
  if (!table) return null;

  return (
    <Dialog open={!!table} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifica Tavolo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="tableName">Nome Tavolo</Label>
            <Input 
              id="tableName" 
              value={table.name}
              onChange={(e) => onChange({ name: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tableCapacity">Numero di Posti</Label>
            <Input 
              id="tableCapacity" 
              type="number"
              min={table.guests?.length || 1} 
              value={table.capacity}
              onChange={(e) => onChange({
                capacity: parseInt(e.target.value) || table.guests.length
              })}
            />
            <p className="text-sm text-gray-500">
              Il numero di posti non può essere inferiore al numero di ospiti già assegnati ({table.guests.length})
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Annulla</Button>
          <Button onClick={onSave}>Salva Modifiche</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditTableDialog;
