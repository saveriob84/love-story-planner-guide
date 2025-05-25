
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BudgetItem } from "@/hooks/budget/types";

interface BudgetItemsListProps {
  budgetItems: BudgetItem[];
  onUpdateItem: (id: string, updates: Partial<BudgetItem>) => void;
  onDeleteItem: (id: string) => void;
}

export const BudgetItemsList = ({ 
  budgetItems, 
  onUpdateItem, 
  onDeleteItem 
}: BudgetItemsListProps) => {
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<BudgetItem | null>(null);
  const [actualCost, setActualCost] = useState<string>("");
  
  const handleEditItem = (item: BudgetItem) => {
    setEditingItem(item);
    setActualCost(item.actualCost?.toString() || item.estimatedCost.toString());
  };
  
  const handleSaveActualCost = () => {
    if (editingItem) {
      onUpdateItem(editingItem.id, {
        actualCost: parseFloat(actualCost) || editingItem.estimatedCost
      });
      setEditingItem(null);
    }
  };
  
  const handleConfirmDelete = () => {
    if (deleteConfirmItem) {
      onDeleteItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
    }
  };

  return (
    <div>
      <h2 className="font-serif text-xl font-bold text-wedding-navy mb-4">Voci di spesa</h2>
      
      {budgetItems.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-4 py-2 border-b">Categoria</th>
                <th className="px-4 py-2 border-b">Descrizione</th>
                <th className="px-4 py-2 border-b text-right">Costo stimato</th>
                <th className="px-4 py-2 border-b text-right">Costo effettivo</th>
                <th className="px-4 py-2 border-b">Stato</th>
                <th className="px-4 py-2 border-b">Azioni</th>
              </tr>
            </thead>
            <tbody>
              {budgetItems.map(item => (
                <tr key={item.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{item.category}</td>
                  <td className="px-4 py-3">{item.description}</td>
                  <td className="px-4 py-3 text-right">€{item.estimatedCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">
                    {item.actualCost !== null ? `€${item.actualCost.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${item.paid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {item.paid ? 'Pagato' : 'Non pagato'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleEditItem(item)}
                      >
                        Aggiorna
                      </Button>
                      
                      <Button 
                        variant={item.paid ? "outline" : "secondary"} 
                        size="sm" 
                        onClick={() => onUpdateItem(item.id, { paid: !item.paid })}
                      >
                        {item.paid ? 'Non pagato' : 'Segna pagato'}
                      </Button>
                      
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => setDeleteConfirmItem(item)}
                      >
                        Elimina
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-500">Non hai ancora aggiunto voci di spesa al tuo budget.</p>
      )}
      
      {/* Edit Item Dialog */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Aggiorna costo effettivo</DialogTitle>
            <DialogDescription>
              Inserisci il costo effettivo per {editingItem?.category}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="actualCost">Costo effettivo (€)</Label>
            <Input
              id="actualCost"
              type="number"
              value={actualCost}
              onChange={(e) => setActualCost(e.target.value)}
            />
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>Annulla</Button>
            <Button onClick={handleSaveActualCost}>Salva</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmItem} onOpenChange={(open) => !open && setDeleteConfirmItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Conferma eliminazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler eliminare la voce "{deleteConfirmItem?.category}"? Questa azione non può essere annullata.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmItem(null)}>Annulla</Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>Elimina</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
