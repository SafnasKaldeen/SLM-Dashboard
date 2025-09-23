"use client";

import { useEffect, useRef, useState } from "react";
import type { Waypoint, RouteData } from "@/app/(protected)/optimize/page";

interface RouteOptimizerMapProps {
  origin: Waypoint | null;
  destination: Waypoint | null;
  waypoints: Waypoint[];
  routeData: RouteData | null;
  onMapClick: (lat: number, lng: number, address: string) => void;
}

declare global {
  interface Window {
    google: typeof google;
  }
}

export function RouteOptimizerMap({
  origin,
  destination,
  waypoints,
  routeData,
  onMapClick,
}: RouteOptimizerMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      if (!mapRef.current) return;

      try {
        // Check if API key exists
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error("Google Maps API key is missing");
        }

        // Load Google Maps API
        const { Loader } = await import("@googlemaps/js-api-loader");
        const loader = new Loader({
          apiKey,
          version: "weekly",
          libraries: ["places", "geometry"],
        });

        await loader.load();

        if (!window.google?.maps) {
          throw new Error("Google Maps failed to load");
        }

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
          zoom: 10,
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        });

        const renderer = new window.google.maps.DirectionsRenderer({
          suppressMarkers: true,
          polylineOptions: {
            strokeColor: "#3B82F6",
            strokeWeight: 4,
          },
        });
        renderer.setMap(mapInstance);

        setMap(mapInstance);
        setDirectionsRenderer(renderer);
        setIsLoading(false);

        // Add click listener
        mapInstance.addListener(
          "click",
          async (event: google.maps.MapMouseEvent) => {
            if (event.latLng) {
              const lat = event.latLng.lat();
              const lng = event.latLng.lng();

              // Reverse geocode to get address
              const geocoder = new window.google.maps.Geocoder();
              try {
                const result = await geocoder.geocode({
                  location: { lat, lng },
                });
                const address =
                  result.results[0]?.formatted_address ||
                  `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                onMapClick(lat, lng, address);
              } catch (error) {
                console.error("Geocoding failed:", error);
                onMapClick(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`);
              }
            }
          }
        );
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setError(
          `Failed to load Google Maps: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
        setIsLoading(false);
      }
    };

    initMap();
  }, [onMapClick]);

  // Update markers when locations change
  useEffect(() => {
    if (!map || !window.google?.maps) return;

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null));
    const newMarkers: google.maps.Marker[] = [];

    // Add origin marker
    if (origin) {
      const marker = new window.google.maps.Marker({
        position: { lat: origin.lat, lng: origin.lng },
        map,
        title: "Origin",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#10B981" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });
      newMarkers.push(marker);
    }

    // Add waypoint markers
    waypoints.forEach((waypoint, index) => {
      const marker = new window.google.maps.Marker({
        position: { lat: waypoint.lat, lng: waypoint.lng },
        map,
        title: `Waypoint ${index + 1}`,
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#3B82F6" stroke="white" strokeWidth="2"/>
              <text x="12" y="16" textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">${
                index + 1
              }</text>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });
      newMarkers.push(marker);
    });

    // Add destination marker
    if (destination) {
      const marker = new window.google.maps.Marker({
        position: { lat: destination.lat, lng: destination.lng },
        map,
        title: "Destination",
        icon: {
          url:
            "data:image/svg+xml;charset=UTF-8," +
            encodeURIComponent(`
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="8" fill="#EF4444" stroke="white" strokeWidth="2"/>
              <circle cx="12" cy="12" r="3" fill="white"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(24, 24),
        },
      });
      newMarkers.push(marker);
    }

    setMarkers(newMarkers);

    // Fit bounds to show all markers
    if (newMarkers.length > 0) {
      const bounds = new window.google.maps.LatLngBounds();
      newMarkers.forEach((marker) => {
        const position = marker.getPosition();
        if (position) bounds.extend(position);
      });
      map.fitBounds(bounds);
    }
  }, [map, origin, destination, waypoints]);

  // Display route when available
  useEffect(() => {
    if (
      !map ||
      !directionsRenderer ||
      !routeData ||
      !origin ||
      !window.google?.maps
    )
      return;

    // Mock directions display - replace with actual Google Directions API
    // For now, just draw a simple polyline between points
    const path = [
      { lat: origin.lat, lng: origin.lng },
      ...waypoints.map((w) => ({ lat: w.lat, lng: w.lng })),
      ...(destination ? [{ lat: destination.lat, lng: destination.lng }] : []),
    ];

    if (path.length > 1) {
      const polyline = new window.google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: "#3B82F6",
        strokeOpacity: 1.0,
        strokeWeight: 4,
      });
      polyline.setMap(map);
    }
  }, [map, directionsRenderer, routeData, origin, waypoints, destination]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">
            Loading Google Maps...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800">
        <div className="text-center p-4">
          <p className="text-red-600 dark:text-red-400 mb-2">{error}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables
          </p>
        </div>
      </div>
    );
  }

  return <div ref={mapRef} className="w-full h-full" />;
}
