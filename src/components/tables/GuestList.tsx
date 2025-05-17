
import { useState } from "react";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";

interface GuestListProps {
  guests: Guest[];
  tables: Array<{
    id: string;
    name: string;
    capacity: number;
    guests: Guest[];
  }>;
  onAssignGuest: (guestId: string, tableId: string) => void;
}

export const GuestList = ({ guests, tables, onAssignGuest }: GuestListProps) => {
  const [tableAssignments, setTableAssignments] = useState<Record<string, string>>({});

  const handleAssignment = (guestId: string, tableId: string) => {
    setTableAssignments({
      ...tableAssignments,
      [guestId]: tableId,
    });
    onAssignGuest(guestId, tableId);
  };

  // Find which table a guest is assigned to
  const getGuestTable = (guestId: string) => {
    for (const table of tables) {
      if (table.guests.some(g => g.id === guestId)) {
        return table.id;
      }
    }
    return "";
  };

  if (guests.length === 0) {
    return (
      <div className="text-center p-6 border-2 border-dashed rounded-lg">
        <p className="text-gray-500">Nessun ospite confermato</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-3">
        {guests.map((guest) => {
          const assignedTable = getGuestTable(guest.id);
          
          return (
            <div 
              key={guest.id} 
              className="border rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
              draggable
              onDragStart={(e) => e.dataTransfer.setData("guestId", guest.id)}
            >
              <div className="flex justify-between gap-2">
                <div>
                  <p className="font-medium">{guest.name}</p>
                  {guest.groupMembers.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      +{guest.groupMembers.length} nel gruppo
                    </div>
                  )}
                  {guest.dietaryRestrictions && (
                    <div className="text-xs text-amber-600 mt-1">
                      Dieta: {guest.dietaryRestrictions}
                    </div>
                  )}
                </div>
                
                <Select 
                  value={assignedTable} 
                  onValueChange={(value) => handleAssignment(guest.id, value)}
                >
                  <SelectTrigger className="w-[110px] h-8 text-xs">
                    <SelectValue placeholder="Assegna" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Non assegnato</SelectItem>
                    {tables.map((table) => (
                      <SelectItem 
                        key={table.id} 
                        value={table.id}
                        disabled={table.guests.length >= table.capacity && !assignedTable}
                      >
                        {table.name} {table.guests.length >= table.capacity ? "(pieno)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
