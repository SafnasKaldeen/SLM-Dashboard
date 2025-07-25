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
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { MapPin, Layers, Radar, Ruler, Maximize } from "lucide-react";
import CartoMap from "@/components/maps/carto-map";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StationAllocationData {
  clusters: Array<{
    id: number;
    centroid: { lat: number; lng: number };
    stations: Array<{
      id: string;
      name: string;
      lat: number;
      lng: number;
      capacity: number;
      available: number;
    }>;
  }>;
  totalStations: number;
  totalCapacity: number;
  totalAvailable: number;
}

export default function StationAllocationPage() {
  const [activeTab, setActiveTab] = useState("density");
  const [eps, setEps] = useState(0.5);
  const [minSamples, setMinSamples] = useState(5);
  const [maxRadius, setMaxRadius] = useState(2.0);
  const [outlierThreshold, setOutlierThreshold] = useState(5.0);
  const [topN, setTopN] = useState(10);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [stageName, setStageName] = useState("production");
  const [isLoading, setIsLoading] = useState(false);
  const [stationData, setStationData] = useState<StationAllocationData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  const handleDensitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an actual API call
      // const response = await fetch('/api/DensityBased-station-allocation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ eps, minSamples, topN, zoomLevel, stageName }),
      // });
      // const data = await response.json();

      // For demo purposes, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Sample response data
      const data = {
        status: "success",
        data: {
          clusters: [
            {
              id: 1,
              centroid: { lat: 6.698123, lng: 79.986789 },
              stations: [
                {
                  id: "ST001",
                  name: "Central Hub",
                  lat: 6.698123,
                  lng: 79.986789,
                  capacity: 15,
                  available: 8,
                },
                {
                  id: "ST002",
                  name: "City Center",
                  lat: 6.697456,
                  lng: 79.985678,
                  capacity: 10,
                  available: 3,
                },
                {
                  id: "ST003",
                  name: "Main Street",
                  lat: 6.699234,
                  lng: 79.987123,
                  capacity: 8,
                  available: 5,
                },
              ],
            },
            {
              id: 2,
              centroid: { lat: 6.702345, lng: 79.992345 },
              stations: [
                {
                  id: "ST004",
                  name: "North Plaza",
                  lat: 6.702345,
                  lng: 79.992345,
                  capacity: 12,
                  available: 6,
                },
                {
                  id: "ST005",
                  name: "Tech Park",
                  lat: 6.703456,
                  lng: 79.993456,
                  capacity: 20,
                  available: 12,
                },
              ],
            },
            {
              id: 3,
              centroid: { lat: 6.694567, lng: 79.982345 },
              stations: [
                {
                  id: "ST006",
                  name: "South Market",
                  lat: 6.694567,
                  lng: 79.982345,
                  capacity: 10,
                  available: 2,
                },
                {
                  id: "ST007",
                  name: "Beach Road",
                  lat: 6.693456,
                  lng: 79.981234,
                  capacity: 8,
                  available: 4,
                },
              ],
            },
          ],
          totalStations: 7,
          totalCapacity: 83,
          totalAvailable: 40,
        },
      };

      if (data.status === "success") {
        setStationData(data.data);
      } else {
        setError(data.detail || "Failed to allocate stations");
      }
    } catch (err) {
      setError("An error occurred while allocating stations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGeoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // In a real app, this would be an actual API call
      // const response = await fetch('/api/GeoBased-station-allocation', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ maxRadius, outlierThreshold, topN, zoomLevel, stageName }),
      // });
      // const data = await response.json();

      // For demo purposes, we'll simulate a response with the same data structure
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Using the same sample data for demo purposes
      const data = {
        status: "success",
        data: {
          clusters: [
            {
              id: 1,
              centroid: { lat: 6.698123, lng: 79.986789 },
              stations: [
                {
                  id: "ST001",
                  name: "Central Hub",
                  lat: 6.698123,
                  lng: 79.986789,
                  capacity: 15,
                  available: 8,
                },
                {
                  id: "ST002",
                  name: "City Center",
                  lat: 6.697456,
                  lng: 79.985678,
                  capacity: 10,
                  available: 3,
                },
                {
                  id: "ST003",
                  name: "Main Street",
                  lat: 6.699234,
                  lng: 79.987123,
                  capacity: 8,
                  available: 5,
                },
              ],
            },
            {
              id: 2,
              centroid: { lat: 6.702345, lng: 79.992345 },
              stations: [
                {
                  id: "ST004",
                  name: "North Plaza",
                  lat: 6.702345,
                  lng: 79.992345,
                  capacity: 12,
                  available: 6,
                },
                {
                  id: "ST005",
                  name: "Tech Park",
                  lat: 6.703456,
                  lng: 79.993456,
                  capacity: 20,
                  available: 12,
                },
              ],
            },
            {
              id: 3,
              centroid: { lat: 6.694567, lng: 79.982345 },
              stations: [
                {
                  id: "ST006",
                  name: "South Market",
                  lat: 6.694567,
                  lng: 79.982345,
                  capacity: 10,
                  available: 2,
                },
                {
                  id: "ST007",
                  name: "Beach Road",
                  lat: 6.693456,
                  lng: 79.981234,
                  capacity: 8,
                  available: 4,
                },
              ],
            },
          ],
          totalStations: 7,
          totalCapacity: 83,
          totalAvailable: 40,
        },
      };

      if (data.status === "success") {
        setStationData(data.data);
      } else {
        setError(data.detail || "Failed to allocate stations");
      }
    } catch (err) {
      setError("An error occurred while allocating stations");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare map data from station data
  const mapMarkers = stationData
    ? stationData.clusters.flatMap((cluster) =>
        cluster.stations.map((station) => ({
          position: [station.lat, station.lng] as [number, number],
          popup: `<strong>${station.name}</strong><br>Capacity: ${station.capacity}<br>Available: ${station.available}`,
          color: getAvailabilityColor(station.available, station.capacity),
        }))
      )
    : [];

  const mapClusters = stationData
    ? stationData.clusters.map((cluster) => ({
        center: [cluster.centroid.lat, cluster.centroid.lng] as [
          number,
          number
        ],
        radius: 500, // Radius in meters
        color: "#06b6d4", // cyan
        fillColor: "#06b6d4",
        fillOpacity: 0.1,
      }))
    : [];

  const mapCenter = stationData
    ? [
        stationData.clusters.reduce(
          (sum, cluster) => sum + cluster.centroid.lat,
          0
        ) / stationData.clusters.length,
        stationData.clusters.reduce(
          (sum, cluster) => sum + cluster.centroid.lng,
          0
        ) / stationData.clusters.length,
      ]
    : [6.696449, 79.985743];

  function getAvailabilityColor(available: number, capacity: number): string {
    const percentage = (available / capacity) * 100;
    if (percentage > 50) return "#10b981"; // green
    if (percentage > 20) return "#f59e0b"; // amber
    return "#ef4444"; // red
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            Station Allocation
          </h1>
          <p className="text-slate-400">
            Optimize charging station placement using clustering algorithms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Station Allocation Form */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-slate-100">
              Allocation Parameters
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure parameters for station allocation algorithms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-4 bg-slate-800/50 p-1">
                <TabsTrigger
                  value="density"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Density-Based
                </TabsTrigger>
                <TabsTrigger
                  value="geo"
                  className="data-[state=active]:bg-slate-700 data-[state=active]:text-cyan-400"
                >
                  Geo-Based
                </TabsTrigger>
              </TabsList>

              <TabsContent value="density" className="space-y-6">
                <form onSubmit={handleDensitySubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="eps"
                        className="text-slate-300 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Ruler className="h-4 w-4 mr-2 text-cyan-500" />
                          Epsilon (km)
                        </div>
                        <span className="text-cyan-400">{eps}</span>
                      </Label>
                      <Slider
                        id="eps"
                        min={0.1}
                        max={2}
                        step={0.1}
                        value={[eps]}
                        onValueChange={(value) => setEps(value[0])}
                        className="py-4"
                      />
                      <p className="text-xs text-slate-500">
                        Maximum distance between points in a cluster
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="minSamples"
                        className="text-slate-300 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2 text-cyan-500" />
                          Min Samples
                        </div>
                        <span className="text-cyan-400">{minSamples}</span>
                      </Label>
                      <Slider
                        id="minSamples"
                        min={1}
                        max={10}
                        step={1}
                        value={[minSamples]}
                        onValueChange={(value) => setMinSamples(value[0])}
                        className="py-4"
                      />
                      <p className="text-xs text-slate-500">
                        Minimum number of points to form a cluster
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="topN"
                        className="text-slate-300 flex items-center"
                      >
                        <Maximize className="h-4 w-4 mr-2 text-cyan-500" />
                        Top N Results
                      </Label>
                      <Select
                        value={topN.toString()}
                        onValueChange={(value) =>
                          setTopN(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                          <SelectValue placeholder="Select limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="zoomLevel"
                        className="text-slate-300 flex items-center"
                      >
                        <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                        Zoom Level
                      </Label>
                      <Select
                        value={zoomLevel.toString()}
                        onValueChange={(value) =>
                          setZoomLevel(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                          <SelectValue placeholder="Select zoom level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 - City</SelectItem>
                          <SelectItem value="12">12 - District</SelectItem>
                          <SelectItem value="14">14 - Neighborhood</SelectItem>
                          <SelectItem value="16">16 - Streets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="stageName"
                        className="text-slate-300 flex items-center"
                      >
                        <Radar className="h-4 w-4 mr-2 text-cyan-500" />
                        Environment
                      </Label>
                      <Select value={stageName} onValueChange={setStageName}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">
                            Development
                          </SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <Layers className="mr-2 h-4 w-4" />
                        Run Density Clustering
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="geo" className="space-y-6">
                <form onSubmit={handleGeoSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="maxRadius"
                        className="text-slate-300 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Ruler className="h-4 w-4 mr-2 text-cyan-500" />
                          Max Radius (km)
                        </div>
                        <span className="text-cyan-400">{maxRadius}</span>
                      </Label>
                      <Slider
                        id="maxRadius"
                        min={0.5}
                        max={5}
                        step={0.1}
                        value={[maxRadius]}
                        onValueChange={(value) => setMaxRadius(value[0])}
                        className="py-4"
                      />
                      <p className="text-xs text-slate-500">
                        Maximum radius for station coverage
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="outlierThreshold"
                        className="text-slate-300 flex items-center justify-between"
                      >
                        <div className="flex items-center">
                          <Layers className="h-4 w-4 mr-2 text-cyan-500" />
                          Outlier Threshold (km)
                        </div>
                        <span className="text-cyan-400">
                          {outlierThreshold}
                        </span>
                      </Label>
                      <Slider
                        id="outlierThreshold"
                        min={1}
                        max={10}
                        step={0.5}
                        value={[outlierThreshold]}
                        onValueChange={(value) => setOutlierThreshold(value[0])}
                        className="py-4"
                      />
                      <p className="text-xs text-slate-500">
                        Distance threshold for outlier detection
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="topN"
                        className="text-slate-300 flex items-center"
                      >
                        <Maximize className="h-4 w-4 mr-2 text-cyan-500" />
                        Top N Results
                      </Label>
                      <Select
                        value={topN.toString()}
                        onValueChange={(value) =>
                          setTopN(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                          <SelectValue placeholder="Select limit" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5</SelectItem>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="20">20</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="zoomLevel"
                        className="text-slate-300 flex items-center"
                      >
                        <MapPin className="h-4 w-4 mr-2 text-cyan-500" />
                        Zoom Level
                      </Label>
                      <Select
                        value={zoomLevel.toString()}
                        onValueChange={(value) =>
                          setZoomLevel(Number.parseInt(value))
                        }
                      >
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                          <SelectValue placeholder="Select zoom level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10 - City</SelectItem>
                          <SelectItem value="12">12 - District</SelectItem>
                          <SelectItem value="14">14 - Neighborhood</SelectItem>
                          <SelectItem value="16">16 - Streets</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="stageName"
                        className="text-slate-300 flex items-center"
                      >
                        <Radar className="h-4 w-4 mr-2 text-cyan-500" />
                        Environment
                      </Label>
                      <Select value={stageName} onValueChange={setStageName}>
                        <SelectTrigger className="bg-slate-800/50 border-slate-700 text-slate-300">
                          <SelectValue placeholder="Select environment" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="development">
                            Development
                          </SelectItem>
                          <SelectItem value="staging">Staging</SelectItem>
                          <SelectItem value="production">Production</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <MapPin className="mr-2 h-4 w-4" />
                        Run Geo Clustering
                      </>
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            {error && <p className="text-red-400 text-sm mt-4">{error}</p>}
          </CardContent>
        </Card>

        {/* Map and Station Details */}
        <div className="lg:col-span-2 space-y-6">
          <CartoMap
            center={mapCenter as [number, number]}
            zoom={13}
            markers={mapMarkers}
            clusters={mapClusters}
            height="400px"
          />

          {stationData && (
            <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-slate-100">
                  Station Allocation Results
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {activeTab === "density" ? "Density-based" : "Geo-based"}{" "}
                  clustering results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">
                      Total Stations
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {stationData.totalStations}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">
                      Total Capacity
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {stationData.totalCapacity}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700/50">
                    <div className="text-slate-400 text-sm mb-1">
                      Available Slots
                    </div>
                    <div className="text-xl font-bold text-cyan-400">
                      {stationData.totalAvailable}
                    </div>
                  </div>
                </div>

                <Separator className="my-4 bg-slate-700/50" />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-slate-200">
                    Clusters
                  </h3>
                  <div className="space-y-6">
                    {stationData.clusters.map((cluster) => (
                      <div key={cluster.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-md font-medium text-cyan-400">
                            Cluster {cluster.id}
                          </h4>
                          <Badge className="bg-slate-800/50 text-slate-300 border-slate-600/50">
                            {cluster.stations.length} stations
                          </Badge>
                        </div>
                        <div className="bg-slate-800/30 rounded-md p-2 text-xs text-slate-400">
                          Centroid: {cluster.centroid.lat.toFixed(6)},{" "}
                          {cluster.centroid.lng.toFixed(6)}
                        </div>
                        <div className="grid grid-cols-1 gap-2">
                          {cluster.stations.map((station) => (
                            <div
                              key={station.id}
                              className="flex items-center p-2 rounded-md bg-slate-800/30 border border-slate-700/30"
                            >
                              <div
                                className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 bg-${getAvailabilityColor(
                                  station.available,
                                  station.capacity
                                ).replace(
                                  "#",
                                  ""
                                )}/30 text-${getAvailabilityColor(
                                  station.available,
                                  station.capacity
                                ).replace(
                                  "#",
                                  ""
                                )} border border-${getAvailabilityColor(
                                  station.available,
                                  station.capacity
                                ).replace("#", "")}/50`}
                                style={{
                                  backgroundColor: `${getAvailabilityColor(
                                    station.available,
                                    station.capacity
                                  )}30`,
                                  color: getAvailabilityColor(
                                    station.available,
                                    station.capacity
                                  ),
                                  borderColor: `${getAvailabilityColor(
                                    station.available,
                                    station.capacity
                                  )}50`,
                                }}
                              >
                                <MapPin className="h-4 w-4" />
                              </div>
                              <div className="flex-1">
                                <div className="text-sm font-medium text-slate-300">
                                  {station.name}{" "}
                                  <span className="text-xs text-slate-500">
                                    ({station.id})
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500">
                                  {station.lat.toFixed(6)},{" "}
                                  {station.lng.toFixed(6)}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium text-slate-300">
                                  {station.available}/{station.capacity}
                                </div>
                                <div className="text-xs text-slate-500">
                                  Available
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
