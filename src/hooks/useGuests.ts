
import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";

export const useGuests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load guests from localStorage
  useEffect(() => {
    const loadGuests = () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          const savedGuests = localStorage.getItem(`wedding_guests_${user.id}`);
          if (savedGuests) {
            const parsedGuests = JSON.parse(savedGuests);
            
            // Assicuriamoci che tutti i membri del gruppo abbiano la proprietà isChild
            const updatedGuests = parsedGuests.map((guest: Guest) => {
              const updatedGroupMembers = guest.groupMembers.map(member => ({
                ...member,
                isChild: member.isChild !== undefined ? member.isChild : false
              }));
              
              return {
                ...guest,
                groupMembers: updatedGroupMembers
              };
            });
            
            setGuests(Array.isArray(updatedGuests) ? updatedGuests : []);
          }
        }
      } catch (error) {
        console.error("Error loading guests:", error);
        toast({
          title: "Errore",
          description: "Impossibile caricare la lista degli ospiti.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGuests();
  }, [user?.id, toast]);
  
  // Save guests to localStorage whenever the list changes
  useEffect(() => {
    try {
      if (user?.id) {
        localStorage.setItem(`wedding_guests_${user.id}`, JSON.stringify(guests));
      }
    } catch (error) {
      console.error("Error saving guests:", error);
      toast({
        title: "Errore",
        description: "Impossibile salvare la lista degli ospiti.",
        variant: "destructive",
      });
    }
  }, [guests, user?.id, toast]);

  // Add new guest
  const addGuest = (guestData: Omit<Guest, "id" | "rsvp">) => {
    if (guestData.name) {
      const guest: Guest = {
        id: `guest-${Date.now()}`,
        rsvp: "pending",
        ...guestData,
      };
      
      setGuests([...guests, guest]);
      
      return true;
    }
    return false;
  };

  // Update guest
  const updateGuest = (id: string, updates: Partial<Guest>) => {
    setGuests(guests.map(guest => 
      guest.id === id ? { ...guest, ...updates } : guest
    ));
  };

  // Remove guest
  const removeGuest = (id: string) => {
    if (window.confirm("Sei sicuro di voler rimuovere questo ospite?")) {
      setGuests(guests.filter(guest => guest.id !== id));
      toast({
        title: "Ospite rimosso",
        description: "L'ospite è stato rimosso dalla lista.",
      });
    }
  };

  // Guest statistics
  const totalGuests = guests.length;
  const confirmedGuests = guests.filter(g => g.rsvp === "confirmed").length;
  const pendingGuests = guests.filter(g => g.rsvp === "pending").length;
  const declinedGuests = guests.filter(g => g.rsvp === "declined").length;
  
  // Plus ones and group members calculation
  const totalGroupMembers = guests.reduce((total, guest) => {
    return total + (guest.rsvp === "confirmed" ? guest.groupMembers.length : 0);
  }, 0);

  const plusOnes = guests.reduce((total, guest) => {
    return total + (guest.plusOne && guest.rsvp === "confirmed" ? 1 : 0);
  }, 0);
  
  // Total attending
  const totalAttending = confirmedGuests + plusOnes + totalGroupMembers;

  return {
    guests,
    isLoading,
    addGuest,
    updateGuest,
    removeGuest,
    stats: {
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalGroupMembers,
      plusOnes,
      totalAttending
    }
  };
};
