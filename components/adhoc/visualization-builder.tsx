"use client";

import type React from "react";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CanvasMap } from "./canvas-map";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  AreaChart,
  Palette,
  Download,
  RefreshCw,
  Settings,
  Eye,
  Code,
  MapPin,
  Save,
  AlertCircle,
  Table,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  ScatterChart as RechartsScatterChart,
  Scatter,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface ChartConfig {
  type: string;
  xField: string;
  yField: string;
  colorField?: string;
  colorScheme: string;
  title: string;
  showLegend: boolean;
  showGrid: boolean;
  name: string;
  description: string;
  barType?: "clustered" | "stacked";
  latField?: string;
  lngField?: string;
  sizeField?: string;
  pingSpeedField?: string;
}

interface SavedQuery {
  id: string;
  config: ChartConfig;
  timestamp: Date;
}

interface VisualizationBuilderProps {
  data?: any[];
  query?: string;
  onVisualizationChange?: (config: ChartConfig) => void;
  onQuerySave?: (query: SavedQuery) => void;
}

const chartTypes = [
  {
    id: "table",
    name: "Data Table",
    icon: Table,
    description: "View raw data in tabular format",
  },
  {
    id: "bar",
    name: "Bar Chart",
    icon: BarChart3,
    description: "Compare values across categories",
  },
  {
    id: "line",
    name: "Line Chart",
    icon: LineChart,
    description: "Show trends and changes over time",
  },
  {
    id: "pie",
    name: "Pie Chart",
    icon: PieChart,
    description: "Display proportions of a whole",
  },
  {
    id: "scatter",
    name: "Scatter Plot",
    icon: ScatterChart,
    description: "Show relationships between variables",
  },
  {
    id: "area",
    name: "Area Chart",
    icon: AreaChart,
    description: "Show cumulative values over time",
  },
  {
    id: "map",
    name: "Geographic Map",
    icon: MapPin,
    description: "Display data points on an interactive map",
  },
];

