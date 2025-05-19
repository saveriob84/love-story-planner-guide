
import { Button } from "@/components/ui/button";

// Budget item interface
export interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paid: boolean;
}

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
                        onClick={() => {
                          const actualCost = prompt('Inserisci il costo effettivo:', item.actualCost?.toString() || item.estimatedCost.toString());
                          if (actualCost !== null) {
                            onUpdateItem(item.id, {
                              actualCost: parseFloat(actualCost) || item.estimatedCost
                            });
                          }
                        }}
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
                        onClick={() => {
                          if (confirm('Sei sicuro di voler eliminare questa voce?')) {
                            onDeleteItem(item.id);
                          }
                        }}
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
    </div>
  );
};
