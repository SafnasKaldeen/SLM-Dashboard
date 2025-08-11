"use client";

import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

// Define the props interface
interface CartoMapProps {
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    position: [number, number];
    popup?: string;
    icon?: string;
    color?: string;
  }>;
  routes?: Array<{
    path: Array<[number, number]>;
    color?: string;
    weight?: number;
    opacity?: number;
    dashArray?: string;
  }>;
  clusters?: Array<{
    center: [number, number];
    radius: number;
    color?: string;
    fillColor?: string;
    fillOpacity?: number;
  }>;
  eps?: number; // Now interpreted as kilometers
  clusterSeparation?: number; // Optional, for cluster separation in kilometers
  height?: string;
  onMapClick?: (lat: number, lng: number) => void;
  interactive?: boolean;
}

// Helper function to generate SVG paths for icons
function getIconSVG(icon: string) {
  switch (icon) {
    case "location":
      return `
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      `;
    case "charging":
      return `<path d="M7 2v11m3-9 4 14m3-11v11"></path>`;
    case "scooter":
      return `<circle cx="12" cy="12" r="10"/>`;
    default:
      return `
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      `;
  }
}

function CartoMapComponent({
  center = [7.8731, 80.7718],
  zoom = 7,
  markers = [],
  routes = [],
  clusters = [],
  eps = 0, // eps in kilometers
  clusterSeparation = 0, // Optional, for cluster separation in kilometers
  height = "500px",
  onMapClick,
  interactive = true,
}: CartoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leaflet, setLeaflet] = useState<any>(null);

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

  useEffect(() => {
    if (!leaflet || !mapRef.current) return;

    const L = leaflet.default || leaflet;

    const initMap = () => {
      try {
        if (!mapInstance.current) {
          mapInstance.current = L.map(mapRef.current, {
            zoomControl: interactive,
            dragging: interactive,
            scrollWheelZoom: interactive,
          }).setView(center, zoom);

          L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
            {
              attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
              subdomains: "abcd",
              maxZoom: 19,
            }
          ).addTo(mapInstance.current);

          if (onMapClick) {
            mapInstance.current.on("click", (e: any) => {
              onMapClick(e.latlng.lat, e.latlng.lng);
            });
          }
        } else {
          mapInstance.current.setView(center, zoom);
        }

        // Remove old layers except tile layer
        mapInstance.current.eachLayer((layer: any) => {
          if (
            layer instanceof L.Marker ||
            layer instanceof L.Polyline ||
            layer instanceof L.Circle
          ) {
            mapInstance.current.removeLayer(layer);
          }
        });

        // Add markers and draw radius circle using eps in kilometers
        markers.forEach((marker) => {
          const {
            position,
            popup,
            icon = "location",
            color = "#06b6d4",
          } = marker;

          const customIcon = L.divIcon({
            className: "custom-marker-icon",
            html: `
              <div style="width: 30px; height: 30px; background-color: ${color}; display: flex; align-items: center; justify-content: center; border-radius: 50%; box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  ${getIconSVG(icon)}
                </svg>
              </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
          });

          const markerInstance = L.marker(position, { icon: customIcon }).addTo(
            mapInstance.current
          );

          if (popup) {
            markerInstance.bindPopup(popup, { className: "custom-popup" });
          }

          // Draw eps radius circle (in blue)
          if (eps > 0) {
            L.circle(position, {
              radius: eps * 1000, // km to meters
              color: "#06b6d4", // blue
              fillColor: "#06b6d4",
              fillOpacity: 0.1,
              weight: 1,
              dashArray: "4, 4",
            }).addTo(mapInstance.current);
          }

          // Draw clusterSeparation radius circle (in yellow)
          if (clusterSeparation && clusterSeparation > 0) {
            L.circle(position, {
              radius: clusterSeparation * 1000, // km to meters
              color: "#f59e0b", // yellow/orange
              fillColor: "#f59e0b",
              fillOpacity: 0.1,
              weight: 1,
              dashArray: "6, 6",
            }).addTo(mapInstance.current);
          }
        });

        // Draw routes
        routes.forEach((route) => {
          const {
            path,
            color = "#06b6d4",
            weight = 3,
            opacity = 0.7,
            dashArray = "",
          } = route;

          L.polyline(path, { color, weight, opacity, dashArray }).addTo(
            mapInstance.current
          );
        });

        // Draw clusters
        clusters.forEach((cluster) => {
          const {
            center,
            radius,
            color = "#06b6d4",
            fillColor = "#06b6d4",
            fillOpacity = 0.2,
          } = cluster;

          L.circle(center, {
            radius,
            color,
            fillColor,
            fillOpacity,
            weight: 1,
          }).addTo(mapInstance.current);
        });

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
  }, [
    leaflet,
    center,
    zoom,
    markers,
    routes,
    clusters,
    eps,
    clusterSeparation,
    onMapClick,
    interactive,
  ]);

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div style={{ height, position: "relative" }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
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
  );
}

export default CartoMapComponent;
