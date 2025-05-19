
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle } from "lucide-react";

interface AddBudgetItemProps {
  onAddItem: (category: string, description: string, estimatedCost: number) => void;
}

export const AddBudgetItem = ({ onAddItem }: AddBudgetItemProps) => {
  const [newItem, setNewItem] = useState({
    category: "",
    description: "",
    estimatedCost: ""
  });

  const handleAddItem = () => {
    if (newItem.category && newItem.estimatedCost) {
      onAddItem(
        newItem.category, 
        newItem.description, 
        parseFloat(newItem.estimatedCost)
      );
      
      // Reset form
      setNewItem({
        category: "",
        description: "",
        estimatedCost: ""
      });
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Aggiungi nuova voce di spesa</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="category">Categoria</Label>
            <Input 
              id="category" 
              value={newItem.category} 
              onChange={e => setNewItem({
                ...newItem,
                category: e.target.value
              })} 
              placeholder="Es. Location, Catering" 
            />
          </div>
          <div>
            <Label htmlFor="description">Descrizione</Label>
            <Input 
              id="description" 
              value={newItem.description} 
              onChange={e => setNewItem({
                ...newItem,
                description: e.target.value
              })} 
              placeholder="Dettagli opzionali" 
            />
          </div>
          <div>
            <Label htmlFor="estimatedCost">Costo stimato (€)</Label>
            <Input 
              id="estimatedCost" 
              type="number" 
              value={newItem.estimatedCost} 
              onChange={e => setNewItem({
                ...newItem,
                estimatedCost: e.target.value
              })} 
              placeholder="0" 
            />
          </div>
        </div>
        <Button onClick={handleAddItem} className="mt-4 bg-wedding-navy hover:bg-wedding-navy/80">
          <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi voce
        </Button>
      </CardContent>
    </Card>
  );
};
