
import { useMemo } from "react";
import { Guest } from "@/types/guest";

export const useGuestStats = (guests: Guest[]) => {
  return useMemo(() => {
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
      totalGuests,
      confirmedGuests,
      pendingGuests,
      declinedGuests,
      totalGroupMembers,
      plusOnes,
      totalAttending
    };
  }, [guests]);
};
