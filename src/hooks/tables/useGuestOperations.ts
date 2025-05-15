
import { GuestOperationsProps } from "./guest-operations/types";
import { useAddGuest } from "./guest-operations/addGuest";
import { useAddGroupMember } from "./guest-operations/addGroupMember";
import { useRemoveGuest } from "./guest-operations/removeGuest";

export const useGuestOperations = (props: GuestOperationsProps) => {
  const { addGuestToTable } = useAddGuest(props);
  const { addGroupMemberToTable } = useAddGroupMember(props);
  const { removeGuestFromTable } = useRemoveGuest(props);

  return {
    addGuestToTable,
    addGroupMemberToTable,
    removeGuestFromTable
  };
};
