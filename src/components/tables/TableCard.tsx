
import { TableGuest, Table } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserRound, Users, Edit, Trash2 } from "lucide-react";

interface TableCardProps {
  table: Table;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  onEditTable: (table: Table) => void;
  onDeleteTable: (table: Table) => void;
  handleDragStart: (e: React.DragEvent<HTMLDivElement>, guestId: string) => void;
}

export const TableCard = ({
  table,
  onDragOver,
  onDrop,
  onEditTable,
  onDeleteTable,
  handleDragStart
}: TableCardProps) => {
  return (
    <Card 
      key={table.id}
      className="relative overflow-hidden border-2 transition-shadow hover:shadow-md"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, table.id)}
    >
      <div className="absolute top-0 left-0 right-0 bg-wedding-gold/20 px-4 py-2 text-center flex justify-between items-center">
        <div className="w-8">
          <button 
            onClick={() => onDeleteTable(table)}
            className="text-gray-600 hover:text-red-600 transition-colors"
            aria-label="Elimina tavolo"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        
        <h3 className="font-serif text-lg font-medium">{table.name}</h3>
        
        <div className="w-8 text-right">
          <button 
            onClick={() => onEditTable(table)}
            className="text-gray-600 hover:text-wedding-gold transition-colors"
            aria-label="Modifica tavolo"
          >
            <Edit className="h-4 w-4" />
          </button>
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
  );
};
