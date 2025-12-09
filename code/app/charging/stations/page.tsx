"use client";

import React, { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MapPin,
  Battery,
  Users,
  Clock,
  Zap,
  AlertTriangle,
} from "lucide-react";

import CartoMap from "@/components/maps/carto-map"; // Import the CartoMap component

// Mock data generator for BSS stations
const generateStationData = () => {
  const stations = [
    {
      id: "BSS_001",
      name: "Downtown Hub",
      lat: 40.7589,
      lng: -73.9851,
      zone: "Manhattan",
    },
    {
      id: "BSS_002",
      name: "Tech District",
      lat: 40.7614,
      lng: -73.9776,
      zone: "Manhattan",
    },
    {
      id: "BSS_003",
      name: "Brooklyn Center",
      lat: 40.6892,
      lng: -73.9442,
      zone: "Brooklyn",
    },
    {
      id: "BSS_004",
      name: "Queens Plaza",
      lat: 40.7505,
      lng: -73.937,
      zone: "Queens",
    },
    {
      id: "BSS_005",
      name: "Bronx Terminal",
      lat: 40.8176,
      lng: -73.9482,
      zone: "Bronx",
    },
    {
      id: "BSS_006",
      name: "Financial District",
      lat: 40.7074,
      lng: -74.0113,
      zone: "Manhattan",
    },
    {
      id: "BSS_007",
      name: "Williamsburg",
      lat: 40.7081,
      lng: -73.9571,
      zone: "Brooklyn",
    },
    {
      id: "BSS_008",
      name: "Astoria Hub",
      lat: 40.7794,
      lng: -73.9198,
      zone: "Queens",
    },
  ];

  return stations.map((station) => ({
    ...station,
    status:
      Math.random() > 0.8
        ? "maintenance"
        : Math.random() > 0.1
        ? "operational"
        : "offline",
    batteryLevel: Math.floor(Math.random() * 100),
    dailySwaps: Math.floor(Math.random() * 80) + 20,
    queueLength: Math.floor(Math.random() * 8),
    lastMaintenance: new Date(
      Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000
    ),
    utilization: Math.floor(Math.random() * 40) + 60,
  }));
};

