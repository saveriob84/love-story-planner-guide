
import { useAuth } from "@/contexts/AuthContext";
import { useGuestQueries } from "./useGuestQueries";
import { useGuestMutations } from "./useGuestMutations";
import { useGuestStats } from "./useGuestStats";
import { useGuestMigration } from "./useGuestMigration";
import { useEffect } from "react";

export const useGuests = () => {
  const { user } = useAuth();
  const { guests, setGuests, isLoading, loadGuests } = useGuestQueries();
  const { migrateLocalStorageToSupabase } = useGuestMigration();
  const { addGuest, updateGuest, removeGuest } = useGuestMutations(guests, setGuests, loadGuests);
  const stats = useGuestStats(guests);

  // Check for data migration needs
  useEffect(() => {
    const checkForMigration = async () => {
      if (user?.id && guests.length === 0 && !isLoading) {
        const savedGuests = localStorage.getItem(`wedding_guests_${user.id}`);
        if (savedGuests) {
          try {
            const parsedGuests = JSON.parse(savedGuests);
            if (Array.isArray(parsedGuests) && parsedGuests.length > 0) {
              await migrateLocalStorageToSupabase(parsedGuests, user.id);
              loadGuests();
            }
          } catch (error) {
            console.error("Error checking for migration:", error);
          }
        }
      }
    };
    
    checkForMigration();
  }, [user?.id, guests.length, isLoading]);

  return {
    guests,
    isLoading,
    addGuest,
    updateGuest,
    removeGuest,
    stats
  };
};

// Export the original hook (now refactored) to maintain compatibility
export * from "./useGuests";
