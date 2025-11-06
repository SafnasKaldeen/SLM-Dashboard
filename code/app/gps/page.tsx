"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Route, Layers, Navigation } from "lucide-react";
import Link from "next/link";
import CartoMap from "@/components/maps/carto-map";

export default function GPSServicesPage() {
  // Sample data for the map
  const mapMarkers = [
    {
      position: [6.696449, 79.985743] as [number, number],
      popup: "<strong>Current Location</strong>",
      color: "#3b82f6", // blue
    },
    {
      position: [6.698123, 79.986789] as [number, number],
      popup: "<strong>Central Hub</strong><br>Available: 8/15",
      color: "#10b981", // green
      icon: "charging",
    },
    {
      position: [6.699234, 79.987123] as [number, number],
      popup: "<strong>Main Street</strong><br>Available: 5/8",
      color: "#f59e0b", // amber
      icon: "charging",
    },
    {
      position: [6.697456, 79.985678] as [number, number],
      popup: "<strong>City Center</strong><br>Available: 3/10",
      color: "#ef4444", // red
      icon: "charging",
    },
  ];

  const mapRoutes = [
    {
      path: [
        [6.696449, 79.985743],
        [6.697123, 79.986567],
        [6.698234, 79.987123],
        [6.699345, 79.988456],
        [6.700123, 79.989567],
        [6.701234, 79.990123],
      ] as [number, number][],
      color: "#3b82f6", // blue
      dashArray: "5, 10",
    },
  ];

  const mapClusters = [
    {
      center: [6.698123, 79.986789] as [number, number],
      radius: 500, // Radius in meters
      color: "#06b6d4", // cyan
      fillColor: "#06b6d4",
      fillOpacity: 0.1,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">GPS Services</h1>
          <p className="text-slate-400">
            Location-based services for EV fleet management
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm col-span-full">
          <CardContent className="p-0">
            <CartoMap
              center={[6.696449, 79.985743]}
              zoom={14}
              markers={mapMarkers}
              routes={mapRoutes}
              clusters={mapClusters}
              height="400px"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Route className="mr-2 h-5 w-5 text-cyan-500" />
              EV Route Planning
            </CardTitle>
            <CardDescription className="text-slate-400">
              Plan optimal routes for electric vehicles with charging stops
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Calculate the most efficient route between two points, taking into
              account battery level, vehicle efficiency, and available charging
              stations.
            </p>
            <Link href="/gps/route-planning" passHref>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Route className="mr-2 h-4 w-4" />
                Plan Route
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Layers className="mr-2 h-5 w-5 text-cyan-500" />
              Station Allocation
            </CardTitle>
            <CardDescription className="text-slate-400">
              Optimize charging station placement using clustering algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Use density-based or geospatial clustering to determine optimal
              locations for new charging stations based on usage patterns and
              demand.
            </p>
            <Link href="/gps/station-allocation" passHref>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Layers className="mr-2 h-4 w-4" />
                Allocate Stations
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm hover:bg-slate-800/50 transition-colors">
          <CardHeader>
            <CardTitle className="text-slate-100 flex items-center">
              <Navigation className="mr-2 h-5 w-5 text-cyan-500" />
              Closest Stations
            </CardTitle>
            <CardDescription className="text-slate-400">
              Find nearby charging stations based on location or route
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-slate-300 mb-4">
              Locate the nearest available charging stations based on your
              current location or along your planned route to a destination.
            </p>
            <Link href="/gps/closest-stations" passHref>
              <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">
                <Navigation className="mr-2 h-4 w-4" />
                Find Stations
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100">API Documentation</CardTitle>
          <CardDescription className="text-slate-400">
            Available GPS service endpoints for developers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-md font-medium text-cyan-400 mb-2">
                POST /ev-route-plan
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                Plan an EV route based on source, destination, battery, and
                efficiency.
              </p>
              <div className="bg-slate-900/50 p-3 rounded-md text-xs font-mono text-slate-300 overflow-x-auto">
                {`{
  "source": "6.696449,79.985743",
  "destination": "6.701234,79.990123",
  "battery": 80,
  "efficiency": 70
}`}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-md font-medium text-cyan-400 mb-2">
                POST /DensityBased-station-allocation
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                Cluster stations using density-based clustering (e.g., DBSCAN).
              </p>
              <div className="bg-slate-900/50 p-3 rounded-md text-xs font-mono text-slate-300 overflow-x-auto">
                {`{
  "eps": 0.5,
  "min_samples": 5,
  "top_n": 10,
  "zoom_level": 14,
  "stage_name": "production"
}`}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-md font-medium text-cyan-400 mb-2">
                POST /GeoBased-station-allocation
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                Allocate stations using geospatial filtering and radius-based
                logic.
              </p>
              <div className="bg-slate-900/50 p-3 rounded-md text-xs font-mono text-slate-300 overflow-x-auto">
                {`{
  "max_radius_km": 2.0,
  "outlier_threshold_km": 5.0,
  "top_n": 10,
  "zoom_level": 14,
  "stage_name": "production"
}`}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-md font-medium text-cyan-400 mb-2">
                POST /closest-station
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                Return the closest station based on current coordinates or
                context.
              </p>
              <div className="bg-slate-900/50 p-3 rounded-md text-xs font-mono text-slate-300 overflow-x-auto">
                {`{
  "stage_name": "production"
}`}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
              <h3 className="text-md font-medium text-cyan-400 mb-2">
                POST /closest-station-with-direction
              </h3>
              <p className="text-sm text-slate-300 mb-2">
                Return closest station along with directional context (e.g.,
                towards destination).
              </p>
              <div className="bg-slate-900/50 p-3 rounded-md text-xs font-mono text-slate-300 overflow-x-auto">
                {`{
  "stage_name": "production"
}`}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
