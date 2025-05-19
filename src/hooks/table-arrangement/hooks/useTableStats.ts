
import { Table } from "@/types/table";
import { tableService } from "../services/tableService";
import { TableStats } from "../types";

/**
 * Hook for calculating table statistics
 */
export const useTableStats = (tables: Table[]): TableStats => {
  return tableService.calculateTableStats(tables);
};
