
import { useState, useEffect } from "react";
import MainLayout from "@/components/layouts/MainLayout";
import { useGuests } from "@/hooks/useGuests";
import { Guest } from "@/types/guest";
import { Input } from "@/components/ui/input";
import { Search, Users, Table } from "lucide-react";
import { TableVisualization } from "@/components/tables/TableVisualization";
import { GuestList } from "@/components/tables/GuestList";
import { TableStatistics } from "@/components/tables/TableStatistics";
import { TableActionBar } from "@/components/tables/TableActionBar";
import { downloadTableArrangement } from "@/utils/tableExporter";
import { useTableArrangement } from "@/hooks/useTableArrangement";

const TableArrangementPage = () => {
  const { guests, stats } = useGuests();
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmedGuests, setConfirmedGuests] = useState<Guest[]>([]);
  const [filteredGuests, setFilteredGuests] = useState<Guest[]>([]);
  
  const {
    tables,
    assignGuestToTable,
    addTable,
    addCustomTable,
    editTable,
    deleteTable,
    tableStats
  } = useTableArrangement(guests);

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
              totalTables={tableStats.totalTables}
              assignedGuests={tableStats.assignedGuests}
              availableSeats={tableStats.availableSeats}
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
