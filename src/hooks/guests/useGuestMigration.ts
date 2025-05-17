
import { Guest } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useGuestMigration = () => {
  const { toast } = useToast();
  
  // Migrate data from localStorage to Supabase
  const migrateLocalStorageToSupabase = async (localGuests: Guest[], userId: string) => {
    try {
      if (!userId) return;
      
      toast({
        title: "Migrazione dati",
        description: "Sto migrando i tuoi dati al nuovo database...",
      });
      
      for (const guest of localGuests) {
        // Insert main guest
        const { data: insertedGuest, error: guestError } = await supabase
          .from('guests')
          .insert({
            id: guest.id,
            profile_id: userId,
            name: guest.name,
            email: guest.email,
            phone: guest.phone,
            relationship: guest.relationship,
            rsvp: guest.rsvp,
            plus_one: guest.plusOne,
            dietary_restrictions: guest.dietaryRestrictions,
            notes: guest.notes
          })
          .select()
          .single();
          
        if (guestError) {
          console.error("Error migrating guest:", guestError);
          continue;
        }
        
        // Insert group members if any
        if (guest.groupMembers.length > 0) {
          const groupMembersData = guest.groupMembers.map(member => ({
            guest_id: guest.id,
            name: member.name,
            dietary_restrictions: member.dietaryRestrictions,
            is_child: member.isChild
          }));
          
          const { error: groupError } = await supabase
            .from('group_members')
            .insert(groupMembersData);
            
          if (groupError) {
            console.error("Error migrating group members:", groupError);
          }
        }
      }
      
      toast({
        title: "Migrazione completata",
        description: "I tuoi dati sono stati migrati con successo!",
      });
      
      // Clear localStorage data after successful migration
      localStorage.removeItem(`wedding_guests_${userId}`);
      return true;
    } catch (error) {
      console.error("Error during migration:", error);
      toast({
        title: "Errore di migrazione",
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
