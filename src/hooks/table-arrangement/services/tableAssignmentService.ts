
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/auth";

// Service for table assignment operations
export const tableAssignmentService = {
  // Fetch table assignments
  fetchAssignments: async () => {
    const { data, error } = await supabase
      .from('table_assignments')
      .select(`
        id,
        table_id,
        guest_id,
        group_member_id,
        guests:guest_id(id, name, dietary_restrictions),
        group_members:group_member_id(id, name, dietary_restrictions, is_child, guest_id)
      `);
    
    if (error) {
      console.error('Error fetching table assignments:', error);
      throw error;
    }
    
    return data || [];
  },
  
  // Add couple to Sposi table
  addCoupleToSposiTable: async (user: User, sposiTableId: string) => {
    if (!user.name) return;
    
    const coupleNames = [];
    
    // Add first partner
    if (user.name) {
      coupleNames.push(user.name);
      
      // Insert the first partner as a guest
      const { data: guestData, error: guestError } = await supabase
        .from('guests')
        .insert({
          name: user.name,
          profile_id: user.id,
          relationship: 'Sposa/Sposo',
          rsvp: 'confirmed'
        } as any)
        .select('id')
        .single();
        
      if (!guestError && guestData) {
        // Assign the first partner to the Sposi table
        await supabase
          .from('table_assignments')
          .insert({
            table_id: sposiTableId,
            guest_id: (guestData as any).id
          } as any);
      }
    }
    
    // Add second partner if available
    if (user.partnerName) {
      coupleNames.push(user.partnerName);
      
      // Insert the second partner as a guest
      const { data: partnerData, error: partnerError } = await supabase
        .from('guests')
        .insert({
          name: user.partnerName,
          profile_id: user.id,
          relationship: 'Sposa/Sposo',
          rsvp: 'confirmed'
        } as any)
        .select('id')
        .single();
        
      if (!partnerError && partnerData) {
        // Assign the second partner to the Sposi table
        await supabase
          .from('table_assignments')
          .insert({
            table_id: sposiTableId,
            guest_id: (partnerData as any).id
          } as any);
      }
    }
    
    return coupleNames;
  }
};
