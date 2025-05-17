
import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/layouts/MainLayout";
import { Input } from "@/components/ui/input";
import { Search, FileText, Download } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GuestList from "@/components/guests/GuestList";
import GuestFormCard from "@/components/guests/GuestFormCard";
import GuestStats from "@/components/guests/GuestStats";
import GroupMemberDialog from "@/components/guests/GroupMemberDialog";
import { useGuests } from "@/hooks/useGuests";
import { Guest } from "@/types/guest";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateGuestPDF } from "@/utils/pdfGenerator";
import GuestListPrint from "@/components/guests/GuestListPrint";

const GuestsPage = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  
  const { 
    guests, 
    isLoading, 
    addGuest, 
    updateGuest, 
    removeGuest,
    stats 
  } = useGuests();

  // Filter guests based on search and tab
  const filteredGuests = (rsvpFilter?: Guest["rsvp"]) => {
    return guests.filter(guest => {
      const matchesSearch = guest.name.toLowerCase().includes(searchTerm.toLowerCase());
      return rsvpFilter 
        ? matchesSearch && guest.rsvp === rsvpFilter
        : matchesSearch;
    });
  };

  // If still loading, show loading state
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl text-gray-600">Caricamento degli ospiti...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // If no user, show login message
  if (!user) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <p className="text-xl text-gray-600">Effettua il login per vedere la lista degli ospiti.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  const handleDownloadPDF = () => {
    generateGuestPDF(guests, stats);
  };

  return (
    <MainLayout>
      <div className="py-6 px-4 sm:px-6">
        <div className="mb-8">
          <h1 className="font-serif text-3xl font-bold text-wedding-navy">
            Lista Ospiti
          </h1>
          <p className="text-gray-500 mt-2">
            Gestisci gli invitati al tuo matrimonio
          </p>
        </div>

        {/* Overview Cards */}
        <GuestStats 
          totalGuests={stats.totalGuests} 
          confirmedGuests={stats.confirmedGuests}
          pendingGuests={stats.pendingGuests}
          declinedGuests={stats.declinedGuests}
          totalAttending={stats.totalAttending}
        />
        
        {/* Add New Guest Form */}
        <GuestFormCard onAddGuest={addGuest} />
        
        {/* Guests List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-bold text-wedding-navy">I tuoi ospiti</h2>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  placeholder="Cerca ospiti..." 
                  className="pl-10 w-full max-w-xs"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Dialog open={showPrintDialog} onOpenChange={setShowPrintDialog}>
                <Button 
                  variant="outline" 
                  onClick={() => setShowPrintDialog(true)}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Anteprima Lista
                </Button>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle className="text-center">Lista Invitati - Anteprima</DialogTitle>
                  </DialogHeader>
                  <GuestListPrint guests={guests} stats={stats} />
                </DialogContent>
              </Dialog>
              
              <Button 
                onClick={handleDownloadPDF} 
                variant="default"
                className="flex items-center gap-2 bg-wedding-navy hover:bg-wedding-navy/80"
              >
                <Download className="h-4 w-4" />
                Scarica PDF
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Tutti ({stats.totalGuests})</TabsTrigger>
              <TabsTrigger value="confirmed">Confermati ({stats.confirmedGuests})</TabsTrigger>
              <TabsTrigger value="pending">In attesa ({stats.pendingGuests})</TabsTrigger>
              <TabsTrigger value="declined">Non partecipano ({stats.declinedGuests})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <GuestList 
                guests={filteredGuests()} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
            
            <TabsContent value="confirmed">
              <GuestList 
                guests={filteredGuests("confirmed")} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
            
            <TabsContent value="pending">
              <GuestList 
                guests={filteredGuests("pending")} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
            
            <TabsContent value="declined">
              <GuestList 
                guests={filteredGuests("declined")} 
                onUpdate={updateGuest} 
                onRemove={removeGuest}
                onEditMembers={setEditingGuest}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog per modificare i membri del gruppo */}
      <GroupMemberDialog 
        guest={editingGuest} 
        onClose={() => setEditingGuest(null)} 
        onUpdateGuest={updateGuest}
      />
    </MainLayout>
  );
};

export default GuestsPage;
