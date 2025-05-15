
import { useState } from "react";
import { Table } from "@/types/table";
import { Guest } from "@/types/guest";
import TableCard from "./TableCard";
import EditTableDialog from "./EditTableDialog";
import GuestAssignmentDialog from "./GuestAssignmentDialog";

interface TableListProps {
  tables: Table[];
  guests: Guest[];
  assignedGuestIds: Set<string>;
  onUpdateTable: (id: string, updates: Partial<Table>) => void;
  onRemoveTable: (id: string) => void;
  onAddGuestToTable: (tableId: string, guest: Guest) => void;
  onAddGroupMemberToTable: (tableId: string, guestId: string, member: { id: string; name: string; isChild: boolean }) => void;
  onRemoveGuestFromTable: (tableId: string, guestInstanceId: string) => void;
}

const TableList = ({
  tables,
  guests,
  assignedGuestIds,
  onUpdateTable,
  onRemoveTable,
  onAddGuestToTable,
  onAddGroupMemberToTable,
  onRemoveGuestFromTable
}: TableListProps) => {
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);

  // Handle table edit
  const handleEditTable = (table: Table) => {
    setEditingTable({
      ...table
    });
  };

  // Save table edits
  const saveTableEdits = () => {
    if (editingTable) {
      onUpdateTable(editingTable.id, {
        name: editingTable.name,
        capacity: editingTable.capacity
      });
      setEditingTable(null);
    }
  };

  // Handle table edit changes
  const handleEditChanges = (updates: Partial<Table>) => {
    if (editingTable) {
      setEditingTable({
        ...editingTable,
        ...updates
      });
    }
  };

  if (tables.length === 0) {
    return <p className="text-gray-500">Nessun tavolo trovato. Aggiungi un tavolo per iniziare.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {tables.map((table) => (
          <TableCard
            key={table.id}
            table={table}
            onEditTable={handleEditTable}
            onRemoveTable={onRemoveTable}
            onOpenAssignDialog={setSelectedTable}
            onRemoveGuestFromTable={onRemoveGuestFromTable}
          />
        ))}
      </div>

      {/* Edit Table Dialog */}
      <EditTableDialog 
        table={editingTable}
        onClose={() => setEditingTable(null)}
        onSave={saveTableEdits}
        onChange={handleEditChanges}
      />

      {/* Assign Guests Dialog */}
      <GuestAssignmentDialog
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        guests={guests}
        assignedGuestIds={assignedGuestIds}
        onAddGuestToTable={onAddGuestToTable}
        onAddGroupMemberToTable={onAddGroupMemberToTable}
      />
    </>
  );
};

export default TableList;
