
import { Table, TableGuest } from "@/types/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Edit, Baby, UserPlus } from "lucide-react";

interface TableCardProps {
  table: Table;
  onEditTable: (table: Table) => void;
  onRemoveTable: (id: string) => void;
  onOpenAssignDialog: (table: Table) => void;
  onRemoveGuestFromTable: (tableId: string, guestInstanceId: string) => void;
}

const TableCard = ({
  table,
  onEditTable,
  onRemoveTable,
  onOpenAssignDialog,
  onRemoveGuestFromTable
}: TableCardProps) => {
  return (
    <Card key={table.id} className="relative overflow-hidden">
      <CardHeader className={table.id === "table-sposi" ? "bg-red-500 text-white" : ""}>
        <CardTitle className="flex justify-between items-center">
          <span>{table.name}</span>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onEditTable(table)}
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
          onClick={() => onOpenAssignDialog(table)}
        >
          <UserPlus className="h-4 w-4 mr-2" /> 
          Assegna ospiti
        </Button>
      </CardContent>
    </Card>
  );
};

export default TableCard;
