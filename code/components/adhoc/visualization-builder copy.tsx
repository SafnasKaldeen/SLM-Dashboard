"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  BarChart3,
  LineChart,
  PieChart,
  ScatterChart,
  TrendingUp,
  Save,
  Download,
  Palette,
  Activity,
  AlertTriangle,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart as RechartsLineChart,
  Line,
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface QueryResult {
  columns: string[];
  data: any[];
  executionTime: number;
  rowCount: number;
}

interface VisualizationBuilderProps {
  queryResult: QueryResult;
  query: string;
  onAnalysisSave: (analysis: any) => void;
}

interface FieldInfo {
  name: string;
  type: "numeric" | "text" | "date" | "coordinate";
  sampleValues: any[];
}

interface ChartConfig {
  xAxis?: string;
  yAxis?: string;
  groupBy?: string;
  colorBy?: string;
}

const chartTypes = [
  {
    id: "bar",
    name: "Bar Chart",
    icon: BarChart3,
    description: "Compare categories",
    requiredFields: ["xAxis", "yAxis"],
    optionalFields: ["groupBy"],
  },
  {
    id: "line",
    name: "Line Chart",
    icon: LineChart,
    description: "Show trends over time",
    requiredFields: ["xAxis", "yAxis"],
    optionalFields: ["groupBy"],
  },
  {
    id: "area",
    name: "Area Chart",
    icon: TrendingUp,
    description: "Show cumulative trends",
    requiredFields: ["xAxis", "yAxis"],
    optionalFields: ["groupBy"],
  },
  {
    id: "pie",
    name: "Pie Chart",
    icon: PieChart,
    description: "Show proportions",
    requiredFields: ["xAxis", "yAxis"],
    optionalFields: [],
  },
  {
    id: "scatter",
    name: "Scatter Plot",
    icon: ScatterChart,
    description: "Show correlations",
    requiredFields: ["xAxis", "yAxis"],
    optionalFields: ["colorBy"],
  },
];

