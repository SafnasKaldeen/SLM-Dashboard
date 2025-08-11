// lib/geo-aggregation.ts

/* =========================
   Public Types
========================= */
export type SelectByKey = "area" | "district" | "province";

export type AggregationKey =
  | "none"      // NEW: treat as default (count)
  | "count"
  | "sum"
  | "average"
  | "max"
  | "min"
  | "median"
  | "mode"
  | "stddev"
  | "variance";

export interface RegionBucket<T> {
  name: string;
  stations: T[];
  count: number;
  values: number[]; // numeric values collected for AggregationField
  metric: number;   // computed aggregation result (numeric)
}

export interface AggregateParams<T extends Record<string, any>> {
  geoData: any; // GeoJSON FeatureCollection
  stations: T[];
  selectBy: SelectByKey;
  regionProperty: string; // preferred region property key in geojson (e.g., "ADM1_EN")
  aggregation: AggregationKey;
  aggregationField?: keyof T & string; // numeric field name in T
}

export interface AggregateResult<T> {
  regionMap: Map<string, RegionBucket<T>>;
  domain: { min: number; max: number };
}

/* =========================
   Helpers
========================= */
function toNumber(x: unknown): number | null {
  const n = Number(x);
  return Number.isFinite(n) ? n : null;
}

function hasNonEmpty(x: unknown): boolean {
  if (x === null || x === undefined) return false;
  if (typeof x === "string") return x.trim() !== "";
  return true; // allows 0, false, objects, numbers, etc. (you can tighten if needed)
}

function median(values: number[]) {
  if (values.length === 0) return 0;
  const a = [...values].sort((a, b) => a - b);
  const mid = Math.floor(a.length / 2);
  return a.length % 2 ? a[mid] : (a[mid - 1] + a[mid]) / 2;
}

function modeNumeric(values: number[]) {
  if (values.length === 0) return 0;
  const freq = new Map<number, number>();
  for (const v of values) freq.set(v, (freq.get(v) ?? 0) + 1);
  let best = values[0], bestC = 0;
  for (const [v, c] of freq) if (c > bestC) { best = v; bestC = c; }
  return best;
}

function varianceSample(values: number[]) {
  if (values.length <= 1) return 0;
  const mean = values.reduce((s, v) => s + v, 0) / values.length;
  return values.reduce((s, v) => s + (v - mean) ** 2, 0) / (values.length - 1);
}

const AGG = {
  count: (values: number[]) => values.length,
  sum:   (values: number[]) => values.reduce((s, v) => s + v, 0),
  average: (values: number[]) =>
    values.length ? values.reduce((s, v) => s + v, 0) / values.length : 0,
  max: (values: number[]) => (values.length ? Math.max(...values) : 0),
  min: (values: number[]) => (values.length ? Math.min(...values) : 0),
  median,
  mode: modeNumeric,               // numeric mode
  variance: varianceSample,        // sample variance (n-1)
  stddev: (values: number[]) => Math.sqrt(varianceSample(values)),
} as const;

export function getRegionNameFromFeature(
  feature: any,
  preferredKey: string
): string | undefined {
  if (!feature?.properties) return undefined;
  const props = feature.properties;
  const candidates = [preferredKey, "ADM3_EN", "ADM2_EN", "ADM1_EN", "NAME"];
  for (const k of candidates) {
    const v = props[k];
    if (v != null && String(v).trim() !== "") return String(v);
  }
  return undefined;
}

function pickRegionCandidates<T extends Record<string, any>>(
  station: T,
  selectBy: SelectByKey
): string[] {
  if (selectBy === "district") {
    return [station.district].filter(Boolean) as string[];
  }
  if (selectBy === "province") {
    // accept legacy `region` as fallback
    return [station.province, station.region].filter(Boolean) as string[];
  }
  // area-level: area, region (legacy), and sometimes name
  return [station.area, station.region, station.name].filter(Boolean) as string[];
}

