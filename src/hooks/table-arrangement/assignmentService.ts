
import { supabase } from "@/integrations/supabase/client";
import { Guest } from "@/types/guest";
import { Table, TableGuest } from "@/types/table";

// Service for guest assignment operations
export const assignmentService = {
  // Check if a guest ID belongs to a group member
  checkIfGroupMember: (guests: Guest[], guestId: string): boolean => {
    for (const guest of guests) {
      if (guest.groupMembers.some(m => m.id === guestId)) {
        return true;
      }
    }
    return false;
  },
  
  // Remove existing assignment for a guest
  removeExistingAssignment: async (guestId: string, isGroupMember: boolean) => {
    try {
      if (isGroupMember) {
        await supabase
          .from('table_assignments')
          .delete()
          .eq('group_member_id', guestId);
      } else {
        await supabase
          .from('table_assignments')
          .delete()
          .eq('guest_id', guestId);
      }
    } catch (error) {
      console.error("Error removing existing assignment:", error);
      throw error;
    }
  },
  
  // Create a new assignment
  createAssignment: async (tableId: string, guestId: string, isGroupMember: boolean) => {
    const { error } = await supabase
      .from('table_assignments')
      .insert({
        table_id: tableId,
        guest_id: isGroupMember ? null : guestId,
        group_member_id: isGroupMember ? guestId : null
      });
    
    if (error) {
      console.error("Error assigning guest to table:", error);
      throw error;
    }
  },
  
  // Find guest details
  findGuestInfo: (guests: Guest[], guestId: string, isGroupMember: boolean): TableGuest | undefined => {
    if (isGroupMember) {
      // Look for the group member
      for (const guest of guests) {
        const member = guest.groupMembers.find(m => m.id === guestId);
        if (member) {
          return {
            id: member.id,
            name: member.name,
            dietaryRestrictions: member.dietaryRestrictions,
            isGroupMember: true,
            parentGuestId: guest.id
          };
        }
      }
    } else {
      // Look for main guest
      const mainGuest = guests.find(g => g.id === guestId);
      if (mainGuest) {
        return {
          id: mainGuest.id,
          name: mainGuest.name,
          dietaryRestrictions: mainGuest.dietaryRestrictions
        };
      }
    }
    return undefined;
  }
};
