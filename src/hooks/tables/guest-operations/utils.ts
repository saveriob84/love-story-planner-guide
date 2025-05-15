
import { Table } from "@/types/table";

// Helper function to check if a guest is already assigned to any table
export const isGuestAssigned = (tables: Table[], guestId: string): boolean => {
  let assigned = false;
  tables.forEach(table => {
    table.guests.forEach(g => {
      if (g.guestId === guestId && !g.id.includes('-')) {
        assigned = true;
      }
    });
  });
  return assigned;
};

// Helper function to check if a group member is already assigned
export const isGroupMemberAssigned = (tables: Table[], memberId: string): boolean => {
  let assigned = false;
  tables.forEach(table => {
    table.guests.forEach(g => {
      if (g.id.includes(`-${memberId}`)) {
        assigned = true;
      }
    });
  });
  return assigned;
};

// Helper function to find a table by ID
export const findTableById = (tables: Table[], tableId: string): Table | undefined => {
  return tables.find(table => table.id === tableId);
};
