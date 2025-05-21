

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

// User Roles
export type UserRoleInsert = TablesInsert['user_roles']['Insert'];
export type UserRoleRow = TablesRow['user_roles']['Row'];

// Vendors
export type VendorInsert = TablesInsert['vendors']['Insert'];
export type VendorRow = TablesRow['vendors']['Row'];

// Service Categories
export type ServiceCategoryInsert = TablesInsert['service_categories']['Insert'];
export type ServiceCategoryRow = TablesRow['service_categories']['Row'];

// Vendor Services
export type VendorServiceInsert = TablesInsert['vendor_services']['Insert'];
export type VendorServiceRow = TablesRow['vendor_services']['Row'];

// Service Images
export type ServiceImageInsert = TablesInsert['service_images']['Insert'];
export type ServiceImageRow = TablesRow['service_images']['Row'];
