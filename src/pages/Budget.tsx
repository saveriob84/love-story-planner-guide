import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PlusCircle, Euro } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Budget item interface
interface BudgetItem {
  id: string;
  category: string;
  description: string;
  estimatedCost: number;
  actualCost: number | null;
  paid: boolean;
}
const Budget = () => {
  const {
    user
  } = useAuth();
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>(() => {
    // Try to load from localStorage
    const savedItems = localStorage.getItem(`budget_items_${user?.id}`);
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [totalBudget, setTotalBudget] = useState<number>(() => {
    const savedBudget = localStorage.getItem(`total_budget_${user?.id}`);
    return savedBudget ? parseInt(savedBudget) : 0;
  });
  const [newItem, setNewItem] = useState({
    category: "",
    description: "",
    estimatedCost: ""
  });

  // Calculate totals
  const totalEstimated = budgetItems.reduce((sum, item) => sum + item.estimatedCost, 0);
  const totalActual = budgetItems.reduce((sum, item) => sum + (item.actualCost || 0), 0);
  const totalPaid = budgetItems.reduce((sum, item) => sum + (item.paid ? item.actualCost || item.estimatedCost : 0), 0);

  // Save budget to localStorage
  const saveBudget = (items: BudgetItem[], budget: number) => {
    if (user?.id) {
      localStorage.setItem(`budget_items_${user.id}`, JSON.stringify(items));
      localStorage.setItem(`total_budget_${user.id}`, budget.toString());
    }
  };

  // Add new budget item
  const handleAddItem = () => {
    if (newItem.category && newItem.estimatedCost) {
      const item: BudgetItem = {
        id: `item-${Date.now()}`,
        category: newItem.category,
        description: newItem.description,
        estimatedCost: parseFloat(newItem.estimatedCost),
        actualCost: null,
        paid: false
      };
      const updatedItems = [...budgetItems, item];
      setBudgetItems(updatedItems);
      saveBudget(updatedItems, totalBudget);

      // Reset form
      setNewItem({
        category: "",
        description: "",
        estimatedCost: ""
      });
    }
  };

  // Update budget item
  const updateBudgetItem = (id: string, updates: Partial<BudgetItem>) => {
    const updatedItems = budgetItems.map(item => item.id === id ? {
      ...item,
      ...updates
    } : item);
    setBudgetItems(updatedItems);
    saveBudget(updatedItems, totalBudget);
  };

  // Delete budget item
  const deleteBudgetItem = (id: string) => {
    const updatedItems = budgetItems.filter(item => item.id !== id);
    setBudgetItems(updatedItems);
    saveBudget(updatedItems, totalBudget);
  };

  // Update total budget
  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 0;
    setTotalBudget(value);
    saveBudget(budgetItems, value);
  };
  return <MainLayout>
      <div className="py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Budget
          </h1>
          <p className="text-gray-500 mt-2">
            Pianifica e gestisci le spese del tuo matrimonio
          </p>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Budget Totale</CardTitle>
              <CardDescription>Importo previsto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Euro className="h-5 w-5 text-wedding-navy mr-2" />
                <Input type="number" value={totalBudget || ''} onChange={handleBudgetChange} className="text-2xl font-bold text-wedding-navy" placeholder="0" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Costi Stimati</CardTitle>
              <CardDescription>Totale stimato</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-wedding-navy">€{totalEstimated.toLocaleString()}</p>
              <Progress value={totalBudget > 0 ? totalEstimated / totalBudget * 100 : 0} className="h-2 mt-2" />
              <p className="text-sm text-gray-500 mt-1">
                {totalBudget > 0 ? `${Math.round(totalEstimated / totalBudget * 100)}% del budget` : "Imposta un budget totale"}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Costi Effettivi</CardTitle>
              <CardDescription>Spese pagate</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-wedding-navy">€{totalPaid.toLocaleString()}</p>
              <Progress value={totalEstimated > 0 ? totalPaid / totalEstimated * 100 : 0} className="h-2 mt-2 bg-wedding-blush/20" />
              <p className="text-sm text-gray-500 mt-1">
                €{totalPaid.toLocaleString()} di €{totalEstimated.toLocaleString()} pagati
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Add New Item Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Aggiungi nuova voce di spesa</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input id="category" value={newItem.category} onChange={e => setNewItem({
                ...newItem,
                category: e.target.value
              })} placeholder="Es. Location, Catering" />
              </div>
              <div>
                <Label htmlFor="description">Descrizione</Label>
                <Input id="description" value={newItem.description} onChange={e => setNewItem({
                ...newItem,
                description: e.target.value
              })} placeholder="Dettagli opzionali" />
              </div>
              <div>
                <Label htmlFor="estimatedCost">Costo stimato (€)</Label>
                <Input id="estimatedCost" type="number" value={newItem.estimatedCost} onChange={e => setNewItem({
                ...newItem,
                estimatedCost: e.target.value
              })} placeholder="0" />
              </div>
            </div>
            <Button onClick={handleAddItem} className="mt-4 bg-wedding-navy hover:bg-wedding-navy/80">
              <PlusCircle className="h-4 w-4 mr-2" /> Aggiungi voce
            </Button>
          </CardContent>
        </Card>
        
        {/* Budget Items List */}
        <div>
          <h2 className="font-serif text-xl font-bold text-wedding-navy mb-4">Voci di spesa</h2>
          
          {budgetItems.length > 0 ? <div className="overflow-x-auto">
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
                  {budgetItems.map(item => <tr key={item.id} className="border-b hover:bg-gray-50">
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
                          <Button variant="outline" size="sm" onClick={() => {
                      const actualCost = prompt('Inserisci il costo effettivo:', item.actualCost?.toString() || item.estimatedCost.toString());
                      if (actualCost !== null) {
                        updateBudgetItem(item.id, {
                          actualCost: parseFloat(actualCost) || item.estimatedCost
                        });
                      }
                    }}>
                            Aggiorna
                          </Button>
                          
                          <Button variant={item.paid ? "outline" : "secondary"} size="sm" onClick={() => updateBudgetItem(item.id, {
                      paid: !item.paid
                    })}>
                            {item.paid ? 'Non pagato' : 'Segna pagato'}
                          </Button>
                          
                          <Button variant="destructive" size="sm" onClick={() => {
                      if (confirm('Sei sicuro di voler eliminare questa voce?')) {
                        deleteBudgetItem(item.id);
                      }
                    }}>
                            Elimina
                          </Button>
                        </div>
                      </td>
                    </tr>)}
                </tbody>
              </table>
            </div> : <p className="text-gray-500">Non hai ancora aggiunto voci di spesa al tuo budget.</p>}
        </div>
      </div>
    </MainLayout>;
};
export default Budget;