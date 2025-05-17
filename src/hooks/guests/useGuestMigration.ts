import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types/guest";
import { useAuth } from "@/contexts/auth/AuthContext";

export const useGuestMigration = () => {
  const { toast } = useToast();

  // Function to migrate guests from localStorage to Supabase
  const migrateLocalStorageToSupabase = async (localGuests: Guest[], userId: string) => {
    try {
      // Check if the provided userId is valid or get the current authenticated user
      let validUserId = userId;
      
      // If the userId doesn't look like a UUID, get the authenticated user
      if (userId.includes('-') && userId.split('-')[0] === 'user') {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) {
          toast({
            title: "Errore",
            description: "Per migrare gli ospiti devi essere loggato.",
            variant: "destructive",
          });
          return false;
        }
        validUserId = user.id;
      }
      
      toast({
        title: "Migrazione dati",
        description: "Stiamo migrando i tuoi ospiti al database...",
      });

      // Process each guest
      for (const guest of localGuests) {
        // Insert the guest
        const { error: guestError } = await supabase
          .from('guests')
          .insert({
            id: guest.id,
            profile_id: validUserId,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            relationship: guest.relationship,
            rsvp: guest.rsvp,
            plus_one: guest.plusOne,
            dietary_restrictions: guest.dietaryRestrictions,
            notes: guest.notes
          });

        if (guestError) {
          console.error("Error migrating guest:", guestError);
          continue;
        }

        // Process group members if any
        if (guest.groupMembers && guest.groupMembers.length > 0) {
          const groupMembersData = guest.groupMembers.map(member => ({
            id: member.id,
            guest_id: guest.id,
            name: member.name,
            dietary_restrictions: member.dietaryRestrictions,
            is_child: member.isChild
          }));

          // Insert group members
          const { error: groupError } = await supabase
            .from('group_members')
            .insert(groupMembersData);

          if (groupError) {
            console.error("Error migrating group members:", groupError);
          }
        }
      }

      // Clear localStorage after successful migration
      localStorage.removeItem(`wedding_guests_${userId}`);

      toast({
        title: "Migrazione completata",
        description: "I tuoi ospiti sono stati migrati con successo.",
      });

      return true;
    } catch (error) {
      console.error("Error during migration:", error);
      toast({
        title: "Errore",
        description: "Si è verificato un errore durante la migrazione dei dati.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    migrateLocalStorageToSupabase
  };
};
