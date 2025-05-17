
import { TableGuest, Table } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserRound, Users, Edit, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

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

  if (tables.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 border-2 border-dashed rounded-lg p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-gray-500 mb-2">Nessun tavolo disponibile</p>
          <p className="text-gray-400 text-sm">Aggiungi dei tavoli per iniziare</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tables.map((table) => (
        <Card 
          key={table.id}
          className="relative overflow-hidden border-2 transition-shadow hover:shadow-md"
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, table.id)}
        >
          <div className="absolute top-0 left-0 right-0 bg-wedding-gold/20 px-4 py-2 text-center flex justify-between items-center">
            <div className="w-8">
              {onDeleteTable && (
                <button 
                  onClick={() => openDeleteDialog(table)}
                  className="text-gray-600 hover:text-red-600 transition-colors"
                  aria-label="Elimina tavolo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <h3 className="font-serif text-lg font-medium">{table.name}</h3>
            
            <div className="w-8 text-right">
              {onEditTable && (
                <button 
                  onClick={() => openEditDialog(table)}
                  className="text-gray-600 hover:text-wedding-gold transition-colors"
                  aria-label="Modifica tavolo"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-12 p-4">
            <div className="bg-gray-50 rounded-lg p-3 min-h-40">
              <div className="flex flex-wrap gap-2 justify-center">
                {table.guests.map((guest) => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm cursor-move transition-colors ${
                      guest.isGroupMember 
                        ? "bg-wedding-blush/20 hover:bg-wedding-blush/40" 
                        : "bg-wedding-blush/30 hover:bg-wedding-blush/50"
                    }`}
                  >
                    {guest.isGroupMember ? (
                      <UserRound className="h-3 w-3 mr-1 opacity-70" />
                    ) : (
                      <Users className="h-3 w-3 mr-1 opacity-70" />
                    )}
                    {guest.name}
                  </div>
                ))}
                
                {Array.from({ length: table.capacity - table.guests.length }).map((_, index) => (
                  <div key={index} className="bg-gray-100 rounded-lg px-3 py-1.5 text-sm text-gray-400 italic">
                    Posto libero
                  </div>
                ))}
              </div>
            </div>
            
            <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
              <span>{table.guests.length} / {table.capacity} ospiti</span>
              <Badge variant="outline" className={table.guests.length === table.capacity ? "bg-green-50 text-green-700" : ""}>
                {table.guests.length === table.capacity ? "Completo" : `${table.capacity - table.guests.length} posti liberi`}
              </Badge>
            </div>
          </div>
        </Card>
      ))}

      {/* Edit Table Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica tavolo</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome del tavolo</Label>
              <Input
                id="edit-name"
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Es. Tavolo Sposi"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-capacity">Numero di posti</Label>
              <Input
                id="edit-capacity"
                type="number"
                min="1"
                max="20"
                value={tableCapacity}
                onChange={(e) => setTableCapacity(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>Annulla</Button>
            <Button onClick={handleSaveEdit}>Salva modifiche</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Table Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro di voler eliminare questo tavolo?</AlertDialogTitle>
            <AlertDialogDescription>
              Questa azione rimuoverà "{currentTable?.name}" e tutti gli ospiti assegnati verranno rimossi dal tavolo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annulla</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (currentTable && onDeleteTable) {
                  onDeleteTable(currentTable.id);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Elimina
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
