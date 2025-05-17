
import { useState } from "react";
import { TableGuest, Table } from "@/types/table";
import { TableCard } from "./TableCard";
import { EditTableDialog } from "./EditTableDialog";
import { DeleteTableDialog } from "./DeleteTableDialog";
import { EmptyTableDisplay } from "./EmptyTableDisplay";

interface TableVisualizationProps {
  tables: Table[];
  onAssignGuest: (guestId: string, tableId: string) => void;
  onEditTable?: (tableId: string, name: string, capacity: number) => void;
  onDeleteTable?: (tableId: string) => void;
}

export const TableVisualization = ({ 
  tables, 
  onAssignGuest,
  onEditTable,
  onDeleteTable
}: TableVisualizationProps) => {
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentTable, setCurrentTable] = useState<Table | null>(null);
  const [tableName, setTableName] = useState("");
  const [tableCapacity, setTableCapacity] = useState("");

  // Handle dialog for editing table
  const openEditDialog = (table: Table) => {
    setCurrentTable(table);
    setTableName(table.name);
    setTableCapacity(table.capacity.toString());
    setEditDialogOpen(true);
  };

  // Handle dialog for deleting table
  const openDeleteDialog = (table: Table) => {
    setCurrentTable(table);
    setDeleteDialogOpen(true);
  };

  // Handle save table edits
  const handleSaveEdit = () => {
    if (currentTable && onEditTable) {
      onEditTable(currentTable.id, tableName, parseInt(tableCapacity) || currentTable.capacity);
    }
    setEditDialogOpen(false);
  };

  // Handle drag events
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, guestId: string) => {
    e.dataTransfer.setData("guestId", guestId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, tableId: string) => {
    e.preventDefault();
    const guestId = e.dataTransfer.getData("guestId");
    onAssignGuest(guestId, tableId);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (currentTable && onDeleteTable) {
      onDeleteTable(currentTable.id);
    }
  };

  if (tables.length === 0) {
    return <EmptyTableDisplay />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map((table) => (
        <TableCard
          key={table.id}
          table={table}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onEditTable={openEditDialog}
          onDeleteTable={openDeleteDialog}
          handleDragStart={handleDragStart}
        />
      ))}

      {/* Edit Table Dialog */}
      <EditTableDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        currentTable={currentTable}
        tableName={tableName}
        setTableName={setTableName}
        tableCapacity={tableCapacity}
        setTableCapacity={setTableCapacity}
        onSave={handleSaveEdit}
      />

      {/* Delete Table Confirmation Dialog */}
      <DeleteTableDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        currentTable={currentTable}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
};
