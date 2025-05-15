
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle } from "lucide-react";

interface TableFormCardProps {
  onAddTable: (name: string, capacity: number) => boolean;
}

const TableFormCard = ({ onAddTable }: TableFormCardProps) => {
  const { toast } = useToast();
  const [newTable, setNewTable] = useState({
    name: "",
    capacity: 8
  });

  const handleAddTable = () => {
    if (!newTable.name.trim()) {
      toast({
        title: "Errore",
        description: "Il nome del tavolo è obbligatorio.",
        variant: "destructive"
      });
      return;
    }

    if (newTable.capacity < 1) {
      toast({
        title: "Errore",
        description: "La capacità del tavolo deve essere almeno 1.",
        variant: "destructive"
      });
      return;
    }

    // Call the onAddTable function
    onAddTable(newTable.name, newTable.capacity);

    // Reset form after adding table
    setNewTable({
      name: "",
      capacity: 8
    });

    // Show success toast
    toast({
      title: "Tavolo aggiunto",
      description: "Il tavolo è stato aggiunto con successo."
    });
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Aggiungi nuovo tavolo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Nome Tavolo*</Label>
            <Input 
              id="name" 
              value={newTable.name} 
              onChange={e => setNewTable({
                ...newTable,
                name: e.target.value
              })} 
              placeholder="Tavolo 1" 
              required 
            />
          </div>
          
          <div>
            <Label htmlFor="capacity">Numero di Posti*</Label>
            <Input 
              id="capacity" 
              type="number" 
              min={1} 
              value={newTable.capacity} 
              onChange={e => setNewTable({
                ...newTable,
                capacity: parseInt(e.target.value) || 1
              })} 
              required 
            />
          </div>
        </div>
        
        <Button onClick={handleAddTable} className="mt-6 bg-red-500 hover:bg-red-400 text-zinc-950">
          <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi tavolo
        </Button>
      </CardContent>
    </Card>
  );
};

export default TableFormCard;
