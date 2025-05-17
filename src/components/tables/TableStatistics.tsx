
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TableStatisticsProps {
  totalGuests: number;
  totalTables: number;
  assignedGuests: number;
  availableSeats: number;
}

export const TableStatistics = ({
  totalGuests,
  totalTables,
  assignedGuests,
  availableSeats,
}: TableStatisticsProps) => {
  const unassignedGuests = totalGuests - assignedGuests;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
      <Card>
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm text-gray-600">Ospiti Totali</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-serif">{totalGuests}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm text-gray-600">Tavoli</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-serif">{totalTables}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm text-gray-600">Posti Disponibili</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-serif">{availableSeats}</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="py-3 pb-1">
          <CardTitle className="text-sm text-gray-600">Non Assegnati</CardTitle>
        </CardHeader>
        <CardContent>
          <p className={`text-2xl font-serif ${unassignedGuests > 0 ? 'text-amber-600' : 'text-green-600'}`}>
            {unassignedGuests}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
