
import { Database } from '@/integrations/supabase/types';

// Custom types for Supabase tables
export type TablesInsert = Database['public']['Tables']['Insert'];
export type TablesRow = Database['public']['Tables']['Row'];

// Profiles
export type ProfileInsert = TablesInsert['profiles'];
export type ProfileRow = TablesRow['profiles'];

// Guests
export type GuestInsert = TablesInsert['guests'];
export type GuestRow = TablesRow['guests'];

// Group Members
export type GroupMemberInsert = TablesInsert['group_members'];
export type GroupMemberRow = TablesRow['group_members'];

// Tables
export type TableInsert = TablesInsert['tables'];
export type TableRow = TablesRow['tables'];

// Table Assignments
export type TableAssignmentInsert = TablesInsert['table_assignments'];
export type TableAssignmentRow = TablesRow['table_assignments'];

// Tasks
export type TaskInsert = TablesInsert['tasks'];
export type TaskRow = TablesRow['tasks'];

// Timelines
export type TimelineInsert = TablesInsert['timelines'];
export type TimelineRow = TablesRow['timelines'];
