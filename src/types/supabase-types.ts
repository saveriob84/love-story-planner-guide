
import { Database } from '@/integrations/supabase/types';

// Custom types for Supabase tables
export type TablesInsert = Database['public']['Tables'];
export type TablesRow = Database['public']['Tables'];

// Profiles
export type ProfileInsert = TablesInsert['profiles']['Insert'];
export type ProfileRow = TablesRow['profiles']['Row'];

// Guests
export type GuestInsert = TablesInsert['guests']['Insert'];
export type GuestRow = TablesRow['guests']['Row'];

// Group Members
export type GroupMemberInsert = TablesInsert['group_members']['Insert'];
export type GroupMemberRow = TablesRow['group_members']['Row'];

// Tables
export type TableInsert = TablesInsert['tables']['Insert'];
export type TableRow = TablesRow['tables']['Row'];

// Table Assignments
export type TableAssignmentInsert = TablesInsert['table_assignments']['Insert'];
export type TableAssignmentRow = TablesRow['table_assignments']['Row'];

// Tasks
export type TaskInsert = TablesInsert['tasks']['Insert'];
export type TaskRow = TablesRow['tasks']['Row'];

// Timelines
export type TimelineInsert = TablesInsert['timelines']['Insert'];
export type TimelineRow = TablesRow['timelines']['Row'];

// Budget Items
export type BudgetItemInsert = TablesInsert['budget_items']['Insert'];
export type BudgetItemRow = TablesRow['budget_items']['Row'];

// Budget Settings
export type BudgetSettingsInsert = TablesInsert['budget_settings']['Insert'];
export type BudgetSettingsRow = TablesRow['budget_settings']['Row'];
