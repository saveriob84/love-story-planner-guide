
import { useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useGuests } from "@/hooks/useGuests";
import { useTables } from "@/hooks/useTables";
import TableFormCard from "@/components/tables/TableFormCard";
import TableList from "@/components/tables/TableList";
import TableStats from "@/components/tables/TableStats";

const TablePage = () => {
  const { guests, isLoading: guestsLoading } = useGuests();
  const { 
    tables, 
    isLoading: tablesLoading, 
    addTable, 
    updateTable, 
    removeTable,
    addGuestToTable,
    addGroupMemberToTable,
    removeGuestFromTable,
    stats,
    assignedGuestIds
  } = useTables();
  
  const isLoading = guestsLoading || tablesLoading;

  useEffect(() => {
    document.title = "Composizione Tavoli - Wedding Planner";
  }, []);

  return (
    <MainLayout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Composizione Tavoli</h1>
        
        {isLoading ? (
          <p>Caricamento in corso...</p>
        ) : (
          <>
            <TableStats stats={stats} />
            
            <TableFormCard onAddTable={addTable} />
            
            <h2 className="text-2xl font-semibold mb-4 mt-8">I tuoi tavoli</h2>
            
            <TableList 
              tables={tables}
              guests={guests}
              assignedGuestIds={assignedGuestIds}
              onUpdateTable={updateTable}
              onRemoveTable={removeTable}
              onAddGuestToTable={addGuestToTable}
              onAddGroupMemberToTable={addGroupMemberToTable}
              onRemoveGuestFromTable={removeGuestFromTable}
            />
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default TablePage;
