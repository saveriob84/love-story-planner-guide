
import { TableGuest, Table } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserRound, Users } from "lucide-react";

interface TableVisualizationProps {
  tables: Table[];
  onAssignGuest: (guestId: string, tableId: string) => void;
}

export const TableVisualization = ({ tables, onAssignGuest }: TableVisualizationProps) => {
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
          <div className="absolute top-0 left-0 right-0 bg-wedding-gold/20 px-4 py-2 text-center">
            <h3 className="font-serif text-lg font-medium">{table.name}</h3>
          </div>
          
          <div className="mt-12 p-4">
            <div className="bg-gray-50 rounded-lg p-3 min-h-40">
              <div className="flex flex-wrap gap-2 justify-center">
                {table.guests.map((guest) => (
                  <div
                    key={guest.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, guest.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm cursor-move transition-colors flex items-center ${
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
    </div>
  );
};
