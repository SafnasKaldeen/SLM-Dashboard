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
  Clock,
  Lightbulb,
  Star,
  AlertCircle,
  DollarSign,
  CheckCircle,
  ShoppingCart,
  MapPin,
  Battery,
  TrendingUp,
} from "lucide-react";
import { useGenerateSQL } from "@/hooks/useGenerateSQL";

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

const VERIFIED_QUERIES = [
  {
    category: "E-Commerce Insights",
    icon: ShoppingCart,
    color: "text-orange-400",
    bgColor: "bg-orange-500/10 border-orange-500/20",
    queries: [
      {
        text: "List top 10 customers by total spend",
        description: "Summarizes total revenue per customer and ranks them",
      },
      {
        text: "Get total products sold per category",
        description: "Aggregates quantity sold grouped by product category",
      },
      {
        text: "Calculate monthly payroll cost by department",
        description: "Summarizes net pay across departments per month",
      },
      {
        text: "Compare sales to targets per region and category",
        description: "Shows sales performance vs targets per region/category",
      },
      {
        text: "Daily revenue and traffic correlation",
        description: "Joins orders with website analytics to compare metrics",
      },
      {
        text: "Support tickets by priority and status",
        description: "Counts support tickets grouped by severity and state",
      },
      {
        text: "Supplier performance – active products count",
        description: "Counts how many active products each supplier has",
      },
      {
        text: "Campaign ROI summary",
        description: "Summarizes cost, revenue, and ROI per marketing campaign",
      },
      {
        text: "Return rate per product",
        description: "Calculates product return percentage from orders",
      },
      {
        text: "Average working hours per employee per week",
        description: "Analyzes employee attendance trends weekly",
      },
    ],
  },
  {
    category: "Revenue Analysis",
    icon: DollarSign,
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
    queries: [
      {
        text: "Show me the top 5 stations by revenue this month",
        description: "Identifies highest performing stations by revenue",
      },
      {
        text: "What's the revenue trend over the last 6 months?",
        description: "Shows monthly revenue trends",
      },
      {
        text: "Compare revenue by area for this quarter",
        description: "Area-wise revenue comparison",
      },
    ],
  },
  {
    category: "Station Performance",
    icon: MapPin,
    color: "text-blue-400",
    bgColor: "bg-blue-500/10 border-blue-500/20",
    queries: [
      {
        text: "Which stations have the highest utilization rates?",
        description: "Ranks stations by efficiency",
      },
      {
        text: "Show me stations with declining performance",
        description: "Identifies underperforming stations",
      },
      {
        text: "What's the average swap time by station?",
        description: "Station efficiency metrics",
      },
    ],
  },
  {
    category: "Battery Analytics",
    icon: Battery,
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
    queries: [
      {
        text: "Show battery health distribution across stations",
        description: "Battery condition analysis",
      },
      {
        text: "Which batteries need replacement soon?",
        description: "Maintenance planning",
      },
    ],
  },
  {
    category: "Operational Insights",
    icon: TrendingUp,
    color: "text-purple-400",
    bgColor: "bg-purple-500/10 border-purple-500/20",
    queries: [
      {
        text: "What are the peak hours for battery swaps?",
        description: "Identifies busy periods",
      },
      {
        text: "Show me the busiest days of the week",
        description: "Weekly pattern analysis",
      },
    ],
  },
];

