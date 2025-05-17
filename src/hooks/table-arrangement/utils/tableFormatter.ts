
import { Table } from "@/types/table";

export const formatTablesWithGuests = (tablesData: any[], assignmentsData: any[]): Table[] => {
  if (!tablesData || !assignmentsData) return [];
  
  return tablesData.map((table: any) => {
    // Find all assignments for this table
    const tableAssignments = assignmentsData.filter((assignment: any) => 
      assignment.table_id === table.id
    ) || [];
    
    // Map assignments to TableGuest objects
    const tableGuests = tableAssignments.map((assignment: any) => {
      // If it's a main guest
      if (assignment.guest_id && assignment.guests) {
        return {
          id: assignment.guests.id,
          name: assignment.guests.name,
          dietaryRestrictions: assignment.guests.dietary_restrictions
        };
      }
      // If it's a group member
      else if (assignment.group_member_id && assignment.group_members) {
        return {
          id: assignment.group_members.id,
          name: assignment.group_members.name,
          dietaryRestrictions: assignment.group_members.dietary_restrictions,
          isGroupMember: true,
          parentGuestId: assignment.group_members.guest_id
        };
      }
      // Fallback (shouldn't happen with proper constraints)
      return {
        id: assignment.id,
        name: 'Unknown Guest',
      };
    });

    // Return the formatted table
    return {
      id: table.id,
      name: table.name,
      capacity: table.capacity,
      guests: tableGuests,
      isSpecial: table.is_special || false
    };
  });
};
