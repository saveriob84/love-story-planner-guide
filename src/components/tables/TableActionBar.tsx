
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, Download, FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TableActionBarProps {
  onAddTable: () => void;
  onAddCustomTable: (name: string, capacity: number) => void;
  onExportTables: () => void;
  tables: Array<{
    id: string;
    name: string;
    capacity: number;
    guests: any[];
  }>;
}

export const TableActionBar = ({ onAddTable, onAddCustomTable, onExportTables, tables }: TableActionBarProps) => {
  const [open, setOpen] = useState(false);
  const [tableName, setTableName] = useState("");
  const [capacity, setCapacity] = useState("8");

  const handleAddCustomTable = () => {
    if (tableName) {
      onAddCustomTable(tableName, parseInt(capacity) || 8);
      setTableName("");
      setCapacity("8");
      setOpen(false);
    }
  };
  
  return (
    <div className="flex flex-wrap gap-4 mb-6">
      <Button
        onClick={onAddTable}
        className="bg-wedding-gold text-white hover:bg-wedding-gold/90"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Aggiungi Tavolo
      </Button>
      
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Tavolo Personalizzato</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Crea Tavolo Personalizzato</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome del tavolo</Label>
              <Input
                id="name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Es. Tavolo Sposi"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="capacity">Numero di posti</Label>
              <Input
                id="capacity"
                type="number"
                min="1"
                max="20"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
              />
            </div>
            <Button onClick={handleAddCustomTable}>Aggiungi</Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <Button
        variant="outline"
        onClick={onExportTables}
      >
        <FileText className="mr-2 h-4 w-4" />
        Esporta Disposizione
      </Button>
    </div>
  );
};
