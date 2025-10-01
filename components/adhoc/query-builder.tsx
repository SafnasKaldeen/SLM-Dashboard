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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  History,
  Table,
  Clock,
  Database,
  Loader2,
  Zap,
} from "lucide-react";

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  tables: any[];
}

interface QueryResult {
  columns: string[];
  data: any[];
  executionTime: number;
  rowCount: number;
}

interface QueryBuilderProps {
  connection: DatabaseConnection;
  onQueryExecute: (query: string, result: QueryResult) => void;
}

// Mock BSS data for query results
const mockBSSData = {
  BSS_SWAPS: [
    {
      SWAP_ID: 1,
      STATION_ID: "ST001",
      CUSTOMER_ID: "CUST001",
      SWAP_DATE: "2024-01-15",
      REVENUE: 8.5,
      AREA: "Downtown",
      LATITUDE: 40.7128,
      LONGITUDE: -74.006,
    },
    {
      SWAP_ID: 2,
      STATION_ID: "ST002",
      CUSTOMER_ID: "CUST002",
      SWAP_DATE: "2024-01-15",
      REVENUE: 8.5,
      AREA: "University District",
      LATITUDE: 40.7589,
      LONGITUDE: -73.9851,
    },
    {
      SWAP_ID: 3,
      STATION_ID: "ST003",
      CUSTOMER_ID: "CUST003",
      SWAP_DATE: "2024-01-16",
      REVENUE: 8.5,
      AREA: "Business District",
      LATITUDE: 40.7505,
      LONGITUDE: -73.9934,
    },
  ],
  BSS_STATIONS: [
    {
      STATION_ID: "ST001",
      STATION_NAME: "Downtown Hub",
      AREA: "Downtown",
      LATITUDE: 40.7128,
      LONGITUDE: -74.006,
      CAPACITY: 20,
      MONTHLY_RENT: 2500.0,
    },
    {
      STATION_ID: "ST002",
      STATION_NAME: "University Station",
      AREA: "University District",
      LATITUDE: 40.7589,
      LONGITUDE: -73.9851,
      CAPACITY: 15,
      MONTHLY_RENT: 2000.0,
    },
    {
      STATION_ID: "ST003",
      STATION_NAME: "Business Center",
      AREA: "Business District",
      LATITUDE: 40.7505,
      LONGITUDE: -73.9934,
      CAPACITY: 25,
      MONTHLY_RENT: 3000.0,
    },
  ],
};

