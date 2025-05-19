
import { useAuth } from "@/contexts/auth/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { BudgetOverview } from "@/components/budget/BudgetOverview";
import { AddBudgetItem } from "@/components/budget/AddBudgetItem";
import { BudgetItemsList } from "@/components/budget/BudgetItemsList";
import { useBudget } from "@/hooks/budget/useBudget";

const Budget = () => {
  const { user } = useAuth();
  
  const {
    budgetItems,
    totalBudget,
    totalEstimated,
    totalPaid,
    remainingBudget,
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
      </div>
    </MainLayout>
  );
};

export default Budget;
