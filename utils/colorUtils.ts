// utils/colorUtils.ts

type Color = string;

const COLOR_MAPPINGS: Record<string, Color> = {
  // Statuses
  active: "green",
  online: "green",
  operational: "green",
  healthy: "green",
  ok: "green",
  running: "green",
  available: "green",
  connected: "green",

  warning: "yellow",
  caution: "yellow",
  alert: "yellow",
  low: "yellow",
  partial: "yellow",

  danger: "red",
  error: "red",
  critical: "red",
  emergency: "red",
  failed: "red",
  broken: "red",
  offline: "gray",
  inactive: "gray",
  disabled: "gray",
  disconnected: "gray",
  unavailable: "gray",

  // Priorities
  high: "red",
  urgent: "red",
  critical_priority: "red",

  medium: "orange",
  normal: "orange",
  moderate: "orange",

  low_priority: "green",
  minor: "green",

  // Battery / Charging
  full: "green",
  charged: "green",
  charging: "blue",
  "in-use": "blue",
  "on-charge": "blue",
  swap: "orange",
  swapping: "orange",
  empty: "red",
  low_battery: "red",
  depleted: "red",
  "not-charging": "gray",
  unplugged: "gray",

  // Infrastructure & Operations
  scheduled: "blue",
  pending: "orange",
  maintenance: "orange",
  repair: "orange",
  service_due: "orange",
  under_review: "yellow",

  // EVs / Scooters / Fleet
  scooter: "blue",
  vehicle: "blue",
  assigned: "blue",
  unassigned: "gray",
  reserved: "blue",
  in_transit: "blue",
  delivered: "green",
  deployed: "green",

  // Users & Customers
  customer: "blue",
  user: "blue",
  member: "blue",
  verified: "green",
  unverified: "gray",

  // Home charging
  home: "blue",
  home_charging: "blue",
  installed: "green",
  not_installed: "gray",
  requested: "orange",

  // Binary values
  true: "green",
  false: "gray",
  yes: "green",
  no: "gray",
  enabled: "green",
  disabled_status: "gray",

  // Special / fallback
  unknown: "gray",
  default: "blue"
};

/**
 * Normalize and check if a keyword exists in color mappings
 */
function getColorFromKeyword(keyword: string): Color | undefined {
  const normalized = keyword.toLowerCase().trim();

  // Direct match
  if (COLOR_MAPPINGS[normalized]) return COLOR_MAPPINGS[normalized];

  // Fuzzy contains match
  for (const key in COLOR_MAPPINGS) {
    if (normalized.includes(key)) return COLOR_MAPPINGS[key];
  }

  return undefined;
}

/**
 * Get color based on any dynamic field value (status, priority, etc.)
 * @param value Field value like "active", "critical", "high"
 * @returns Color name like "green", "red", etc.
 */
export function getSemanticColor(value: string | boolean | number | null | undefined): Color {
  if (typeof value === "boolean") return value ? "green" : "gray";
  if (typeof value === "number") {
    if (value >= 80) return "green";
    if (value >= 50) return "orange";
    return "red";
  }
  if (!value) return "gray";

  const strValue = value.toString().toLowerCase().trim();
  return getColorFromKeyword(strValue) || COLOR_MAPPINGS["default"];
}

/**
 * Batch color resolver for multiple fields
 * @param record Object with keys like status, priority, isActive
 */
export function getColorsFromRecord(record: Record<string, any>): Record<string, Color> {
  const colorResult: Record<string, Color> = {};

  for (const key in record) {
    const val = record[key];
    colorResult[key] = getSemanticColor(val);
  }

  return colorResult;
}
