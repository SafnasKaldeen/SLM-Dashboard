"use client";

import { useState, useMemo, useEffect } from "react";
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
  Loader2,
  ShoppingCart,
} from "lucide-react";

interface AnalysisHistoryProps {
  onHistorySelect: (analysis: any) => void;
}

const mockHistoryData = [
  {
    id: "analysis_1",
    title: "Show me revenue by area for the last 6 months",
    subtitle: "Revenue Analysis",
    timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    executionTime: 1.45,
    rowCount: 10,
    status: "success",
    sql: "SELECT AREA, SUM(AMOUNT) as TOTAL_REVENUE FROM REVENUE_TRANSACTIONS...",
  },
  {
    id: "analysis_2",
    title: "Which stations have the highest utilization rates?",
    subtitle: "Station Performance",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    executionTime: 0.78,
    rowCount: 8,
    status: "success",
    sql: "SELECT STATION_NAME, COUNT(*) as TOTAL_SWAPS FROM STATIONS...",
  },
  {
    id: "analysis_3",
    title: "Show me batteries with health scores below 70%",
    subtitle: "Battery Health",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    executionTime: 0.67,
    rowCount: 8,
    status: "success",
    sql: "SELECT BATTERY_ID, HEALTH_SCORE FROM BATTERY_HEALTH WHERE...",
  },
  {
    id: "analysis_4",
    title: "Show hourly usage patterns throughout the day",
    subtitle: "Usage Patterns",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    executionTime: 0.45,
    rowCount: 18,
    status: "success",
    sql: "SELECT EXTRACT(HOUR FROM TIMESTAMP) as HOUR, COUNT(*) FROM...",
  },
  {
    id: "analysis_5",
    title: "Compare revenue trends across different areas",
    subtitle: "Revenue Analysis",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    executionTime: 1.23,
    rowCount: 15,
    status: "success",
    sql: "SELECT AREA, DATE_TRUNC('month', TIMESTAMP) as MONTH, SUM(AMOUNT)...",
  },
  {
    id: "analysis_6",
    title: "Find stations that need maintenance",
    subtitle: "Station Performance",
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    executionTime: 0.89,
    rowCount: 5,
    status: "success",
    sql: "SELECT STATION_ID, LAST_MAINTENANCE, STATUS FROM STATIONS WHERE...",
  },
  {
    id: "analysis_7",
    title: "What's the average revenue per battery swap?",
    subtitle: "Revenue Analysis",
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    executionTime: 0.32,
    rowCount: 1,
    status: "success",
    sql: "SELECT AVG(AMOUNT) as AVG_REVENUE FROM REVENUE_TRANSACTIONS...",
  },
  {
    id: "analysis_8",
    title: "Battery health distribution across the fleet",
    subtitle: "Battery Health",
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

// Loading skeleton components
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
      <div
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-cyan-400 rounded-full animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      />
    </div>

    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <Database className="h-5 w-5 text-cyan-400 animate-pulse" />
        <h3 className="text-lg font-medium text-white">
          Loading Query History
        </h3>
      </div>
      <div className="text-m text-slate-400 space-y-1">
        <p className="m-10 animate-pulse">Fetching your analysis history...</p>
        <div className="flex items-center justify-center gap-1">
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  </div>
);

export function AnalysisHistory({ onHistorySelect }: AnalysisHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedTimeFilter, setSelectedTimeFilter] = useState("all");
  const [mongoHistory, setMongoHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track IDs currently being deleted
  const [deletingIds, setDeletingIds] = useState<string[]>([]);

  // Fetch data from Mongo API endpoint
  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          "/api/query-history?connectionId=bss_demo_warehouse"
        );
        if (!res.ok) throw new Error("Failed to fetch query history");
        const data = await res.json();

        const processed = data.map((item: any) => ({
          ...item,
          timestamp: item.timestamp ? new Date(item.timestamp) : new Date(),
        }));

        setMongoHistory(processed);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  // Combine mock data + fetched Mongo data
  const combinedHistory = useMemo(() => {
    return [...mongoHistory, ...mockHistoryData];
  }, [mongoHistory]);

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

  const getCategoryIcon = (subtitle: string) => {
    switch (subtitle) {
      case "Revenue Analysis":
        return <TrendingUp className="h-4 w-4 text-green-400" />;
      case "Station Performance":
        return <Database className="h-4 w-4 text-blue-400" />;
      case "Battery Health":
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case "Usage Patterns":
        return <BarChart3 className="h-4 w-4 text-purple-400" />;
      case "E-Commerce Insights":
        return <ShoppingCart className="h-4 w-4 text-pink-400" />;
      default:
        return <History className="h-4 w-4 text-slate-400" />;
    }
  };

  const filteredHistory = useMemo(() => {
    let filtered = combinedHistory;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.query?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.subtitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.title?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== "All Categories") {
      filtered = filtered.filter((item) => item.subtitle === selectedCategory);
    }

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
          (item) =>
            now.getTime() - new Date(item.timestamp).getTime() <= filterTime
        );
      }
    }

    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [combinedHistory, searchTerm, selectedCategory, selectedTimeFilter]);

  const handleQueryRerun = (analysis: any) => {
    onHistorySelect(analysis);
  };

  // DELETE handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this query history?")) return;

    try {
      setDeletingIds((ids) => [...ids, id]);
      const res = await fetch(`/api/query-history/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete");
      }

      // Remove the deleted item from mongoHistory only (don't remove mock data)
      setMongoHistory((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(`Error deleting item: ${err.message}`);
    } finally {
      setDeletingIds((ids) => ids.filter((deleteId) => deleteId !== id));
    }
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
                  disabled={loading}
                />
              </div>

              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                disabled={loading}
              >
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  {categories.map((subtitle) => (
                    <SelectItem
                      key={subtitle}
                      value={subtitle}
                      className="text-white hover:bg-slate-700"
                    >
                      {subtitle}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={selectedTimeFilter}
                onValueChange={setSelectedTimeFilter}
                disabled={loading}
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

            <div className="text-sm text-slate-400 flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {loading
                ? "Loading..."
                : error
                ? `Error: ${error}`
                : `${filteredHistory.length} ${
                    filteredHistory.length === 1 ? "query" : "queries"
                  } found`}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History List */}
      {loading ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <LoadingSpinner />
          </CardContent>
        </Card>
      ) : error ? (
        <div className="text-center text-red-500 py-10">{error}</div>
      ) : filteredHistory.length === 0 ? (
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
                      {getCategoryIcon(analysis.subtitle)}
                      <div className="flex-1">
                        <h4 className="font-medium text-white mb-1">
                          {analysis.title}
                        </h4>
                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          <Badge
                            variant="outline"
                            className="text-xs border-slate-600 text-slate-300"
                          >
                            {analysis.subtitle}
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
                        {analysis.sql?.length > 100
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
                      onClick={() => handleDelete(analysis.id)}
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
                {combinedHistory.length}
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
                {combinedHistory.length
                  ? (
                      combinedHistory.reduce(
                        (sum, item) => sum + (item.executionTime || 0),
                        0
                      ) / combinedHistory.length
                    ).toFixed(2)
                  : 0}
                s
              </p>
              <p className="text-sm text-slate-400">Avg Execution</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {combinedHistory.reduce(
                  (sum, item) => sum + (item.rowCount || 0),
                  0
                )}
              </p>
              <p className="text-sm text-slate-400">Total Rows</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
