
import { Table, TableGuest } from "@/types/table";
import { Guest, GroupMember } from "@/types/guest";

export interface GuestOperationsProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}
