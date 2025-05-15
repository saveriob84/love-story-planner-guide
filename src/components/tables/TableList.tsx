
import { useState } from "react";
import { Table } from "@/types/table";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { X, Edit, Users, UserPlus, Baby } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [searchGuest, setSearchGuest] = useState("");

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

  // Filter guests based on search and already assigned status
  const filteredGuests = guests.filter(guest => 
    (guest.name.toLowerCase().includes(searchGuest.toLowerCase()) || 
      guest.groupMembers.some(m => m.name.toLowerCase().includes(searchGuest.toLowerCase()))) &&
    !assignedGuestIds.has(guest.id) &&
    guest.rsvp === "confirmed" // Only show confirmed guests
  );

  if (tables.length === 0) {
    return <p className="text-gray-500">Nessun tavolo trovato. Aggiungi un tavolo per iniziare.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-8">
        {tables.map((table) => (
          <Card key={table.id} className="relative overflow-hidden">
            <CardHeader className={table.id === "table-sposi" ? "bg-red-500 text-white" : ""}>
              <CardTitle className="flex justify-between items-center">
                <span>{table.name}</span>
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditTable(table)}
                    className={table.id === "table-sposi" ? "hover:bg-red-600 text-white" : ""}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  {table.id !== "table-sposi" && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onRemoveTable(table.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardTitle>
              <div className={`text-sm ${table.id === "table-sposi" ? "text-white" : "text-gray-500"}`}>
                {table.guests.length}/{table.capacity} posti occupati
              </div>
            </CardHeader>
            <CardContent>
              {table.guests.length > 0 ? (
                <ul className="space-y-2">
                  {table.guests.map((tableGuest) => (
                    <li key={tableGuest.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                      <div className="flex items-center">
                        {tableGuest.name}
                        {tableGuest.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => onRemoveGuestFromTable(table.id, tableGuest.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-400 text-sm">Nessun ospite assegnato</p>
              )}
              
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4 w-full"
                onClick={() => setSelectedTable(table)}
              >
                <UserPlus className="h-4 w-4 mr-2" /> 
                Assegna ospiti
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Table Dialog */}
      {editingTable && (
        <Dialog open={!!editingTable} onOpenChange={(open) => !open && setEditingTable(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Modifica Tavolo</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="tableName">Nome Tavolo</Label>
                <Input 
                  id="tableName" 
                  value={editingTable.name}
                  onChange={(e) => setEditingTable({...editingTable, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tableCapacity">Numero di Posti</Label>
                <Input 
                  id="tableCapacity" 
                  type="number"
                  min={editingTable.guests?.length || 1} 
                  value={editingTable.capacity}
                  onChange={(e) => setEditingTable({
                    ...editingTable, 
                    capacity: parseInt(e.target.value) || editingTable.guests.length
                  })}
                />
                <p className="text-sm text-gray-500">
                  Il numero di posti non può essere inferiore al numero di ospiti già assegnati ({editingTable.guests.length})
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingTable(null)}>Annulla</Button>
              <Button onClick={saveTableEdits}>Salva Modifiche</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Assign Guests Dialog */}
      {selectedTable && (
        <Dialog open={!!selectedTable} onOpenChange={(open) => !open && setSelectedTable(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Assegna Ospiti a {selectedTable.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="guestSearch">Cerca Ospiti</Label>
                <Input 
                  id="guestSearch" 
                  placeholder="Cerca per nome..."
                  value={searchGuest}
                  onChange={(e) => setSearchGuest(e.target.value)}
                />
              </div>
              
              <div className="h-[400px] overflow-y-auto border rounded-md">
                {filteredGuests.length > 0 ? (
                  <UITable>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Gruppo</TableHead>
                        <TableHead>Azioni</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredGuests.map((guest) => (
                        <TableRow key={guest.id}>
                          <TableCell>{guest.name}</TableCell>
                          <TableCell>
                            {guest.groupMembers.length > 0 && (
                              <div className="flex items-center">
                                <Users className="h-4 w-4 mr-1" /> 
                                {guest.groupMembers.length}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button 
                                size="sm"
                                onClick={() => {
                                  onAddGuestToTable(selectedTable.id, guest);
                                  toast({
                                    title: "Ospite aggiunto",
                                    description: `${guest.name} è stato aggiunto a ${selectedTable.name}`
                                  });
                                }}
                              >
                                Aggiungi
                              </Button>
                              
                              {guest.groupMembers.length > 0 && (
                                <Dialog>
                                  <Button variant="outline" size="sm" onClick={() => {}}>
                                    Gruppo
                                  </Button>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>Aggiungi membri del gruppo</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <p>Seleziona i membri del gruppo di {guest.name} da aggiungere al tavolo:</p>
                                      <div className="space-y-2">
                                        {guest.groupMembers.map((member) => (
                                          <div key={member.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                            <div className="flex items-center">
                                              {member.name}
                                              {member.isChild && <Baby className="h-4 w-4 ml-2 text-blue-500" />}
                                            </div>
                                            <Button 
                                              size="sm"
                                              onClick={() => {
                                                onAddGroupMemberToTable(selectedTable.id, guest.id, member);
                                                toast({
                                                  title: "Membro aggiunto",
                                                  description: `${member.name} è stato aggiunto a ${selectedTable.name}`
                                                });
                                              }}
                                            >
                                              Aggiungi
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">Nessun ospite disponibile da assegnare</p>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default TableList;
