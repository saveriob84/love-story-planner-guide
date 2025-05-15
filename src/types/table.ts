
import { Guest } from "./guest";

export interface TableGuest {
  id: string;
  guestId: string;
  name: string;
  isChild: boolean;
}

export interface Table {
  id: string;
  name: string;
  capacity: number;
  guests: TableGuest[];
}