export default function AIQueryBuilder({
  connection,
  onQueryExecute,
}: AIQueryBuilderProps) {
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<QueryResult | null>(null); // <-- NEW STATE

  const {
    sql: generatedSQL,
    loading: isGenerating,
    error,
    explanation,
    generate,
  } = useGenerateSQL();

  const getCategoryFromPrompt = (prompt: string): string => {
    const lowerPrompt = prompt.toLowerCase();
    for (const category of VERIFIED_QUERIES) {
      for (const q of category.queries) {
        if (q.text.toLowerCase() === lowerPrompt) {
          return category.category;
        }
      }
    }
    return "General Analysis";
  };

  const saveQueryToMongo = async (
    prompt: string,
    sql: string,
    explanation?: string,
    result?: QueryResult
  ) => {
    try {
      const document = {
        id: `query_${Date.now()}`,
        connectionId: connection.id,
        title: prompt,
        subtitle: getCategoryFromPrompt(prompt),
        timeAgo: "Just now",
        rowsReturned: result?.rowCount ?? 0,
        executionTime: result?.executionTime
          ? `${result.executionTime.toFixed(2)}s`
          : "N/A",
        sql,
        explanation,
        timestamp: new Date().toISOString(),
      };

      await fetch("/api/query-history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(document),
      });
    } catch (err) {
      console.error("Failed to save query to history:", err);
    }
  };

  const generateMockData = (sqlQuery: string): QueryResult => {
    const q = sqlQuery.toLowerCase();
    if (q.includes("revenue")) {
      return {
        columns: [
          "station_name",
          "total_revenue",
          "swap_count",
          "lat",
          "long",
          "Area",
        ],
        data: [
          ["Station Alpha", 12450, 156, 7.123456, 80.123456, "Ampara"],
          ["Station Beta", 9800, 124, 7.120498, 79.983923, "Kalmunai"],
        ],
        executionTime: 0.15,
        rowCount: 2,
      };
    } else if (q.includes("utilization") || q.includes("performance")) {
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
        ],
        executionTime: 0.12,
        rowCount: 2,
      };
    } else if (q.includes("battery") || q.includes("health")) {
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
        ],
        executionTime: 0.18,
        rowCount: 2,
      };
    } else {
      return {
        columns: ["id", "name", "value", "category"],
        data: [
          [1, "Item A", 150, "Category 1"],
          [2, "Item B", 230, "Category 2"],
        ],
        executionTime: 0.08,
        rowCount: 2,
      };
    }
  };

  const handleExecuteQuery = async () => {
    if (!generatedSQL) return;
    setIsExecuting(true);
    try {
      const res = await fetch("/api/RunSQLQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sql: generatedSQL,
          connectionId: "snowflake_1751620346752",
        }),
      });

      const data = await res.json();

      let resultData: QueryResult;

      if (
        data.success &&
        data.result &&
        Array.isArray(data.result.columns) &&
        Array.isArray(data.result.rows)
      ) {
        // Transform rows from array of objects to array of arrays
        const { columns, rows, executionTime, rowCount } = data.result;

        const dataRows = rows.map((row: Record<string, any>) =>
          columns.map((col: string) => row[col])
        );

        resultData = {
          columns,
          data: dataRows,
          executionTime,
          rowCount,
        };
      } else {
        // fallback mock data
        resultData = generateMockData(generatedSQL);
      }

      console.log("Query executed successfully:", data);

      await saveQueryToMongo(query, generatedSQL, explanation, resultData);

      setQueryResult(resultData); // <-- Store result to local state here
      onQueryExecute(generatedSQL, resultData);
    } catch (e) {
      console.warn("Falling back to mock data due to error:", e);
      const fallback = generateMockData(generatedSQL);

      await saveQueryToMongo(query, generatedSQL, explanation, fallback);

      setQueryResult(fallback); // <-- Store fallback result
      onQueryExecute(generatedSQL, fallback);
    } finally {
      setIsExecuting(false);
    }
  };

  const handleSampleQuery = (sampleQuery: any) => {
    setQuery(sampleQuery.text);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Connection Status Bar */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    connection.status === "connected"
                      ? "bg-emerald-400 shadow-sm shadow-emerald-400/50"
                      : "bg-red-400 shadow-sm shadow-red-400/50"
                  } animate-pulse`}
                />
                <span className="text-sm font-medium text-slate-200">
                  Connected to{" "}
                  <span className="text-white font-semibold">
                    {connection.name}
                  </span>
                </span>
              </div>
              <Badge
                variant="outline"
                className="text-xs text-slate-300 border-slate-500/50 bg-slate-700/30"
              >
                {connection.type}
              </Badge>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Last connected:{" "}
                {connection.lastConnected
                  ? new Date(connection.lastConnected).toLocaleString()
                  : "N/A"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Query Input */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Brain className="h-5 w-5 text-cyan-400" />
            AI Query Builder
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Input Section */}
          <div className="space-y-4">
            <Textarea
              placeholder="Ask me anything about your BSS data..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                  generate(query);
                }
              }}
              className="bg-slate-900/60 border-slate-600/50 text-white min-h-[100px] resize-none focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent transition-all duration-200"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400 flex items-center gap-1">
                <Lightbulb className="h-3 w-3" />
                Press Ctrl+Enter or click to generate SQL
              </p>
              <Button
                onClick={() => generate(query)}
                disabled={!query.trim() || isGenerating}
                className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-lg transition-all duration-200"
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

          {/* Results Section */}
          {(generatedSQL || explanation || error) && (
            <div className="space-y-4">
              <Separator className="bg-slate-700/50" />

              {/* Generated SQL */}
              {generatedSQL && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-white flex items-center gap-2">
                      <Database className="h-4 w-4 text-emerald-400" />
                      Generated SQL
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-400" />
                    </h4>
                    <Button
                      onClick={handleExecuteQuery}
                      disabled={isExecuting}
                      size="sm"
                      className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white shadow-md transition-all duration-200"
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

                  <div className="bg-slate-900/70 border border-slate-600/50 rounded-lg p-4 backdrop-blur-sm">
                    <pre className="text-sm text-emerald-300 font-mono whitespace-pre-wrap overflow-x-auto">
                      {generatedSQL}
                    </pre>
                  </div>
                </div>
              )}

              {/* Explanation */}
              {explanation && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-medium text-amber-200 mb-1">
                        Explanation
                      </h5>
                      <p className="text-sm text-amber-100/90 whitespace-pre-wrap leading-relaxed">
                        {explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 backdrop-blur-sm">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <h5 className="text-sm font-medium text-red-200 mb-1">
                        Error
                      </h5>
                      <p className="text-sm text-red-100/90 whitespace-pre-wrap leading-relaxed">
                        {error}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* QUERY RESULT TABLE - NEW */}
              {queryResult && (
                <div className="overflow-auto max-h-72 bg-slate-900/70 border border-slate-600/50 rounded-lg p-4 text-white">
                  <table className="w-full table-auto border-collapse border border-slate-700">
                    <thead>
                      <tr>
                        {queryResult.columns.map((col) => (
                          <th
                            key={col}
                            className="border border-slate-700 px-2 py-1 text-left"
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {queryResult.data.map((row, idx) => (
                        <tr
                          key={idx}
                          className={idx % 2 === 0 ? "bg-slate-800" : ""}
                        >
                          {row.map((cell, cidx) => (
                            <td
                              key={cidx}
                              className="border border-slate-700 px-2 py-1"
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-2 text-xs text-slate-400">
                    Rows: {queryResult.rowCount} — Execution time:{" "}
                    {queryResult.executionTime.toFixed(2)}s
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Verified Queries */}
      <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Star className="h-5 w-5 text-amber-400" />
            Verified Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {VERIFIED_QUERIES.map((cat) => (
              <Button
                key={cat.category}
                onClick={() =>
                  setSelectedCategory(
                    selectedCategory === cat.category ? null : cat.category
                  )
                }
                className={`transition-all duration-200 ${
                  selectedCategory === cat.category
                    ? "bg-cyan-600 text-white shadow-md shadow-cyan-600/30 border-cyan-500"
                    : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-600/60 hover:border-slate-500/60"
                }`}
                variant="outline"
                size="sm"
              >
                <cat.icon className={`h-4 w-4 mr-2 ${cat.color}`} />
                {cat.category}
              </Button>
            ))}
            {selectedCategory && (
              <Button
                onClick={() => setSelectedCategory(null)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-slate-200"
              >
                Clear filter
              </Button>
            )}
          </div>

          {/* Query List */}
          <ScrollArea className="h-[320px]">
            <div className="space-y-4 pr-4">
              {VERIFIED_QUERIES.filter(
                (cat) => !selectedCategory || cat.category === selectedCategory
              ).map((cat) => (
                <div key={cat.category} className="space-y-3">
                  {!selectedCategory && (
                    <h4
                      className={`text-sm font-medium ${cat.color} flex items-center gap-2`}
                    >
                      <cat.icon className="h-4 w-4" />
                      {cat.category}
                    </h4>
                  )}
                  <div className="grid gap-2">
                    {cat.queries.map((q, i) => (
                      <div
                        key={i}
                        className={`${cat.bgColor} border rounded-lg p-4 cursor-pointer hover:bg-opacity-80 transition-all duration-200 hover:shadow-md hover:scale-[1.01]`}
                        onClick={() => handleSampleQuery(q)}
                      >
                        <p className="text-sm font-medium text-white mb-1 leading-relaxed">
                          {q.text}
                        </p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                          {q.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
