"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  CornerDownRight,
  Battery,
  Route,
  Zap,
  ChargingStation,
  Navigation,
} from "lucide-react";
import CartoMap from "@/components/maps/carto-map";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

import DashboardLayout from "@/components/dashboard-layout";

interface RouteSummary {
  location: string; // e.g. "(6.9271, 79.8612)"
  category: "Source" | "Destination" | "Visiting_Charging_Station";
  battery_on_arrival_percent: number;
  battery_on_departure_percent: number;
  next_stop_distance_km: number;
  station_name?: string;
}

interface RouteData {
  success: boolean;
  distance_km: number;
  message: string;
  planned_charging_stops_count: number;
  route_summary: RouteSummary[];
  llm_description?: string;
  llm_charging_strategy?: string;
}

// Google Maps Route Optimizer interfaces
interface Waypoint {
  id: string;
  address: string;
  lat: number;
  lng: number;
}

interface GoogleRouteData {
  distance: string;
  duration: string;
  polyline: string;
  optimizedOrder: number[];
  stepByStepDirections?: {
    instruction: string;
    distance: number;
    duration: string;
    maneuver: string;
  }[];
}

interface ProcessedRouteData {
  route: { lat: number; lng: number; name: string; category: string }[];
  batteryUsage: number;
  distance: number;
  estimatedTime: number;
  chargingStops: {
    name: string;
    lat: number;
    lng: number;
    chargingTime: number;
    batteryAdded: number;
    batteryOnArrival: number;
    batteryOnDeparture: number;
  }[];
  googleRoute?: GoogleRouteData; // Added Google Maps route data
  optimizedPolyline?: string; // Decoded polyline for map display
}

