export type CompanyId = 'flogal' | 'rrtl' | 'jnd';
export type UnitType = 'truck' | 'trailer' | 'equipment';
export type ServiceType =
  | 'pm_preventive_maintenance' | 'oil_change' | 'filters' | 'brakes'
  | 'tires' | 'electrical' | 'air_leak_air_system' | 'hydraulics'
  | 'suspension' | 'engine' | 'transmission' | 'emissions'
  | 'tarp_trailer' | 'welding_fabrication' | 'dot_safety'
  | 'scanner_fault_code' | 'other';
export type PriorityLevel = 'safety_dot' | 'truck_down' | 'revenue_blocking' | 'preventive' | 'normal' | 'cosmetic';
export type UnitStatus = 'ready_for_dispatch' | 'limited_use' | 'still_down' | 'waiting_on_parts' | 'needs_outside_shop' | 'needs_manager_decision' | 'inactive_sold';
export type PartStatus = 'needed' | 'ordered' | 'received' | 'installed' | 'cancelled';
export type GlobalRole = 'flogal_admin' | 'company_user';

export interface MxCompany {
  id: CompanyId;
  name: string;
  short_name: string;
  dot_color: string;
  is_admin: boolean;
}

export interface MxLocation {
  id: string;
  name: string;
  company_id: CompanyId;
}

export interface MxProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  global_role: GlobalRole;
  can_access_admin_portal: boolean;
}

export interface MxCompanyMembership {
  user_id: string;
  company_id: CompanyId;
  role: string;
}

export interface MxUnit {
  id: string;
  unit_number: string;
  company_id: CompanyId;
  location_id: string | null;
  unit_type: UnitType;
  status: UnitStatus;
  current_issue: string | null;
  parts_needed: string | null;
  operating_entity: string | null;
  owner_entity: string | null;
  vin: string | null;
  make: string | null;
  model: string | null;
  year: number | null;
  odometer: number | null;
  engine_hours: number | null;
  samsara_asset: string | null;
  samsara_vehicle_id: string | null;
  unit_folder_link: string | null;
  last_service_date: string | null;
  created_at: string;
  mx_locations?: { name: string } | null;
}

export interface MxServiceEntry {
  id: string;
  unit_id: string;
  company_id: CompanyId;
  location_id: string | null;
  entry_date: string;
  service_type: ServiceType;
  priority: PriorityLevel;
  mechanic: string | null;
  issue_reported: string | null;
  work_performed: string | null;
  parts_used: string | null;
  parts_needed: string | null;
  labor_hours: number | null;
  odometer: number | null;
  engine_hours: number | null;
  status_after: UnitStatus;
  approved: boolean;
  approved_by: string | null;
  approval_date: string | null;
  photo_folder_link: string | null;
  scanner_report_link: string | null;
  invoice_link: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  mx_units?: { unit_number: string; company_id: CompanyId } | null;
}

export interface MxPartNeeded {
  id: string;
  part_name: string;
  unit_id: string | null;
  company_id: CompanyId;
  location_id: string | null;
  priority: PriorityLevel;
  quantity: number;
  requested_by: string | null;
  date_requested: string;
  status: PartStatus;
  vendor: string | null;
  notes: string | null;
  service_entry_id: string | null;
  created_at: string;
  mx_units?: { unit_number: string } | null;
}

export interface MxMaintenanceFile {
  id: string;
  company_id: CompanyId;
  unit_id: string | null;
  kind: string;
  label: string | null;
  url: string;
  created_at: string;
  mx_units?: { unit_number: string; make: string | null; model: string | null } | null;
}

export interface MxMonthlyReport {
  id: string;
  company_id: CompanyId;
  month: string;
  drive_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  profile: MxProfile;
  isFlogalAdmin: boolean;
  companies: MxCompany[];
  primaryCompanyId: CompanyId;
}
