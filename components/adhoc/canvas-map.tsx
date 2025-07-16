"use client";

import { useState, useRef, useEffect } from "react";
import {
  MapPin,
  Navigation,
  Clock,
  Info,
  AlertTriangle,
  CheckCircle,
  Menu,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import dynamic from "next/dynamic";
import type { CanvasElement, DataSource } from "../types/professional-types";

interface CanvasMapProps {
  element: CanvasElement;
  dataSources?: DataSource[];
}

const mockMapData = [
  {
    id: "ST01",
    name: "Miriswaththa",
    latitude: 7.123456,
    longitude: 80.123456,
    type: "station",
    area: "Gampaha",
    revenue: 4120,
    utilization_rate: 85,
    battery_level: 85,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST02",
    name: "Seeduwa",
    latitude: 7.148497,
    longitude: 79.873276,
    type: "station",
    area: "Gampaha",
    revenue: 3980,
    utilization_rate: 78,
    battery_level: 78,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST03",
    name: "Minuwangoda",
    latitude: 7.182689,
    longitude: 79.961171,
    type: "station",
    area: "Gampaha",
    revenue: 4215,
    utilization_rate: 81,
    battery_level: 81,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST04",
    name: "Divulapitiya",
    latitude: 7.222404,
    longitude: 80.017613,
    type: "station",
    area: "Gampaha",
    revenue: 3900,
    utilization_rate: 74,
    battery_level: 74,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST05",
    name: "Katunayake",
    latitude: 7.222445,
    longitude: 80.017625,
    type: "station",
    area: "Gampaha",
    revenue: 4050,
    utilization_rate: 86,
    battery_level: 86,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST06",
    name: "Udugampola",
    latitude: 7.120498,
    longitude: 79.983923,
    type: "station",
    area: "Gampaha",
    revenue: 3775,
    utilization_rate: 71,
    battery_level: 71,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST07",
    name: "Kadawatha",
    latitude: 7.006685,
    longitude: 79.958184,
    type: "station",
    area: "Gampaha",
    revenue: 3890,
    utilization_rate: 77,
    battery_level: 77,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST08",
    name: "Kochchikade",
    latitude: 7.274298,
    longitude: 79.862597,
    type: "station",
    area: "Gampaha",
    revenue: 3625,
    utilization_rate: 69,
    battery_level: 69,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST09",
    name: "Paliyagoda",
    latitude: 6.960975,
    longitude: 79.880949,
    type: "station",
    area: "Gampaha",
    revenue: 4100,
    utilization_rate: 84,
    battery_level: 84,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST10",
    name: "Boralesgamuwa",
    latitude: 6.837024,
    longitude: 79.903572,
    type: "station",
    area: "Colombo",
    revenue: 4230,
    utilization_rate: 90,
    battery_level: 90,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST11",
    name: "Thalawathugoda",
    latitude: 6.877865,
    longitude: 79.939505,
    type: "station",
    area: "Colombo",
    revenue: 4065,
    utilization_rate: 79,
    battery_level: 79,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST12",
    name: "Moratuwa",
    latitude: 6.787022,
    longitude: 79.884759,
    type: "station",
    area: "Colombo",
    revenue: 4330,
    utilization_rate: 88,
    battery_level: 88,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST13",
    name: "Borella",
    latitude: 6.915059,
    longitude: 79.881394,
    type: "station",
    area: "Colombo",
    revenue: 4190,
    utilization_rate: 83,
    battery_level: 83,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST14",
    name: "Padukka",
    latitude: 6.847305,
    longitude: 80.102153,
    type: "station",
    area: "Colombo",
    revenue: 3745,
    utilization_rate: 68,
    battery_level: 68,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST15",
    name: "Beruwala",
    latitude: 7.222348,
    longitude: 80.017553,
    type: "station",
    area: "Kalutara",
    revenue: 3855,
    utilization_rate: 76,
    battery_level: 76,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST16",
    name: "Bandaragama",
    latitude: 6.714853,
    longitude: 79.989208,
    type: "station",
    area: "Kalutara",
    revenue: 3970,
    utilization_rate: 72,
    battery_level: 72,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST17",
    name: "Maggona",
    latitude: 7.222444,
    longitude: 80.017606,
    type: "station",
    area: "Kalutara",
    revenue: 3710,
    utilization_rate: 66,
    battery_level: 66,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
  {
    id: "ST18",
    name: "Panadura",
    latitude: 6.713372,
    longitude: 79.906452,
    type: "station",
    area: "Kalutara",
    revenue: 4140,
    utilization_rate: 80,
    battery_level: 80,
    status: "active",
    timestamp: "2024-01-15T10:30:00Z",
  },
];

const computeAverageCenter = (points: typeof mockMapData) => {
  const latitudes = points.map((p) => p.latitude || 0);
  const longitudes = points.map((p) => p.longitude || 0);

  const avgLat =
    latitudes.reduce((sum, val) => sum + val, 0) / latitudes.length;
  const avgLng =
    longitudes.reduce((sum, val) => sum + val, 0) / longitudes.length;

  return { lat: avgLat, lng: avgLng };
};

const mapProviders = {
  openstreetmap: {
    name: "OpenStreetMap",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "© OpenStreetMap contributors",
    style: "light",
  },
  cartodb_dark: {
    name: "Carto Dark Matter",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    style: "dark",
  },
  cartodb_light: {
    name: "Carto Positron",
    url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
    attribution: "© OpenStreetMap contributors © CARTO",
    style: "light",
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
    style: "satellite",
  },
};

// Leaflet Map Component
function LeafletMapComponent({ element, dataSources = [] }: CanvasMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);
  const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);
  const [mapStats, setMapStats] = useState({
    safe: 0,
    warning: 0,
    danger: 0,
    stations: 0,
  });
  const [uiCollapsed, setUiCollapsed] = useState(false);

  /**
   * Defensive configuration lookup.
   * element.config can be undefined when the element has
   * just been created or if its config hasn’t been saved yet.
   */
  const cfg = element.config ?? {};

  // Get map-wide config values
  const mapProvider = cfg.mapProvider ?? "openstreetmap";
  const center = cfg.center ?? computeAverageCenter(mockMapData);
  const zoom = cfg.zoom ?? 12;
  const showLegend = cfg.showLegend !== false;
  const timeFilter = cfg.timeFilter ?? "all";

  // Get field mappings
  const latitudeField = cfg.latitudeField;
  const longitudeField = cfg.longitudeField;
  const sizeField = cfg.sizeField;
  const colorField = cfg.colorField;

  // Calculate map statistics
  useEffect(() => {
    const stats = { safe: 0, warning: 0, danger: 0, stations: 0 };
    mockMapData.forEach((point) => {
      if (point.type === "station") {
        stats.stations++;
      } else if (point.type === "scooter") {
        if (point.status === "safe") stats.safe++;
        else if (point.status === "warning") stats.warning++;
        else if (point.status === "danger") stats.danger++;
      }
    });
    setMapStats(stats);
  }, []);

  // Load Leaflet
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

  // Get data points based on field mappings
  const getDataPoints = () => {
    if (!latitudeField || !longitudeField) {
      return mockMapData;
    }

    return mockMapData.map((point) => ({
      ...point,
      lat:
        (point[latitudeField.id as keyof typeof point] as number) ||
        point.latitude,
      lng:
        (point[longitudeField.id as keyof typeof point] as number) ||
        point.longitude,
      size: sizeField
        ? (point[sizeField.id as keyof typeof point] as number)
        : point.revenue,
      color: colorField
        ? (point[colorField.id as keyof typeof point] as number)
        : point.utilization_rate,
    }));
  };

  const dataPoints = getDataPoints();

  // Get the color for a data point based on its value
  const getPointColor = (point: any) => {
    if (colorField) {
      const value = point.color || 0;
      if (value >= 80) return "#10B981";
      if (value >= 60) return "#F59E0B";
      if (value >= 40) return "#F97316";
      return "#EF4444";
    }

    if (point.type === "station") {
      const utilizationRate = point.utilization_rate || 0;
      if (utilizationRate >= 80) return "#10B981";
      if (utilizationRate >= 60) return "#F59E0B";
      return "#EF4444";
    } else if (point.type === "scooter") {
      switch (point.status) {
        case "safe":
          return "#10B981";
        case "warning":
          return "#F59E0B";
        case "danger":
          return "#EF4444";
        default:
          return "#6B7280";
      }
    }
    return "#6B7280";
  };

  // Get icon SVG for point type
  const getPointIconSvg = (point: any) => {
    if (point.type === "station") {
      return '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>';
    } else if (point.type === "scooter") {
      switch (point.status) {
        case "safe":
          return '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22,4 12,14.01 9,11.01"></polyline>';
        case "warning":
          return '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="m12 17 .01 0"></path>';
        case "danger":
          return '<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><path d="M12 9v4"></path><path d="m12 17 .01 0"></path>';
        default:
          return '<path d="M6 3h12l4 6-10 13L2 9l4-6z"></path>';
      }
    }
    return '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>';
  };

  // Create popup content
  const createPopupContent = (point: any) => {
    return `
      <div style="color: white; font-family: system-ui, sans-serif;">
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px;">
          <div style="font-weight: 600; font-size: 14px;">${point.name}</div>
          <div style="background: ${getPointColor(
            point
          )}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 500;">
            ${
              point.type === "station" ? "STATION" : point.status?.toUpperCase()
            }
          </div>
        </div>
        
        <div style="font-size: 12px; line-height: 1.4;">
          <div style="margin-bottom: 4px;">
            <span style="color: #94a3b8;">Coordinates:</span>
            <span style="font-weight: 500; margin-left: 4px;">
              ${(point.lat || point.latitude).toFixed(4)}, ${(
      point.lng || point.longitude
    ).toFixed(4)}
            </span>
          </div>
          
          ${
            latitudeField
              ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">${latitudeField.name}:</span>
              <span style="font-weight: 500; margin-left: 4px;">${
                point.lat || point.latitude
              }</span>
            </div>
          `
              : ""
          }
          
          ${
            longitudeField
              ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">${longitudeField.name}:</span>
              <span style="font-weight: 500; margin-left: 4px;">${
                point.lng || point.longitude
              }</span>
            </div>
          `
              : ""
          }
          
          ${
            sizeField
              ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">${sizeField.name}:</span>
              <span style="font-weight: 500; margin-left: 4px;">${point.size}</span>
            </div>
          `
              : ""
          }
          
          ${
            colorField
              ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">${colorField.name}:</span>
              <span style="font-weight: 500; margin-left: 4px;">${point.color}</span>
            </div>
          `
              : ""
          }
          
          ${
            point.type === "station"
              ? `
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">Revenue:</span>
              <span style="font-weight: 500; margin-left: 4px;">$${point.revenue?.toLocaleString()}</span>
            </div>
            <div style="margin-bottom: 4px;">
              <span style="color: #94a3b8;">Utilization:</span>
              <span style="font-weight: 500; margin-left: 4px;">${
                point.utilization_rate
              }%</span>
            </div>
          `
              : `
            <div style="margin-bottom: 4px; display: flex; align-items: center; gap: 4px;">
              <span style="color: #94a3b8;">Battery:</span>
              <span style="font-weight: 500;">${point.battery_level}%</span>
            </div>
            ${
              point.range
                ? `
              <div style="margin-bottom: 4px;">
                <span style="color: #94a3b8;">Range:</span>
                <span style="font-weight: 500; margin-left: 4px;">${point.range} km</span>
              </div>
            `
                : ""
            }
          `
          }
        </div>
      </div>
    `;
  };

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;

    const L = leaflet.default || leaflet;

    const initMap = () => {
      try {
        const L = leaflet.default || leaflet;

        if (!mapInstance.current) {
          mapInstance.current = L.map(mapRef.current, {
            zoomControl: true,
            dragging: true,
            scrollWheelZoom: true,
          });

          const currentProvider =
            mapProviders[mapProvider as keyof typeof mapProviders];

          const tileOptions: any = {
            attribution: currentProvider.attribution,
            maxZoom: 19,
          };

          if (currentProvider.url.includes("{s}")) {
            tileOptions.subdomains = "abcd";
          }

          L.tileLayer(currentProvider.url, tileOptions).addTo(
            mapInstance.current
          );

          // ✅ Custom CSS styles
          const style = document.createElement("style");
          style.innerHTML = `
        .custom-marker-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          border-radius: 50%;
          border: 2px solid rgba(255, 255, 255, 0.5);
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
        }
        .custom-marker-pulse {
          animation: pulse 1.5s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 1; }
          70% { transform: scale(1.5); opacity: 0.3; }
          100% { transform: scale(0.8); opacity: 1; }
        }
        .custom-popup {
          background-color: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(100, 116, 139, 0.5);
          border-radius: 8px;
          color: white;
          font-family: system-ui, sans-serif;
          padding: 0;
          font-size: 14px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
          backdrop-filter: blur(8px);
        }
        .custom-popup .leaflet-popup-content-wrapper {
          background-color: transparent;
          border: none;
          box-shadow: none;
          border-radius: 8px;
          padding: 16px;
        }
        .custom-popup .leaflet-popup-content {
          margin: 0;
          color: white;
        }
        .custom-popup .leaflet-popup-tip {
          background-color: rgba(15, 23, 42, 0.95);
          border: 1px solid rgba(100, 116, 139, 0.5);
        }
        .custom-popup a.leaflet-popup-close-button {
          color: rgba(255, 255, 255, 0.7);
          font-size: 18px;
          padding: 4px 8px;
        }
        .custom-popup a.leaflet-popup-close-button:hover {
          color: white;
          background-color: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
      `;
          document.head.appendChild(style);
        } else {
          // update center without changing zoom manually
          mapInstance.current.setView([center.lat, center.lng]);
        }

        // 🔄 Remove all previous markers
        mapInstance.current.eachLayer((layer: any) => {
          if (layer instanceof L.Marker) {
            mapInstance.current.removeLayer(layer);
          }
        });

        const markerLatLngs: any[] = [];

        // 🧿 Add all points
        dataPoints.forEach((point) => {
          const color = getPointColor(point);
          const iconSvg = getPointIconSvg(point);

          const customIcon = L.divIcon({
            className: "custom-marker-icon",
            html: `
          <div style="width: 32px; height: 32px; background-color: ${color}; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 15px rgba(0, 0, 0, 0.6); border: 2px solid rgba(255, 255, 255, 0.8);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              ${iconSvg}
            </svg>
          </div>
          <div class="custom-marker-pulse" style="position: absolute; top: -8px; left: -8px; width: 48px; height: 48px; background-color: ${color}; opacity: 0.3; border-radius: 50%;"></div>
        `,
            iconSize: [32, 32],
            iconAnchor: [16, 16],
          });

          const lat = point.lat || point.latitude;
          const lng = point.lng || point.longitude;
          const marker = L.marker([lat, lng], { icon: customIcon }).addTo(
            mapInstance.current
          );

          markerLatLngs.push([lat, lng]);

          const popupContent = createPopupContent(point);
          marker.bindPopup(popupContent, {
            className: "custom-popup",
            maxWidth: 300,
            closeButton: true,
          });

          marker.on("click", () => {
            setSelectedPoint(point.id);
          });
        });

        // 🗺️ Fit map bounds to all markers with padding
        if (markerLatLngs.length > 0) {
          const bounds = L.latLngBounds(markerLatLngs);
          mapInstance.current.fitBounds(bounds.pad(0.1)); // ✅ 10% padding
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      // Cleanup on component unmount
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [
    leaflet,
    mapProvider,
    dataPoints,
    latitudeField,
    longitudeField,
    sizeField,
    colorField,
  ]);

  const renderCollapsibleUI = () => {
    return (
      <>
        {/* Collapsible Toggle Button */}
        <div className="absolute top-4 right-4 z-[1000]">
          <Button
            onClick={() => setUiCollapsed(!uiCollapsed)}
            className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-sm border shadow-lg hover:bg-white/95 transition-all duration-200"
            variant="outline"
          >
            {uiCollapsed ? (
              <Menu className="h-5 w-5 text-gray-700" />
            ) : (
              <X className="h-5 w-5 text-gray-700" />
            )}
          </Button>
        </div>

        {/* Collapsible UI Panel */}
        {!uiCollapsed && (
          <div className="absolute top-4 left-4 space-y-4 z-[999] transition-all duration-300">
            {/* Zoom Level Display */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
              <CardContent className="p-3">
                <div className="flex items-center gap-2">
                  <Navigation className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-xs text-gray-600">Zoom Level</div>
                    <div className="text-lg font-bold text-blue-600">
                      {zoom}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="space-y-2">
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <div>
                      <div className="text-xs text-gray-600">Safe</div>
                      <div className="text-lg font-bold text-green-600">
                        {mapStats.safe}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <div>
                      <div className="text-xs text-gray-600">Warning</div>
                      <div className="text-lg font-bold text-yellow-600">
                        {mapStats.warning}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <div>
                      <div className="text-xs text-gray-600">Danger</div>
                      <div className="text-lg font-bold text-red-600">
                        {mapStats.danger}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <div>
                      <div className="text-xs text-gray-600">Stations</div>
                      <div className="text-lg font-bold text-blue-600">
                        {mapStats.stations}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Legend */}
            {showLegend && (
              <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border p-4 max-w-xs">
                <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Map Legend
                </div>

                <div className="space-y-3">
                  {/* Field Mappings */}
                  {(latitudeField || longitudeField) && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-2">
                        Field Mappings
                      </div>
                      <div className="space-y-1 text-xs">
                        {latitudeField && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                            <span>Lat: {latitudeField.name}</span>
                          </div>
                        )}
                        {longitudeField && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>Lng: {longitudeField.name}</span>
                          </div>
                        )}
                        {sizeField && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span>Size: {sizeField.name}</span>
                          </div>
                        )}
                        {colorField && (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                            <span>Color: {colorField.name}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Point Types */}
                  <div>
                    <div className="text-xs font-medium text-gray-700 mb-2">
                      Point Types
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex items-center justify-center">
                          <MapPin className="h-2 w-2 text-white" />
                        </div>
                        <span>Stations</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle className="h-2 w-2 text-white" />
                        </div>
                        <span>Safe Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500 flex items-center justify-center">
                          <AlertTriangle className="h-2 w-2 text-white" />
                        </div>
                        <span>Warning Status</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500 flex items-center justify-center">
                          <AlertTriangle className="h-2 w-2 text-white" />
                        </div>
                        <span>Danger Status</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </>
    );
  };

  return (
    <div className="h-full w-full relative bg-gray-100 rounded-lg overflow-hidden">
      {/* Map Provider Info */}
      <div className="absolute top-2 left-2 z-[999]">
        <Badge variant="outline" className="bg-black/90 backdrop-blur-sm">
          {mapProviders[mapProvider as keyof typeof mapProviders]?.name ||
            "OpenStreetMap"}{" "}
          (Z: {zoom})
        </Badge>
      </div>

      {/* Leaflet Map Container */}
      <Card className="h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="h-full relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-[1001]">
                <div className="flex flex-col items-center">
                  <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                  <p className="mt-2 text-sm text-slate-300">Loading map...</p>
                </div>
              </div>
            )}
            <div ref={mapRef} className="h-full w-full" />
          </div>
        </CardContent>
      </Card>

      {/* No Data State */}
      {(!latitudeField || !longitudeField) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-[1002]">
          <div className="text-center text-gray-500 p-6">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <div className="text-lg font-medium mb-2">Configure Map Fields</div>
            <div className="text-sm mb-4">
              Drag and drop latitude and longitude fields from the data panel to
              configure the map
            </div>
            <div className="space-y-2 text-xs text-left bg-gray-50 p-3 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Required: Latitude field</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Required: Longitude field</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Optional: Size field</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span>Optional: Color field</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Dynamically import the map component with SSR disabled
const DynamicLeafletMap = dynamic(() => Promise.resolve(LeafletMapComponent), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full relative bg-gray-100 rounded-lg overflow-hidden">
      <Card className="h-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
        <CardContent className="p-0 h-full">
          <div className="h-full relative">
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
              <div className="flex flex-col items-center">
                <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
                <p className="mt-2 text-sm text-slate-300">Loading map...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  ),
});

// Export the dynamic component as default
export function CanvasMap({ element, dataSources = [] }: CanvasMapProps) {
  return <DynamicLeafletMap element={element} dataSources={dataSources} />;
}