const StationMap = () => {
  const stationData = useMemo(() => generateStationData(), []);
  const [selectedZone, setSelectedZone] = useState("All");
  const [selectedStation, setSelectedStation] = useState(null);

  const zones = ["All", ...new Set(stationData.map((s) => s.zone))];
  const filteredStations =
    selectedZone === "All"
      ? stationData
      : stationData.filter((s) => s.zone === selectedZone);

  const getStatusColor = (status) => {
    switch (status) {
      case "operational":
        return "#10b981"; // green-500
      case "maintenance":
        return "#f59e0b"; // amber-500
      case "offline":
        return "#ef4444"; // red-500
      default:
        return "#6b7280"; // gray-500
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "operational":
        return <Zap className="w-4 h-4" />;
      case "maintenance":
        return <AlertTriangle className="w-4 h-4" />;
      case "offline":
        return <Battery className="w-4 h-4" />;
      default:
        return <MapPin className="w-4 h-4" />;
    }
  };

  // Convert station data to map markers
  const mapMarkers = useMemo(() => {
    return filteredStations.map((station) => ({
      position: [station.lat, station.lng],
      color: getStatusColor(station.status),
      icon:
        station.status === "operational"
          ? "charging"
          : station.status === "maintenance"
          ? "location"
          : "scooter",
      // Remove popup to prevent automatic popup display
    }));
  }, [filteredStations]);

  // Calculate map center based on filtered stations
  const mapCenter = useMemo(() => {
    if (filteredStations.length === 0) return [40.7589, -73.9851]; // Default to NYC center

    const avgLat =
      filteredStations.reduce((sum, station) => sum + station.lat, 0) /
      filteredStations.length;
    const avgLng =
      filteredStations.reduce((sum, station) => sum + station.lng, 0) /
      filteredStations.length;

    return [avgLat, avgLng];
  }, [filteredStations]);

  // Handle map click to select station
  const handleMapClick = (lat, lng) => {
    // Find the closest station to the clicked point
    const clickedStation = filteredStations.reduce((closest, station) => {
      const distance = Math.sqrt(
        Math.pow(station.lat - lat, 2) + Math.pow(station.lng - lng, 2)
      );
      const closestDistance = closest
        ? Math.sqrt(
            Math.pow(closest.lat - lat, 2) + Math.pow(closest.lng - lng, 2)
          )
        : Infinity;

      return distance < closestDistance ? station : closest;
    }, null);

    // Only select if the click is reasonably close to a station (within ~0.005 degrees for more precise clicking)
    if (clickedStation) {
      const distance = Math.sqrt(
        Math.pow(clickedStation.lat - lat, 2) +
          Math.pow(clickedStation.lng - lng, 2)
      );
      if (distance < 0.005) {
        setSelectedStation(clickedStation);
      }
    }
  };

  const summaryStats = useMemo(() => {
    const operational = filteredStations.filter(
      (s) => s.status === "operational"
    ).length;
    const maintenance = filteredStations.filter(
      (s) => s.status === "maintenance"
    ).length;
    const offline = filteredStations.filter(
      (s) => s.status === "offline"
    ).length;
    const totalSwaps = filteredStations.reduce(
      (sum, s) => sum + s.dailySwaps,
      0
    );
    const avgUtilization =
      filteredStations.reduce((sum, s) => sum + s.utilization, 0) /
      filteredStations.length;

    return {
      operational,
      maintenance,
      offline,
      totalSwaps,
      avgUtilization: Math.round(avgUtilization),
    };
  }, [filteredStations]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-100 mb-2">
            BSS Station Network Map
          </h2>
          <p className="text-slate-400">
            Real-time monitoring of battery swap stations
          </p>
        </div>
        <Select value={selectedZone} onValueChange={setSelectedZone}>
          <SelectTrigger className="w-48 bg-slate-900/50 border-slate-700 text-slate-100">
            <SelectValue placeholder="Select Zone" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            {zones.map((zone) => (
              <SelectItem
                key={zone}
                value={zone}
                className="text-slate-100 hover:bg-slate-800"
              >
                {zone}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-sm">
              Operational
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">
              {summaryStats.operational}
            </div>
            <p className="text-xs text-slate-400 mt-1">Active stations</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-sm">
              Maintenance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">
              {summaryStats.maintenance}
            </div>
            <p className="text-xs text-slate-400 mt-1">Under service</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-sm">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {summaryStats.offline}
            </div>
            <p className="text-xs text-slate-400 mt-1">Not available</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-sm">
              Daily Swaps
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {summaryStats.totalSwaps}
            </div>
            <p className="text-xs text-slate-400 mt-1">Total today</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-slate-100 text-sm">
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-400">
              {summaryStats.avgUtilization}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Network average</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Map and Station Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Container */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Station Locations - {selectedZone}
              </CardTitle>
              <CardDescription className="text-slate-400">
                Click on stations to view details • Green: Operational • Amber:
                Maintenance • Red: Offline
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <CartoMap
                center={mapCenter}
                zoom={selectedZone === "All" ? 11 : 12}
                markers={mapMarkers}
                height="400px"
                onMapClick={handleMapClick}
                interactive={true}
              />
            </CardContent>
          </Card>
        </div>

        {/* Station Details Panel */}
        <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-slate-100">Station Details</CardTitle>
            <CardDescription className="text-slate-400">
              {selectedStation
                ? `${selectedStation.name} (${selectedStation.id})`
                : "Select a station on the map"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedStation ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-lg bg-opacity-20`}
                    style={{
                      backgroundColor:
                        getStatusColor(selectedStation.status) + "33",
                    }}
                  >
                    {getStatusIcon(selectedStation.status)}
                  </div>
                  <div>
                    <div className="text-slate-200 font-medium capitalize">
                      {selectedStation.status}
                    </div>
                    <div className="text-slate-400 text-sm">
                      {selectedStation.zone}
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm flex items-center gap-2">
                      <Battery className="w-4 h-4" />
                      Battery Level
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-slate-700 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-cyan-400"
                          style={{
                            width: `${selectedStation.batteryLevel}%`,
                          }}
                        />
                      </div>
                      <span className="text-slate-400 text-xs">
                        {selectedStation.batteryLevel}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Daily Swaps
                    </span>
                    <span className="text-cyan-400 font-mono">
                      {selectedStation.dailySwaps}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Queue Length
                    </span>
                    <span className="text-slate-400 font-mono">
                      {selectedStation.queueLength}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Utilization</span>
                    <span className="text-green-400 font-mono">
                      {selectedStation.utilization}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Last Maintenance
                    </span>
                    <span className="text-slate-400 text-xs">
                      {selectedStation.lastMaintenance.toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="text-slate-300 text-sm mb-2">
                    Quick Actions
                  </div>
                  <div className="space-y-2">
                    <button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white text-sm py-2 px-3 rounded-md transition-colors">
                      View Analytics
                    </button>
                    <button className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm py-2 px-3 rounded-md transition-colors">
                      Schedule Maintenance
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <MapPin className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 text-sm">
                  Click on any station marker to view detailed information
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Station List */}
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100">
            Station Status Overview
          </CardTitle>
          <CardDescription className="text-slate-400">
            Complete list of stations in{" "}
            {selectedZone === "All" ? "all zones" : selectedZone}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredStations.map((station) => (
              <div
                key={station.id}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:border-cyan-500 ${
                  selectedStation?.id === station.id
                    ? "bg-slate-800 border-cyan-500"
                    : "bg-slate-800/50 border-slate-600/50"
                }`}
                onClick={() => setSelectedStation(station)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-slate-200 font-medium">
                    {station.name}
                  </div>
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{
                      backgroundColor: getStatusColor(station.status),
                    }}
                  />
                </div>
                <div className="text-slate-400 text-sm mb-2">
                  {station.id} • {station.zone}
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Swaps: {station.dailySwaps}
                  </span>
                  <span className="text-slate-400">
                    Queue: {station.queueLength}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StationMap;
