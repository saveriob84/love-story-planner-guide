import { useState, useEffect } from "react";
import { Guest } from "@/types/guest";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { GuestRow, GroupMemberRow } from "@/types/supabase-types";

export const useGuestQueries = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [guests, setGuests] = useState<Guest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load guests from Supabase
  useEffect(() => {
    loadGuests();
  }, [user?.id]);

  // Helper function to load all guests (for reuse)
  const loadGuests = async () => {
    setIsLoading(true);
    try {
      // Check if user is authenticated
      const { data: { user: authUser } } = await supabase.auth.getUser();
      
      if (authUser?.id) {
        // Try to fetch from Supabase first
        const { data: supabaseGuests, error } = await supabase
          .from('guests')
          .select(`
            *,
            group_members(*)
          `)
          .eq('profile_id', authUser.id); // Use the actual Supabase auth user ID
            
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
              isChild: member.is_child || false
            }))
          }));
          
          setGuests(formattedGuests);
        } else {
          // Fallback to localStorage for data migration
          const savedGuests = localStorage.getItem(`wedding_guests_${authUser.id}`);
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
          } else {
            setGuests([]);
          }
        }
      } else {
        // No authenticated user
        setGuests([]);
      }
    } catch (error) {
      console.error("Error loading guests:", error);
      toast({
        title: "Errore",
        description: "Impossibile caricare la lista degli ospiti.",
        variant: "destructive",
      });
      setGuests([]);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    guests,
    setGuests,
    isLoading,
    loadGuests
  };
};
