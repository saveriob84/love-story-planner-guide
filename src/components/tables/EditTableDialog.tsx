
import React from "react";
import { Table } from "@/types/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditTableDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentTable: Table | null;
  tableName: string;
  setTableName: (name: string) => void;
  tableCapacity: string;
  setTableCapacity: (capacity: string) => void;
  onSave: () => void;
}

export const EditTableDialog = ({
  open,
  onOpenChange,
  currentTable,
  tableName,
  setTableName,
  tableCapacity,
  setTableCapacity,
  onSave
}: EditTableDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modifica tavolo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nome del tavolo</Label>
            <Input
              id="edit-name"
              value={tableName}
              onChange={(e) => setTableName(e.target.value)}
              placeholder="Es. Tavolo Sposi"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-capacity">Numero di posti</Label>
            <Input
              id="edit-capacity"
              type="number"
              min="1"
              max="20"
              value={tableCapacity}
              onChange={(e) => setTableCapacity(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annulla</Button>
          <Button onClick={onSave}>Salva modifiche</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
