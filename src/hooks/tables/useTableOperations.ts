
import { TableOperationsProps } from "./table-operations/types";
import { useAddTable } from "./table-operations/addTable";
import { useUpdateTable } from "./table-operations/updateTable";
import { useRemoveTable } from "./table-operations/removeTable";

export const useTableOperations = (props: TableOperationsProps) => {
  const { addTable } = useAddTable(props);
  const { updateTable } = useUpdateTable(props);
  const { removeTable } = useRemoveTable(props);

  return {
    addTable,
    updateTable,
    removeTable
  };
};
