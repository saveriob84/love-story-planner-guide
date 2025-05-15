
export interface GroupMember {
  id: string;
  name: string;
  dietaryRestrictions?: string;
  isChild: boolean;
}

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  relationship: string;
  rsvp: "pending" | "confirmed" | "declined";
  plusOne: boolean;
  dietaryRestrictions: string;
  notes: string;
  groupMembers: GroupMember[];
}
