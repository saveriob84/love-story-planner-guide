
import { useAuth } from "@/contexts/auth/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { AddBudgetItem } from "@/components/budget/AddBudgetItem";
import { BudgetItemsList } from "@/components/budget/BudgetItemsList";
import { useBudget } from "@/hooks/budget/useBudget";
import { Skeleton } from "@/components/ui/skeleton";

const Budget = () => {
  const { user } = useAuth();
  
  const {
    budgetItems,
    totalBudget,
    totalEstimated,
    totalPaid,
    remainingBudget,
    isLoading,
    handleBudgetChange,
    saveBudget,
    addBudgetItem,
    updateBudgetItem,
    deleteBudgetItem
  } = useBudget(user?.id);
  
  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Budget
          </h1>
          <p className="text-gray-500 mt-2">
            Pianifica e gestisci le spese del tuo matrimonio
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              {Array(4).fill(0).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
            <Skeleton className="h-64 w-full" />
            <Skeleton className="h-96 w-full" />
          </div>
        ) : (
          <>
            {/* Budget Overview */}
            <BudgetOverview
              totalBudget={totalBudget}
              totalEstimated={totalEstimated}
              totalPaid={totalPaid}
              remainingBudget={remainingBudget}
              handleBudgetChange={handleBudgetChange}
              saveBudget={saveBudget}
            />
            
            {/* Add New Item Form */}
            <AddBudgetItem onAddItem={addBudgetItem} />
            
            {/* Budget Items List */}
            <BudgetItemsList
              budgetItems={budgetItems}
              onUpdateItem={updateBudgetItem}
              onDeleteItem={deleteBudgetItem}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Budget;
