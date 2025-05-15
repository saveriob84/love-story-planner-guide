
import { Table } from "@/types/table";

export interface TableOperationsProps {
  tables: Table[];
  setTables: React.Dispatch<React.SetStateAction<Table[]>>;
}
