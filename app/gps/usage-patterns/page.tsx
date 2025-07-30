"use client";

import { useState, useMemo } from "react";
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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  MapPin,
  Layers,
  Radar,
  Map,
  Settings,
  Maximize,
  Activity,
  Folders,
  Battery,
  Zap,
  Info,
  TrendingUp,
  Database,
} from "lucide-react";
import CustomizableMap from "@/components/gps/canvas-map";
import GeoChoroplethMap from "@/components/gps/GeoHexHeatmap";

interface GPSData {
  stations: Array<{
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    type?: string;
    area?: string;
    utilization_rate?: number;
    ping_speed?: number;
    status?: string;
    battery_count?: number;
    daily_swaps?: number;
    revenue?: number;
  }>;
  totalPoints: number;
  activeStations: number;
  averageUtilization: number;
}

interface GPSFilters {
  quickTime: string;
  dateRange?: { from: Date; to: Date };
  aggregation: string;
  selectedAreas: string[];
  selectedTypes: string[];
  selectedStatus: string[];
}

export default function UsagePatternPage() {
  const [filters, setFilters] = useState<GPSFilters>({
    quickTime: "last_year",
    dateRange: { from: new Date("2024-01-01"), to: new Date("2024-12-31") },
    aggregation: "monthly",
    selectedAreas: [],
    selectedTypes: [],
    selectedStatus: [],
  });

  // Map configuration state - making most fields optional
  const [sizeField, setSizeField] = useState<string>("none");
  const [colorField, setColorField] = useState<string>("none");
  const [pingSpeedField, setPingSpeedField] = useState<string>("none");
  const [categoryField, setCategoryField] = useState<string>("none");
  const [showLegend, setShowLegend] = useState(true);
  const [zoom, setZoom] = useState(7);
  const [markerOpacity, setMarkerOpacity] = useState(0.8);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"points" | "heatmap">("points");

  // Sample GPS data with optional fields
  const [gpsData] = useState<GPSData>({
    stations: [
      {
        id: "GPS001",
        name: "Station Alpha",
        latitude: 7.123456,
        longitude: 80.123456,
        type: "Battery Swap",
        area: "Ampara",
        utilization_rate: 75,
        ping_speed: 100,
        status: "active",
        battery_count: 25,
        daily_swaps: 45,
        revenue: 1200,
      },
      {
        id: "GPS002",
        name: "Station Beta",
        latitude: 6.987654,
        longitude: 79.876543,
        type: "Battery Swap",
        area: "Colombo",
        utilization_rate: 90,
        ping_speed: 85,
        status: "warning",
        battery_count: 30,
        daily_swaps: 60,
        revenue: 1800,
      },
      {
        id: "GPS003",
        name: "Station Gamma",
        latitude: 6.932,
        longitude: 79.847778,
        type: "Charging Station",
        area: "Colombo",
        utilization_rate: 65,
        ping_speed: 120,
        status: "active",
        battery_count: 20,
        daily_swaps: 35,
        revenue: 950,
      },
      {
        id: "GPS004",
        name: "Station Delta",
        latitude: 7.291418,
        longitude: 80.636696,
        type: "Battery Swap",
        area: "Kandy",
        utilization_rate: 80,
        status: "active",
      },
      {
        id: "GPS005",
        name: "Station Echo",
        latitude: 6.037778,
        longitude: 80.217222,
        status: "maintenance",
      },
      {
        id: "GPS006",
        name: "Station Foxtrot",
        latitude: 9.661498,
        longitude: 80.025696,
        type: "Battery Swap",
        area: "Jaffna",
        utilization_rate: 70,
        ping_speed: 90,
        status: "active",
        battery_count: 22,
        daily_swaps: 40,
        revenue: 1100,
      },
    ],
    totalStations: 6,
    activeStations: 5,
    averageUtilization: 72.5,
  });

  // inside your component, before return
  const isConfigLocked = gpsData.stations.length > 100;

  const fieldOptions = [
    { value: "none", label: "None (Optional)" },
    { value: "utilization_rate", label: "Utilization Rate" },
    { value: "ping_speed", label: "Ping Speed" },
    { value: "battery_count", label: "Battery Count" },
    { value: "daily_swaps", label: "Daily Swaps" },
    { value: "revenue", label: "Revenue" },
  ];

  const colorFieldOptions = [
    { value: "none", label: "None (Optional)" },
    { value: "area", label: "Area" },
    { value: "type", label: "Station Type" },
    { value: "status", label: "Status" },
  ];

  // Memoized map configuration that updates when state changes
  const mapConfig = useMemo(() => {
    const config: any = {
      // Map center for Sri Lanka
      center: { lat: 7.8731, lng: 80.7718 },
      zoom: zoom,

      // Basic required fields
      latitudeField: "latitude",
      longitudeField: "longitude",
      nameField: "name",

      // Map styling
      mapProvider: "cartodb_dark",
      showZoomControl: true,
      collapsibleUI: true,
      markerSize: 32,
      colorScheme: "default",

      // Always pass opacity to the map
      markerOpacity: markerOpacity,

      // Show legend if enabled and relevant fields are selected
      showLegend:
        showLegend && (colorField !== "none" || categoryField !== "none"),
    };

    // Only add optional fields if they're selected (not "none")
    if (sizeField !== "none") {
      config.pingSizeField = sizeField;
    }

    if (colorField !== "none") {
      config.colorField = colorField;
    }

    if (pingSpeedField !== "none") {
      config.pingSpeedField = pingSpeedField;
    }

    if (categoryField !== "none") {
      config.categoryField = categoryField;
    }

    return config;
  }, [
    sizeField,
    colorField,
    pingSpeedField,
    categoryField,
    zoom,
    markerOpacity,
    showLegend,
  ]);

  const getStatusColor = (status?: string): string => {
    if (!status) return "#6b7280"; // Default gray for missing status

    switch (status) {
      case "active":
        return "#10b981"; // green
      case "warning":
        return "#f59e0b"; // amber
      case "maintenance":
        return "#ef4444"; // red
      default:
        return "#6b7280"; // gray
    }
  };

  const getTypeIcon = (type?: string) => {
    if (!type) return <MapPin className="h-4 w-4" />; // Default icon

    switch (type) {
      case "Battery Swap":
        return <Battery className="h-4 w-4" />;
      case "Charging Station":
        return <Zap className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  const isDateRangeSet =
    filters.dateRange && filters.dateRange.from && filters.dateRange.to;

  return (
    <div className="min-h-screen p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <TrendingUp className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm font-medium">
              Usage Analytics
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Usage Pattern Overview
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Monitor station locations and performance metrics with advanced
            visualization and pattern analysis
          </p>
        </div>

        {/* Main Content */}
        {isDateRangeSet ? (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* Configuration Panel */}
            <div className="xl:col-span-4">
              <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl h-[100%]">
                <CardHeader className="pb-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg">
                      <Map className="h-5 w-5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-slate-100 text-lg">
                        Advanced Map Configuration
                      </CardTitle>
                      <CardDescription className="text-slate-400">
                        Customize GPS visualization parameters
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Tabs
                        value={activeTab}
                        onValueChange={setActiveTab}
                        className="w-full my-4"
                      >
                        <TabsList className="grid grid-cols-2 mb-6 bg-slate-800/50 p-1 rounded-xl">
                          <TabsTrigger
                            value="points"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
                          >
                            <Layers className="h-4 w-4 mr-2" />
                            Points
                          </TabsTrigger>
                          <TabsTrigger
                            value="heatmap"
                            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-600 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-lg transition-all duration-200"
                          >
                            <MapPin className="h-4 w-4 mr-2" />
                            Heat-map
                          </TabsTrigger>
                        </TabsList>
                      </Tabs>
                      {activeTab === "points" && (
                        <>
                          {gpsData.stations.length > 0 &&
                            (gpsData.stations[0].latitude === undefined ||
                              gpsData.stations[0].longitude === undefined) && (
                              <div className="bg-slate-800/30 border border-slate-700/50 rounded-lg p-3">
                                <div className="flex items-center text-cyan-400 text-sm font-medium mb-1">
                                  <MapPin className="h-4 w-4 mr-2" />
                                  Mandatory Fields
                                </div>
                                <p className="text-xs text-slate-500">
                                  Latitude and Longitude are required. All other
                                  fields are optional.
                                </p>
                              </div>
                            )}

                          {/* Color Field - Optional */}
                          <div className="space-y-3">
                            <Label
                              htmlFor="color-field"
                              className="text-slate-300 flex items-center justify-between text-sm font-medium"
                            >
                              <div className="flex items-center">
                                <Layers className="h-4 w-4 mr-2 text-cyan-400" />
                                Color Coding
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-700/50 text-slate-400"
                              >
                                Optional
                              </Badge>
                            </Label>
                            <Select
                              value={colorField}
                              onValueChange={setColorField}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
                                <SelectValue placeholder="Default color" />
                              </SelectTrigger>
                              <SelectContent>
                                {colorFieldOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Color markers based on selected field
                            </p>
                          </div>

                          <Separator className="bg-slate-700/30" />

                          {/* Category field - Optional */}
                          <div className="space-y-3">
                            <Label
                              htmlFor="category-field"
                              className="text-slate-300 flex items-center justify-between text-sm font-medium"
                            >
                              <div className="flex items-center">
                                <Folders className="h-4 w-4 mr-2 text-cyan-400" />
                                Icon Category
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-700/50 text-slate-400"
                              >
                                Optional
                              </Badge>
                            </Label>
                            <Select
                              disabled={isConfigLocked}
                              value={categoryField}
                              onValueChange={setCategoryField}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
                                <SelectValue placeholder="Default icons" />
                              </SelectTrigger>
                              <SelectContent>
                                {colorFieldOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Categorize icons based on field values
                            </p>
                          </div>

                          <Separator className="bg-slate-700/30" />

                          {/* Ping Size Field - Optional */}
                          <div className="space-y-3">
                            <Label
                              htmlFor="size-field"
                              className="text-slate-300 flex items-center justify-between text-sm font-medium"
                            >
                              <div className="flex items-center">
                                <Maximize className="h-4 w-4 mr-2 text-cyan-400" />
                                Ping Radius Field
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-700/50 text-slate-400"
                              >
                                Optional
                              </Badge>
                            </Label>
                            <Select
                              value={sizeField}
                              onValueChange={setSizeField}
                              disabled={isConfigLocked}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
                                <SelectValue placeholder="None selected" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Scale ping radius based on field values
                            </p>
                          </div>

                          <Separator className="bg-slate-700/30" />

                          {/* Ping Speed Field - Optional */}
                          <div className="space-y-3">
                            <Label
                              htmlFor="ping-field"
                              className="text-slate-300 flex items-center justify-between text-sm font-medium"
                            >
                              <div className="flex items-center">
                                <Activity className="h-4 w-4 mr-2 text-cyan-400" />
                                Ping Frequency Field
                              </div>
                              <Badge
                                variant="secondary"
                                className="text-xs bg-slate-700/50 text-slate-400"
                              >
                                Optional
                              </Badge>
                            </Label>
                            <Select
                              disabled={isConfigLocked}
                              value={pingSpeedField}
                              onValueChange={setPingSpeedField}
                            >
                              <SelectTrigger className="bg-slate-800/50 border-slate-600/50 text-slate-300 h-10">
                                <SelectValue placeholder="None selected" />
                              </SelectTrigger>
                              <SelectContent>
                                {fieldOptions.map((option) => (
                                  <SelectItem
                                    key={option.value}
                                    value={option.value}
                                  >
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              Control ping animation frequency
                            </p>
                          </div>

                          <Separator className="bg-slate-700/30" />

                          {/* Marker Opacity */}
                          <div className="space-y-3">
                            <Label
                              htmlFor="marker-opacity"
                              className="text-slate-300 flex items-center justify-between text-sm font-medium"
                            >
                              <div className="flex items-center">
                                <Settings className="h-4 w-4 mr-2 text-cyan-400" />
                                Marker Opacity
                              </div>
                              <span className="text-cyan-400 font-mono">
                                {Math.round(markerOpacity * 100)}%
                              </span>
                            </Label>
                            <Slider
                              id="marker-opacity"
                              min={0.1}
                              max={1}
                              step={0.1}
                              value={[markerOpacity]}
                              onValueChange={(value) =>
                                setMarkerOpacity(value[0])
                              }
                              className="py-2"
                            />
                          </div>
                        </>
                      )}
                      {activeTab === "heatmap" && (
                        <div className="text-center space-y-4">
                          <div className="p-4 bg-slate-800/50 rounded-full mx-auto w-fit">
                            <Radar className="h-8 w-8 text-slate-400" />
                          </div>
                          <h3 className="text-lg font-medium text-slate-300 mb-2">
                            Heatmap Visualization
                          </h3>
                          <p className="text-sm text-slate-500 max-w-md mx-auto">
                            Visualize station density and performance metrics
                            with an interactive heatmap.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Map and Station Details */}
            <div className="xl:col-span-8 space-y-6">
              {/* Map Display */}
              <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
                <CardContent className="p-0">
                  <div style={{ height: "800px", width: "100%" }}>
                    {activeTab === "points" && (
                      <CustomizableMap
                        data={gpsData.stations}
                        config={mapConfig}
                        onDataPointClick={(point) => {
                          console.log("Clicked point:", point);
                        }}
                        onConfigChange={(newConfig) => {
                          console.log("Config changed:", newConfig);
                        }}
                        className="h-full w-full"
                      />
                    )}
                    {activeTab === "heatmap" && (
                      <div className="flex items-center justify-center h-full">
                        <GeoChoroplethMap />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <Card className="bg-slate-900/80 border-slate-700/50 backdrop-blur-xl shadow-2xl">
            <CardContent className="flex items-center justify-center h-64">
              <div className="text-center space-y-4">
                <div className="p-4 bg-slate-800/50 rounded-full mx-auto w-fit">
                  <TrendingUp className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-slate-300 mb-2">
                    Select Date Range to View GPS Data
                  </h3>
                  <p className="text-sm text-slate-500 max-w-md mx-auto">
                    Please choose a valid date range from the filters above to
                    display station locations and metrics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
