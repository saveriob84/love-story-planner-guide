
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserCheck, UserX } from "lucide-react";

interface GuestStatsProps {
  totalGuests: number;
  confirmedGuests: number;
  pendingGuests: number;
  declinedGuests: number;
  totalAttending: number;
}

const GuestStats = ({
  totalGuests,
  confirmedGuests,
  pendingGuests,
  declinedGuests,
  totalAttending
}: GuestStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Totale Invitati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-wedding-navy mr-2" />
            <span className="text-3xl font-bold text-wedding-navy">{totalGuests}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">nuclei familiari/singoli</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Confermati</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <UserCheck className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-3xl font-bold text-green-600">{confirmedGuests}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            {totalAttending} persone in totale
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">In Attesa</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <Users className="h-5 w-5 text-amber-500 mr-2" />
            <span className="text-3xl font-bold text-amber-500">{pendingGuests}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">risposte attese</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Non Partecipanti</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <UserX className="h-5 w-5 text-red-500 mr-2" />
            <span className="text-3xl font-bold text-red-500">{declinedGuests}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">hanno declinato</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default GuestStats;
