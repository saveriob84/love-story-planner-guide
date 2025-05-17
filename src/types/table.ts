
export interface TableGuest {
  id: string;
  name: string;
  dietaryRestrictions?: string;
  isGroupMember?: boolean;
  parentGuestId?: string;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: TableGuest[];
}
