
import { TableGuest, Table } from "@/types/table";

// Define the Toast type based on the toast function's signature
export type Toast = (props: {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}) => void;

export interface TableStats {
  totalTables: number;
  assignedGuests: number;
  availableSeats: number;
}

export interface UseTableArrangementReturn {
  tables: Table[];
  assignGuestToTable: (guestId: string, tableId: string) => Promise<void>;
  addTable: () => Promise<void>;
  addCustomTable: (name: string, capacity: number) => Promise<void>;
  editTable: (tableId: string, name: string, capacity: number) => Promise<void>;
  deleteTable: (tableId: string) => Promise<void>;
  tableStats: TableStats;
  isLoading: boolean;
}
