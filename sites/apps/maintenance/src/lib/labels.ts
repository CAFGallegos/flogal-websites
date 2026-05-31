import type { UnitStatus, PartStatus, PriorityLevel, ServiceType, UnitType, CompanyId } from './types';

export const STATUS_LABEL: Record<UnitStatus, string> = {
  ready_for_dispatch:       'Ready for dispatch',
  limited_use:              'Limited use',
  still_down:               'Still down',
  waiting_on_parts:         'Waiting on parts',
  needs_outside_shop:       'Needs outside shop',
  needs_manager_decision:   'Needs manager decision',
  inactive_sold:            'Inactive / sold',
};

export const STATUS_CLASS: Record<UnitStatus, string> = {
  ready_for_dispatch:       's-ready',
  limited_use:              's-limited',
  still_down:               's-down',
  waiting_on_parts:         's-wait',
  needs_outside_shop:       's-outside',
  needs_manager_decision:   's-decision',
  inactive_sold:            's-neutral',
};

export const STATUS_DOT_CLASS: Record<UnitStatus, string> = {
  ready_for_dispatch:       'is-ready',
  limited_use:              'is-wait',
  still_down:               'is-down',
  waiting_on_parts:         'is-wait',
  needs_outside_shop:       'is-down',
  needs_manager_decision:   'is-wait',
  inactive_sold:            '',
};

export const PART_STATUS_LABEL: Record<PartStatus, string> = {
  needed:    'Needed',
  ordered:   'Ordered',
  received:  'Received',
  installed: 'Installed',
  cancelled: 'Cancelled',
};

export const PART_STATUS_CLASS: Record<PartStatus, string> = {
  needed:    's-down',
  ordered:   's-wait',
  received:  's-info',
  installed: 's-ready',
  cancelled: 's-neutral',
};

export const PRIORITY_LABEL: Record<PriorityLevel, string> = {
  safety_dot:       'Safety / DOT',
  truck_down:       'Truck down',
  revenue_blocking: 'Revenue blocking',
  preventive:       'Preventive',
  normal:           'Normal',
  cosmetic:         'Cosmetic',
};

export const PRIORITY_CLASS: Record<PriorityLevel, string> = {
  safety_dot:       'p-safety',
  truck_down:       'p-down',
  revenue_blocking: 'p-revenue',
  preventive:       'p-preventive',
  normal:           'p-normal',
  cosmetic:         'p-cosmetic',
};

export const PRIORITY_DOT_COLOR: Record<PriorityLevel, string> = {
  safety_dot:       'var(--st-down)',
  truck_down:       'var(--st-down)',
  revenue_blocking: 'var(--st-wait)',
  preventive:       'var(--st-neutral)',
  normal:           'var(--st-neutral)',
  cosmetic:         'var(--nardo-faint)',
};

export const SERVICE_TYPE_LABEL: Record<ServiceType, string> = {
  pm_preventive_maintenance: 'Preventive maintenance',
  oil_change:                'Oil change',
  filters:                   'Filters',
  brakes:                    'Brakes',
  tires:                     'Tires',
  electrical:                'Electrical',
  air_leak_air_system:       'Air system',
  hydraulics:                'Hydraulics',
  suspension:                'Suspension',
  engine:                    'Engine',
  transmission:              'Transmission',
  emissions:                 'Emissions',
  tarp_trailer:              'Tarp / trailer',
  welding_fabrication:       'Welding / fabrication',
  dot_safety:                'DOT / safety',
  scanner_fault_code:        'Scanner / fault code',
  other:                     'Other',
};

export const UNIT_TYPE_LABEL: Record<UnitType, string> = {
  truck:     'Truck',
  trailer:   'Trailer',
  equipment: 'Equipment',
};

export const COMPANY_DOT: Record<CompanyId, string> = {
  flogal: '#1f2326',
  rrtl:   '#2a4f7a',
  jnd:    '#9a7415',
};

export const COMPANY_SHORT: Record<CompanyId, string> = {
  flogal: 'FLOGAL',
  rrtl:   'RRTL',
  jnd:    'J&D',
};

export const SERVICE_TYPES = Object.entries(SERVICE_TYPE_LABEL) as [ServiceType, string][];
export const UNIT_STATUSES = Object.entries(STATUS_LABEL) as [UnitStatus, string][];
export const PART_STATUSES = Object.entries(PART_STATUS_LABEL) as [PartStatus, string][];
export const PRIORITIES = Object.entries(PRIORITY_LABEL) as [PriorityLevel, string][];
export const UNIT_TYPES = Object.entries(UNIT_TYPE_LABEL) as [UnitType, string][];
