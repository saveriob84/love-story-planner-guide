
import { TableGuest, Table } from "@/types/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { UserRound, Users, Edit, Trash2 } from "lucide-react";

interface TableCardProps {
  table: Table;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, tableId: string) => void;
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
  // Calculate total number of guests including group members
  const totalGuests = table.guests.length;
  
  // Determine if this is the special "Sposi" table
  const isSpecialTable = table.isSpecial || table.name === "Tavolo Sposi";
  
  return (
    <Card 
      key={table.id}
      className={`relative overflow-hidden border-2 transition-shadow hover:shadow-md ${
        isSpecialTable ? "border-wedding-gold" : ""
      }`}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, table.id)}
    >
      <div className={`absolute top-0 left-0 right-0 px-4 py-2 text-center flex justify-between items-center ${
        isSpecialTable ? "bg-wedding-gold/30" : "bg-wedding-gold/20"
      }`}>
        <div className="w-8">
          <button 
            onClick={() => onDeleteTable(table)}
            className={`hover:text-red-600 transition-colors ${
              isSpecialTable ? "text-gray-700" : "text-gray-600"
            }`}
            aria-label="Elimina tavolo"
            disabled={isSpecialTable}
          >
            <Trash2 className={`h-4 w-4 ${isSpecialTable ? "opacity-50" : ""}`} />
          </button>
        </div>
        
        <h3 className={`font-serif text-lg font-medium ${
          isSpecialTable ? "text-gray-900" : ""
        }`}>
          {table.name}
          {isSpecialTable && (
            <Badge variant="outline" className="ml-2 bg-wedding-gold/20 border-wedding-gold text-gray-900">
              Sposi
            </Badge>
          )}
        </h3>
        
        <div className="w-8 text-right">
          <button 
            onClick={() => onEditTable(table)}
            className={`hover:text-wedding-gold transition-colors ${
              isSpecialTable ? "text-gray-700" : "text-gray-600"
            }`}
            aria-label="Modifica tavolo"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
      </div>
      
      <div className="mt-12 p-4">
        <div className={`rounded-lg p-3 min-h-40 ${
          isSpecialTable ? "bg-wedding-gold/10" : "bg-gray-50"
        }`}>
          <div className="flex flex-wrap gap-2 justify-center">
            {table.guests.map((guest) => (
              <div
                key={guest.id}
                draggable
                onDragStart={(e) => handleDragStart(e, guest.id)}
                className={`rounded-lg px-3 py-1.5 text-sm cursor-move transition-colors ${
                  guest.isGroupMember 
                    ? "bg-wedding-blush/20 hover:bg-wedding-blush/40" 
                    : isSpecialTable
                    ? "bg-wedding-gold/20 hover:bg-wedding-gold/30 font-medium"
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
            
            {Array.from({ length: table.capacity - totalGuests }).map((_, index) => (
              <div 
                key={index} 
                className={`rounded-lg px-3 py-1.5 text-sm text-gray-400 italic ${
                  isSpecialTable ? "bg-gray-100/70" : "bg-gray-100"
                }`}
              >
                Posto libero
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center text-sm text-gray-500">
          <span>{totalGuests} / {table.capacity} ospiti</span>
          <Badge 
            variant="outline" 
            className={totalGuests === table.capacity 
              ? "bg-green-50 text-green-700" 
              : isSpecialTable && totalGuests > 0
              ? "bg-wedding-gold/10 text-gray-700"
              : ""
            }
          >
            {totalGuests === table.capacity 
              ? "Completo" 
              : `${table.capacity - totalGuests} posti liberi`
            }
          </Badge>
        </div>
      </div>
    </Card>
  );
};