const COLORS = [
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

export function VisualizationBuilder({
  queryResult,
  query,
  onAnalysisSave,
}: VisualizationBuilderProps) {
  const [selectedChartType, setSelectedChartType] = useState("bar");
  const [chartConfig, setChartConfig] = useState<ChartConfig>({});
  const [analysisName, setAnalysisName] = useState("");
  const [analysisDescription, setAnalysisDescription] = useState("");

  // Check if queryResult is valid
  if (
    !queryResult ||
    !queryResult.columns ||
    !Array.isArray(queryResult.data)
  ) {
    return (
      <div className="grid grid-cols-1 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center text-slate-400">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">Invalid Query Result</p>
              <p className="text-sm">
                The query result is missing required data. Please run a valid
                query first.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Analyze fields to determine their types
  const analyzeFields = (): FieldInfo[] => {
    if (
      !queryResult.columns ||
      !Array.isArray(queryResult.data) ||
      queryResult.data.length === 0
    ) {
      return (
        queryResult.columns?.map((column) => ({
          name: column,
          type: "text" as const,
          sampleValues: [],
        })) || []
      );
    }

    return queryResult.columns.map((column, index) => {
      const sampleValues = queryResult.data
        .slice(0, 5)
        .map((row) => {
          // Ensure row is an array and has the required index
          if (Array.isArray(row) && index < row.length) {
            return row[index];
          }
          return null;
        })
        .filter((val) => val !== null && val !== undefined);

      // Determine field type based on sample values
      let type: FieldInfo["type"] = "text";

      if (sampleValues.length > 0) {
        if (
          sampleValues.every(
            (val) => !isNaN(Number(val)) && val !== null && val !== ""
          )
        ) {
          type = "numeric";
        } else if (
          column.toLowerCase().includes("date") ||
          column.toLowerCase().includes("time")
        ) {
          type = "date";
        } else if (
          column.toLowerCase().includes("lat") ||
          column.toLowerCase().includes("lng") ||
          column.toLowerCase().includes("longitude") ||
          column.toLowerCase().includes("latitude")
        ) {
          type = "coordinate";
        }
      }

      return {
        name: column,
        type,
        sampleValues,
      };
    });
  };

  const fields = analyzeFields();
  const numericFields = fields.filter((f) => f.type === "numeric");
  const textFields = fields.filter((f) => f.type === "text");
  const dateFields = fields.filter((f) => f.type === "date");

  // Transform data for charts
  const getChartData = () => {
    if (!Array.isArray(queryResult.data) || queryResult.data.length === 0) {
      return [];
    }

    return queryResult.data.map((row, index) => {
      const obj: any = {};
      if (Array.isArray(row)) {
        queryResult.columns.forEach((col, colIndex) => {
          obj[col] = colIndex < row.length ? row[colIndex] : null;
        });
      }
      return obj;
    });
  };

  const chartData = getChartData();

  const renderChart = () => {
    const { xAxis, yAxis, groupBy, colorBy } = chartConfig;
    const selectedChart = chartTypes.find((t) => t.id === selectedChartType);

    if (!xAxis || !yAxis) {
      return (
        <div className="flex items-center justify-center h-80 text-slate-400">
          <div className="text-center">
            <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Configure Chart Fields</p>
            <p className="text-sm">
              {selectedChart
                ? `${
                    selectedChart.name
                  } requires: ${selectedChart.requiredFields.join(", ")}`
                : "Select fields to create visualization"}
            </p>
          </div>
        </div>
      );
    }

    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-80 text-slate-400">
          <div className="text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">No Data Available</p>
            <p className="text-sm">The query returned no data to visualize.</p>
          </div>
        </div>
      );
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
    };

    switch (selectedChartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxis} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              {groupBy && <Legend />}
              <Bar dataKey={yAxis} fill="#06B6D4" />
            </BarChart>
          </ResponsiveContainer>
        );

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsLineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxis} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              {groupBy && <Legend />}
              <Line
                type="monotone"
                dataKey={yAxis}
                stroke="#06B6D4"
                strokeWidth={2}
              />
            </RechartsLineChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxis} stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              {groupBy && <Legend />}
              <Area
                type="monotone"
                dataKey={yAxis}
                stroke="#06B6D4"
                fill="#06B6D4"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "pie":
        const pieData = chartData.map((item, index) => ({
          name: item[xAxis],
          value: Number(item[yAxis]) || 0,
          fill: COLORS[index % COLORS.length],
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <RechartsScatterChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey={xAxis} stroke="#9CA3AF" />
              <YAxis dataKey={yAxis} stroke="#9CA3AF" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                  color: "#F9FAFB",
                }}
              />
              <Scatter dataKey={yAxis} fill="#06B6D4" />
            </RechartsScatterChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  const getFieldOptions = (
    fieldType: "xAxis" | "yAxis" | "groupBy" | "colorBy"
  ) => {
    switch (fieldType) {
      case "xAxis":
        return selectedChartType === "pie"
          ? [...textFields, ...dateFields]
          : [...textFields, ...dateFields, ...numericFields];
      case "yAxis":
        return selectedChartType === "pie" ? numericFields : numericFields;
      case "groupBy":
      case "colorBy":
        return textFields;
      default:
        return fields;
    }
  };

  const handleSaveAnalysis = () => {
    const analysis = {
      id: `analysis_${Date.now()}`,
      name: analysisName || `Analysis ${new Date().toLocaleDateString()}`,
      description: analysisDescription,
      query,
      visualization: {
        type: selectedChartType,
        config: chartConfig,
      },
      createdAt: new Date(),
      tags: [],
      starred: false,
    };

    onAnalysisSave(analysis);

    // Reset form
    setAnalysisName("");
    setAnalysisDescription("");
  };

  const selectedChart = chartTypes.find((t) => t.id === selectedChartType);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Configuration Panel */}
      <div className="xl:col-span-1">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-lg">
              Visualization Config
            </CardTitle>
            <CardDescription className="text-slate-400">
              Configure your chart settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Chart Type Selection */}
            <div>
              <Label className="text-white text-sm font-medium mb-3 block">
                Chart Type
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {chartTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={
                        selectedChartType === type.id ? "default" : "ghost"
                      }
                      className={`justify-start h-auto p-3 ${
                        selectedChartType === type.id
                          ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                          : "hover:bg-slate-700 text-slate-300"
                      }`}
                      onClick={() => setSelectedChartType(type.id)}
                    >
                      <Icon className="h-4 w-4 mr-3" />
                      <div className="text-left">
                        <div className="text-sm font-medium">{type.name}</div>
                        <div className="text-xs opacity-70">
                          {type.description}
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Field Configuration */}
            <div className="space-y-4">
              <div>
                <Label className="text-white text-sm font-medium">
                  X-Axis *
                </Label>
                <Select
                  value={chartConfig.xAxis || ""}
                  onValueChange={(value) =>
                    setChartConfig((prev) => ({ ...prev, xAxis: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {getFieldOptions("xAxis").map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {field.type}
                          </Badge>
                          {field.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-white text-sm font-medium">
                  Y-Axis *
                </Label>
                <Select
                  value={chartConfig.yAxis || ""}
                  onValueChange={(value) =>
                    setChartConfig((prev) => ({ ...prev, yAxis: value }))
                  }
                >
                  <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {getFieldOptions("yAxis").map((field) => (
                      <SelectItem key={field.name} value={field.name}>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {field.type}
                          </Badge>
                          {field.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedChart &&
                selectedChart.optionalFields.includes("groupBy") && (
                  <div>
                    <Label className="text-white text-sm font-medium">
                      Group By
                    </Label>
                    <Select
                      value={chartConfig.groupBy || ""}
                      onValueChange={(value) =>
                        setChartConfig((prev) => ({ ...prev, groupBy: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select field (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {getFieldOptions("groupBy").map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                              {field.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

              {selectedChart &&
                selectedChart.optionalFields.includes("colorBy") && (
                  <div>
                    <Label className="text-white text-sm font-medium">
                      Color By
                    </Label>
                    <Select
                      value={chartConfig.colorBy || ""}
                      onValueChange={(value) =>
                        setChartConfig((prev) => ({ ...prev, colorBy: value }))
                      }
                    >
                      <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                        <SelectValue placeholder="Select field (optional)" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {getFieldOptions("colorBy").map((field) => (
                          <SelectItem key={field.name} value={field.name}>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {field.type}
                              </Badge>
                              {field.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
            </div>

            {/* Save Analysis */}
            <div className="pt-4 border-t border-slate-600">
              <div className="space-y-3">
                <div>
                  <Label className="text-white text-sm font-medium">
                    Analysis Name
                  </Label>
                  <Input
                    placeholder="My Analysis"
                    value={analysisName}
                    onChange={(e) => setAnalysisName(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-white text-sm font-medium">
                    Description
                  </Label>
                  <Input
                    placeholder="Brief description..."
                    value={analysisDescription}
                    onChange={(e) => setAnalysisDescription(e.target.value)}
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleSaveAnalysis}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-slate-600 bg-transparent text-slate-300"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visualization Panel */}
      <div className="xl:col-span-3">
        <Tabs defaultValue="chart" className="w-full">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="chart"
              className="data-[state=active]:bg-slate-700"
            >
              Chart
            </TabsTrigger>
            <TabsTrigger
              value="data"
              className="data-[state=active]:bg-slate-700"
            >
              Data Preview
            </TabsTrigger>
            <TabsTrigger
              value="fields"
              className="data-[state=active]:bg-slate-700"
            >
              Field Analysis
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white text-lg">
                      {chartTypes.find((t) => t.id === selectedChartType)
                        ?.name || "Visualization"}
                    </CardTitle>
                    <CardDescription className="text-slate-400">
                      {queryResult.rowCount} rows • {queryResult.executionTime}s
                      execution time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-cyan-400" />
                    <span className="text-sm text-slate-300">Live Preview</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>{renderChart()}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="data" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg">
                  Data Preview
                </CardTitle>
                <CardDescription className="text-slate-400">
                  First 10 rows of {queryResult.rowCount} total rows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-600">
                          {queryResult.columns?.map((column) => (
                            <th
                              key={column}
                              className="text-left p-3 text-white font-medium"
                            >
                              {column}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {queryResult.data?.slice(0, 10).map((row, index) => (
                          <tr key={index} className="border-b border-slate-700">
                            {Array.isArray(row) &&
                              row.map((cell: any, cellIndex: number) => (
                                <td
                                  key={cellIndex}
                                  className="p-3 text-slate-300"
                                >
                                  {cell}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="fields" className="mt-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-4">
                <CardTitle className="text-white text-lg">
                  Field Analysis
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Automatic field type detection and sample values
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fields.map((field) => (
                    <div
                      key={field.name}
                      className="p-4 bg-slate-700/50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-white">{field.name}</h3>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            field.type === "numeric"
                              ? "text-green-400 border-green-400/30"
                              : field.type === "date"
                              ? "text-blue-400 border-blue-400/30"
                              : field.type === "coordinate"
                              ? "text-purple-400 border-purple-400/30"
                              : "text-slate-400 border-slate-400/30"
                          }`}
                        >
                          {field.type}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400">
                        <div className="mb-2 font-medium">Sample values:</div>
                        <div className="space-y-1">
                          {field.sampleValues
                            .slice(0, 3)
                            .map((value, index) => (
                              <div
                                key={index}
                                className="bg-slate-800 px-2 py-1 rounded text-xs font-mono"
                              >
                                {String(value)}
                              </div>
                            ))}
                          {field.sampleValues.length === 0 && (
                            <div className="bg-slate-800 px-2 py-1 rounded text-xs font-mono text-slate-500">
                              No sample data available
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