function matchStationToRegion<T extends Record<string, any>>(
  station: T,
  selectBy: SelectByKey,
  regionKeys: string[]
): string | undefined {
  const loweredKeys = regionKeys.map((k) => k.toLowerCase());
  const candidates = pickRegionCandidates(station, selectBy);

  // exact match first
  for (const c of candidates) {
    if (c && regionKeys.includes(c)) return c;
  }

  // fuzzy contains match (case-insensitive)
  for (const c of candidates) {
    if (!c) continue;
    const target = String(c).toLowerCase();
    const idx = loweredKeys.findIndex(
      (k) => k.includes(target) || target.includes(k)
    );
    if (idx !== -1) return regionKeys[idx];
  }
  return undefined;
}

/* =========================
   Public API
========================= */

/**
 * Builds region buckets and computes the requested aggregation metric per region.
 * - For non-"count" aggregations, only numeric values from `aggregationField` are used.
 * - Returns numeric domain {min, max} across all region metrics for color scales.
 * - NEW: "none" behaves as default count. "count" with an aggregationField counts only non-empty values.
 */
export function aggregateByRegion<T extends Record<string, any>>(
  params: AggregateParams<T>
): AggregateResult<T> {
  const {
    geoData,
    stations,
    selectBy,
    regionProperty,
    aggregation,
    aggregationField,
  } = params;

  const regionMap = new Map<string, RegionBucket<T>>();

  // seed buckets from GeoJSON polygons
  const features = geoData?.features ?? [];
  for (const f of features) {
    const name = getRegionNameFromFeature(f, regionProperty);
    if (!name) continue;
    regionMap.set(name, {
      name,
      stations: [],
      count: 0,
      values: [],
      metric: 0,
    });
  }

  if (!stations?.length || regionMap.size === 0) {
    return { regionMap, domain: { min: 0, max: 1 } };
  }

  const regionKeys = Array.from(regionMap.keys());

  // "none" behaves like "count"
  const aggIsCountLike = aggregation === "count" || aggregation === "none";
  const countRequiresFieldNonEmpty =
    aggregation === "count" && Boolean(aggregationField);

  // assign stations to buckets
  for (const s of stations) {
    const key = matchStationToRegion(s, selectBy, regionKeys);
    if (!key) continue;
    const b = regionMap.get(key)!;
    b.stations.push(s);

    // Counting behavior
    if (aggIsCountLike) {
      if (countRequiresFieldNonEmpty) {
        const val = (s as any)[aggregationField as string];
        if (hasNonEmpty(val)) b.count += 1;
      } else {
        b.count += 1;
      }
    }

    // For non-count-like aggregations, collect numeric values
    if (!aggIsCountLike && aggregationField) {
      const v = toNumber((s as any)[aggregationField]);
      if (v !== null) b.values.push(v);
    }
  }

  // compute metric per bucket
  for (const b of regionMap.values()) {
    if (aggIsCountLike) {
      b.metric = b.count;
    } else {
      b.metric = AGG[aggregation](b.values);
    }
  }

  // compute domain for color scale
  const metrics = Array.from(regionMap.values()).map((b) => b.metric);
  const filtered = metrics.length ? metrics : [0];
  const min = Math.min(...filtered);
  const max = Math.max(...filtered, min === 0 ? 1 : min); // ensure non-degenerate

  return { regionMap, domain: { min, max } };
}

/**
 * Builds a human-friendly legend label for UI.
 * e.g., "AVERAGE (utilization_rate)" or "COUNT".
 */
export function makeLegendLabel(
  aggregation: AggregationKey,
  aggregationField?: string
) {
  const normalized = aggregation === "none" ? "count" : aggregation; // show NONE as COUNT
  const a = normalized.toUpperCase();
  return aggregationField && normalized !== "count"
    ? `${a} (${aggregationField})`
    : a;
}