export default function RoutePlanningPage() {
  const [source, setSource] = useState("");
  const [destination, setDestination] = useState("");
  const [battery, setBattery] = useState(80);
  const [efficiency, setEfficiency] = useState(70);
  const [isLoading, setIsLoading] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [routeData, setRouteData] = useState<ProcessedRouteData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const DEFAULT_CHARGING_STATIONS = [
    { lat: 7.123456, lon: 80.123456, name: "Miriswaththa_Station" },
    { lat: 7.148497, lon: 79.873276, name: "Seeduwa_Station" },
    { lat: 7.182689, lon: 79.961171, name: "Minuwangoda_Station" },
    { lat: 7.222404, lon: 80.017613, name: "Divulapitiya_Station" },
    { lat: 7.222445, lon: 80.017625, name: "Katunayake_Station" },
    { lat: 7.120498, lon: 79.983923, name: "Udugampola_Station" },
    { lat: 7.006685, lon: 79.958184, name: "Kadawatha_Station" },
    { lat: 7.274298, lon: 79.862597, name: "Kochchikade_Station" },
    { lat: 6.960975, lon: 79.880949, name: "Paliyagoda_Station" },
    { lat: 6.837024, lon: 79.903572, name: "Boralesgamuwa_Station" },
    { lat: 6.877865, lon: 79.939505, name: "Thalawathugoda_Station" },
    { lat: 6.787022, lon: 79.884759, name: "Moratuwa_Station" },
    { lat: 6.915059, lon: 79.881394, name: "Borella_Station" },
    { lat: 6.847305, lon: 80.102153, name: "Padukka_Station" },
    { lat: 7.222348, lon: 80.017553, name: "Beruwala_Station" },
    { lat: 6.714853, lon: 79.989208, name: "Bandaragama_Station" },
    { lat: 7.222444, lon: 80.017606, name: "Maggona_Station" },
    { lat: 6.713372, lon: 79.906452, name: "Panadura_Station" },
    { lat: 7.8715, lon: 80.011, name: "Anamaduwa_Station" },
    { lat: 7.2845, lon: 80.6375, name: "Kandy_Station" },
    { lat: 6.9847, lon: 81.0564, name: "Badulla_Station" },
    { lat: 41.5375, lon: 2.4453, name: "Matara_Station" },
    { lat: 8.4947, lon: 80.1739, name: "Pemaduwa_Station" },
    { lat: 8.7542, lon: 80.4982, name: "Chilaw_Station" },
    { lat: 7.0094, lon: 81.0565, name: "Mahiyangana_Station" },
    { lat: 7.2531, lon: 80.3453, name: "Kegalle_Station" },
  ];

  // Helper function to parse location string "(lat, lng)" to numbers
  const parseLocation = (locationStr: string): { lat: number; lng: number } => {
    const cleaned = locationStr.replace(/[()]/g, "");
    const [lat, lng] = cleaned.split(",").map((s) => parseFloat(s.trim()));
    return { lat, lng };
  };

  // Helper function to get location name based on coordinates
  const getLocationName = (lat: number, lng: number): string => {
    const locations: { [key: string]: string } = {
      "6.9271,79.8612": "Colombo",
      "6.960975,79.880949": "Paliyagoda",
      "7.4863,80.3623": "Kandy",
    };

    const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    return locations[key] || `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
  };

  // Function to decode Google Maps polyline
  const decodePolyline = (encoded: string): [number, number][] => {
    const points: [number, number][] = [];
    let index = 0;
    let lat = 0;
    let lng = 0;

    while (index < encoded.length) {
      let b;
      let shift = 0;
      let result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlat = result & 1 ? ~(result >> 1) : result >> 1;
      lat += dlat;

      shift = 0;
      result = 0;

      do {
        b = encoded.charCodeAt(index++) - 63;
        result |= (b & 0x1f) << shift;
        shift += 5;
      } while (b >= 0x20);

      const dlng = result & 1 ? ~(result >> 1) : result >> 1;
      lng += dlng;

      points.push([lat / 1e5, lng / 1e5]);
    }

    return points;
  };

  // Function to convert coordinates to address for Google Maps API
  const coordsToAddress = async (lat: number, lng: number): Promise<string> => {
    // For demo purposes, return coordinates as string
    // In production, you might want to use reverse geocoding
    return `${lat.toFixed(6)},${lng.toFixed(6)}`;
  };

  // Function to get optimal route from Google Maps
  const getOptimalRoute = async (
    origin: { lat: number; lng: number; name: string },
    destination: { lat: number; lng: number; name: string },
    waypoints: { lat: number; lng: number; name: string }[]
  ): Promise<GoogleRouteData | null> => {
    try {
      setIsOptimizing(true);

      // Prepare waypoints for route optimizer API
      const formattedOrigin: Waypoint = {
        id: "origin",
        address: await coordsToAddress(origin.lat, origin.lng),
        lat: origin.lat,
        lng: origin.lng,
      };

      const formattedDestination: Waypoint = {
        id: "destination",
        address: await coordsToAddress(destination.lat, destination.lng),
        lat: destination.lat,
        lng: destination.lng,
      };

      const formattedWaypoints: Waypoint[] = await Promise.all(
        waypoints.map(async (wp, index) => ({
          id: `waypoint_${index}`,
          address: await coordsToAddress(wp.lat, wp.lng),
          lat: wp.lat,
          lng: wp.lng,
        }))
      );

      // Call the route optimizer API
      const response = await fetch("/api/compute-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          origin: formattedOrigin,
          destination: formattedDestination,
          waypoints: formattedWaypoints,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Route optimization failed with status ${response.status}`
        );
      }

      const json = await response.json();

      if (!json.routes || json.routes.length === 0) {
        throw new Error("No routes returned from optimization API");
      }

      const route = json.routes[0];
      const optimizedOrder: number[] =
        route.optimizedIntermediateWaypointIndex || [];

      // Parse duration from the string format (e.g., "1234s" -> 1234 seconds)
      const durationInSeconds = route.duration
        ? parseFloat(route.duration.replace("s", ""))
        : route.staticDuration
        ? parseFloat(route.staticDuration.replace("s", ""))
        : 0;

      const googleRouteData: GoogleRouteData = {
        distance: `${(route.distanceMeters / 1000).toFixed(1)} km`,
        duration: `${Math.round(durationInSeconds / 60)} mins`,
        polyline: route.polyline.encodedPolyline,
        optimizedOrder,
        stepByStepDirections: route.stepByStepDirections || [],
      };

      return googleRouteData;
    } catch (error) {
      console.error("Error getting optimal route:", error);
      throw error;
    } finally {
      setIsOptimizing(false);
    }
  };

  // Process API response to match component expectations
  const processRouteData = async (
    apiData: RouteData
  ): Promise<ProcessedRouteData> => {
    const route = apiData.route_summary.map((item) => {
      const coords = parseLocation(item.location);
      return {
        lat: coords.lat,
        lng: coords.lng,
        name: item.station_name || getLocationName(coords.lat, coords.lng),
        category: item.category,
      };
    });

    const chargingStops = apiData.route_summary
      .filter((item) => item.category === "Visiting_Charging_Station")
      .map((item) => {
        const coords = parseLocation(item.location);
        return {
          name: item.station_name || "Charging Station",
          lat: coords.lat,
          lng: coords.lng,
          chargingTime: Math.round(
            (item.battery_on_departure_percent -
              item.battery_on_arrival_percent) *
              0.8
          ),
          batteryAdded:
            item.battery_on_departure_percent - item.battery_on_arrival_percent,
          batteryOnArrival: item.battery_on_arrival_percent,
          batteryOnDeparture: item.battery_on_departure_percent,
        };
      });

    const sourceItem = apiData.route_summary.find(
      (item) => item.category === "Source"
    );
    const destinationItem = apiData.route_summary.find(
      (item) => item.category === "Destination"
    );
    const batteryUsage =
      sourceItem && destinationItem
        ? sourceItem.battery_on_departure_percent -
          destinationItem.battery_on_arrival_percent
        : 0;

    // Get the optimal route from Google Maps if we have waypoints
    let googleRoute: GoogleRouteData | undefined;
    let optimizedPolyline: string | undefined;

    if (route.length >= 2) {
      try {
        const origin = route.find((r) => r.category === "Source");
        const destination = route.find((r) => r.category === "Destination");
        const waypoints = route.filter(
          (r) => r.category === "Visiting_Charging_Station"
        );

        if (origin && destination) {
          googleRoute = await getOptimalRoute(origin, destination, waypoints);
          if (googleRoute) {
            // Decode polyline for map display
            const decodedPoints = decodePolyline(googleRoute.polyline);
            optimizedPolyline = googleRoute.polyline;
          }
        }
      } catch (error) {
        console.error("Failed to get optimal route:", error);
        // Continue without optimal route
      }
    }

    return {
      route,
      batteryUsage: Math.round(batteryUsage),
      distance: apiData.distance_km,
      estimatedTime: Math.round(apiData.distance_km * 1.2),
      chargingStops,
      googleRoute,
      optimizedPolyline,
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form inputs
    if (!source.trim() || !destination.trim()) {
      setError("Please enter both source and destination");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/ev-route-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: source.trim(),
          destination: destination.trim(),
          battery: battery,
          efficiency: efficiency / 100,
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const apiResponse: RouteData = await response.json();

      if (!apiResponse.success) {
        throw new Error(apiResponse.message || "Route planning failed");
      }

      // Process the API response (this will also get the optimal route)
      const processedData = await processRouteData(apiResponse);
      setRouteData(processedData);
      console.log("Processed Route Data:", processedData);
    } catch (err) {
      console.error("Error planning route:", err);
      setRouteData(null);
      setError(
        err instanceof Error
          ? err.message
          : "An error occurred while planning the route"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Start journey with optimal route
  const startJourney = () => {
    if (!routeData || !routeData.googleRoute) {
      // Fallback to basic route
      if (!routeData) return;

      const origin = routeData.route.find((r) => r.category === "Source");
      if (!origin) return;

      let url = `https://www.google.com/maps/dir/${origin.lat},${origin.lng}`;

      routeData.chargingStops.forEach((stop) => {
        url += `/${stop.lat},${stop.lng}`;
      });

      const destination = routeData.route.find(
        (r) => r.category === "Destination"
      );
      if (destination) {
        url += `/${destination.lat},${destination.lng}`;
      }

      window.open(url, "_blank");
      return;
    }

    // Use optimized route
    const origin = routeData.route.find((r) => r.category === "Source");
    const destination = routeData.route.find(
      (r) => r.category === "Destination"
    );

    if (!origin) return;

    // Reorder waypoints based on optimization
    const orderedWaypoints =
      routeData.googleRoute.optimizedOrder.length > 0
        ? routeData.googleRoute.optimizedOrder.map(
            (i) => routeData.chargingStops[i]
          )
        : routeData.chargingStops;

    let url = `https://www.google.com/maps/dir/${origin.lat},${origin.lng}`;

    orderedWaypoints.forEach((wp) => {
      url += `/${wp.lat},${wp.lng}`;
    });

    if (destination) {
      url += `/${destination.lat},${destination.lng}`;
    }

    window.open(url, "_blank");
  };

  // Prepare map data from route data
  const mapMarkers = routeData
    ? [
        // Start marker
        {
          position: [routeData.route[0].lat, routeData.route[0].lng] as [
            number,
            number
          ],
          popup: `<strong>Start:</strong> ${routeData.route[0].name}`,
          color: "#10b981", // green
        },
        // End marker
        {
          position: [
            routeData.route[routeData.route.length - 1].lat,
            routeData.route[routeData.route.length - 1].lng,
          ] as [number, number],
          popup: `<strong>Destination:</strong> ${
            routeData.route[routeData.route.length - 1].name
          }`,
          color: "#3b82f6", // blue
        },
        // Visited charging stops (from route)
        ...routeData.chargingStops.map((stop, index) => ({
          position: [stop.lat, stop.lng] as [number, number],
          popup: `<strong>⚡ ${stop.name}</strong><br>Arrive with: ${stop.batteryOnArrival}%<br>Depart with: ${stop.batteryOnDeparture}%<br>Battery added: ${stop.batteryAdded}%<br><em>Active charging stop</em>`,
          icon: "lightning",
          color: "#f59e0b", // amber - visited charging stations
        })),
        // Unvisited charging stations
        ...DEFAULT_CHARGING_STATIONS.filter(
          (station) =>
            !routeData.chargingStops.some(
              (visitedStop) =>
                Math.abs(visitedStop.lat - station.lat) < 0.001 &&
                Math.abs(visitedStop.lng - station.lon) < 0.001
            )
        ).map((station) => ({
          position: [station.lat, station.lon] as [number, number],
          popup: `<strong>🔋 ${station.name}</strong><br><em>Available charging station</em>`,
          icon: "charging",
          color: "#64748b", // gray - unvisited charging stations
        })),
      ]
    : [
        // Show all charging stations when no route is planned
        ...DEFAULT_CHARGING_STATIONS.map((station) => ({
          position: [station.lat, station.lon] as [number, number],
          popup: `<strong>🔋 ${station.name}</strong><br><em>Available charging station</em>`,
          icon: "charging",
          color: "#64748b", // gray
        })),
      ];

  // Use optimized route if available, otherwise fall back to direct route
  const mapRoutes = routeData
    ? routeData.optimizedPolyline
      ? [
          {
            path: decodePolyline(routeData.optimizedPolyline),
            color: "#06b6d4", // cyan - optimized route
            weight: 4,
          },
        ]
      : [
          {
            path: routeData.route.map(
              (point) => [point.lat, point.lng] as [number, number]
            ),
            color: "#94a3b8", // slate - fallback route
            weight: 3,
          },
        ]
    : [];

  const mapCenter = routeData
    ? [
        (routeData.route[0].lat +
          routeData.route[routeData.route.length - 1].lat) /
          2,
        (routeData.route[0].lng +
          routeData.route[routeData.route.length - 1].lng) /
          2,
      ]
    : [6.9271, 79.8612]; // Default to Colombo

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            EV Route Planning
          </h1>
          <p className="text-slate-400">
            Plan optimal routes for electric vehicles with charging stops and
            Google Maps integration
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Planning Form */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-100">Plan Your Route</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your journey details to calculate the optimal route with
              Google Maps integration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="source"
                    className="text-slate-300 flex items-center"
                  >
                    <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                    Starting Point
                  </Label>
                  <Input
                    id="source"
                    placeholder="e.g. 6.9271,79.8612 or Colombo"
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="destination"
                    className="text-slate-300 flex items-center"
                  >
                    <CornerDownRight className="h-4 w-4 mr-2 text-cyan-500" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g. 7.4863,80.3623 or Kandy"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-slate-800/50 border-slate-700 text-slate-300"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="battery"
                    className="text-slate-300 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Battery className="h-4 w-4 mr-2 text-cyan-500" />
                      Current Battery Level
                    </div>
                    <span className="text-cyan-400">{battery}%</span>
                  </Label>
                  <Slider
                    id="battery"
                    min={0}
                    max={100}
                    step={1}
                    value={[battery]}
                    onValueChange={(value) => setBattery(value[0])}
                    className="py-4"
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="efficiency"
                    className="text-slate-300 flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <Zap className="h-4 w-4 mr-2 text-cyan-500" />
                      Vehicle Efficiency
                    </div>
                    <span className="text-cyan-400">{efficiency}%</span>
                  </Label>
                  <Slider
                    id="efficiency"
                    min={50}
                    max={100}
                    step={1}
                    value={[efficiency]}
                    onValueChange={(value) => setEfficiency(value[0])}
                    className="py-4"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                disabled={isLoading || isOptimizing}
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Planning Route...
                  </>
                ) : isOptimizing ? (
                  <>
                    <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                    Optimizing with Google Maps...
                  </>
                ) : (
                  <>
                    <Route className="mr-2 h-4 w-4" />
                    Plan Optimal Route
                  </>
                )}
              </Button>

              {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
            </form>
          </CardContent>
        </Card>

        {/* Map and Route Details */}
        <div className="lg:col-span-2 space-y-6">
          <CartoMap
            center={mapCenter as [number, number]}
            zoom={10}
            markers={mapMarkers}
            routes={mapRoutes}
            height="510px"
          />

          {routeData && routeData.googleRoute && (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center">
                  <Navigation className="h-5 w-5 mr-2 text-cyan-400" />
                  Google Maps Optimized Route
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Real-time optimized route with accurate directions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-cyan-900/30 text-cyan-400 border-cyan-500/50">
                      Distance: {routeData.googleRoute.distance}
                    </Badge>
                    <Badge className="bg-cyan-900/30 text-cyan-400 border-cyan-500/50">
                      Duration: {routeData.googleRoute.duration}
                    </Badge>
                  </div>
                  <Button
                    onClick={startJourney}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Navigation className="h-4 w-4 mr-2" />
                    Start Navigation
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {routeData && (
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-slate-200">
                  Route Waypoints
                </h3>
                {routeData.googleRoute && (
                  <Badge className="bg-green-900/30 text-green-400 border-green-500/50">
                    Google Maps Optimized
                  </Badge>
                )}
              </div>
              <div className="space-y-2">
                {routeData.route.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center p-2 rounded-md bg-slate-800/30 border border-slate-700/30"
                  >
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        point.category === "Source"
                          ? "bg-green-900/30 text-green-400 border border-green-500/50"
                          : point.category === "Destination"
                          ? "bg-blue-900/30 text-blue-400 border border-blue-500/50"
                          : point.category === "Visiting_Charging_Station"
                          ? "bg-amber-900/30 text-amber-400 border border-amber-500/50"
                          : "bg-slate-800 text-slate-400 border border-slate-600/50"
                      }`}
                    >
                      {point.category === "Source" ? (
                        <MapPin className="h-4 w-4" />
                      ) : point.category === "Destination" ? (
                        <CornerDownRight className="h-4 w-4" />
                      ) : point.category === "Visiting_Charging_Station" ? (
                        <Zap className="h-4 w-4" />
                      ) : (
                        <span className="text-xs">{index}</span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-300">
                        {point.name}
                      </div>
                      <div className="text-xs text-slate-500">
                        {point.lat.toFixed(6)}, {point.lng.toFixed(6)}
                      </div>
                    </div>
                    {point.category === "Visiting_Charging_Station" && (
                      <Badge className="bg-amber-900/30 text-amber-400 border-amber-500/50">
                        Charging Stop
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {routeData.chargingStops.length > 0 && (
              <>
                <Separator className="my-4 bg-slate-700/50" />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-200">
                    Charging Stops Details
                  </h3>
                  <div className="space-y-3">
                    {routeData.chargingStops.map((stop, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-md bg-amber-900/10 border border-amber-500/30"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <Zap className="h-5 w-5 text-amber-400 mr-2" />
                            <div className="text-lg font-medium text-amber-400">
                              {stop.name}
                            </div>
                          </div>
                          <Badge className="bg-amber-900/30 text-amber-400 border-amber-500/50">
                            +{stop.batteryAdded}% Battery gain
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <div className="text-slate-400 mb-1">
                              Arrive with:
                            </div>
                            <div className="text-slate-300 font-medium">
                              {stop.batteryOnArrival}%
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-1">
                              Depart with:
                            </div>
                            <div className="text-slate-300 font-medium">
                              {stop.batteryOnDeparture}%
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-1">
                              Est. Charging Time:
                            </div>
                            <div className="text-slate-300 font-medium">
                              {stop.chargingTime} min
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-1">Location:</div>
                            <div className="text-slate-300 text-xs">
                              {stop.lat.toFixed(4)}, {stop.lng.toFixed(4)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {routeData.googleRoute?.stepByStepDirections &&
              routeData.googleRoute.stepByStepDirections.length > 0 && (
                <>
                  <Separator className="my-4 bg-slate-700/50" />
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-slate-200 flex items-center">
                      <Navigation className="h-5 w-5 mr-2 text-cyan-400" />
                      Turn-by-Turn Directions
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                      {routeData.googleRoute.stepByStepDirections.map(
                        (direction, index) => (
                          <div
                            key={index}
                            className="flex items-start p-3 rounded-md bg-slate-800/30 border border-slate-700/30"
                          >
                            <div className="h-6 w-6 rounded-full bg-cyan-900/30 text-cyan-400 border border-cyan-500/50 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                              <span className="text-xs font-medium">
                                {index + 1}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm text-slate-300 mb-1">
                                {direction.instruction}
                              </div>
                              <div className="flex items-center text-xs text-slate-500 space-x-3">
                                <span>{direction.distance} m</span>
                                <span>•</span>
                                <span>{direction.duration}</span>
                                <span>•</span>
                                <span className="capitalize">
                                  {direction.maneuver}
                                </span>
                              </div>
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </>
              )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
