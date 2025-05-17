
import { useState } from "react";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, ChevronDown, ChevronUp } from "lucide-react";
import { TableGuest, Table } from "@/types/table";

interface GuestListProps {
  guests: Guest[];
  tables: Table[];
  onAssignGuest: (guestId: string, tableId: string) => void;
}

export const GuestList = ({ guests, tables, onAssignGuest }: GuestListProps) => {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  // Find which table a guest is assigned to
  const getGuestTable = (guestId: string) => {
    for (const table of tables) {
      if (table.guests.some(g => g.id === guestId)) {
        return table.id;
      }
    }
    return "";
  };

  const toggleGroup = (guestId: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [guestId]: !prev[guestId]
    }));
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
          const hasGroupMembers = guest.groupMembers.length > 0;
          const isExpanded = expandedGroups[guest.id] || false;
          
          return (
            <div key={guest.id} className="space-y-2">
              <div 
                className="border rounded-lg p-3 bg-white hover:shadow-sm transition-shadow"
                draggable
                onDragStart={(e) => e.dataTransfer.setData("guestId", guest.id)}
              >
                <div className="flex justify-between gap-2">
                  <div>
                    <p className="font-medium">{guest.name}</p>
                    {hasGroupMembers && (
                      <button 
                        onClick={() => toggleGroup(guest.id)}
                        className="text-xs text-gray-600 flex items-center mt-1 hover:text-gray-900"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="h-3 w-3 mr-1" />
                            Nascondi gruppo
                          </>
                        ) : (
                          <>
                            <ChevronDown className="h-3 w-3 mr-1" />
                            Mostra gruppo (+{guest.groupMembers.length})
                          </>
                        )}
                      </button>
                    )}
                    {guest.dietaryRestrictions && (
                      <div className="text-xs text-amber-600 mt-1">
                        Dieta: {guest.dietaryRestrictions}
                      </div>
                    )}
                  </div>
                  
                  <Select 
                    value={assignedTable || "unassigned"} 
                    onValueChange={(value) => onAssignGuest(guest.id, value)}
                  >
                    <SelectTrigger className="w-[110px] h-8 text-xs">
                      <SelectValue placeholder="Assegna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Non assegnato</SelectItem>
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
              
              {/* Group members - show when expanded */}
              {hasGroupMembers && isExpanded && (
                <div className="pl-4 space-y-2">
                  {guest.groupMembers.map((member) => {
                    const memberAssignedTable = getGuestTable(member.id);
                    
                    return (
                      <div 
                        key={member.id}
                        className="border border-dashed rounded-lg p-2 bg-gray-50 hover:shadow-sm transition-shadow"
                        draggable
                        onDragStart={(e) => e.dataTransfer.setData("guestId", member.id)}
                      >
                        <div className="flex justify-between gap-2">
                          <div>
                            <p className="text-sm">{member.name}</p>
                            {member.isChild && (
                              <div className="text-xs text-blue-600">Bambino</div>
                            )}
                            {member.dietaryRestrictions && (
                              <div className="text-xs text-amber-600">
                                Dieta: {member.dietaryRestrictions}
                              </div>
                            )}
                          </div>
                          
                          <Select 
                            value={memberAssignedTable || "unassigned"}
                            onValueChange={(value) => onAssignGuest(member.id, value)}
                          >
                            <SelectTrigger className="w-[110px] h-7 text-xs">
                              <SelectValue placeholder="Assegna" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="unassigned">Non assegnato</SelectItem>
                              {tables.map((table) => (
                                <SelectItem 
                                  key={table.id} 
                                  value={table.id}
                                  disabled={table.guests.length >= table.capacity && !memberAssignedTable}
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
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};
