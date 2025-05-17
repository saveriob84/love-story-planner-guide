import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { Guest } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth/AuthContext";

export const useGuestMutations = (
  guests: Guest[],
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>,
  loadGuests: () => Promise<void>
) => {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = useState(false);

  // Add a new guest
  const addGuest = async (guestData: Partial<Guest>): Promise<boolean> => {
    if (!guestData.name || !guestData.relationship) return false;
    
    try {
      setIsAdding(true);
      
      // Generate a UUID for the guest
      const guestId = crypto.randomUUID();
      
      // Get the current user's ID from the Auth context
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user?.id) {
        toast({
          title: "Errore",
          description: "Per aggiungere ospiti devi essere loggato.",
          variant: "destructive",
        });
        return false;
      }
      
      // Insert the guest into Supabase using the authenticated user's ID
      const { error: guestError } = await supabase
        .from('guests')
        .insert({
          id: guestId,
          profile_id: user.id, // Use the actual Supabase auth user ID
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          relationship: guestData.relationship,
          rsvp: guestData.rsvp || "pending",
          plus_one: guestData.plusOne || false,
          dietary_restrictions: guestData.dietaryRestrictions,
          notes: guestData.notes
        });

      if (guestError) {
        console.error("Error adding guest:", guestError);
        throw guestError;
      }

      // Add group members if provided
      if (guestData.groupMembers && guestData.groupMembers.length > 0) {
        const groupMembersData = guestData.groupMembers.map((member) => ({
          id: crypto.randomUUID(),
          guest_id: guestId,
          name: member.name,
          dietary_restrictions: member.dietaryRestrictions,
          is_child: member.isChild || false
        }));

        const { error: groupError } = await supabase
          .from('group_members')
          .insert(groupMembersData);

        if (groupError) {
          console.error("Error adding group members:", groupError);
          // We don't throw here as the main guest was already added
        }
      }

      // Reload guests to get the updated list from the database
      loadGuests();
      
      toast({
        title: "Ospite aggiunto",
        description: `${guestData.name} è stato aggiunto alla lista.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error in addGuest:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'ospite.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAdding(false);
    }
  };

  // Update an existing guest
  const updateGuest = async (id: string, updatedData: Partial<Guest>): Promise<boolean> => {
    try {
      // Update the guest in Supabase
      const { error: guestError } = await supabase
        .from('guests')
        .update({
          name: updatedData.name,
          email: updatedData.email,
          phone: updatedData.phone,
          relationship: updatedData.relationship,
          rsvp: updatedData.rsvp,
          plus_one: updatedData.plusOne,
          dietary_restrictions: updatedData.dietaryRestrictions,
          notes: updatedData.notes
        })
        .eq('id', id);

      if (guestError) {
        console.error("Error updating guest:", guestError);
        throw guestError;
      }

      // Handle group members if there are any
      if (updatedData.groupMembers) {
        // Get current group members
        const { data: currentMembers, error: fetchError } = await supabase
          .from('group_members')
          .select('id')
          .eq('guest_id', id);

        if (fetchError) {
          console.error("Error fetching group members:", fetchError);
          throw fetchError;
        }

        const currentIds = currentMembers ? currentMembers.map(m => m.id) : [];
        const updatedIds = updatedData.groupMembers.map(m => m.id);
        
        // Find members to delete (in current but not in updated)
        const idsToDelete = currentIds.filter(id => !updatedIds.includes(id));
        
        // Delete removed members
        if (idsToDelete.length > 0) {
          const { error: deleteError } = await supabase
            .from('group_members')
            .delete()
            .in('id', idsToDelete);

          if (deleteError) {
            console.error("Error deleting group members:", deleteError);
            // Continue with other operations
          }
        }

        // Update or insert members
        for (const member of updatedData.groupMembers) {
          if (member.id && currentIds.includes(member.id)) {
            // Update existing member
            const { error: updateError } = await supabase
              .from('group_members')
              .update({
                name: member.name,
                dietary_restrictions: member.dietaryRestrictions,
                is_child: member.isChild
              })
              .eq('id', member.id);

            if (updateError) {
              console.error("Error updating group member:", updateError);
              // Continue with other operations
            }
          } else {
            // Insert new member
            const { error: insertError } = await supabase
              .from('group_members')
              .insert({
                id: member.id || crypto.randomUUID(),
                guest_id: id,
                name: member.name,
                dietary_restrictions: member.dietaryRestrictions,
                is_child: member.isChild
              });

            if (insertError) {
              console.error("Error inserting group member:", insertError);
              // Continue with other operations
            }
          }
        }
      }

      // Reload guests to get the updated list from the database
      loadGuests();
      
      toast({
        title: "Ospite aggiornato",
        description: "I dati dell'ospite sono stati aggiornati.",
      });
      
      return true;
    } catch (error) {
      console.error("Error in updateGuest:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare i dati dell'ospite.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Remove a guest
  const removeGuest = async (id: string): Promise<boolean> => {
    try {
      // Check if the guest exists
      const existingGuest = guests.find(g => g.id === id);
      if (!existingGuest) {
        throw new Error("Guest not found");
      }

      // Delete from Supabase (cascade will handle group_members)
      const { error } = await supabase
        .from('guests')
        .delete()
        .eq('id', id);

      if (error) {
        console.error("Error removing guest:", error);
        throw error;
      }

      // Reload guests to get the updated list from the database
      loadGuests();
      
      toast({
        title: "Ospite rimosso",
        description: `${existingGuest.name} è stato rimosso dalla lista.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error in removeGuest:", error);
      toast({
        title: "Errore",
        description: "Impossibile rimuovere l'ospite.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    addGuest,
    updateGuest,
    removeGuest,
    isAdding
  };
};
