
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Euro } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BudgetOverviewProps {
  totalBudget: number;
  totalEstimated: number;
  totalPaid: number;
  remainingBudget: number;
  handleBudgetChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  saveBudget: () => void;
}

export const BudgetOverview = ({
  totalBudget,
  totalEstimated,
  totalPaid,
  remainingBudget,
  handleBudgetChange,
  saveBudget
}: BudgetOverviewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Budget Totale</CardTitle>
          <CardDescription>Importo previsto</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Euro className="h-5 w-5 text-wedding-navy mr-2" />
            <Input 
              type="number" 
              value={totalBudget || ''} 
              onChange={handleBudgetChange}
              onBlur={saveBudget} 
              className="text-2xl font-bold text-wedding-navy" 
              placeholder="0" 
            />
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
          <CardTitle className="text-lg font-medium">Budget Speso</CardTitle>
          <CardDescription>Importo pagato</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold text-purple-600">€{totalPaid.toLocaleString()}</p>
          <Progress 
            value={totalBudget > 0 ? (totalPaid / totalBudget) * 100 : 0} 
            className="h-2 mt-2 bg-purple-100"
            indicatorClassName="bg-purple-600"
          />
          <p className="text-sm text-gray-500 mt-1">
            {totalBudget > 0 
              ? `${Math.round((totalPaid / totalBudget) * 100)}% del budget totale` 
              : "Imposta un budget totale"}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Budget Rimanente</CardTitle>
          <CardDescription>Importo disponibile</CardDescription>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-bold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            €{remainingBudget.toLocaleString()}
          </p>
          <Progress 
            value={totalBudget > 0 ? (remainingBudget / totalBudget) * 100 : 0} 
            className={`h-2 mt-2 ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}
            indicatorClassName={remainingBudget >= 0 ? 'bg-green-600' : 'bg-red-600'}
          />
          <p className="text-sm text-gray-500 mt-1">
            {totalBudget > 0 
              ? `${Math.round((remainingBudget / totalBudget) * 100)}% del budget totale` 
              : "Imposta un budget totale"}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