export function QueryBuilder({
  connection,
  onQueryExecute,
}: QueryBuilderProps) {
  const [query, setQuery] = useState("");
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryHistory, setQueryHistory] = useState<
    Array<{
      query: string;
      timestamp: Date;
      executionTime: number;
    }>
  >([]);

  const sampleQueries = [
    {
      name: "Total Revenue by Area",
      query: `SELECT 
  AREA,
  COUNT(*) as TOTAL_SWAPS,
  SUM(REVENUE) as TOTAL_REVENUE,
  AVG(REVENUE) as AVG_REVENUE
FROM BSS_SWAPS 
GROUP BY AREA 
ORDER BY TOTAL_REVENUE DESC`,
    },
    {
      name: "Station Performance",
      query: `SELECT 
  s.STATION_NAME,
  s.AREA,
  COUNT(sw.SWAP_ID) as TOTAL_SWAPS,
  SUM(sw.REVENUE) as TOTAL_REVENUE,
  s.MONTHLY_RENT,
  (SUM(sw.REVENUE) - s.MONTHLY_RENT) as NET_PROFIT
FROM BSS_STATIONS s
LEFT JOIN BSS_SWAPS sw ON s.STATION_ID = sw.STATION_ID
GROUP BY s.STATION_ID, s.STATION_NAME, s.AREA, s.MONTHLY_RENT
ORDER BY NET_PROFIT DESC`,
    },
    {
      name: "Geographic Analysis",
      query: `SELECT 
  AREA,
  AVG(LATITUDE) as CENTER_LAT,
  AVG(LONGITUDE) as CENTER_LNG,
  COUNT(*) as SWAP_COUNT,
  SUM(REVENUE) as AREA_REVENUE
FROM BSS_SWAPS 
GROUP BY AREA`,
    },
  ];

  const handleExecuteQuery = async () => {
    if (!query.trim()) return;

    setIsExecuting(true);

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Mock query result based on query content
    let mockResult: QueryResult;

    if (query.toLowerCase().includes("group by area")) {
      mockResult = {
        columns: ["AREA", "TOTAL_SWAPS", "TOTAL_REVENUE", "AVG_REVENUE"],
        data: [
          ["Downtown", 1250, 10625.0, 8.5],
          ["University District", 890, 7565.0, 8.5],
          ["Business District", 1100, 9350.0, 8.5],
        ],
        executionTime: 1.23,
        rowCount: 3,
      };
    } else if (query.toLowerCase().includes("station_name")) {
      mockResult = {
        columns: [
          "STATION_NAME",
          "AREA",
          "TOTAL_SWAPS",
          "TOTAL_REVENUE",
          "MONTHLY_RENT",
          "NET_PROFIT",
        ],
        data: [
          ["Downtown Hub", "Downtown", 1250, 10625.0, 2500.0, 8125.0],
          [
            "Business Center",
            "Business District",
            1100,
            9350.0,
            3000.0,
            6350.0,
          ],
          [
            "University Station",
            "University District",
            890,
            7565.0,
            2000.0,
            5565.0,
          ],
        ],
        executionTime: 1.45,
        rowCount: 3,
      };
    } else if (
      query.toLowerCase().includes("latitude") &&
      query.toLowerCase().includes("longitude")
    ) {
      mockResult = {
        columns: [
          "AREA",
          "CENTER_LAT",
          "CENTER_LNG",
          "SWAP_COUNT",
          "AREA_REVENUE",
        ],
        data: [
          ["Downtown", 40.7128, -74.006, 1250, 10625.0],
          ["University District", 40.7589, -73.9851, 890, 7565.0],
          ["Business District", 40.7505, -73.9934, 1100, 9350.0],
        ],
        executionTime: 0.89,
        rowCount: 3,
      };
    } else {
      // Default result for any other query
      mockResult = {
        columns: Object.keys(mockBSSData.BSS_SWAPS[0]),
        data: mockBSSData.BSS_SWAPS.map((row) => Object.values(row)),
        executionTime: 0.67,
        rowCount: mockBSSData.BSS_SWAPS.length,
      };
    }

    // Add to history
    setQueryHistory((prev) => [
      {
        query,
        timestamp: new Date(),
        executionTime: mockResult.executionTime,
      },
      ...prev.slice(0, 9),
    ]);

    setIsExecuting(false);
    onQueryExecute(query, mockResult);
  };

  const insertSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Query Editor */}
      <div className="xl:col-span-3">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white text-lg">
                  SQL Query Editor
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Write and execute SQL queries against {connection.name}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-sm text-slate-300">Live Editor</span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="SELECT * FROM BSS_SWAPS WHERE AREA = 'Downtown'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-[300px] font-mono bg-slate-700 border-slate-600 text-white resize-none"
            />
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">
                  Connected to {connection.name}
                </span>
                <Badge
                  variant="outline"
                  className="text-xs text-green-400 border-green-400/30"
                >
                  Active
                </Badge>
              </div>
              <Button
                onClick={handleExecuteQuery}
                disabled={!query.trim() || isExecuting}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isExecuting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Play className="h-4 w-4 mr-2" />
                )}
                {isExecuting ? "Executing..." : "Execute Query"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="xl:col-span-1 space-y-6">
        {/* Sample Queries */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-sm">Sample Queries</CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Click to insert into editor
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {sampleQueries.map((sample, index) => (
              <Button
                key={index}
                variant="ghost"
                className="w-full justify-start text-left h-auto p-3 hover:bg-slate-700"
                onClick={() => insertSampleQuery(sample.query)}
              >
                <div>
                  <div className="font-medium text-white text-sm">
                    {sample.name}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 truncate">
                    {sample.query.split("\n")[0]}...
                  </div>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Tables */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-sm">
              Available Tables
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs">
              Click to query table
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {connection.tables.map((table) => (
                  <div
                    key={table.name}
                    className="p-3 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() =>
                      setQuery(`SELECT * FROM ${table.name} LIMIT 10`)
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Table className="h-4 w-4 text-cyan-400" />
                      <span className="text-white text-sm font-medium">
                        {table.name}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {table.rowCount} rows
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Query History */}
        {queryHistory.length > 0 && (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-white text-sm flex items-center gap-2">
                <History className="h-4 w-4" />
                Query History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-2">
                  {queryHistory.map((item, index) => (
                    <div
                      key={index}
                      className="p-2 bg-slate-700/50 rounded cursor-pointer hover:bg-slate-700 transition-colors"
                      onClick={() => setQuery(item.query)}
                    >
                      <div className="text-xs text-slate-400 mb-1 flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        {item.timestamp.toLocaleTimeString()}
                        <Badge variant="outline" className="text-xs">
                          {item.executionTime}s
                        </Badge>
                      </div>
                      <div className="text-sm text-white truncate">
                        {item.query.split("\n")[0]}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
