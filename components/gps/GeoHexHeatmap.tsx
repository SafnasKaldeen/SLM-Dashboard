import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  MapPin,
  Layers,
  Settings,
  Menu,
  X,
  Loader2,
  Eye,
  EyeOff,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

// d3 color scale imports
import { scaleSequential } from "d3-scale";
import {
  interpolateYlOrRd,
  interpolateViridis,
  interpolatePlasma,
  interpolateTurbo,
  interpolateCividis,
} from "d3-scale-chromatic";

/* =========================
   Types
========================= */
interface DataPoint {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  type?: string;
  area?: string;
  // explicit admin fields
  district?: string;
  province?: string;
  // kept for backward compatibility (province equivalent)
  region?: string;

  utilization_rate?: number;
  ping_speed?: number;
  status?: string;
  battery_count?: number;
  daily_swaps?: number;
  revenue?: number;
}

type SelectByKey = "area" | "district" | "province";

interface ChoroplethProps {
  data?: DataPoint[];
  geojsonData?: any;
  config?: {
    opacity?: number;
    showPoints?: boolean;
    showBorders?: boolean;
    mapProvider?:
      | "openstreetmap"
      | "cartodb_dark"
      | "cartodb_light"
      | "satellite";
    regionProperty?: string; // If you want to override the detected property
    palette?: PaletteKey;
    selectBy?: SelectByKey; // default grouping
  };
  className?: string;
  onRegionClick?: (region: any, data: DataPoint[]) => void;
  onDataPointClick?: (point: DataPoint) => void;
}

type PaletteKey = "YlOrRd" | "Viridis" | "Plasma" | "Turbo" | "Cividis";

/* =========================
   Palette Config
========================= */
const PALETTES: Record<
  PaletteKey,
  {
    label: string;
    interpolator: (t: number) => string;
    stops?: number[];
  }
> = {
  YlOrRd: { label: "YlOrRd (Heatmap)", interpolator: interpolateYlOrRd },
  Viridis: { label: "Viridis", interpolator: interpolateViridis },
  Plasma: { label: "Plasma", interpolator: interpolatePlasma },
  Turbo: { label: "Turbo", interpolator: interpolateTurbo },
  Cividis: { label: "Cividis", interpolator: interpolateCividis },
};

function cssGradientFromInterpolator(
  interpolator: (t: number) => string,
  stops: number[] = [0, 0.25, 0.5, 0.75, 1]
) {
  const segments = stops
    .map((s) => `${interpolator(s)} ${s * 100}%`)
    .join(", ");
  return `linear-gradient(to right, ${segments})`;
}

