
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useGuests } from "@/hooks/useGuests";
import { Guest, GroupMember } from "@/types/guest";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Table } from "lucide-react";
import { TableVisualization } from "@/components/tables/TableVisualization";
import { GuestList } from "@/components/tables/GuestList";
import { TableStatistics } from "@/components/tables/TableStatistics";
import { TableActionBar } from "@/components/tables/TableActionBar";
import { downloadTableArrangement } from "@/utils/tableExporter";
import { useToast } from "@/hooks/use-toast";
import { TableGuest, Table as TableType } from "@/types/table";

const TableArrangementPage = () => {
  const { toast } = useToast();
  const { guests, stats } = useGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmedGuests, setConfirmedGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  const [tables, setTables] = useState<TableType[]>([ 
    { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
    { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
    { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
  ]);

  // Filter only confirmed guests
  useEffect(() => {
    const onlyConfirmed = guests.filter(g => g.rsvp === "confirmed");
    setConfirmedGuests(onlyConfirmed);
    setFilteredGuests(onlyConfirmed);
  }, [guests]);

  // Filter guests based on search term
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredGuests(confirmedGuests);
    } else {
      setFilteredGuests(
        confirmedGuests.filter((guest) =>
          guest.name.toLowerCase().includes(value.toLowerCase()) ||
          guest.groupMembers.some(member => 
            member.name.toLowerCase().includes(value.toLowerCase())
          )
        )
      );
    }
  };

  // Assign guest to table (works for both main guests and group members)
  const assignGuestToTable = (guestId: string, tableId: string) => {
    console.log("Assigning guest", guestId, "to table", tableId);
    
    // First check if it's a main guest or a group member
    let targetGuest: TableGuest | undefined;
    
    // Find among main guests
    const mainGuest = guests.find(g => g.id === guestId);
    if (mainGuest) {
      targetGuest = {
        id: mainGuest.id,
        name: mainGuest.name,
        dietaryRestrictions: mainGuest.dietaryRestrictions
      };
    } else {
      // If not a main guest, look among group members
      for (const guest of guests) {
        const groupMember = guest.groupMembers.find(m => m.id === guestId);
        if (groupMember) {
          targetGuest = {
            id: groupMember.id,
            name: groupMember.name,
            dietaryRestrictions: groupMember.dietaryRestrictions,
            isGroupMember: true,
            parentGuestId: guest.id
          };
          console.log("Found group member", groupMember.name);
          break;
        }
      }
    }
    
    if (!targetGuest) {
      console.log("Guest not found:", guestId);
      return;
    }
    
    console.log("Target guest", targetGuest);
    
    // Remove guest from any existing table
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g.id !== guestId)
    }));
    
    // Add guest to new table if tableId is provided and not "unassigned"
    if (tableId && tableId !== "unassigned") {
      const targetTable = updatedTables.find(t => t.id === tableId);
      if (targetTable && targetTable.guests.length < targetTable.capacity) {
        targetTable.guests = [...targetTable.guests, targetGuest];
        toast({
          title: "Ospite assegnato",
          description: `${targetGuest.name} è stato assegnato a ${targetTable.name}`,
        });
      }
    } else {
      toast({
        title: "Ospite rimosso",
        description: `${targetGuest.name} è stato rimosso dal tavolo`,
      });
    }
    
    setTables(updatedTables);
  };

  // Add new table
  const addTable = () => {
    const newId = `table${tables.length + 1}`;
    const newTable = {
      id: newId,
      name: `Tavolo ${tables.length + 1}`,
      capacity: 8,
      guests: []
    };
    setTables([...tables, newTable]);
    toast({
      title: "Tavolo aggiunto",
      description: `${newTable.name} è stato aggiunto con successo`,
    });
  };

  // Add custom table with name and capacity
  const addCustomTable = (name: string, capacity: number) => {
    const newId = `table${tables.length + 1}`;
    const newTable = {
      id: newId,
      name,
      capacity,
      guests: []
    };
    setTables([...tables, newTable]);
    toast({
      title: "Tavolo personalizzato aggiunto",
      description: `${name} è stato aggiunto con successo`,
    });
  };

  // Edit existing table
  const editTable = (tableId: string, name: string, capacity: number) => {
    const updatedTables = tables.map(table => {
      if (table.id === tableId) {
        // If new capacity is less than current guests, don't allow the change
        if (capacity < table.guests.length) {
          toast({
            title: "Errore",
            description: `Non puoi ridurre la capacità a ${capacity} perché ci sono già ${table.guests.length} ospiti assegnati.`,
            variant: "destructive",
          });
          return table;
        }
        
        return {
          ...table,
          name,
          capacity
        };
      }
      return table;
    });
    
    setTables(updatedTables);
    toast({
      title: "Tavolo modificato",
      description: `Il tavolo è stato aggiornato con successo`,
    });
  };

  // Delete table
  const deleteTable = (tableId: string) => {
    const tableToDelete = tables.find(t => t.id === tableId);
    if (!tableToDelete) return;
    
    const hasGuests = tableToDelete.guests.length > 0;
    
    const updatedTables = tables.filter(table => table.id !== tableId);
    setTables(updatedTables);
    
    toast({
      title: "Tavolo eliminato",
      description: hasGuests 
        ? `${tableToDelete.name} è stato eliminato e ${tableToDelete.guests.length} ospiti sono stati rimossi dal tavolo` 
        : `${tableToDelete.name} è stato eliminato con successo`,
    });
  };

  // Export table arrangement
  const handleExportTables = () => {
    downloadTableArrangement(tables);
  };

  return (
    <MainLayout>
      <div className="container px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-semibold text-gray-800">Disposizione dei Tavoli</h1>
          <p className="text-gray-600 mt-2">Organizza facilmente i posti a sedere per il tuo ricevimento</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main section - Table visualization */}
          <div className="w-full lg:w-2/3">
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-xl font-serif font-medium mb-4 flex items-center">
                <Table className="mr-2 text-wedding-gold" /> 
                Mappa dei Tavoli
              </h2>
              <TableVisualization 
                tables={tables} 
                onAssignGuest={assignGuestToTable} 
                onEditTable={editTable}
                onDeleteTable={deleteTable}
              />
            </div>
            
            <TableActionBar 
              onAddTable={addTable} 
              tables={tables} 
              onAddCustomTable={addCustomTable}
              onExportTables={handleExportTables}
            />
            
            <TableStatistics
              totalGuests={stats.confirmedGuests}
              totalTables={tables.length}
              assignedGuests={tables.reduce((sum, table) => sum + table.guests.length, 0)}
              availableSeats={tables.reduce((sum, table) => sum + table.capacity, 0)}
            />
          </div>

          {/* Side section - Guest list */}
          <div className="w-full lg:w-1/3">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-serif font-medium mb-4 flex items-center">
                <Users className="mr-2 text-wedding-gold" />
                Elenco Ospiti
              </h2>
              
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cerca ospiti..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {filteredGuests.length === 0 ? (
                <div className="text-center p-6 border-2 border-dashed rounded-lg">
                  {searchTerm ? (
                    <p className="text-gray-500">Nessun ospite corrisponde alla ricerca</p>
                  ) : (
                    <>
                      <p className="text-gray-500">Nessun ospite confermato</p>
                      <p className="text-sm text-gray-400 mt-2">Vai alla pagina "Ospiti" per confermare gli invitati</p>
                    </>
                  )}
                </div>
              ) : (
                <GuestList 
                  guests={filteredGuests} 
                  tables={tables}
                  onAssignGuest={assignGuestToTable} 
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TableArrangementPage;
