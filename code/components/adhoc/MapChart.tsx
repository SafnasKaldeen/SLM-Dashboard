"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Layers, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";

interface MapChartProps {
  data: any[];
  config: any;
}

export default function MapChart({ data, config }: MapChartProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaflet, setLeaflet] = useState<any>(null);
  const [zoom, setZoom] = useState(10);

  // Load Leaflet dynamically
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

  // Mock geographic data if not present
  const mockGeoData = [
    {
      name: "Station A",
      lat: 6.9271,
      lng: 79.8612,
      value: 150,
      category: "High",
    },
    {
      name: "Station B",
      lat: 6.9344,
      lng: 79.8428,
      value: 120,
      category: "Medium",
    },
    {
      name: "Station C",
      lat: 6.9147,
      lng: 79.873,
      value: 200,
      category: "High",
    },
    {
      name: "Station D",
      lat: 6.9022,
      lng: 79.8607,
      value: 80,
      category: "Low",
    },
    {
      name: "Station E",
      lat: 6.9388,
      lng: 79.8653,
      value: 175,
      category: "High",
    },
  ];

  const mapData = data.length > 0 ? data : mockGeoData;

  // Initialize map
  useEffect(() => {
    if (!leaflet || !mapRef.current) return;

    const L = leaflet.default || leaflet;

    const initMap = () => {
      try {
        if (!mapInstance.current) {
          // Initialize map with Carto Dark Matter tiles
          mapInstance.current = L.map(mapRef.current, {
            center: [6.9271, 79.8612], // Colombo, Sri Lanka
            zoom: zoom,
            zoomControl: false,
          });

          // Add Carto Dark Matter tile layer
          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              attribution: "© OpenStreetMap contributors © CARTO",
              subdomains: "abcd",
              maxZoom: 19,
            }
          ).addTo(mapInstance.current);

          // Custom marker style
          const createCustomIcon = (value: number, category: string) => {
            const color =
              category === "High"
                ? "#10B981"
                : category === "Medium"
                ? "#F59E0B"
                : "#EF4444";

            const size = Math.max(20, Math.min(40, (value / 200) * 40));

            return L.divIcon({
              className: "custom-marker",
              html: `
                <div style="
                  width: ${size}px;
                  height: ${size}px;
                  background-color: ${color};
                  border: 3px solid rgba(255, 255, 255, 0.8);
                  border-radius: 50%;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: white;
                  font-weight: bold;
                  font-size: 10px;
                  box-shadow: 0 0 15px rgba(0, 0, 0, 0.5);
                  animation: pulse 2s infinite;
                ">
                  ${value}
                </div>
                <style>
                  @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.7; }
                    100% { transform: scale(1); opacity: 1; }
                  }
                </style>
              `,
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            });
          };

          // Add markers
          mapData.forEach((point) => {
            const lat =
              point.lat ||
              point.latitude ||
              6.9271 + (Math.random() - 0.5) * 0.1;
            const lng =
              point.lng ||
              point.longitude ||
              79.8612 + (Math.random() - 0.5) * 0.1;
            const value = point.value || Math.floor(Math.random() * 200) + 50;
            const category =
              point.category ||
              ["High", "Medium", "Low"][Math.floor(Math.random() * 3)];

            const marker = L.marker([lat, lng], {
              icon: createCustomIcon(value, category),
            }).addTo(mapInstance.current);

            // Custom popup
            const popupContent = `
              <div style="color: white; font-family: system-ui, sans-serif; min-width: 200px;">
                <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #06B6D4;">
                  ${point.name || `Point ${mapData.indexOf(point) + 1}`}
                </div>
                <div style="font-size: 12px; line-height: 1.4;">
                  <div style="margin-bottom: 4px;">
                    <span style="color: #94A3B8;">Coordinates:</span>
                    <span style="margin-left: 8px; font-weight: 500;">${lat.toFixed(
                      4
                    )}, ${lng.toFixed(4)}</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="color: #94A3B8;">Value:</span>
                    <span style="margin-left: 8px; font-weight: 500;">${value.toLocaleString()}</span>
                  </div>
                  <div style="margin-bottom: 4px;">
                    <span style="color: #94A3B8;">Category:</span>
                    <span style="margin-left: 8px; font-weight: 500; color: ${
                      category === "High"
                        ? "#10B981"
                        : category === "Medium"
                        ? "#F59E0B"
                        : "#EF4444"
                    };">${category}</span>
                  </div>
                </div>
              </div>
            `;

            marker.bindPopup(popupContent, {
              className: "custom-popup",
              maxWidth: 300,
              closeButton: true,
            });
          });

          // Add custom CSS for popups
          const style = document.createElement("style");
          style.innerHTML = `
            .custom-popup .leaflet-popup-content-wrapper {
              background-color: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(100, 116, 139, 0.5);
              border-radius: 8px;
              color: white;
              backdrop-filter: blur(8px);
            }
            .custom-popup .leaflet-popup-tip {
              background-color: rgba(15, 23, 42, 0.95);
              border: 1px solid rgba(100, 116, 139, 0.5);
            }
            .custom-popup .leaflet-popup-close-button {
              color: rgba(255, 255, 255, 0.7);
              font-size: 18px;
            }
            .custom-popup .leaflet-popup-close-button:hover {
              color: white;
              background-color: rgba(255, 255, 255, 0.1);
              border-radius: 4px;
            }
          `;
          document.head.appendChild(style);

          // Fit bounds to show all markers
          if (mapData.length > 0) {
            const group = new L.featureGroup(
              mapData.map((point) =>
                L.marker([
                  point.lat ||
                    point.latitude ||
                    6.9271 + (Math.random() - 0.5) * 0.1,
                  point.lng ||
                    point.longitude ||
                    79.8612 + (Math.random() - 0.5) * 0.1,
                ])
              )
            );
            mapInstance.current.fitBounds(group.getBounds().pad(0.1));
          }

          // Update zoom state when map zoom changes
          mapInstance.current.on("zoomend", () => {
            setZoom(mapInstance.current.getZoom());
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error initializing map:", error);
        setIsLoading(false);
      }
    };

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [leaflet, mapData]);

  const handleZoomIn = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapInstance.current) {
      mapInstance.current.zoomOut();
    }
  };

  const handleReset = () => {
    if (mapInstance.current && mapData.length > 0) {
      const group = new (leaflet.default || leaflet).featureGroup(
        mapData.map((point) =>
          (leaflet.default || leaflet).marker([
            point.lat || point.latitude || 6.9271 + (Math.random() - 0.5) * 0.1,
            point.lng ||
              point.longitude ||
              79.8612 + (Math.random() - 0.5) * 0.1,
          ])
        )
      );
      mapInstance.current.fitBounds(group.getBounds().pad(0.1));
    }
  };

  return (
    <div className="relative h-[400px] w-full">
      {/* Map Container */}
      <div ref={mapRef} className="h-full w-full rounded-lg overflow-hidden" />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto mb-2"></div>
            <p className="text-slate-300 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-[1000]">
        <Button
          size="sm"
          variant="outline"
          className="bg-slate-800/90 border-slate-600 text-white hover:bg-slate-700"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-slate-800/90 border-slate-600 text-white hover:bg-slate-700"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="bg-slate-800/90 border-slate-600 text-white hover:bg-slate-700"
          onClick={handleReset}
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Map Info */}
      <div className="absolute top-4 left-4 z-[1000]">
        <Card className="bg-slate-800/90 border-slate-600">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-sm">
              <MapPin className="h-4 w-4 text-cyan-400" />
              <span className="text-white font-medium">Carto Dark Matter</span>
              <Badge
                variant="outline"
                className="text-xs text-slate-300 border-slate-600"
              >
                Zoom: {zoom}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <Card className="bg-slate-800/90 border-slate-600">
          <CardContent className="p-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs">
                <Layers className="h-3 w-3 text-cyan-400" />
                <span className="text-white font-medium">Legend</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-slate-300">High Value</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-slate-300">Medium Value</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-slate-300">Low Value</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Stats */}
      <div className="absolute bottom-4 right-4 z-[1000]">
        <Card className="bg-slate-800/90 border-slate-600">
          <CardContent className="p-3">
            <div className="text-xs text-slate-300">
              <div className="font-medium text-white mb-1">Data Points</div>
              <div>{mapData.length} locations</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