/* =========================
   Hardcoded Data (added district & province)
========================= */
const hardcodedStations: DataPoint[] = [
  // Western Province
  {
    id: "LK001",
    name: "Station Colombo Fort",
    latitude: 6.9271,
    longitude: 79.8612,
    area: "Colombo",
    district: "Colombo",
    province: "Western Province",
  },
  {
    id: "LK002",
    name: "Station Negombo",
    latitude: 7.2083,
    longitude: 79.8358,
    area: "Negombo",
    district: "Gampaha",
    province: "Western Province",
  },
  {
    id: "LK003",
    name: "Station Kelaniya",
    latitude: 6.9553,
    longitude: 79.9219,
    area: "Kelaniya",
    district: "Gampaha",
    province: "Western Province",
  },
  {
    id: "LK004",
    name: "Station Kalutara",
    latitude: 6.5831,
    longitude: 79.9608,
    area: "Kalutara",
    district: "Kalutara",
    province: "Western Province",
  },
  {
    id: "LK021",
    name: "Station Dehiwala",
    latitude: 6.8528,
    longitude: 79.8651,
    area: "Dehiwala",
    district: "Colombo",
    province: "Western Province",
  },
  {
    id: "LK022",
    name: "Station Wattala",
    latitude: 6.9735,
    longitude: 79.8897,
    area: "Wattala",
    district: "Gampaha",
    province: "Western Province",
  },
  {
    id: "LK023",
    name: "Station Moratuwa",
    latitude: 6.7733,
    longitude: 79.8836,
    area: "Moratuwa",
    district: "Colombo",
    province: "Western Province",
  },
  {
    id: "LK024",
    name: "Station Ragama",
    latitude: 7.0273,
    longitude: 79.9183,
    area: "Ragama",
    district: "Gampaha",
    province: "Western Province",
  },

  // Central Province
  {
    id: "LK005",
    name: "Station Kandy City",
    latitude: 7.2906,
    longitude: 80.6337,
    area: "Gangawata Korale",
    district: "Kandy",
    province: "Central Province",
  },
  {
    id: "LK006",
    name: "Station Matale",
    latitude: 7.4675,
    longitude: 80.6234,
    area: "Matale",
    district: "Matale",
    province: "Central Province",
  },
  {
    id: "LK007",
    name: "Nuwara Eliya",
    latitude: 6.9497,
    longitude: 80.7891,
    area: "Nuwara Eliya",
    district: "Nuwara Eliya",
    province: "Central Province",
  },
  {
    id: "LK025",
    name: "Station Peradeniya",
    latitude: 7.2624,
    longitude: 80.5982,
    area: "Peradeniya",
    district: "Kandy",
    province: "Central Province",
  },
  {
    id: "LK026",
    name: "Station Dambulla",
    latitude: 7.8554,
    longitude: 80.6512,
    area: "Dambulla",
    district: "Matale",
    province: "Central Province",
  },

  // Southern Province
  {
    id: "LK008",
    name: "Station Galle Fort",
    latitude: 6.0346,
    longitude: 80.217,
    area: "Galle",
    district: "Galle",
    province: "Southern Province",
  },
  {
    id: "LK009",
    name: "Station Matara",
    latitude: 5.9485,
    longitude: 80.5353,
    area: "Matara",
    district: "Matara",
    province: "Southern Province",
  },
  {
    id: "LK027",
    name: "Station Weligama",
    latitude: 5.9668,
    longitude: 80.4292,
    area: "Weligama",
    district: "Matara",
    province: "Southern Province",
  },
  {
    id: "LK028",
    name: "Station Tangalle",
    latitude: 6.0244,
    longitude: 80.7916,
    area: "Tangalle",
    district: "Hambantota",
    province: "Southern Province",
  },
  {
    id: "LK029",
    name: "Station Hambantota Town",
    latitude: 6.1241,
    longitude: 81.1185,
    area: "Hambantota Town",
    district: "Hambantota",
    province: "Southern Province",
  },

  // Northern Province
  {
    id: "LK010",
    name: "Station Jaffna",
    latitude: 9.6615,
    longitude: 80.0255,
    area: "Jaffna",
    district: "Jaffna",
    province: "Northern Province",
  },
  {
    id: "LK030",
    name: "Station Chavakachcheri",
    latitude: 9.658,
    longitude: 80.159,
    area: "Chavakachcheri",
    district: "Jaffna",
    province: "Northern Province",
  },
  {
    id: "LK031",
    name: "Station Kilinochchi",
    latitude: 9.395,
    longitude: 80.398,
    area: "Kilinochchi",
    district: "Kilinochchi",
    province: "Northern Province",
  },
  {
    id: "LK032",
    name: "Station Mannar",
    latitude: 8.977,
    longitude: 79.911,
    area: "Mannar",
    district: "Mannar",
    province: "Northern Province",
  },

  // Eastern Province
  {
    id: "LK011",
    name: "Station Batticaloa",
    latitude: 7.712,
    longitude: 81.6784,
    area: "Manmunai North",
    district: "Batticaloa",
    province: "Eastern Province",
  },
  {
    id: "LK012",
    name: "Station Trincomalee",
    latitude: 8.5874,
    longitude: 81.2152,
    area: "Town & Gravets",
    district: "Trincomalee",
    province: "Eastern Province",
  },
  {
    id: "LK018",
    name: "Station Eravur",
    latitude: 7.733,
    longitude: 81.628,
    area: "Eravur",
    district: "Batticaloa",
    province: "Eastern Province",
  },
  {
    id: "LK019",
    name: "Station Kinniya",
    latitude: 8.433,
    longitude: 81.183,
    area: "Kinniya",
    district: "Trincomalee",
    province: "Eastern Province",
  },
  {
    id: "LK020",
    name: "Station Ampara",
    latitude: 7.283,
    longitude: 81.682,
    area: "Ampara",
    district: "Ampara",
    province: "Eastern Province",
  },

  // North Western Province
  {
    id: "LK013",
    name: "Station Kurunegala",
    latitude: 7.4863,
    longitude: 80.3647,
    area: "Kurunegala",
    district: "Kurunegala",
    province: "North Western Province",
  },
  {
    id: "LK033",
    name: "Station Kuliyapitiya",
    latitude: 7.473,
    longitude: 80.042,
    area: "Kuliyapitiya",
    district: "Kurunegala",
    province: "North Western Province",
  },
  {
    id: "LK034",
    name: "Station Puttalam",
    latitude: 8.036,
    longitude: 79.828,
    area: "Puttalam",
    district: "Puttalam",
    province: "North Western Province",
  },

  // North Central Province
  {
    id: "LK014",
    name: "Station Anuradhapura",
    latitude: 8.3114,
    longitude: 80.4037,
    area: "Nuwaragam Palatha East",
    district: "Anuradhapura",
    province: "North Central Province",
  },
  {
    id: "LK035",
    name: "Station Polonnaruwa",
    latitude: 7.939,
    longitude: 81.002,
    area: "Polonnaruwa Town",
    district: "Polonnaruwa",
    province: "North Central Province",
  },
  {
    id: "LK036",
    name: "Station Mihintale",
    latitude: 8.35,
    longitude: 80.515,
    area: "Mihintale",
    district: "Anuradhapura",
    province: "North Central Province",
  },

  // Uva Province
  {
    id: "LK015",
    name: "Station Badulla",
    latitude: 6.9934,
    longitude: 81.055,
    area: "Badulla",
    district: "Badulla",
    province: "Uva Province",
  },
  {
    id: "LK037",
    name: "Station Bandarawela",
    latitude: 6.828,
    longitude: 80.987,
    area: "Bandarawela",
    district: "Badulla",
    province: "Uva Province",
  },
  {
    id: "LK038",
    name: "Station Monaragala",
    latitude: 6.873,
    longitude: 81.349,
    area: "Monaragala",
    district: "Monaragala",
    province: "Uva Province",
  },

  // Sabaragamuwa Province
  {
    id: "LK016",
    name: "Station Ratnapura",
    latitude: 6.6828,
    longitude: 80.3992,
    area: "Ratnapura",
    district: "Ratnapura",
    province: "Sabaragamuwa Province",
  },
  {
    id: "LK017",
    name: "Station Kegalle",
    latitude: 7.2513,
    longitude: 80.3464,
    area: "Kegalle",
    district: "Kegalle",
    province: "Sabaragamuwa Province",
  },
  {
    id: "LK039",
    name: "Station Balangoda",
    latitude: 6.662,
    longitude: 80.698,
    area: "Balangoda",
    district: "Ratnapura",
    province: "Sabaragamuwa Province",
  },
  {
    id: "LK040",
    name: "Station Mawanella",
    latitude: 7.252,
    longitude: 80.439,
    area: "Mawanella",
    district: "Kegalle",
    province: "Sabaragamuwa Province",
  },

  // Additional filler points (to reach 50)
  {
    id: "LK041",
    name: "Station Hikkaduwa",
    latitude: 6.14,
    longitude: 80.101,
    area: "Hikkaduwa",
    district: "Galle",
    province: "Southern Province",
  },
  {
    id: "LK042",
    name: "Station Arugam Bay",
    latitude: 6.837,
    longitude: 81.83,
    area: "Arugam Bay",
    district: "Ampara",
    province: "Eastern Province",
  },
  {
    id: "LK043",
    name: "Station Hatton",
    latitude: 6.898,
    longitude: 80.599,
    area: "Hatton",
    district: "Nuwara Eliya",
    province: "Central Province",
  },
  {
    id: "LK044",
    name: "Station Avissawella",
    latitude: 6.951,
    longitude: 80.204,
    area: "Avissawella",
    district: "Colombo",
    province: "Western Province",
  },
  {
    id: "LK045",
    name: "Station Chilaw",
    latitude: 7.575,
    longitude: 79.795,
    area: "Chilaw",
    district: "Puttalam",
    province: "North Western Province",
  },
  {
    id: "LK046",
    name: "Station Medirigiriya",
    latitude: 7.984,
    longitude: 80.951,
    area: "Medirigiriya",
    district: "Polonnaruwa",
    province: "North Central Province",
  },
  {
    id: "LK047",
    name: "Station Wellawaya",
    latitude: 6.733,
    longitude: 81.1,
    area: "Wellawaya",
    district: "Monaragala",
    province: "Uva Province",
  },
  {
    id: "LK048",
    name: "Station Ruwanwella",
    latitude: 7.031,
    longitude: 80.315,
    area: "Ruwanwella",
    district: "Kegalle",
    province: "Sabaragamuwa Province",
  },
  {
    id: "LK049",
    name: "Station Vavuniya",
    latitude: 8.756,
    longitude: 80.498,
    area: "Vavuniya",
    district: "Vavuniya",
    province: "Northern Province",
  },
  {
    id: "LK050",
    name: "Station Mullaitivu",
    latitude: 9.267,
    longitude: 80.815,
    area: "Mullaitivu",
    district: "Mullaitivu",
    province: "Northern Province",
  },
];

