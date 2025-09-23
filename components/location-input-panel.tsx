"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Plus, MapPin } from "lucide-react";
import type { Waypoint } from "@/app/(protected)/optimize/page";

declare global {
  interface Window {
    google: typeof google;
  }
}

type LocationInputPanelProps = {
  origin: Waypoint | null;
  destination: Waypoint | null;
  waypoints: Waypoint[];
  onOriginChange: (waypoint: Waypoint) => void;
  onDestinationChange: (waypoint: Waypoint) => void;
  onAddWaypoint: (waypoint: Waypoint) => void;
  onRemoveWaypoint: (id: string) => void;
};

export function LocationInputPanel({
  origin,
  destination,
  waypoints,
  onOriginChange,
  onDestinationChange,
  onAddWaypoint,
  onRemoveWaypoint,
}: LocationInputPanelProps) {
  const [originInput, setOriginInput] = useState(origin?.address || "");
  const [destinationInput, setDestinationInput] = useState(
    destination?.address || ""
  );
  const [waypointInputs, setWaypointInputs] = useState<string[]>(
    waypoints.map((w) => w.address)
  );
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);

  const originRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const waypointRefs = useRef<(HTMLInputElement | null)[]>([]);
  const autocompleteRefs = useRef<google.maps.places.Autocomplete[]>([]);
  const initializationRef = useRef<boolean>(false);

  // Check if Google Maps is loaded
  const checkGoogleMapsLoaded = useCallback(() => {
    return !!window.google?.maps?.places?.Autocomplete;
  }, []);

  // Wait for Google Maps to load
  useEffect(() => {
    const checkAndSetGoogleLoaded = () => {
      if (checkGoogleMapsLoaded()) {
        setIsGoogleLoaded(true);
        return;
      }

      // If not loaded, check again after a short delay
      const timeoutId = setTimeout(checkAndSetGoogleLoaded, 100);
      return () => clearTimeout(timeoutId);
    };

    checkAndSetGoogleLoaded();
  }, [checkGoogleMapsLoaded]);

  // Clean up autocomplete instances
  const cleanupAutocomplete = useCallback(() => {
    autocompleteRefs.current.forEach((autocomplete) => {
      if (autocomplete) {
        try {
          google.maps.event.clearInstanceListeners(autocomplete);
        } catch (error) {
          console.warn("Error clearing autocomplete listeners:", error);
        }
      }
    });
    autocompleteRefs.current = [];
  }, []);

  // Initialize autocomplete for a single input
  const initializeAutocomplete = useCallback(
    (
      inputRef: HTMLInputElement,
      onPlaceSelected: (place: google.maps.places.PlaceResult) => void
    ): google.maps.places.Autocomplete | null => {
      if (!inputRef || !window.google?.maps?.places) return null;

      try {
        const autocomplete = new window.google.maps.places.Autocomplete(
          inputRef,
          {
            types: ["establishment", "geocode"],
            fields: ["formatted_address", "name", "geometry.location"],
          }
        );

        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          onPlaceSelected(place);
        });

        return autocomplete;
      } catch (error) {
        console.error("Failed to initialize autocomplete:", error);
        return null;
      }
    },
    []
  );

  // Initialize all autocomplete instances
  useEffect(() => {
    if (!isGoogleLoaded || initializationRef.current) return;

    const initAll = () => {
      cleanupAutocomplete();

      // Origin autocomplete
      if (originRef.current) {
        const autocomplete = initializeAutocomplete(
          originRef.current,
          (place) => {
            if (place.geometry?.location) {
              const waypoint: Waypoint = {
                id: "origin",
                address: place.formatted_address || place.name || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              onOriginChange(waypoint);
              setOriginInput(waypoint.address);
            }
          }
        );
        if (autocomplete) autocompleteRefs.current.push(autocomplete);
      }

      // Destination autocomplete
      if (destinationRef.current) {
        const autocomplete = initializeAutocomplete(
          destinationRef.current,
          (place) => {
            if (place.geometry?.location) {
              const waypoint: Waypoint = {
                id: "destination",
                address: place.formatted_address || place.name || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };
              onDestinationChange(waypoint);
              setDestinationInput(waypoint.address);
            }
          }
        );
        if (autocomplete) autocompleteRefs.current.push(autocomplete);
      }

      // Waypoint autocompletes
      waypointRefs.current.forEach((ref, index) => {
        if (ref) {
          const autocomplete = initializeAutocomplete(ref, (place) => {
            if (place.geometry?.location) {
              const waypoint: Waypoint = {
                id: `waypoint-${Date.now()}-${index}`,
                address: place.formatted_address || place.name || "",
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng(),
              };

              // Update the local input state
              setWaypointInputs((prev) => {
                const newInputs = [...prev];
                newInputs[index] = waypoint.address;
                return newInputs;
              });

              // If this is replacing an existing waypoint, remove the old one first
              if (waypoints[index]) {
                onRemoveWaypoint(waypoints[index].id);
              }

              onAddWaypoint(waypoint);
            }
          });
          if (autocomplete) autocompleteRefs.current.push(autocomplete);
        }
      });

      initializationRef.current = true;
    };

    // Small delay to ensure refs are set
    const timeoutId = setTimeout(initAll, 50);
    return () => clearTimeout(timeoutId);
  }, [
    isGoogleLoaded,
    onOriginChange,
    onDestinationChange,
    onAddWaypoint,
    onRemoveWaypoint,
    initializeAutocomplete,
    cleanupAutocomplete,
    waypoints,
  ]);

  // Reinitialize when waypoint inputs change
  useEffect(() => {
    if (isGoogleLoaded && initializationRef.current) {
      initializationRef.current = false;
    }
  }, [waypointInputs.length, isGoogleLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanupAutocomplete;
  }, [cleanupAutocomplete]);

  const addWaypointInput = () => {
    setWaypointInputs((prev) => [...prev, ""]);
  };

  const removeWaypointInput = (index: number) => {
    setWaypointInputs((prev) => prev.filter((_, i) => i !== index));

    // Remove the corresponding waypoint if it exists
    if (waypoints[index]) {
      onRemoveWaypoint(waypoints[index].id);
    }

    // Update refs array
    waypointRefs.current = waypointRefs.current.filter((_, i) => i !== index);
  };

  // Update input values when props change
  useEffect(() => {
    if (origin?.address !== originInput) {
      setOriginInput(origin?.address || "");
    }
  }, [origin?.address]);

  useEffect(() => {
    if (destination?.address !== destinationInput) {
      setDestinationInput(destination?.address || "");
    }
  }, [destination?.address]);

  if (!isGoogleLoaded) {
    return (
      <div className="space-y-4">
        <div className="text-sm text-gray-500 dark:text-gray-400 text-center p-4">
          Loading Google Maps...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Origin Input */}
      <div className="space-y-2">
        <Label htmlFor="origin" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          Origin *
        </Label>
        <div className="relative">
          <Input
            id="origin"
            ref={originRef}
            value={originInput}
            onChange={(e) => setOriginInput(e.target.value)}
            placeholder="Enter starting location"
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Waypoints */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          Waypoints
        </Label>

        {waypointInputs.map((input, index) => (
          <div key={`waypoint-${index}`} className="flex gap-2">
            <div className="flex-1 relative">
              <Input
                ref={(el) => {
                  waypointRefs.current[index] = el;
                }}
                value={input}
                onChange={(e) => {
                  setWaypointInputs((prev) => {
                    const newInputs = [...prev];
                    newInputs[index] = e.target.value;
                    return newInputs;
                  });
                }}
                placeholder={`Waypoint ${index + 1}`}
                className="pr-10"
              />
              <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => removeWaypointInput(index)}
              className="shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <Button
          variant="outline"
          onClick={addWaypointInput}
          className="w-full bg-transparent"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Waypoint
        </Button>
      </div>

      {/* Destination Input */}
      <div className="space-y-2">
        <Label htmlFor="destination" className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          Destination (optional)
        </Label>
        <div className="relative">
          <Input
            id="destination"
            ref={destinationRef}
            value={destinationInput}
            onChange={(e) => setDestinationInput(e.target.value)}
            placeholder="Enter destination (or return to origin)"
            className="pr-10"
          />
          <MapPin className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
      </div>
    </div>
  );
}
