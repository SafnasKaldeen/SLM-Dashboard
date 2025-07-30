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
import {
  MapPin,
  Layers,
  Radar,
  Ruler,
  Maximize,
  Activity,
  Database,
} from "lucide-react";
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
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <Activity className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm font-medium">
              Intelligent Allocation
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Station Allocation System
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Optimize charging station placement using advanced clustering
            algorithms and batch data analysis
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* Configuration Panel */}
          <div className="xl:col-span-4">
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl h-[100%]">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-cyan-500/10 rounded-lg">
                    <Database className="h-5 w-5 text-cyan-400" />
                  </div>
                  <div>
                    <CardTitle className="text-slate-100 text-lg">
                      Algorithm Configuration
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      Fine-tune clustering parameters for optimal results
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
                    <TabsTrigger
                      value="density"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
                    >
                      <Layers className="h-4 w-4 mr-2" />
                      Density-Based
                    </TabsTrigger>
                    <TabsTrigger
                      value="geo"
                      className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Geo-Based
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="density" className="space-y-6">
                    <form onSubmit={handleDensitySubmit} className="space-y-6">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="eps"
                            className="text-slate-300 flex items-center justify-between text-sm font-medium"
                          >
                            <div className="flex items-center">
                              <Ruler className="h-4 w-4 mr-2 text-cyan-400" />
                              Epsilon Distance
                            </div>
                            <span className="text-cyan-400 font-mono">
                              {eps} km
                            </span>
                          </Label>
                          <Slider
                            id="eps"
                            min={0.1}
                            max={2}
                            step={0.1}
                            value={[eps]}
                            onValueChange={(value) => setEps(value[0])}
                            className="py-2"
                          />
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Maximum distance between points in a cluster
                          </p>
                        </div>

                        <Separator className="bg-slate-700/30" />

                        <div className="space-y-3">
                          <Label
                            htmlFor="minSamples"
                            className="text-slate-300 flex items-center justify-between text-sm font-medium"
                          >
                            <div className="flex items-center">
                              <Layers className="h-4 w-4 mr-2 text-cyan-400" />
                              Minimum Samples
                            </div>
                            <span className="text-cyan-400 font-mono">
                              {minSamples}
                            </span>
                          </Label>
                          <Slider
                            id="minSamples"
                            min={1}
                            max={10}
                            step={1}
                            value={[minSamples]}
                            onValueChange={(value) => setMinSamples(value[0])}
                            className="py-2"
                          />
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Minimum number of points to form a cluster
                          </p>
                        </div>

                        <Separator className="bg-slate-700/30" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label
                              htmlFor="topN"
                              className="text-slate-300 flex items-center text-sm font-medium"
                            >
                              <Maximize className="h-4 w-4 mr-2 text-cyan-400" />
                              Results Limit
                            </Label>
                            <Select
                              value={topN.toString()}
                              onValueChange={(value) =>
                                setTopN(Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
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

                          <div className="space-y-3">
                            <Label
                              htmlFor="zoomLevel"
                              className="text-slate-300 flex items-center text-sm font-medium"
                            >
                              <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
                              Zoom Level
                            </Label>
                            <Select
                              value={zoomLevel.toString()}
                              onValueChange={(value) =>
                                setZoomLevel(Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
                                <SelectValue placeholder="Select zoom" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">City</SelectItem>
                                <SelectItem value="12">District</SelectItem>
                                <SelectItem value="14">Neighborhood</SelectItem>
                                <SelectItem value="16">Streets</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-3"></div>
                            Processing Clusters...
                          </>
                        ) : (
                          <>
                            <Layers className="mr-3 h-4 w-4" />
                            Run Density Clustering
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>

                  <TabsContent value="geo" className="space-y-6">
                    <form onSubmit={handleGeoSubmit} className="space-y-6">
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <Label
                            htmlFor="maxRadius"
                            className="text-slate-300 flex items-center justify-between text-sm font-medium"
                          >
                            <div className="flex items-center">
                              <Ruler className="h-4 w-4 mr-2 text-cyan-400" />
                              Maximum Radius
                            </div>
                            <span className="text-cyan-400 font-mono">
                              {maxRadius} km
                            </span>
                          </Label>
                          <Slider
                            id="maxRadius"
                            min={0.5}
                            max={5}
                            step={0.1}
                            value={[maxRadius]}
                            onValueChange={(value) => setMaxRadius(value[0])}
                            className="py-2"
                          />
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Maximum radius for station coverage area
                          </p>
                        </div>

                        <Separator className="bg-slate-700/30" />

                        <div className="space-y-3">
                          <Label
                            htmlFor="outlierThreshold"
                            className="text-slate-300 flex items-center justify-between text-sm font-medium"
                          >
                            <div className="flex items-center">
                              <Layers className="h-4 w-4 mr-2 text-cyan-400" />
                              Outlier Threshold
                            </div>
                            <span className="text-cyan-400 font-mono">
                              {outlierThreshold} km
                            </span>
                          </Label>
                          <Slider
                            id="outlierThreshold"
                            min={1}
                            max={10}
                            step={0.5}
                            value={[outlierThreshold]}
                            onValueChange={(value) =>
                              setOutlierThreshold(value[0])
                            }
                            className="py-2"
                          />
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Distance threshold for outlier detection
                          </p>
                        </div>

                        <Separator className="bg-slate-700/30" />

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-3">
                            <Label
                              htmlFor="topN"
                              className="text-slate-300 flex items-center text-sm font-medium"
                            >
                              <Maximize className="h-4 w-4 mr-2 text-cyan-400" />
                              Results Limit
                            </Label>
                            <Select
                              value={topN.toString()}
                              onValueChange={(value) =>
                                setTopN(Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
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

                          <div className="space-y-3">
                            <Label
                              htmlFor="zoomLevel"
                              className="text-slate-300 flex items-center text-sm font-medium"
                            >
                              <MapPin className="h-4 w-4 mr-2 text-cyan-400" />
                              Zoom Level
                            </Label>
                            <Select
                              value={zoomLevel.toString()}
                              onValueChange={(value) =>
                                setZoomLevel(Number.parseInt(value))
                              }
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
                                <SelectValue placeholder="Select zoom" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="10">City</SelectItem>
                                <SelectItem value="12">District</SelectItem>
                                <SelectItem value="14">Neighborhood</SelectItem>
                                <SelectItem value="16">Streets</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-700 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-3"></div>
                            Processing Clusters...
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-3 h-4 w-4" />
                            Run Geo Clustering
                          </>
                        )}
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mt-6">
                    <p className="text-red-400 text-sm">{error}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Map and Results */}
          <div className="xl:col-span-8 space-y-8">
            {/* Map Section */}
            <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative">
                  <CartoMap
                    center={mapCenter as [number, number]}
                    zoom={13}
                    markers={mapMarkers}
                    clusters={mapClusters}
                    height="620px"
                  />
                  {!stationData && (
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center">
                      <div className="text-center space-y-4">
                        <div className="p-4 bg-slate-800/50 rounded-full mx-auto w-fit">
                          <MapPin className="h-8 w-8 text-slate-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-slate-300 mb-2">
                            No Clustering Results Yet
                          </h3>
                          <p className="text-slate-500 text-sm max-w-md">
                            Configure your parameters and run a clustering
                            algorithm to visualize station allocations on the
                            map
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
