"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Send,
  Loader2,
  Database,
  Zap,
  TrendingUp,
  DollarSign,
  Clock,
  MapPin,
  Battery,
  Lightbulb,
  Star,
} from "lucide-react";

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected";
  lastConnected: Date;
  tables: any[];
  config: Record<string, string>;
}

interface QueryResult {
  columns: string[];
  data: any[][];
  executionTime: number;
  rowCount: number;
}

interface AIQueryBuilderProps {
  connection: DatabaseConnection;
  onQueryExecute: (query: string, result: QueryResult) => void;
}

const SAMPLE_QUERIES = [
  {
    category: "Revenue Analysis",
    icon: DollarSign,
    color: "text-green-400",
    queries: [
      {
        text: "Show me the top 5 stations by revenue this month",
        sql: "SELECT station_name, SUM(revenue) as total_revenue FROM battery_swaps WHERE swap_date >= DATE_TRUNC('month', CURRENT_DATE) GROUP BY station_name ORDER BY total_revenue DESC LIMIT 5",
        description: "Identifies highest performing stations by revenue",
      },
      {
        text: "What's the revenue trend over the last 6 months?",
        sql: "SELECT DATE_TRUNC('month', swap_date) as month, SUM(revenue) as monthly_revenue FROM battery_swaps WHERE swap_date >= CURRENT_DATE - INTERVAL '6 months' GROUP BY month ORDER BY month",
        description: "Shows monthly revenue trends",
      },
      {
        text: "Compare revenue by area for this quarter",
        sql: "SELECT area, SUM(revenue) as total_revenue, COUNT(*) as swap_count FROM battery_swaps WHERE swap_date >= DATE_TRUNC('quarter', CURRENT_DATE) GROUP BY area ORDER BY total_revenue DESC",
        description: "Area-wise revenue comparison",
      },
    ],
  },
  {
    category: "Station Performance",
    icon: MapPin,
    color: "text-blue-400",
    queries: [
      {
        text: "Which stations have the highest utilization rates?",
        sql: "SELECT station_name, utilization_rate, capacity FROM stations ORDER BY utilization_rate DESC LIMIT 10",
        description: "Ranks stations by efficiency",
      },
      {
        text: "Show me stations with declining performance",
        sql: "SELECT station_id, station_name, AVG(swap_duration) as avg_duration FROM battery_swaps WHERE swap_date >= CURRENT_DATE - INTERVAL '30 days' GROUP BY station_id, station_name HAVING AVG(swap_duration) > 18 ORDER BY avg_duration DESC",
        description: "Identifies underperforming stations",
      },
      {
        text: "What's the average swap time by station?",
        sql: "SELECT station_name, AVG(swap_duration) as avg_swap_time, COUNT(*) as total_swaps FROM battery_swaps GROUP BY station_name ORDER BY avg_swap_time",
        description: "Station efficiency metrics",
      },
    ],
  },
  {
    category: "Battery Analytics",
    icon: Battery,
    color: "text-yellow-400",
    queries: [
      {
        text: "Show battery health distribution across stations",
        sql: "SELECT station_name, AVG(battery_health) as avg_health, COUNT(*) as swap_count FROM battery_swaps GROUP BY station_name ORDER BY avg_health DESC",
        description: "Battery condition analysis",
      },
      {
        text: "Which batteries need replacement soon?",
        sql: "SELECT station_name, battery_health FROM battery_swaps WHERE battery_health < 85 AND swap_date >= CURRENT_DATE - INTERVAL '7 days' ORDER BY battery_health ASC",
        description: "Maintenance planning",
      },
    ],
  },
  {
    category: "Operational Insights",
    icon: TrendingUp,
    color: "text-purple-400",
    queries: [
      {
        text: "What are the peak hours for battery swaps?",
        sql: "SELECT EXTRACT(hour FROM swap_time) as hour, COUNT(*) as swap_count FROM battery_swaps GROUP BY hour ORDER BY swap_count DESC",
        description: "Identifies busy periods",
      },
      {
        text: "Show me the busiest days of the week",
        sql: "SELECT EXTRACT(dow FROM swap_date) as day_of_week, COUNT(*) as swap_count FROM battery_swaps GROUP BY day_of_week ORDER BY swap_count DESC",
        description: "Weekly pattern analysis",
      },
    ],
  },
];

const MOCK_RESPONSES = {
  revenue:
    "Based on the data, I can see that Station Alpha leads with $12,450 in revenue this month, followed by Station Beta at $9,800. The revenue trend shows a 15% increase compared to last month, primarily driven by increased utilization during peak hours.",
  performance:
    "The analysis reveals that Station Alpha has the highest utilization rate at 87%, while Station Gamma shows declining performance with an average swap time of 22 minutes, which is above the optimal 15-minute target.",
  battery:
    "Battery health analysis shows that 85% of batteries are in good condition (>90% health). However, 12 batteries across 3 stations are showing health below 85% and should be scheduled for replacement within the next 2 weeks.",
  operational:
    "Peak swap hours are between 8-10 AM and 6-8 PM, accounting for 45% of daily swaps. Tuesday and Wednesday are the busiest days with 18% higher activity than weekends.",
};

