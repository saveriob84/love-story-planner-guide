
import { useState } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useGuests } from "@/hooks/useGuests";
import { Guest } from "@/types/guest";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, PlusCircle, Download, Users, Table } from "lucide-react";
import { TableVisualization } from "@/components/tables/TableVisualization";
import { GuestList } from "@/components/tables/GuestList";
import { TableStatistics } from "@/components/tables/TableStatistics";
import { TableActionBar } from "@/components/tables/TableActionBar";

const TableArrangementPage = () => {
  const { guests, stats, updateGuest } = useGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>(guests);
  const [tables, setTables] = useState<Array<{id: string, name: string, capacity: number, guests: Guest[]}>>([
    { id: "table1", name: "Tavolo 1", capacity: 8, guests: [] },
    { id: "table2", name: "Tavolo 2", capacity: 8, guests: [] },
    { id: "table3", name: "Tavolo 3", capacity: 8, guests: [] },
  ]);

  // Filter guests based on search term
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    if (value.trim() === "") {
      setFilteredGuests(guests);
    } else {
      setFilteredGuests(
        guests.filter((guest) =>
          guest.name.toLowerCase().includes(value.toLowerCase())
        )
      );
    }
  };

  // Assign guest to table
  const assignGuestToTable = (guestId: string, tableId: string) => {
    const guest = guests.find(g => g.id === guestId);
    if (!guest) return;
    
    // Remove guest from any existing table
    const updatedTables = tables.map(table => ({
      ...table,
      guests: table.guests.filter(g => g.id !== guestId)
    }));
    
    // Add guest to new table if tableId is provided
    if (tableId) {
      const targetTable = updatedTables.find(t => t.id === tableId);
      if (targetTable && targetTable.guests.length < targetTable.capacity) {
        targetTable.guests = [...targetTable.guests, guest];
      }
    }
    
    setTables(updatedTables);
  };

  // Add new table
  const addTable = () => {
    const newTable = {
      id: `table${tables.length + 1}`,
      name: `Tavolo ${tables.length + 1}`,
      capacity: 8,
      guests: []
    };
    setTables([...tables, newTable]);
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
              />
            </div>
            
            <TableActionBar onAddTable={addTable} tables={tables} />
            
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
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Cerca ospiti..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <GuestList 
                guests={filteredGuests.filter(g => g.rsvp === "confirmed")} 
                tables={tables}
                onAssignGuest={assignGuestToTable} 
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TableArrangementPage;
