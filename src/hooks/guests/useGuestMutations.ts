import { useState } from "react";
import { Guest } from "@/types/guest";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useGuestMutations = (
  guests: Guest[],
  setGuests: React.Dispatch<React.SetStateAction<Guest[]>>,
  loadGuests: () => Promise<void>
) => {
  const { toast } = useToast();

  // Add new guest to Supabase
  const addGuest = async (guestData: Omit<Guest, "id" | "rsvp">) => {
    if (!guestData.name || !guestData.relationship) return false;
    
    try {
      // Generate a UUID for client-side reference
      const guestId = crypto.randomUUID();
      const userId = guests.length > 0 ? guests[0].id.split('-')[0] : undefined;
      
      if (!userId) {
        toast({
          title: "Errore",
          description: "Impossibile determinare l'utente corrente.",
          variant: "destructive",
        });
        return false;
      }
      
      // Insert the guest into Supabase
      const { error: guestError } = await supabase
        .from('guests')
        .insert({
          id: guestId,
          profile_id: userId,
          name: guestData.name,
          email: guestData.email,
          phone: guestData.phone,
          relationship: guestData.relationship,
          rsvp: "pending",
          plus_one: guestData.plusOne,
          dietary_restrictions: guestData.dietaryRestrictions,
          notes: guestData.notes
        });
        
      if (guestError) {
        console.error("Error adding guest:", guestError);
        toast({
          title: "Errore",
          description: "Impossibile aggiungere l'ospite.",
          variant: "destructive",
        });
        return false;
      }
      
      // Insert group members if any
      if (guestData.groupMembers && guestData.groupMembers.length > 0) {
        const groupMembersData = guestData.groupMembers.map(member => ({
          guest_id: guestId,
          name: member.name,
          dietary_restrictions: member.dietaryRestrictions,
          is_child: member.isChild
        }));
        
        const { error: groupError } = await supabase
          .from('group_members')
          .insert(groupMembersData);
          
        if (groupError) {
          console.error("Error adding group members:", groupError);
          toast({
            title: "Avviso",
            description: "Ospite aggiunto ma si è verificato un errore con i membri del gruppo.",
            variant: "destructive",
          });
        }
      }
      
      // Fetch the newly inserted guest with group members
      const { data: newGuest, error: fetchError } = await supabase
        .from('guests')
        .select(`
          *,
          group_members(*)
        `)
        .eq('id', guestId)
        .single();
        
      if (fetchError || !newGuest) {
        console.error("Error fetching new guest:", fetchError);
        // Refresh the whole guest list
        loadGuests();
        return true;
      }
      
      // Map to our Guest type
      const formattedGuest: Guest = {
        id: newGuest.id,
        name: newGuest.name,
        email: newGuest.email || '',
        phone: newGuest.phone || '',
        relationship: newGuest.relationship,
        rsvp: newGuest.rsvp as "pending" | "confirmed" | "declined",
        plusOne: newGuest.plus_one || false,
        dietaryRestrictions: newGuest.dietary_restrictions || '',
        notes: newGuest.notes || '',
        groupMembers: newGuest.group_members.map((member: any) => ({
          id: member.id,
          name: member.name,
          dietaryRestrictions: member.dietary_restrictions || '',
          isChild: member.is_child || false
        }))
      };
      
      // Update state with the new guest
      setGuests(prevGuests => [...prevGuests, formattedGuest]);
      
      return true;
    } catch (error) {
      console.error("Error in addGuest:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiungere l'ospite.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Update guest in Supabase
  const updateGuest = async (id: string, updates: Partial<Guest>) => {
    try {
      // First update the state for immediate UI response
      setGuests(prevGuests => 
        prevGuests.map(guest => 
          guest.id === id ? { ...guest, ...updates } : guest
        )
      );
      
      // Prepare data for Supabase update
      const supabaseUpdates: any = {};
      
      if (updates.name !== undefined) supabaseUpdates.name = updates.name;
      if (updates.email !== undefined) supabaseUpdates.email = updates.email;
      if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
      if (updates.relationship !== undefined) supabaseUpdates.relationship = updates.relationship;
      if (updates.rsvp !== undefined) supabaseUpdates.rsvp = updates.rsvp;
      if (updates.plusOne !== undefined) supabaseUpdates.plus_one = updates.plusOne;
      if (updates.dietaryRestrictions !== undefined) supabaseUpdates.dietary_restrictions = updates.dietaryRestrictions;
      if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
      
      // Only update if we have something to update
      if (Object.keys(supabaseUpdates).length > 0) {
        const { error } = await supabase
          .from('guests')
          .update(supabaseUpdates)
          .eq('id', id);
          
        if (error) {
          console.error("Error updating guest:", error);
          toast({
            title: "Errore",
            description: "Impossibile aggiornare l'ospite.",
            variant: "destructive",
          });
        }
      }
      
      // Handle group members updates if needed
      if (updates.groupMembers) {
        // For now, keeping this simple - would ideally track changes and update/insert/delete as needed
        const currentGuest = guests.find(g => g.id === id);
        if (currentGuest && updates.groupMembers) {
          // Handle updates to existing members and adding new ones
          for (const member of updates.groupMembers) {
            if (member.id.startsWith('member-')) {
              // This is a new member, insert it
              const { error } = await supabase
                .from('group_members')
                .insert({
                  guest_id: id,
                  name: member.name,
                  dietary_restrictions: member.dietaryRestrictions,
                  is_child: member.isChild
                });
                
              if (error) {
                console.error("Error adding group member:", error);
              }
            }
          }
          
          // Handle deleted members
          const currentMemberIds = currentGuest.groupMembers.map(m => m.id);
          const updatedMemberIds = updates.groupMembers.map(m => m.id);
          const removedMemberIds = currentMemberIds.filter(id => !updatedMemberIds.includes(id));
          
          if (removedMemberIds.length > 0) {
            const { error } = await supabase
              .from('group_members')
              .delete()
              .in('id', removedMemberIds);
              
            if (error) {
              console.error("Error deleting group members:", error);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in updateGuest:", error);
      toast({
        title: "Errore",
        description: "Impossibile aggiornare l'ospite.",
        variant: "destructive",
      });
    }
  };

  // Remove guest from Supabase
  const removeGuest = async (id: string) => {
    if (window.confirm("Sei sicuro di voler rimuovere questo ospite?")) {
      try {
        // Delete from Supabase (group members will cascade delete)
        const { error } = await supabase
          .from('guests')
          .delete()
          .eq('id', id);
          
        if (error) {
          console.error("Error removing guest:", error);
          toast({
            title: "Errore",
            description: "Impossibile rimuovere l'ospite.",
            variant: "destructive",
          });
          return;
        }
        
        // Update local state
        setGuests(guests.filter(guest => guest.id !== id));
        
        toast({
          title: "Ospite rimosso",
          description: "L'ospite è stato rimosso dalla lista.",
        });
      } catch (error) {
        console.error("Error in removeGuest:", error);
        toast({
          title: "Errore",
          description: "Impossibile rimuovere l'ospite.",
          variant: "destructive",
        });
      }
    }
  };

  return {
    addGuest,
    updateGuest,
    removeGuest
  };
};
