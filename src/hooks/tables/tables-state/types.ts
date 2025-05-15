
import { Table } from "@/types/table";

export interface TablesStateReturn {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
  isLoading: boolean;
}