export default function AIQueryBuilder({
  connection,
  onQueryExecute,
}: AIQueryBuilderProps) {
  const [query, setQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const generateMockData = (sqlQuery: string): QueryResult => {
    // Generate realistic mock data based on SQL query patterns
    if (sqlQuery.toLowerCase().includes("revenue")) {
      return {
        columns: ["station_name", "total_revenue", "swap_count"],
        data: [
          ["Station Alpha", 12450, 156],
          ["Station Beta", 9800, 124],
          ["Station Gamma", 8750, 98],
          ["Station Delta", 7200, 89],
          ["Station Epsilon", 6500, 76],
        ],
        executionTime: 0.15,
        rowCount: 5,
      };
    } else if (
      sqlQuery.toLowerCase().includes("utilization") ||
      sqlQuery.toLowerCase().includes("performance")
    ) {
      return {
        columns: [
          "station_name",
          "utilization_rate",
          "avg_swap_time",
          "capacity",
        ],
        data: [
          ["Station Alpha", 87.5, 14.2, 50],
          ["Station Beta", 82.1, 15.8, 45],
          ["Station Gamma", 76.3, 22.1, 40],
          ["Station Delta", 71.8, 18.5, 35],
          ["Station Epsilon", 69.2, 19.3, 30],
        ],
        executionTime: 0.12,
        rowCount: 5,
      };
    } else if (
      sqlQuery.toLowerCase().includes("battery") ||
      sqlQuery.toLowerCase().includes("health")
    ) {
      return {
        columns: [
          "station_name",
          "avg_health",
          "batteries_below_85",
          "total_batteries",
        ],
        data: [
          ["Station Alpha", 92.3, 2, 25],
          ["Station Beta", 89.7, 3, 22],
          ["Station Gamma", 87.1, 5, 20],
          ["Station Delta", 91.5, 1, 18],
          ["Station Epsilon", 88.9, 4, 15],
        ],
        executionTime: 0.18,
        rowCount: 5,
      };
    } else if (
      sqlQuery.toLowerCase().includes("hour") ||
      sqlQuery.toLowerCase().includes("time")
    ) {
      return {
        columns: ["hour", "swap_count", "avg_duration"],
        data: [
          [8, 145, 16.2],
          [9, 132, 15.8],
          [18, 128, 17.1],
          [19, 119, 16.9],
          [17, 98, 18.2],
          [7, 87, 14.5],
          [20, 76, 19.3],
        ],
        executionTime: 0.09,
        rowCount: 7,
      };
    } else {
      // Default generic data
      return {
        columns: ["id", "name", "value", "category"],
        data: [
          [1, "Item A", 150, "Category 1"],
          [2, "Item B", 230, "Category 2"],
          [3, "Item C", 180, "Category 1"],
          [4, "Item D", 290, "Category 3"],
          [5, "Item E", 120, "Category 2"],
        ],
        executionTime: 0.08,
        rowCount: 5,
      };
    }
  };

  const handleGenerateSQL = async () => {
    if (!query.trim()) return;

    setIsGenerating(true);
    setGeneratedSQL("");
    setAiResponse("");

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate SQL based on query patterns
    let sql = "";
    let response = "";

    if (
      query.toLowerCase().includes("revenue") ||
      query.toLowerCase().includes("money") ||
      query.toLowerCase().includes("earning")
    ) {
      sql =
        "SELECT station_name, SUM(revenue) as total_revenue, COUNT(*) as swap_count FROM battery_swaps WHERE swap_date >= DATE_TRUNC('month', CURRENT_DATE) GROUP BY station_name ORDER BY total_revenue DESC LIMIT 5";
      response = MOCK_RESPONSES.revenue;
    } else if (
      query.toLowerCase().includes("performance") ||
      query.toLowerCase().includes("utilization") ||
      query.toLowerCase().includes("efficiency")
    ) {
      sql =
        "SELECT station_name, utilization_rate, AVG(swap_duration) as avg_swap_time, capacity FROM stations ORDER BY utilization_rate DESC LIMIT 5";
      response = MOCK_RESPONSES.performance;
    } else if (
      query.toLowerCase().includes("battery") ||
      query.toLowerCase().includes("health")
    ) {
      sql =
        "SELECT station_name, AVG(battery_health) as avg_health, COUNT(CASE WHEN battery_health < 85 THEN 1 END) as batteries_below_85, COUNT(*) as total_batteries FROM battery_swaps GROUP BY station_name ORDER BY avg_health DESC";
      response = MOCK_RESPONSES.battery;
    } else if (
      query.toLowerCase().includes("time") ||
      query.toLowerCase().includes("hour") ||
      query.toLowerCase().includes("peak")
    ) {
      sql =
        "SELECT EXTRACT(hour FROM swap_time) as hour, COUNT(*) as swap_count, AVG(swap_duration) as avg_duration FROM battery_swaps GROUP BY hour ORDER BY swap_count DESC LIMIT 7";
      response = MOCK_RESPONSES.operational;
    } else {
      sql = "SELECT * FROM battery_swaps ORDER BY swap_date DESC LIMIT 10";
      response =
        "I've generated a general query to show recent battery swap data. You can refine your question to get more specific insights about revenue, performance, battery health, or operational patterns.";
    }

    setGeneratedSQL(sql);
    setAiResponse(response);
    setIsGenerating(false);
  };

  const handleExecuteQuery = async () => {
    if (!generatedSQL) return;

    setIsExecuting(true);

    // Simulate query execution
    await new Promise((resolve) => setTimeout(resolve, 800));

    const result = generateMockData(generatedSQL);
    onQueryExecute(generatedSQL, result);
    setIsExecuting(false);
  };

  const handleSampleQuery = (sampleQuery: any) => {
    setQuery(sampleQuery.text);
    setGeneratedSQL(sampleQuery.sql);
    setAiResponse(sampleQuery.description);
  };

  return (
    <div className="space-y-6">
      {/* AI Query Input */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-cyan-400" />
            AI Query Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Textarea
              placeholder="Ask me anything about your BSS data... e.g., 'Show me the top performing stations this month' or 'Which batteries need replacement?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-slate-900 border-slate-600 text-white min-h-[80px] resize-none"
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  handleGenerateSQL();
                }
              }}
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Press Ctrl+Enter to generate SQL, or click the button
              </p>
              <Button
                onClick={handleGenerateSQL}
                disabled={!query.trim() || isGenerating}
                className="bg-cyan-600 hover:bg-cyan-700 text-white"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Generate SQL
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Generated SQL */}
          {generatedSQL && (
            <div className="space-y-3">
              <Separator className="bg-slate-700" />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Database className="h-4 w-4 text-green-400" />
                    Generated SQL
                  </h4>
                  <Button
                    onClick={handleExecuteQuery}
                    disabled={isExecuting}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isExecuting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Executing...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Run Query
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-slate-900 border border-slate-600 rounded-lg p-3">
                  <code className="text-sm text-green-400 font-mono whitespace-pre-wrap">
                    {generatedSQL}
                  </code>
                </div>
              </div>

              {/* AI Response */}
              {aiResponse && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-white flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-yellow-400" />
                    AI Insights
                  </h4>
                  <div className="bg-slate-900/50 border border-slate-600 rounded-lg p-3">
                    <p className="text-sm text-slate-300 leading-relaxed">
                      {aiResponse}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sample Queries */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-400" />
            Sample Queries
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2">
              {SAMPLE_QUERIES.map((category) => (
                <Button
                  key={category.category}
                  variant={
                    selectedCategory === category.category
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setSelectedCategory(
                      selectedCategory === category.category
                        ? null
                        : category.category
                    )
                  }
                  className={`${
                    selectedCategory === category.category
                      ? "bg-cyan-600 hover:bg-cyan-700 text-white"
                      : "border-slate-600 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  <category.icon className={`h-4 w-4 mr-2 ${category.color}`} />
                  {category.category}
                </Button>
              ))}
            </div>

            {/* Sample Query List */}
            <ScrollArea className="h-[300px]">
              <div className="space-y-3">
                {SAMPLE_QUERIES.filter(
                  (category) =>
                    !selectedCategory || category.category === selectedCategory
                ).map((category) => (
                  <div key={category.category} className="space-y-2">
                    {!selectedCategory && (
                      <h4
                        className={`text-sm font-medium ${category.color} flex items-center gap-2`}
                      >
                        <category.icon className="h-4 w-4" />
                        {category.category}
                      </h4>
                    )}
                    {category.queries.map((sampleQuery, index) => (
                      <div
                        key={index}
                        className="bg-slate-900/30 border border-slate-700 rounded-lg p-3 cursor-pointer hover:bg-slate-700/30 transition-colors"
                        onClick={() => handleSampleQuery(sampleQuery)}
                      >
                        <div className="space-y-1">
                          <p className="text-sm text-white font-medium">
                            {sampleQuery.text}
                          </p>
                          <p className="text-xs text-slate-400">
                            {sampleQuery.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      {/* Connection Status */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    connection.status === "connected"
                      ? "bg-green-400"
                      : "bg-red-400"
                  }`}
                />
                <span className="text-sm text-slate-300">
                  Connected to{" "}
                  <strong className="text-white">{connection.name}</strong>
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-slate-400 border-slate-600"
              >
                {connection.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3 w-3" />
              Last connected:{" "}
              {connection.lastConnected
                ? new Date(connection.lastConnected).toLocaleTimeString()
                : "N/A"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