const colorSchemes = [
  {
    name: "Default",
    colors: ["#06b6d4", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981"],
  },
  {
    name: "Ocean",
    colors: ["#0891b2", "#0284c7", "#2563eb", "#7c3aed", "#db2777", "#dc2626"],
  },
  {
    name: "Forest",
    colors: ["#059669", "#0d9488", "#0891b2", "#3b82f6", "#6366f1", "#8b5cf6"],
  },
  {
    name: "Sunset",
    colors: ["#f59e0b", "#f97316", "#ef4444", "#ec4899", "#d946ef", "#a855f7"],
  },
];

const defaultData = [
  {
    country: "China",
    continent: "Asia",
    population: 1441,
    gdp: 17.7,
    latitude: 35.8617,
    longitude: 104.1954,
    ping_speed: 45,
  },
  {
    country: "India",
    continent: "Asia",
    population: 1393,
    gdp: 3.7,
    latitude: 20.5937,
    longitude: 78.9629,
    ping_speed: 67,
  },
  {
    country: "Japan",
    continent: "Asia",
    population: 125,
    gdp: 5.1,
    latitude: 36.2048,
    longitude: 138.2529,
    ping_speed: 23,
  },
  {
    country: "Germany",
    continent: "Europe",
    population: 83,
    gdp: 4.2,
    latitude: 51.1657,
    longitude: 10.4515,
    ping_speed: 34,
  },
  {
    country: "France",
    continent: "Europe",
    population: 67,
    gdp: 2.9,
    latitude: 46.2276,
    longitude: 2.2137,
    ping_speed: 28,
  },
  {
    country: "United Kingdom",
    continent: "Europe",
    population: 68,
    gdp: 3.1,
    latitude: 55.3781,
    longitude: -3.436,
    ping_speed: 31,
  },
  {
    country: "United States",
    continent: "North America",
    population: 332,
    gdp: 21.4,
    latitude: 37.0902,
    longitude: -95.7129,
    ping_speed: 52,
  },
  {
    country: "Canada",
    continent: "North America",
    population: 38,
    gdp: 1.6,
    latitude: 56.1304,
    longitude: -106.3468,
    ping_speed: 41,
  },
  {
    country: "Brazil",
    continent: "South America",
    population: 213,
    gdp: 1.8,
    latitude: -14.235,
    longitude: -51.9253,
    ping_speed: 78,
  },
  {
    country: "Argentina",
    continent: "South America",
    population: 45,
    gdp: 0.45,
    latitude: -38.4161,
    longitude: -63.6167,
    ping_speed: 89,
  },
  {
    country: "South Africa",
    continent: "Africa",
    population: 60,
    gdp: 0.35,
    latitude: -30.5595,
    longitude: 22.9375,
    ping_speed: 95,
  },
  {
    country: "Egypt",
    continent: "Africa",
    population: 104,
    gdp: 0.37,
    latitude: 26.8206,
    longitude: 30.8025,
    ping_speed: 112,
  },
];

export default function VisualizationBuilder({
  data = defaultData,
  query = "SELECT * FROM population_data",
  onVisualizationChange,
  onQuerySave,
}: VisualizationBuilderProps) {
  // State management
  const [chartType, setChartType] = useState("table");
  const [xField, setXField] = useState("");
  const [yField, setYField] = useState("");
  const [colorField, setColorField] = useState("none");
  const [colorScheme, setColorScheme] = useState("Default");
  const [title, setTitle] = useState("");
  const [showLegend, setShowLegend] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [barType, setBarType] = useState<"clustered" | "stacked">("clustered");
  const [latField, setLatField] = useState("");
  const [lngField, setLngField] = useState("");
  const [sizeField, setSizeField] = useState("");
  const [pingSpeedField, setPingSpeedField] = useState("");
  const [queryName, setQueryName] = useState("");
  const [queryDescription, setQueryDescription] = useState("");
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  // Table-specific state
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(7);
  const [sortField, setSortField] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Derive field information from data
  const fields = data.length > 0 ? Object.keys(data[0]) : [];
  const numericFields = fields.filter((field) => {
    const value = data[0]?.[field];
    return typeof value === "number" || !isNaN(Number(value));
  });
  const categoricalFields = fields.filter((field) => {
    const value = data[0]?.[field];
    return typeof value === "string" || typeof value === "boolean";
  });

  // Initialize default field selections
  useEffect(() => {
    if (fields.length > 0 && !xField) {
      const defaultX = categoricalFields[0] || fields[0];
      setXField(defaultX);
    }
    if (numericFields.length > 0 && !yField) {
      setYField(numericFields[0]);
    }
    // Initialize map fields
    if (fields.includes("latitude") && !latField) {
      setLatField("latitude");
    }
    if (fields.includes("longitude") && !lngField) {
      setLngField("longitude");
    }
    if (fields.includes("ping_speed") && !pingSpeedField) {
      setPingSpeedField("ping_speed");
    }
  }, [
    fields,
    categoricalFields,
    numericFields,
    xField,
    yField,
    latField,
    lngField,
    pingSpeedField,
  ]);

  // Auto-generate title based on selections
  useEffect(() => {
    if (chartType === "map" && latField && lngField) {
      setTitle(`Geographic Distribution - Interactive Map`);
    } else if (xField && yField && !title && chartType !== "table") {
      const chartName =
        chartTypes.find((t) => t.id === chartType)?.name || "Chart";
      setTitle(`${yField} by ${xField} - ${chartName}`);
    } else if (chartType === "table" && !title) {
      setTitle("Data Table View");
    }
  }, [xField, yField, chartType, title, latField, lngField]);

  // Handle configuration changes and notify parent
  const handleConfigChange = useCallback(() => {
    if (
      onVisualizationChange &&
      (chartType === "table" || chartType === "map" || (xField && yField))
    ) {
      const config: ChartConfig = {
        type: chartType,
        xField,
        yField,
        colorField: colorField === "none" ? undefined : colorField,
        colorScheme,
        title:
          title ||
          (chartType === "table"
            ? "Data Table View"
            : chartType === "map"
            ? "Geographic Map"
            : `${yField} by ${xField}`),
        showLegend,
        showGrid,
        name: queryName,
        description: queryDescription,
        barType,
        latField,
        lngField,
        sizeField,
        pingSpeedField,
      };
      onVisualizationChange(config);
    }
  }, [
    chartType,
    xField,
    yField,
    colorField,
    colorScheme,
    title,
    showLegend,
    showGrid,
    queryName,
    queryDescription,
    barType,
    latField,
    lngField,
    sizeField,
    pingSpeedField,
    onVisualizationChange,
  ]);

  // Trigger config change when dependencies update
  useEffect(() => {
    handleConfigChange();
  }, [handleConfigChange]);

  // Handle chart type changes with smart field selection
  const handleChartTypeChange = useCallback(
    (newType: string) => {
      setChartType(newType);

      // Reset search and pagination when switching to/from table
      if (newType === "table" || chartType === "table") {
        setSearchTerm("");
        setCurrentPage(1);
        setSortField("");
        setSortDirection("asc");
      }

      // Auto-adjust fields based on chart type
      if (newType === "pie" && numericFields.length > 0) {
        if (categoricalFields.length === 0) {
          setXField(fields[0]);
        }
      } else if (newType === "scatter") {
        if (numericFields.length >= 2) {
          setXField(numericFields[0]);
          setYField(numericFields[1]);
        }
      } else if (newType === "map") {
        // Auto-select latitude and longitude fields if available
        const latFields = fields.filter((f) => f.toLowerCase().includes("lat"));
        const lngFields = fields.filter(
          (f) =>
            f.toLowerCase().includes("lng") || f.toLowerCase().includes("lon")
        );

        if (latFields.length > 0 && !latField) {
          setLatField(latFields[0]);
        }
        if (lngFields.length > 0 && !lngField) {
          setLngField(lngFields[0]);
        }

        // Auto-select ping speed field if available
        const pingFields = fields.filter((f) =>
          f.toLowerCase().includes("ping")
        );
        if (pingFields.length > 0 && !pingSpeedField) {
          setPingSpeedField(pingFields[0]);
        }
      }
    },
    [
      numericFields,
      categoricalFields,
      fields,
      chartType,
      latField,
      lngField,
      pingSpeedField,
    ]
  );

  // Handle field changes with validation
  const handleFieldChange = useCallback((field: string, value: string) => {
    switch (field) {
      case "xField":
        setXField(value);
        break;
      case "yField":
        setYField(value);
        break;
      case "colorField":
        setColorField(value);
        break;
      case "latField":
        setLatField(value);
        break;
      case "lngField":
        setLngField(value);
        break;
      case "sizeField":
        setSizeField(value);
        break;
      case "pingSpeedField":
        setPingSpeedField(value);
        break;
    }
  }, []);

  // Table filtering and sorting logic
  const getFilteredAndSortedData = useCallback(() => {
    let filteredData = data;

    // Apply search filter
    if (searchTerm) {
      filteredData = data.filter((row) =>
        Object.values(row).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Apply sorting
    if (sortField) {
      filteredData = [...filteredData].sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
        }

        const aStr = String(aVal).toLowerCase();
        const bStr = String(bVal).toLowerCase();

        if (sortDirection === "asc") {
          return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
        } else {
          return aStr > bStr ? -1 : aStr < bStr ? 1 : 0;
        }
      });
    }

    return filteredData;
  }, [data, searchTerm, sortField, sortDirection]);

  // Get paginated data
  const getPaginatedData = useCallback(() => {
    const filteredData = getFilteredAndSortedData();
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [getFilteredAndSortedData, currentPage, rowsPerPage]);

  // Handle table sorting
  const handleSort = useCallback(
    (field: string) => {
      if (sortField === field) {
        setSortDirection(sortDirection === "asc" ? "desc" : "asc");
      } else {
        setSortField(field);
        setSortDirection("asc");
      }
      setCurrentPage(1);
    },
    [sortField, sortDirection]
  );

  // Handle query saving
  const handleSaveQuery = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!queryName.trim()) {
        setSaveStatus("error");
        return;
      }

      setSaveStatus("saving");

      try {
        const config: ChartConfig = {
          type: chartType,
          xField,
          yField,
          colorField: colorField === "none" ? undefined : colorField,
          colorScheme,
          title:
            title ||
            (chartType === "table"
              ? "Data Table View"
              : chartType === "map"
              ? "Geographic Map"
              : `${yField} by ${xField}`),
          showLegend,
          showGrid,
          name: queryName.trim(),
          description: queryDescription.trim(),
          barType,
          latField,
          lngField,
          sizeField,
          pingSpeedField,
        };

        const savedQuery: SavedQuery = {
          id: Date.now().toString(),
          config,
          timestamp: new Date(),
        };

        setSavedQueries((prev) => [...prev, savedQuery]);

        if (onQuerySave) {
          onQuerySave(savedQuery);
        }

        setSaveStatus("saved");

        setTimeout(() => {
          setQueryName("");
          setQueryDescription("");
          setSaveStatus("idle");
        }, 2000);
      } catch (error) {
        setSaveStatus("error");
        setTimeout(() => setSaveStatus("idle"), 3000);
      }
    },
    [
      chartType,
      xField,
      yField,
      colorField,
      colorScheme,
      title,
      showLegend,
      showGrid,
      queryName,
      queryDescription,
      barType,
      latField,
      lngField,
      sizeField,
      pingSpeedField,
      onQuerySave,
    ]
  );

  // Handle refresh/reset
  const handleRefresh = useCallback(() => {
    setChartType("bar");
    setColorField("none");
    setColorScheme("Default");
    setShowLegend(true);
    setShowGrid(true);
    setTitle("");
    setSearchTerm("");
    setCurrentPage(1);
    setSortField("");
    setSortDirection("asc");
    setBarType("clustered");
    setLatField("");
    setLngField("");
    setSizeField("");
    setPingSpeedField("");

    if (categoricalFields.length > 0) {
      setXField(categoricalFields[0]);
    }
    if (numericFields.length > 0) {
      setYField(numericFields[0]);
    }
  }, [categoricalFields, numericFields]);

  // Render field configuration based on chart type
  const renderFieldConfiguration = () => {
    const colors =
      colorSchemes.find((scheme) => scheme.name === colorScheme)?.colors ||
      colorSchemes[0].colors;

    switch (chartType) {
      case "map":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Latitude Field *
                </Label>
                <Select
                  value={latField}
                  onValueChange={(value) =>
                    handleFieldChange("latField", value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select latitude field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {numericFields.map((field) => (
                      <SelectItem
                        key={field}
                        value={field}
                        className="text-white hover:bg-slate-700"
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Longitude Field *
                </Label>
                <Select
                  value={lngField}
                  onValueChange={(value) =>
                    handleFieldChange("lngField", value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select longitude field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {numericFields.map((field) => (
                      <SelectItem
                        key={field}
                        value={field}
                        className="text-white hover:bg-slate-700"
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Pin Size Field
                </Label>
                <Select
                  value={sizeField || "none"}
                  onValueChange={(value) =>
                    handleFieldChange(
                      "sizeField",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select size field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem
                      value="none"
                      className="text-white hover:bg-slate-700"
                    >
                      Default Size
                    </SelectItem>
                    {numericFields.map((field) => (
                      <SelectItem
                        key={field}
                        value={field}
                        className="text-white hover:bg-slate-700"
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Legend/Color Field
                </Label>
                <Select
                  value={colorField}
                  onValueChange={(value) =>
                    handleFieldChange("colorField", value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select color field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem
                      value="none"
                      className="text-white hover:bg-slate-700"
                    >
                      No Legend
                    </SelectItem>
                    {categoricalFields.map((field) => (
                      <SelectItem
                        key={field}
                        value={field}
                        className="text-white hover:bg-slate-700"
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Ping Speed Field
                </Label>
                <Select
                  value={pingSpeedField || "none"}
                  onValueChange={(value) =>
                    handleFieldChange(
                      "pingSpeedField",
                      value === "none" ? "" : value
                    )
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select ping field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem
                      value="none"
                      className="text-white hover:bg-slate-700"
                    >
                      No Ping Animation
                    </SelectItem>
                    {numericFields.map((field) => (
                      <SelectItem
                        key={field}
                        value={field}
                        className="text-white hover:bg-slate-700"
                      >
                        {field}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Color Scheme
              </Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {colorSchemes.map((scheme) => (
                    <SelectItem
                      key={scheme.name}
                      value={scheme.name}
                      className="text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {scheme.colors.slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {scheme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );

      case "table":
        return null;

      default:
        return (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                X-Axis Field
              </Label>
              <Select
                value={xField}
                onValueChange={(value) => handleFieldChange("xField", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select X field" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {fields.map((field) => (
                    <SelectItem
                      key={field}
                      value={field}
                      className="text-white hover:bg-slate-700"
                    >
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Y-Axis Field
              </Label>
              <Select
                value={yField}
                onValueChange={(value) => handleFieldChange("yField", value)}
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select Y field" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {numericFields.map((field) => (
                    <SelectItem
                      key={field}
                      value={field}
                      className="text-white hover:bg-slate-700"
                    >
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Legend Field (Optional)
              </Label>
              <Select
                value={colorField}
                onValueChange={(value) =>
                  handleFieldChange("colorField", value)
                }
              >
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue placeholder="Select legend field" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="none"
                    className="text-white hover:bg-slate-700"
                  >
                    None
                  </SelectItem>
                  {categoricalFields.map((field) => (
                    <SelectItem
                      key={field}
                      value={field}
                      className="text-white hover:bg-slate-700"
                    >
                      {field}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-white">
                Color Scheme
              </Label>
              <Select value={colorScheme} onValueChange={setColorScheme}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {colorSchemes.map((scheme) => (
                    <SelectItem
                      key={scheme.name}
                      value={scheme.name}
                      className="text-white hover:bg-slate-700"
                    >
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          {scheme.colors.slice(0, 4).map((color, i) => (
                            <div
                              key={i}
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                        {scheme.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartType === "bar" && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-white">
                  Bar Type
                </Label>
                <Select
                  value={barType}
                  onValueChange={(value: "clustered" | "stacked") =>
                    setBarType(value)
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem
                      value="clustered"
                      className="text-white hover:bg-slate-700"
                    >
                      Clustered
                    </SelectItem>
                    <SelectItem
                      value="stacked"
                      className="text-white hover:bg-slate-700"
                    >
                      Stacked
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        );
    }
  };

  // Render data table
  const renderDataTable = () => {
    const filteredData = getFilteredAndSortedData();
    const paginatedData = getPaginatedData();
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    return (
      <div className="space-y-4">
        {/* Table Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search data..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 w-64"
              />
            </div>
            <Select
              value={rowsPerPage.toString()}
              onValueChange={(value) => {
                setRowsPerPage(Number.parseInt(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-32 bg-slate-700 border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-700">
                {[5, 10, 25, 50, 100].map((size) => (
                  <SelectItem
                    key={size}
                    value={size.toString()}
                    className="text-white hover:bg-slate-700"
                  >
                    {size} rows
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="text-sm text-slate-400">
            Showing {paginatedData.length} of {filteredData.length} rows
            {filteredData.length !== data.length &&
              ` (filtered from ${data.length})`}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-slate-900/50 rounded-lg border border-slate-700">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700 bg-slate-800/50">
                {fields.map((field) => (
                  <th
                    key={field}
                    className="px-4 py-3 text-left text-sm font-medium text-slate-300 cursor-pointer hover:bg-slate-700/50 transition-colors"
                    onClick={() => handleSort(field)}
                  >
                    <div className="flex items-center gap-2">
                      {field}
                      {sortField === field && (
                        <span className="text-cyan-400">
                          {sortDirection === "asc" ? "↑" : "↓"}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row, index) => (
                <tr
                  key={index}
                  className="border-b border-slate-700/50 hover:bg-slate-800/30 transition-colors"
                >
                  {fields.map((field) => (
                    <td
                      key={field}
                      className="px-4 py-3 text-sm text-slate-200"
                    >
                      {typeof row[field] === "number"
                        ? row[field].toLocaleString()
                        : String(row[field])}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </Button>
              <span className="text-sm text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="text-slate-400 hover:text-white disabled:opacity-50"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Go to page:</span>
              <input
                type="number"
                min="1"
                max={totalPages}
                value={currentPage}
                onChange={(e) => {
                  const page = Number.parseInt(e.target.value);
                  if (page >= 1 && page <= totalPages) {
                    setCurrentPage(page);
                  }
                }}
                className="w-16 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render chart visualization
  const renderChart = () => {
    if (chartType === "table") {
      return renderDataTable();
    }

    if (chartType === "map") {
      if (!latField || !lngField) {
        return (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="font-medium">
                Configure latitude and longitude fields
              </p>
              <p className="text-xs mt-1">
                Select latitude and longitude fields to display the map
              </p>
            </div>
          </div>
        );
      }

      // Transform data to match the expected format for CanvasMap
      const mapData = data.map((item, index) => ({
        id: `point-${index}`,
        name: item[xField] || item.country || item.name || `Point ${index + 1}`,
        latitude: item[latField],
        longitude: item[lngField],
        type: "station",
        area: item.continent || item.area || "Unknown",
        revenue: sizeField
          ? item[sizeField]
          : item.revenue || Math.random() * 5000,
        utilization_rate:
          colorField !== "none" && colorField
            ? typeof item[colorField] === "number"
              ? item[colorField]
              : Math.random() * 100
            : Math.random() * 100,
        battery_level:
          colorField !== "none" && colorField
            ? typeof item[colorField] === "number"
              ? item[colorField]
              : Math.random() * 100
            : Math.random() * 100,
        status:
          colorField !== "none" && colorField
            ? typeof item[colorField] === "string"
              ? item[colorField]
              : typeof item[colorField] === "number"
              ? item[colorField] > 80
                ? "active"
                : item[colorField] > 60
                ? "warning"
                : "danger"
              : "active"
            : "active",
        ping_speed: pingSpeedField
          ? item[pingSpeedField]
          : Math.random() * 100 + 20,
        timestamp: new Date().toISOString(),
        ...item, // Include all original data
      }));

      return (
        <div className="h-[500px]">
          <CanvasMap
            element={{
              id: "map-viz",
              type: "map",
              position: { x: 0, y: 0 },
              size: { width: 800, height: 500 },
              config: {
                mapProvider: "cartodb_dark",
                showLegend: showLegend,
                timeFilter: "all",
                latitudeField: latField
                  ? { id: latField, name: latField }
                  : undefined,
                longitudeField: lngField
                  ? { id: lngField, name: lngField }
                  : undefined,
                sizeField: sizeField
                  ? { id: sizeField, name: sizeField }
                  : undefined,
                colorField:
                  colorField !== "none"
                    ? { id: colorField, name: colorField }
                    : undefined,
                pingSpeedField: pingSpeedField
                  ? { id: pingSpeedField, name: pingSpeedField }
                  : undefined,
                center: {
                  lat:
                    data.reduce((sum, item) => sum + item[latField], 0) /
                    data.length,
                  lng:
                    data.reduce((sum, item) => sum + item[lngField], 0) /
                    data.length,
                },
                zoom: 6,
                data: mapData,
              },
            }}
            dataSources={[]}
          />
        </div>
      );
    }

    if (!data.length || !xField || !yField) {
      return (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="font-medium">Configure fields to see visualization</p>
            <p className="text-xs mt-1">
              Select X and Y fields from the configuration above
            </p>
          </div>
        </div>
      );
    }

    const colors =
      colorSchemes.find((scheme) => scheme.name === colorScheme)?.colors ||
      colorSchemes[0].colors;

    const tooltipStyle = {
      backgroundColor: "#1f2937",
      border: "1px solid #374151",
      borderRadius: "6px",
      color: "#f9fafb",
    };

    switch (chartType) {
      case "bar":
        if (colorField && colorField !== "none") {
          // Grouped/Stacked bar chart
          const categories = [...new Set(data.map((d) => d[colorField]))];
          const groupedData = Object.values(
            data.reduce((acc, curr) => {
              const xVal = curr[xField];
              if (!acc[xVal]) {
                acc[xVal] = { [xField]: xVal };
                categories.forEach((cat) => {
                  acc[xVal][cat] = 0;
                });
              }
              acc[xVal][curr[colorField]] += curr[yField];
              return acc;
            }, {} as Record<string, any>)
          );

          return (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={groupedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                )}
                <XAxis
                  dataKey={xField}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend />}
                {categories.map((category, i) => (
                  <Bar
                    key={category}
                    dataKey={category}
                    name={category}
                    stackId={barType === "stacked" ? "a" : undefined}
                    fill={colors[i % colors.length]}
                  />
                ))}
              </RechartsBarChart>
            </ResponsiveContainer>
          );
        } else {
          // Simple bar chart
          const stackedData = Object.values(
            data.reduce((acc, curr) => {
              const xVal = curr[xField];
              if (!acc[xVal]) acc[xVal] = { [xField]: xVal, [yField]: 0 };
              acc[xVal][yField] += curr[yField];
              return acc;
            }, {} as Record<string, any>)
          );

          return (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={stackedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                )}
                <XAxis
                  dataKey={xField}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend />}
                <Bar dataKey={yField} name={yField} fill={colors[0]} />
              </RechartsBarChart>
            </ResponsiveContainer>
          );
        }

      case "line":
        if (colorField && colorField !== "none") {
          const categories = [...new Set(data.map((d) => d[colorField]))];
          const multiLineData = Object.values(
            data.reduce((acc, curr) => {
              const xVal = curr[xField];
              if (!acc[xVal]) {
                acc[xVal] = { [xField]: xVal };
                categories.forEach((cat) => {
                  acc[xVal][cat] = 0;
                });
              }
              acc[xVal][curr[colorField]] += curr[yField];
              return acc;
            }, {} as Record<string, any>)
          );

          return (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsLineChart
                data={multiLineData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {showGrid && (
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(var(--border))"
                  />
                )}
                <XAxis
                  dataKey={xField}
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <YAxis
                  tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
                />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend />}
                {categories.map((category, i) => (
                  <Line
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stroke={colors[i % colors.length]}
                    strokeWidth={2}
                    dot={{ fill: colors[i % colors.length] }}
                  />
                ))}
              </RechartsLineChart>
            </ResponsiveContainer>
          );
        }

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsLineChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              {showGrid && (
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                />
              )}
              <XAxis
                dataKey={xField}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Line
                type="monotone"
                dataKey={yField}
                name={yField}
                stroke={colors[0]}
                strokeWidth={2}
                dot={{ fill: colors[0] }}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case "pie":
        const aggregatedData = Object.values(
          data.reduce((acc, curr) => {
            const key = curr[xField];
            if (!acc[key]) {
              acc[key] = { [xField]: key, [yField]: 0 };
            }
            acc[key][yField] += curr[yField];
            return acc;
          }, {} as Record<string, any>)
        );

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={aggregatedData}
                dataKey={yField}
                nameKey={xField}
                cx="50%"
                cy="50%"
                outerRadius={80}
                labelLine={false}
              >
                {aggregatedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        if (
          !numericFields.includes(xField) ||
          !numericFields.includes(yField)
        ) {
          return (
            <div className="h-64 flex items-center justify-center text-red-500">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="font-medium">
                  Scatter chart requires numeric X and Y fields
                </p>
              </div>
            </div>
          );
        }

        if (colorField && colorField !== "none") {
          const categories = [...new Set(data.map((d) => d[colorField]))];

          return (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsScatterChart
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {showGrid && (
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                )}
                <XAxis
                  dataKey={xField}
                  stroke="#9ca3af"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                />
                <YAxis
                  dataKey={yField}
                  stroke="#9ca3af"
                  type="number"
                  domain={["dataMin", "dataMax"]}
                />
                <Tooltip
                  cursor={{ strokeDasharray: "3 3" }}
                  contentStyle={tooltipStyle}
                />
                {showLegend && <Legend />}
                {categories.map((category, i) => {
                  const categoryData = data.filter(
                    (d) => d[colorField] === category
                  );
                  return (
                    <Scatter
                      key={category}
                      name={category}
                      data={categoryData}
                      fill={colors[i % colors.length]}
                    />
                  );
                })}
              </RechartsScatterChart>
            </ResponsiveContainer>
          );
        }

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsScatterChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              )}
              <XAxis
                dataKey={xField}
                stroke="#9ca3af"
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <YAxis
                dataKey={yField}
                stroke="#9ca3af"
                type="number"
                domain={["dataMin", "dataMax"]}
              />
              <Tooltip
                cursor={{ strokeDasharray: "3 3" }}
                contentStyle={tooltipStyle}
              />
              {showLegend && <Legend />}
              <Scatter name={yField} data={data} fill={colors[0]} />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      case "area":
        if (colorField && colorField !== "none") {
          const categories = [...new Set(data.map((d) => d[colorField]))];
          const groupedData = Object.values(
            data.reduce((acc, curr) => {
              const xVal = curr[xField];
              if (!acc[xVal]) {
                acc[xVal] = { [xField]: xVal };
                categories.forEach((cat) => {
                  acc[xVal][cat] = 0;
                });
              }
              acc[xVal][curr[colorField]] += curr[yField];
              return acc;
            }, {} as Record<string, any>)
          );

          return (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsAreaChart
                data={groupedData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                {showGrid && (
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                )}
                <XAxis dataKey={xField} stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip contentStyle={tooltipStyle} />
                {showLegend && <Legend />}
                {categories.map((category, i) => (
                  <Area
                    key={category}
                    type="monotone"
                    dataKey={category}
                    name={category}
                    stackId="a"
                    stroke={colors[i % colors.length]}
                    fill={colors[i % colors.length]}
                    fillOpacity={0.6}
                  />
                ))}
              </RechartsAreaChart>
            </ResponsiveContainer>
          );
        }

        const areaData = Object.values(
          data.reduce((acc, curr) => {
            const xVal = curr[xField];
            if (!acc[xVal]) acc[xVal] = { [xField]: xVal, [yField]: 0 };
            acc[xVal][yField] += curr[yField];
            return acc;
          }, {} as Record<string, any>)
        );

        return (
          <ResponsiveContainer width="100%" height={300}>
            <RechartsAreaChart
              data={areaData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              {showGrid && (
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              )}
              <XAxis dataKey={xField} stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip contentStyle={tooltipStyle} />
              {showLegend && <Legend />}
              <Area
                type="monotone"
                dataKey={yField}
                name={yField}
                stroke={colors[0]}
                fill={colors[0]}
                fillOpacity={0.6}
              />
            </RechartsAreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Chart Type Selection */}
        <div className="space-y-4">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Visualization Type
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {chartTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Button
                    key={type.id}
                    variant={chartType === type.id ? "default" : "ghost"}
                    className={`w-full justify-start h-auto p-3 ${
                      chartType === type.id
                        ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                        : "text-slate-300 hover:bg-slate-700"
                    }`}
                    onClick={() => handleChartTypeChange(type.id)}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="h-5 w-5 mt-0.5 flex-shrink-0" />
                      <div className="text-left">
                        <div className="font-medium">{type.name}</div>
                        <div className="text-xs opacity-70">
                          {type.description}
                        </div>
                      </div>
                    </div>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* Chart Options */}
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Display Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white">Show Legend</Label>
                <Switch checked={showLegend} onCheckedChange={setShowLegend} />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm text-white">Show Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visualization */}
        <div className="lg:col-span-3">
          {/* Field Configuration */}
          {chartType !== "table" && (
            <Card className="bg-slate-800/50 border-slate-700 mb-4">
              <CardHeader className="pb-4">
                <CardTitle className="text-white flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  {chartType === "map"
                    ? "Map Configuration"
                    : "Field Configuration"}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderFieldConfiguration()}</CardContent>
            </Card>
          )}

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-white flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  {title || "Visualization Preview"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRefresh}
                    className="text-slate-400 hover:text-white"
                    title="Reset to defaults"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    title="Download chart"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-slate-400 hover:text-white"
                    title="View code"
                  >
                    <Code className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-900/50 rounded-lg p-4">
                {renderChart()}
              </div>

              {/* Data Summary */}
              <div className="mt-4 pt-4 border-t border-slate-700">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4 text-slate-400">
                    <span>{data.length} rows</span>
                    <span>•</span>
                    <span>{fields.length} columns</span>
                    <span>•</span>
                    <span>{numericFields.length} numeric fields</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-600 text-slate-300"
                    >
                      {chartType}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs border-slate-600 text-slate-300"
                    >
                      {colorScheme}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Query Section */}
          <Card className="bg-slate-800/50 border-slate-700 mt-4 h-[180px]">
            <CardHeader className="py-4 mb-4">
              <CardTitle className="text-white flex items-center gap-2">
                <Save className="h-5 w-5" />
                Save Query Configuration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSaveQuery}
                className="flex flex-col lg:flex-row items-start lg:items-end gap-4"
              >
                <div className="w-full lg:w-1/3 space-y-2">
                  <div className="mb-2">
                    <Label className="text-sm font-medium text-white">
                      Query Name *
                    </Label>
                  </div>
                  <input
                    type="text"
                    value={queryName}
                    onChange={(e) => setQueryName(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Enter query name"
                    required
                  />
                </div>
                <div className="w-full lg:w-1/2 space-y-2">
                  <div className="mb-2">
                    <Label className="text-sm font-medium text-white">
                      Description
                    </Label>
                  </div>
                  <input
                    type="text"
                    value={queryDescription}
                    onChange={(e) => setQueryDescription(e.target.value)}
                    className="w-full bg-slate-700 text-white rounded px-3 py-2 border border-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    placeholder="Add description (optional)"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    className="bg-cyan-600 text-white hover:bg-cyan-700"
                  >
                    Save Query
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