/* =========================
   Component
========================= */
const GeoChoroplethMap: React.FC<ChoroplethProps> = ({
  data,
  geojsonData,
  config = {},
  className = "",
  onRegionClick,
  onDataPointClick,
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const baseTileLayer = useRef<any>(null);
  const geoJsonLayer = useRef<any>(null);
  const pointsLayer = useRef<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [uiCollapsed, setUiCollapsed] = useState(false);
  const [hoveredRegion, setHoveredRegion] = useState<any>(null);
  const [geoData, setGeoData] = useState<any>(null);

  const [opacity, setOpacity] = useState([config.opacity ?? 0.7]);
  const [showPoints, setShowPoints] = useState(config.showPoints ?? false);
  const [showBorders, setShowBorders] = useState(config.showBorders ?? true);
  const [mapProvider, setMapProvider] = useState<
    "openstreetmap" | "cartodb_dark" | "cartodb_light" | "satellite"
  >(config.mapProvider || "cartodb_dark");

  // === Strict ADM mapping for each level ===
  const defaultRegionPropByLevel: Record<SelectByKey, string> = {
    area: "ADM3_EN", // DS divisions / areas
    district: "ADM2_EN", // Districts
    province: "ADM1_EN", // Provinces
  };

  const initialSelectBy: SelectByKey = config.selectBy || "province";
  const [selectBy, setSelectBy] = useState<SelectByKey>(initialSelectBy);

  // regionProperty is reset automatically when selectBy changes
  const [regionProperty, setRegionProperty] = useState<string>(
    config.regionProperty || defaultRegionPropByLevel[initialSelectBy]
  );

  // Palette selection
  const [paletteKey, setPaletteKey] = useState<PaletteKey>(
    config.palette || "YlOrRd"
  );

  // discover region property options from geojson (if present)
  const [regionPropertyOptions, setRegionPropertyOptions] = useState<string[]>(
    []
  );

  // Use hardcoded stations unless data provided
  const stations = useMemo<DataPoint[]>(() => {
    if (data && data.length > 0) return data;
    return hardcodedStations;
  }, [data]);

  /* =========================
     GeoJSON source resolution by selectBy
  ========================= */
  const getGeoUrlForLevel = (level: SelectByKey) => {
    if (geojsonData) return null; // user provided
    // Adjust these paths to where you host your files
    if (level === "district") return "/srilanka_districts.geojson"; // ADM2 polygons
    if (level === "province") return "/srilanka_provinces.geojson"; // ADM1 polygons
    return "/srilanka.geojson"; // ADM3 polygons for Area
  };

  /* =========================
     Load GeoJSON (prop or per selectBy)
  ========================= */
  useEffect(() => {
    const loadGeoJSON = async () => {
      try {
        if (geojsonData) {
          setGeoData(geojsonData);
          return;
        }
        const url = getGeoUrlForLevel(selectBy);
        if (!url) return;
        const response = await fetch(url);
        if (response.ok) {
          const json = await response.json();
          setGeoData(json);
        } else {
          console.warn("Could not load GeoJSON:", url);
          setGeoData(null);
        }
      } catch (error) {
        console.error("Error loading GeoJSON:", error);
        setGeoData(null);
      }
    };
    loadGeoJSON();
  }, [geojsonData, selectBy]);

  // Reset regionProperty to the strict ADM key whenever level changes
  useEffect(() => {
    setRegionProperty(defaultRegionPropByLevel[selectBy]);
  }, [selectBy]);

  // discover property keys; prefer the default ADM key for the level
  useEffect(() => {
    if (!geoData?.features?.length) return;
    const sampleProps = geoData.features[0]?.properties || {};
    const keys = Object.keys(sampleProps);

    const likely = keys.filter(
      (k) =>
        /^(ADM1|ADM2|ADM3).*_EN$/i.test(k) ||
        /(NAME|ADM).*(EN|_1|_2|_3)?$/i.test(k) ||
        /^NAME$/i.test(k)
    );

    const preferred = defaultRegionPropByLevel[selectBy];
    const unique = Array.from(
      new Set([preferred, regionProperty, ...likely].filter(Boolean))
    );
    setRegionPropertyOptions(unique);
  }, [geoData, regionProperty, selectBy]);

  /* =========================
     Map providers with styling
  ========================= */
  const mapProviders = {
    openstreetmap: {
      name: "OpenStreetMap",
      url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      attribution: "© OpenStreetMap contributors",
      borderColor: "#1f2937", // Dark gray for clear visibility
      regionBaseColor: "#ffffff",
    },
    cartodb_dark: {
      name: "Carto Dark",
      url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      attribution: "© OpenStreetMap contributors © CARTO",
      borderColor: "#facc15", // Bright yellow for high contrast on dark map
      regionBaseColor: "#1e293b",
    },
    cartodb_light: {
      name: "Carto Light",
      url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      attribution: "© OpenStreetMap contributors © CARTO",
      borderColor: "#111827", // Almost black, stands out on light map
      regionBaseColor: "#f8fafc",
    },
    satellite: {
      name: "Satellite",
      url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      attribution: "© Esri",
      borderColor: "#00E5FF", // Electric cyan stands out on greens/browns/blues
      regionBaseColor: "#000000",
    },
  };

  /* =========================
     Load Leaflet
  ========================= */
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const L = await import("leaflet");
        await import("leaflet/dist/leaflet.css");
        setLeaflet(L);
      } catch (error) {
        console.error("Failed to load Leaflet:", error);
        setIsLoading(false);
      }
    };
    loadLeaflet();
  }, []);

  /* =========================
     Initialize map
  ========================= */
  useEffect(() => {
    if (!leaflet || !mapRef.current || mapInstance.current) return;
    const L = (leaflet as any).default || leaflet;

    const map = L.map(mapRef.current, {
      zoomControl: true,
      dragging: true,
      scrollWheelZoom: true,
    });
    // Initial center: Sri Lanka
    map.setView([7.8731, 80.7718], 7);
    mapInstance.current = map;

    const provider = mapProviders[mapProvider];
    const tileOptions: any = {
      attribution: provider.attribution,
      maxZoom: 19,
    };
    if (provider.url.includes("{s}")) tileOptions.subdomains = "abcd";
    baseTileLayer.current = L.tileLayer(provider.url, tileOptions).addTo(map);

    setIsLoading(false);
  }, [leaflet]);

  /* =========================
     Update base tile on provider change
  ========================= */
  useEffect(() => {
    if (!leaflet || !mapInstance.current) return;

    const provider = mapProviders[mapProvider];
    const tileOptions: any = {
      attribution: provider.attribution,
      maxZoom: 19,
    };
    if (provider.url.includes("{s}")) tileOptions.subdomains = "abcd";

    if (baseTileLayer.current) {
      mapInstance.current.removeLayer(baseTileLayer.current);
      baseTileLayer.current = null;
    }

    const L = (leaflet as any).default || leaflet;
    baseTileLayer.current = L.tileLayer(provider.url, tileOptions).addTo(
      mapInstance.current
    );
  }, [mapProvider, leaflet]);

  /* =========================
     Helpers: get region name with fallbacks
  ========================= */
  function getRegionNameFromFeature(
    feature: any,
    preferredKey: string
  ): string | undefined {
    if (!feature?.properties) return undefined;
    const props = feature.properties;
    // Always try the selected target property first, then common fallbacks
    console.log("preferredKey: ", preferredKey);
    const candidates = [preferredKey, "ADM3_EN", "ADM2_EN", "ADM1_EN", "NAME"];
    for (const k of candidates) {
      if (props[k] != null && String(props[k]).trim() !== "")
        return String(props[k]);
    }
    return undefined;
  }

  /* =========================
     Count-based region data with selectBy matching
  ========================= */
  const regionData = useMemo(() => {
    if (!geoData) return new Map<string, any>();

    const aggregated = new Map<string, any>();

    // Initialize all polygons
    geoData.features?.forEach((feature: any) => {
      const regionName = getRegionNameFromFeature(feature, regionProperty);
      if (regionName) {
        aggregated.set(regionName, {
          name: regionName,
          stations: [] as DataPoint[],
          count: 0,
        });
      }
    });

    if (!stations.length) return aggregated;

    const polygonKeys = Array.from(aggregated.keys());
    const loweredKeys = polygonKeys.map((k) => k.toLowerCase());

    const pickCandidatesForStation = (s: DataPoint): string[] => {
      if (selectBy === "district") {
        return [s.district].filter(Boolean) as string[];
      }
      if (selectBy === "province") {
        // prefer explicit province, then region (legacy)
        return [s.province, s.region].filter(Boolean) as string[];
      }
      // area: area name, then region, then station name
      return [s.area, s.region, s.name].filter(Boolean) as string[];
    };

    stations.forEach((station) => {
      const candidates = pickCandidatesForStation(station);

      let matchedKey: string | undefined;

      // exact match
      for (const c of candidates) {
        if (c && aggregated.has(c)) {
          matchedKey = c;
          break;
        }
      }

      // case-insensitive "includes" both ways
      if (!matchedKey) {
        for (const c of candidates) {
          const target = String(c).toLowerCase();
          const idx = loweredKeys.findIndex(
            (k) => k.includes(target) || target.includes(k)
          );
          if (idx !== -1) {
            matchedKey = polygonKeys[idx];
            break;
          }
        }
      }

      if (matchedKey) {
        const bucket = aggregated.get(matchedKey);
        bucket.stations.push(station);
        bucket.count += 1;
      }
    });

    return aggregated;
  }, [stations, geoData, regionProperty, selectBy]);

  /* =========================
     Color scale (D3 sequential palette)
  ========================= */
  const { getColor, getLegendCSS, maxCount } = useMemo(() => {
    const counts = Array.from(regionData.values()).map((r: any) => r.count);
    const max = Math.max(...counts, 1);
    const interpolator = PALETTES[paletteKey].interpolator;
    const seq = scaleSequential(interpolator).domain([0, max]);

    return {
      getColor: (count: number) => {
        if (count <= 0) return "rgba(156, 163, 175, 0.2)";
        return seq(count);
      },
      getLegendCSS: () => cssGradientFromInterpolator(interpolator),
      maxCount: max,
    };
  }, [regionData, paletteKey]);

  /* =========================
     Points management
  ========================= */
  const clearPoints = () => {
    if (mapInstance.current && pointsLayer.current) {
      pointsLayer.current.forEach((marker) => {
        mapInstance.current.removeLayer(marker);
      });
      pointsLayer.current = [];
    }
  };

  const addPoints = () => {
    if (!leaflet || !mapInstance.current) return;
    const L = (leaflet as any).default || leaflet;

    stations.forEach((station) => {
      const statusColors: Record<string, string> = {
        active: "#10b981",
        warning: "#f59e0b",
        maintenance: "#ef4444",
      };

      const marker = L.circleMarker([station.latitude, station.longitude], {
        radius: 6,
        fillColor: statusColors[station.status || ""] || "#6b7280",
        color: "#ffffff",
        weight: 2,
        opacity: 0.9,
        fillOpacity: 0.8,
      }).addTo(mapInstance.current);

      const popupContent = `
        <div style="color: white; font-family: system-ui, sans-serif;">
          <div style="font-weight: 600; margin-bottom: 8px;">${
            station.name
          }</div>
          <div style="font-size: 13px;">
            <div>Province: ${station.province || station.region || "N/A"}</div>
            <div>District: ${station.district || "N/A"}</div>
            <div>Area: ${station.area || "N/A"}</div>
            <div>Status: ${station.status ?? "n/a"}</div>
            <div>Type: ${station.type ?? "n/a"}</div>
            <div>Utilization: ${station.utilization_rate ?? "N/A"}%</div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, { className: "custom-popup" });
      marker.on("click", () => onDataPointClick?.(station));
      pointsLayer.current.push(marker);
    });
  };

  useEffect(() => {
    if (!mapInstance.current || !leaflet) return;
    clearPoints();
    if (showPoints) addPoints();
  }, [showPoints, stations, leaflet]);

  /* =========================
     GeoJSON layer + fit to bounds on change
  ========================= */
  const hoverNameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!leaflet || !mapInstance.current || !geoData) return;
    const L = (leaflet as any).default || leaflet;

    if (geoJsonLayer.current) {
      mapInstance.current.removeLayer(geoJsonLayer.current);
      geoJsonLayer.current = null;
    }

    const provider = mapProviders[mapProvider];

    geoJsonLayer.current = L.geoJSON(geoData, {
      style: (feature: any) => {
        const regionName = getRegionNameFromFeature(feature, regionProperty);
        const regionInfo = regionName ? regionData.get(regionName) : undefined;
        const count = regionInfo ? regionInfo.count : 0;

        return {
          fillColor: getColor(count),
          weight: showBorders
            ? selectBy === "area"
              ? 0.5
              : 2 // thinner for area, thicker for district/province
            : 0,
          opacity: showBorders ? 1 : 0,
          color: provider.borderColor,
          dashArray: "",
          fillOpacity: count > 0 ? opacity[0] : 0.12,
          stroke: showBorders,
        };
      },
      onEachFeature: (feature, layer) => {
        layer.on({
          mouseover: () => {
            const regionName = getRegionNameFromFeature(
              feature,
              regionProperty
            );
            const regionInfo = regionName
              ? regionData.get(regionName)
              : undefined;
            if (hoverNameRef.current !== regionName) {
              hoverNameRef.current = regionName || null;
              setHoveredRegion({
                name: regionName,
                info: regionInfo || { count: 0, stations: [] },
              });
            }
          },
          mouseout: () => {
            hoverNameRef.current = null;
            setHoveredRegion(null);
          },
          click: () => {
            const regionName = getRegionNameFromFeature(
              feature,
              regionProperty
            );
            const regionInfo = regionName
              ? regionData.get(regionName)
              : undefined;
            if (onRegionClick && regionInfo) {
              onRegionClick(feature, regionInfo.stations);
            }
          },
        });
      },
    }).addTo(mapInstance.current);

    // Fit to bounds of the newly added admin layer
    try {
      const b = geoJsonLayer.current.getBounds();
      if (b && b.isValid && b.isValid()) {
        mapInstance.current.fitBounds(b, { padding: [20, 20] });
      }
    } catch (e) {
      // ignore
    }
  }, [
    leaflet,
    geoData,
    regionProperty,
    showBorders,
    mapProvider,
    opacity,
    regionData,
    getColor,
    onRegionClick,
  ]);

  /* =========================
     Stats
  ========================= */
  const stats = useMemo(() => {
    const counts = Array.from(regionData.values()).map((r: any) => r.count);
    if (counts.length === 0)
      return { total: 0, max: 0, min: 0, avg: 0, totalRegions: 0 };

    const activeCounts = counts.filter((c: number) => c > 0);
    return {
      total: stations.length,
      max: Math.max(...counts, 0),
      min: activeCounts.length > 0 ? Math.min(...activeCounts) : 0,
      avg:
        activeCounts.length > 0
          ? activeCounts.reduce((sum: number, c: number) => sum + c, 0) /
            activeCounts.length
          : 0,
      totalRegions: activeCounts.length,
    };
  }, [regionData, stations]);

  const selectByLabel: Record<SelectByKey, string> = {
    area: "Area",
    district: "District",
    province: "Province",
  };

  /* =========================
     Render
  ========================= */
  return (
    <div
      className={`relative w-full h-screen bg-background overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="absolute top-4 left-4 z-[999]">
        <Card className="bg-card/95 backdrop-blur-sm border border-border/50 p-3">
          <div className="flex items-center space-x-2">
            <Layers className="h-5 w-5 text-primary" />
            <span className="text-foreground font-medium">
              Station Density Map
            </span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {stats.totalRegions} {selectByLabel[selectBy]} polygons •{" "}
            {stations.length} stations
          </div>
        </Card>
      </div>

      {/* Settings Toggle */}
      <div className="absolute top-4 right-4 z-[999]">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setUiCollapsed(!uiCollapsed)}
          className="bg-card/95 backdrop-blur-sm border border-border/50"
        >
          {uiCollapsed ? (
            <Menu className="h-4 w-4" />
          ) : (
            <X className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Settings Panel */}
      {!uiCollapsed && (
        <div className="absolute top-16 right-4 z-[998] max-w-xs">
          <Card className="bg-card/95 backdrop-blur-sm border border-border/50 p-4">
            <div className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Map Settings
            </div>
            <div className="space-y-4 text-xs">
              {/* Select By */}
              <div className="space-y-2">
                <label className="text-foreground block text-xs font-medium">
                  Select By
                </label>
                <Select
                  value={selectBy}
                  onValueChange={(v) => setSelectBy(v as SelectByKey)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="area">Area</SelectItem>
                    <SelectItem value="district">District</SelectItem>
                    <SelectItem value="province">Province</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Map Style */}
              <div className="space-y-2">
                <label className="text-foreground block text-xs font-medium">
                  Map Style
                </label>
                <Select value={mapProvider} onValueChange={setMapProvider}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cartodb_light">Carto Light</SelectItem>
                    <SelectItem value="cartodb_dark">Carto Dark</SelectItem>
                    <SelectItem value="openstreetmap">OpenStreetMap</SelectItem>
                    <SelectItem value="satellite">Satellite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Region Property (advanced override) */}
              {/* <div className="space-y-2">
                <label className="text-foreground block text-xs font-medium">
                  Region Property
                </label>
                <Select
                  value={regionProperty}
                  onValueChange={setRegionProperty}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(regionPropertyOptions.length
                      ? regionPropertyOptions
                      : ["ADM3_EN", "ADM2_EN", "ADM1_EN", "NAME_EN", "NAME"]
                    ).map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div> */}

              {/* Palette */}
              <div className="space-y-2">
                <label className="text-foreground block text-xs font-medium">
                  Palette
                </label>
                <Select
                  value={paletteKey}
                  onValueChange={(v) => setPaletteKey(v as PaletteKey)}
                >
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(PALETTES).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        {v.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <label className="text-foreground block text-xs font-medium">
                  Fill Opacity
                </label>
                <Slider
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={opacity}
                  onValueChange={setOpacity}
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between">
                <label className="text-foreground text-xs font-medium">
                  Show Data Points
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPoints(!showPoints)}
                  className="h-8 px-2"
                >
                  {showPoints ? (
                    <Eye className="h-3 w-3" />
                  ) : (
                    <EyeOff className="h-3 w-3" />
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-foreground text-xs font-medium">
                  Show Borders
                </label>
                <Switch
                  checked={showBorders}
                  onCheckedChange={setShowBorders}
                />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Hover Tooltip */}
      {hoveredRegion && (
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-[1000] pointer-events-none">
          <Card className="bg-card/95 backdrop-blur-sm border border-border/50 p-3 shadow-lg">
            <div className="text-sm font-medium text-foreground mb-2">
              {hoveredRegion.name}
            </div>
            {hoveredRegion.info && (
              <div className="text-xs text-muted-foreground space-y-1">
                <div>Station Count: {hoveredRegion.info.count}</div>
                {hoveredRegion.info.count > 0 && (
                  <div className="text-xs">
                    {hoveredRegion.info.stations
                      .slice(0, 3)
                      .map((station: DataPoint) => (
                        <div key={station.id} className="truncate">
                          • {station.name}
                        </div>
                      ))}
                    {hoveredRegion.info.stations.length > 3 && (
                      <div>
                        ... and {hoveredRegion.info.stations.length - 3} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 z-[999]">
        <Card className="bg-card/95 backdrop-blur-sm border border-border/50 p-3">
          <div className="text-sm font-medium text-foreground mb-2">
            Station Density by {selectByLabel[selectBy]}
          </div>
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs text-muted-foreground">0</span>
            <div
              className="w-24 h-3 rounded-full border border-border/30"
              style={{ background: getLegendCSS() }}
            />
            <span className="text-xs text-muted-foreground">{maxCount}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            Stations per {selectByLabel[selectBy]}
          </div>
        </Card>
      </div>

      {/* Stats */}
      <div className="absolute bottom-4 left-4 z-[999]">
        <Card className="bg-card/95 backdrop-blur-sm border border-border/50 p-3">
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Total Stations: {stats.total}</div>
            <div>
              Max per {selectByLabel[selectBy]}: {stats.max}
            </div>
            <div>
              Min per {selectByLabel[selectBy]}: {stats.min}
            </div>
            <div>
              Avg per {selectByLabel[selectBy]}: {stats.avg.toFixed(1)}
            </div>
          </div>
        </Card>
      </div>

      {/* Map Container */}
      <div className="absolute inset-0">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-[1001]">
            <div className="flex flex-col items-center text-foreground">
              <Loader2 className="h-8 w-8 animate-spin mb-2" />
              <p className="text-sm">Loading choropleth map...</p>
            </div>
          </div>
        )}
        <div ref={mapRef} className="h-full w-full" />
      </div>

      {/* No Data State */}
      {!geoData && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1002]">
          <div className="text-center text-muted-foreground p-6">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium mb-2">
              Loading GeoJSON Data...
            </div>
            <div className="text-sm">
              Please ensure the GeoJSON file is available for{" "}
              {selectByLabel[selectBy]} level.
            </div>
          </div>
        </div>
      )}

      {/* Custom popup styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .custom-popup .leaflet-popup-content-wrapper {
            background-color: hsl(var(--card));
            border: 1px solid hsl(var(--border));
            border-radius: 12px;
            color: hsl(var(--foreground));
            backdrop-filter: blur(12px);
          }
          .custom-popup .leaflet-popup-content {
            margin: 12px;
            color: hsl(var(--foreground));
          }
          .custom-popup .leaflet-popup-tip {
            background-color: hsl(var(--card));
            border: 1px solid hsl(var(--border));
          }
          .custom-popup a.leaflet-popup-close-button {
            color: hsl(var(--muted-foreground));
            font-size: 18px;
            padding: 4px 8px;
            border-radius: 4px;
          }
          .custom-popup a.leaflet-popup-close-button:hover {
            color: hsl(var(--foreground));
            background-color: hsl(var(--accent));
          }
        `,
        }}
      />
    </div>
  );
};

export default GeoChoroplethMap;
