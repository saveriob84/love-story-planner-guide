import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GuestRow, GroupMemberRow } from "@/types/supabase-types";

export const useGuests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load guests from Supabase
  useEffect(() => {
    const loadGuests = async () => {
      setIsLoading(true);
      try {
        if (user?.id) {
          // Try to fetch from Supabase first
          const { data: supabaseGuests, error } = await supabase
            .from('guests')
            .select(`
              *,
              group_members(*)
            `)
            .eq('profile_id', user.id);
            
          if (error) {
            console.error("Error fetching guests from Supabase:", error);
            throw error;
          }
          
          if (supabaseGuests && supabaseGuests.length > 0) {
            // Map Supabase data to our Guest type
            const formattedGuests: Guest[] = supabaseGuests.map((guest: GuestRow & { group_members: GroupMemberRow[] }) => ({
              id: guest.id,
              name: guest.name,
              email: guest.email || '',
              phone: guest.phone || '',
              relationship: guest.relationship,
              rsvp: guest.rsvp as "pending" | "confirmed" | "declined",
              plusOne: guest.plus_one || false,
              dietaryRestrictions: guest.dietary_restrictions || '',
              notes: guest.notes || '',
              groupMembers: guest.group_members.map(member => ({
                id: member.id,
                name: member.name,
                dietaryRestrictions: member.dietary_restrictions || '',
                isChild: member.is_child || false  // Fix: Changed from isChild to is_child
              }))
            }));
            
            setGuests(formattedGuests);
          } else {
            // Fallback to localStorage for data migration
            const savedGuests = localStorage.getItem(`wedding_guests_${user.id}`);
            if (savedGuests) {
              const parsedGuests = JSON.parse(savedGuests);
              
              // Make sure all group members have the isChild property
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
              
              // Migrate localStorage data to Supabase if we have user data
              if (updatedGuests.length > 0) {
                migrateLocalStorageToSupabase(updatedGuests);
              }
            } else {
              setGuests([]);
            }
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
  
  // Migrate data from localStorage to Supabase
  const migrateLocalStorageToSupabase = async (localGuests: Guest[]) => {
    try {
      if (!user?.id) return;
      
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
            profile_id: user.id,
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
            dietary_restrictions: member.dietary_restrictions,
            is_child: member.isChild  // Fix: Make sure we're using the correct field name for database insertion
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
      localStorage.removeItem(`wedding_guests_${user.id}`);
    } catch (error) {
      console.error("Error during migration:", error);
      toast({
        title: "Errore di migrazione",
        description: "Si è verificato un errore durante la migrazione dei dati.",
        variant: "destructive",
      });
    }
  };

  // Add new guest to Supabase
  const addGuest = async (guestData: Omit<Guest, "id" | "rsvp">) => {
    if (!guestData.name || !user?.id) return false;
    
    try {
      // Generate a UUID for client-side reference
      const guestId = crypto.randomUUID();
      
      // Insert the guest into Supabase
      const { error: guestError } = await supabase
        .from('guests')
        .insert({
          id: guestId,
          profile_id: user.id,
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
      
      // Handle group members updates separately if needed
      if (updates.groupMembers) {
        // This would be more complex - for now we're keeping it simple
        // Ideally you'd track changes and update/insert/delete as needed
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

  // Helper function to load all guests (for reuse)
  const loadGuests = async () => {
    setIsLoading(true);
    try {
      if (user?.id) {
        const { data: supabaseGuests, error } = await supabase
          .from('guests')
          .select(`
            *,
            group_members(*)
          `)
          .eq('profile_id', user.id);
          
        if (error) {
          console.error("Error fetching guests:", error);
          throw error;
        }
        
        // Map Supabase data to our Guest type
        const formattedGuests: Guest[] = (supabaseGuests || []).map((guest: any) => ({
          id: guest.id,
          name: guest.name,
          email: guest.email || '',
          phone: guest.phone || '',
          relationship: guest.relationship,
          rsvp: guest.rsvp,
          plusOne: guest.plus_one || false,
          dietaryRestrictions: guest.dietary_restrictions || '',
          notes: guest.notes || '',
          groupMembers: (guest.group_members || []).map((member: any) => ({
            id: member.id,
            name: member.name,
            dietaryRestrictions: member.dietary_restrictions || '',
            isChild: member.is_child || false
          }))
        }));
        
        setGuests(formattedGuests);
      }
    } catch (error) {
      console.error("Error reloading guests:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista degli ospiti.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
