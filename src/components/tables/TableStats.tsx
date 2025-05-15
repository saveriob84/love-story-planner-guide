
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TableStatsProps {
  stats: {
    totalTables: number;
    totalSeats: number;
    occupiedSeats: number;
    availableSeats: number;
  };
}

const TableStats = ({ stats }: TableStatsProps) => {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Tavoli Totali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalTables}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Posti Totali
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalSeats}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Posti Occupati
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.occupiedSeats}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSeats > 0 ? `${Math.round((stats.occupiedSeats / stats.totalSeats) * 100)}%` : '0%'}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Posti Disponibili
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.availableSeats}</div>
          <p className="text-xs text-muted-foreground">
            {stats.totalSeats > 0 ? `${Math.round((stats.availableSeats / stats.totalSeats) * 100)}%` : '0%'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TableStats;
