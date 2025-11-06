"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  History,
  Search,
  Filter,
  Play,
  Trash2,
  Clock,
  BarChart3,
  TrendingUp,
  Database,
  Zap,
  Calendar,
  ChevronRight,
} from "lucide-react";

interface AnalysisHistoryProps {
  onHistorySelect: (analysis: any) => void;
}

const mockHistoryData = [
  {
    id: "analysis_1",
    query: "Show me revenue by area for the last 6 months",
    category: "Revenue Analysis",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    executionTime: 1.45,
    rowCount: 10,
    status: "success",
    sql: "SELECT AREA, SUM(AMOUNT) as TOTAL_REVENUE FROM REVENUE_TRANSACTIONS...",
  },
  {
    id: "analysis_2",
    query: "Which stations have the highest utilization rates?",
    category: "Station Performance",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    executionTime: 0.78,
    rowCount: 8,
    status: "success",
    sql: "SELECT STATION_NAME, COUNT(*) as TOTAL_SWAPS FROM STATIONS...",
  },
  {
    id: "analysis_3",
    query: "Show me batteries with health scores below 70%",
    category: "Battery Health",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    executionTime: 0.67,
    rowCount: 8,
    status: "success",
    sql: "SELECT BATTERY_ID, HEALTH_SCORE FROM BATTERY_HEALTH WHERE...",
  },
  {
    id: "analysis_4",
    query: "Show hourly usage patterns throughout the day",
    category: "Usage Patterns",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    executionTime: 0.45,
    rowCount: 18,
    status: "success",
    sql: "SELECT EXTRACT(HOUR FROM TIMESTAMP) as HOUR, COUNT(*) FROM...",
  },
  {
    id: "analysis_5",
    query: "Compare revenue trends across different areas",
    category: "Revenue Analysis",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    executionTime: 1.23,
    rowCount: 15,
    status: "success",
    sql: "SELECT AREA, DATE_TRUNC('month', TIMESTAMP) as MONTH, SUM(AMOUNT)...",
  },
  {
    id: "analysis_6",
    query: "Find stations that need maintenance",
    category: "Station Performance",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    executionTime: 0.89,
    rowCount: 5,
    status: "success",
    sql: "SELECT STATION_ID, LAST_MAINTENANCE, STATUS FROM STATIONS WHERE...",
  },
  {
    id: "analysis_7",
    query: "What's the average revenue per battery swap?",
    category: "Revenue Analysis",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    executionTime: 0.32,
    rowCount: 1,
    status: "success",
    sql: "SELECT AVG(AMOUNT) as AVG_REVENUE FROM REVENUE_TRANSACTIONS...",
  },
  {
    id: "analysis_8",
    query: "Battery health distribution across the fleet",
    category: "Battery Health",
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 1 week ago
    executionTime: 1.12,
    rowCount: 12,
    status: "success",
    sql: "SELECT HEALTH_SCORE_RANGE, COUNT(*) FROM BATTERY_HEALTH GROUP BY...",
  },
];

const categories = [
  "All Categories",
  "Revenue Analysis",
  "Station Performance",
  "Battery Health",
  "Usage Patterns",
];

const timeFilters = [
  { label: "All Time", value: "all" },
  { label: "Last Hour", value: "1h" },
  { label: "Last 24 Hours", value: "24h" },
  { label: "Last Week", value: "7d" },
  { label: "Last Month", value: "30d" },
];

export function AnalysisHistory({ onHistorySelect }: AnalysisHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - timestamp.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;

    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks}w ago`;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Revenue Analysis":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "Station Performance":
        return <Database className="h-4 w-4 text-blue-400" />;
      case "Battery Health":
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case "Usage Patterns":
        return <BarChart3 className="h-4 w-4 text-purple-400" />;
      default:
        return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredHistory = useMemo(() => {
    let filtered = mockHistoryData;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.query.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by time
    if (selectedTimeFilter !== "all") {
      const now = new Date();
      const filterTime = {
        "1h": 60 * 60 * 1000,
        "24h": 24 * 60 * 60 * 1000,
        "7d": 7 * 24 * 60 * 60 * 1000,
        "30d": 30 * 24 * 60 * 60 * 1000,
      }[selectedTimeFilter];

      if (filterTime) {
        filtered = filtered.filter(
          (item) => now.getTime() - item.timestamp.getTime() <= filterTime
        );
      }
    }

    return filtered.sort(
      (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [searchTerm, selectedCategory, selectedTimeFilter]);

  const handleQueryRerun = (analysis: any) => {
    onHistorySelect(analysis);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <History className="h-5 w-5" />
            Analysis History
          </CardTitle>
          <CardDescription className="text-slate-400">
            View and rerun your previous queries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search queries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((category) => (
                    <SelectItem
                      key={category}
                      value={category}
                      className="text-white hover:bg-slate-700"
                    >
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTimeFilter}
                onValueChange={setSelectedTimeFilter}
              >
                <SelectTrigger className="w-40 bg-slate-700 border-slate-600 text-white">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {timeFilters.map((filter) => (
                    <SelectItem
                      key={filter.value}
                      value={filter.value}
                      className="text-white hover:bg-slate-700"
                    >
                      {filter.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="text-sm text-slate-400">
              {filteredHistory.length}{" "}
              {filteredHistory.length === 1 ? "query" : "queries"} found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">
              No queries found
            </h3>
            <p className="text-slate-400">
              {searchTerm ||
              selectedCategory !== "All Categories" ||
              selectedTimeFilter !== "all"
                ? "Try adjusting your filters to see more results"
                : "Start by running some queries to build your analysis history"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredHistory.map((analysis) => (
            <Card
              key={analysis.id}
              className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-colors"
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-3">
                      {getCategoryIcon(analysis.category)}
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">
                          {analysis.query}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <Badge
                            variant="outline"
                            className="text-xs border-slate-600 text-slate-300"
                          >
                            {analysis.category}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(analysis.timestamp)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Database className="h-3 w-3" />
                            {analysis.rowCount} rows
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {analysis.executionTime}s
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-900/50 p-3 rounded-lg">
                      <p className="text-xs text-slate-400 mb-1">
                        Generated SQL:
                      </p>
                      <code className="text-xs text-cyan-400 font-mono">
                        {analysis.sql.length > 100
                          ? `${analysis.sql.substring(0, 100)}...`
                          : analysis.sql}
                      </code>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQueryRerun(analysis)}
                      className="text-cyan-400 hover:text-cyan-300 hover:bg-slate-700"
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Rerun
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-red-400 hover:bg-slate-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="h-4 w-4 text-slate-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-white">
                {mockHistoryData.length}
              </p>
              <p className="text-sm text-slate-400">Total Queries</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {categories.length - 1}
              </p>
              <p className="text-sm text-slate-400">Categories</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {(
                  mockHistoryData.reduce(
                    (sum, item) => sum + item.executionTime,
                    0
                  ) / mockHistoryData.length
                ).toFixed(2)}
                s
              </p>
              <p className="text-sm text-slate-400">Avg Execution</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {mockHistoryData.reduce((sum, item) => sum + item.rowCount, 0)}
              </p>
              <p className="text-sm text-slate-400">Total Rows</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
