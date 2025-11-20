"use client";

import React, { useState, useEffect } from "react";
import ReactECharts from "echarts-for-react";
import {
  Activity,
  Database,
  TrendingUp,
  AlertCircle,
  RefreshCw,
  Lock,
  Clock,
  TrendingDown,
  Trash2,
} from "lucide-react";
import RedisMemorySection from "@/components/cache/RedisMemorySection";

const QueryCacheVisualization = () => {
  const [activeView, setActiveView] = useState("overview");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedQuery, setExpandedQuery] = useState(null);
  const [deletingQuery, setDeletingQuery] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "/api/cache-analytics?sortBy=score&limit=50"
      );
      if (!response.ok) throw new Error("Failed to fetch analytics");
      const data = await response.json();
      setAnalyticsData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatSQL = (sql) => {
    if (!sql || sql === "N/A") return "SQL not available";
    return sql.length > 100 ? sql.substring(0, 100) + "..." : sql;
  };

  const handleDeleteQuery = async (queryHash) => {
    if (
      !confirm(
        "Are you sure you want to delete this query from the cache? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setDeletingQuery(queryHash);
      const response = await fetch("/api/cache-analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ queryHash, action: "delete" }),
      });

      if (!response.ok) throw new Error("Failed to delete query");

      const result = await response.json();

      if (result.success) {
        // Refresh analytics to update the UI
        await fetchAnalytics();
      } else {
        throw new Error(result.error || "Failed to delete query");
      }
    } catch (err) {
      alert(`Error deleting query: ${err.message}`);
      console.error("Failed to delete query:", err);
    } finally {
      setDeletingQuery(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-slate-100 text-xl">Loading Cache Analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-8 max-w-md backdrop-blur-sm">
          <h2 className="text-red-400 text-xl font-bold mb-2">
            Error Loading Data
          </h2>
          <p className="text-slate-100 mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-100 text-xl">No analytics data available</p>
      </div>
    );
  }

  const { summary, candidates = [] } = analyticsData;

  const hitMissData = [
    { name: "Cache Hits", value: summary?.totalHits || 0 },
    { name: "Cache Misses", value: summary?.totalMisses || 0 },
  ];

  const scoreDistribution = (candidates || [])
    .reduce((acc, q) => {
      const bucket = Math.floor((q.score || 0) / 10) * 10;
      const existing = acc.find(
        (item) => item.range === `${bucket}-${bucket + 10}`
      );
      if (existing) {
        existing.count++;
      } else {
        acc.push({ range: `${bucket}-${bucket + 10}`, count: 1 });
      }
      return acc;
    }, [])
    .sort((a, b) => parseInt(a.range) - parseInt(b.range));

  const topByScore = (candidates || []).slice(0, 15).map((q) => ({
    hash: q.queryHash?.substring(0, 8) || "N/A",
    score: q.score || 0,
    executions: q.total || 0,
    hitRate: (q.hitRatio || 0) * 100,
    sql: q.sql || "SQL not available",
    isPersistent: q.isPersistent || false,
    recentHits: q.recentHits || 0,
    activeDays: q.activeDays || 0,
  }));

  const overviewCards = [
    {
      title: "Total Queries",
      value: summary?.totalQueries || 0,
      subtitle: "Unique cached queries",
      icon: Database,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      borderColor: "border-cyan-500/20",
    },
    {
      title: "Persistent Queries",
      value: summary?.persistentQueries || 0,
      subtitle: "Never expire (locked)",
      icon: Lock,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      title: "Hit Ratio",
      value: `${((summary?.averageHitRatio || 0) * 100).toFixed(1)}%`,
      subtitle: "Average across all queries",
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      title: "Expiring Soon",
      value: summary?.expiringSoon || 0,
      subtitle: "Less than 6 hours TTL",
      icon: AlertCircle,
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
    },
  ];

  // Pie Chart Options
  const pieChartOptions = {
    tooltip: {
      trigger: "item",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#06b6d4",
      borderWidth: 2,
      padding: 16,
      textStyle: { color: "#cbd5e1" },
      extraCssText:
        "border-radius: 8px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px);",
      formatter: (params) => {
        const percentage = params.percent.toFixed(1);
        return `
          <div style="min-width: 200px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #06b6d4; border-bottom: 1px solid #334155; padding-bottom: 6px;">${
              params.name
            }</div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Value:</span>
              <span style="font-family: monospace; font-weight: 600; color: #ffffff;">${params.value.toLocaleString()}</span>
            </div>
            <div style="display: flex; justify-content: space-between;">
              <span style="color: #94a3b8;">Percentage:</span>
              <span style="font-family: monospace; font-weight: 600; color: #10b981;">${percentage}%</span>
            </div>
          </div>
        `;
      },
    },
    legend: {
      orient: "horizontal",
      bottom: 10,
      textStyle: { color: "#cbd5e1", fontSize: 12 },
      itemGap: 10,
      itemWidth: 14,
      itemHeight: 14,
    },
    series: [
      {
        type: "pie",
        radius: ["30%", "85%"],
        center: ["50%", "45%"],
        data: hitMissData.map((item, idx) => ({
          ...item,
          itemStyle: {
            color: idx === 0 ? "#10b981" : "#ef4444",
            borderRadius: 4,
            borderColor: "#1e293b",
            borderWidth: 2,
          },
        })),
        avoidLabelOverlap: false,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
      },
    ],
  };

  // Bar Chart Options
  const barChartOptions = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#06b6d4",
      borderWidth: 2,
      padding: 16,
      textStyle: { color: "#cbd5e1" },
      extraCssText:
        "border-radius: 8px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px);",
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: "rgba(6, 182, 212, 0.1)",
        },
      },
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: scoreDistribution.map((d) => d.range),
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
    },
    yAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    series: [
      {
        name: "Query Count",
        type: "bar",
        data: scoreDistribution.map((d) => d.count),
        itemStyle: {
          color: "#06b6d4",
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  // Horizontal Bar Chart Options (with persistent indicator)
  const horizontalBarOptions = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      borderColor: "#06b6d4",
      borderWidth: 2,
      padding: 16,
      textStyle: { color: "#cbd5e1" },
      extraCssText:
        "border-radius: 8px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); backdrop-filter: blur(10px); max-width: 600px;",
      axisPointer: {
        type: "shadow",
        shadowStyle: {
          color: "rgba(6, 182, 212, 0.1)",
        },
      },
      formatter: (params) => {
        const dataItem = topByScore[params[0].dataIndex];
        return `
          <div style="min-width: 300px; max-width: 550px;">
            <div style="font-weight: 700; font-size: 14px; margin-bottom: 8px; color: #06b6d4; border-bottom: 1px solid #334155; padding-bottom: 6px;">
              Query ${dataItem.hash} ${
          dataItem.isPersistent ? "🔒 PERSISTENT" : ""
        }
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Score:</span>
              <span style="font-family: monospace; font-weight: 600; color: #ffffff;">${dataItem.score.toFixed(
                1
              )}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Recent Hits (7d):</span>
              <span style="font-family: monospace; font-weight: 600; color: #10b981;">${
                dataItem.recentHits
              }</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
              <span style="color: #94a3b8;">Active Days:</span>
              <span style="font-family: monospace; font-weight: 600; color: #06b6d4;">${
                dataItem.activeDays
              }/7</span>
            </div>
            <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #334155;">
              <div style="color: #06b6d4; font-size: 12px; font-weight: 600; margin-bottom: 6px;">SQL Query:</div>
              <div style="background: rgba(0, 0, 0, 0.3); padding: 8px; border-radius: 4px; border-left: 3px solid ${
                dataItem.isPersistent ? "#a855f7" : "#06b6d4"
              };">
                <code style="color: #cbd5e1; font-size: 11px; line-height: 1.5; display: block; word-break: break-all; white-space: normal;">
                  ${dataItem.sql.substring(0, 400)}${
          dataItem.sql.length > 400 ? "..." : ""
        }
                </code>
              </div>
            </div>
          </div>
        `;
      },
    },
    grid: {
      left: "15%",
      right: "10%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "value",
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
      splitLine: { lineStyle: { color: "#334155" } },
    },
    yAxis: {
      type: "category",
      data: topByScore.map((d) => d.hash),
      axisLine: { lineStyle: { color: "#475569" } },
      axisLabel: { color: "#94a3b8" },
    },
    series: [
      {
        name: "Pre-warm Score",
        type: "bar",
        data: topByScore.map((d) => d.score),
        itemStyle: {
          color: (params) => {
            const item = topByScore[params.dataIndex];
            return item.isPersistent ? "#a855f7" : "#06b6d4";
          },
          borderRadius: [0, 4, 4, 0],
        },
      },
    ],
  };

  return (
    <div className="space-y-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
            Query Cache Intelligence
          </h1>
          <p className="text-slate-400 mt-1">
            Real-time insights with persistent scoring system
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 rounded-lg transition border border-slate-700"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {overviewCards.map((card) => (
          <div
            key={card.title}
            className={`bg-slate-900/50 border-slate-800 ${card.borderColor} backdrop-blur-sm rounded-lg border p-6`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-slate-100">
                  {card.value}
                </p>
                <p className="text-xs text-slate-500 mt-1">{card.subtitle}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/50 p-1 border border-slate-800 rounded-lg backdrop-blur-sm inline-flex gap-1">
        {["overview", "performance", "persistent", "candidates"].map((view) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all ${
              activeView === view
                ? "bg-slate-800 text-cyan-400"
                : "text-slate-400 hover:text-slate-300 hover:bg-slate-800/50"
            }`}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </button>
        ))}
      </div>

      {/* Content Area */}
      {activeView === "overview" && (
        <div className="space-y-6">
          {/* Redis Memory Analytics */}
          <RedisMemorySection />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Cache Hit vs Miss Distribution
              </h3>
              <div className="text-sm text-slate-400 mb-4">
                Total:{" "}
                {(
                  summary?.totalHits + summary?.totalMisses || 0
                ).toLocaleString()}{" "}
                requests
              </div>
              <ReactECharts
                option={pieChartOptions}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>

            <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Pre-warm Score Distribution
              </h3>
              <div className="text-sm text-slate-400 mb-4">
                Score ranges by query count
              </div>
              <ReactECharts
                option={barChartOptions}
                style={{ height: "350px", width: "100%" }}
                opts={{ renderer: "svg" }}
              />
            </div>
          </div>
        </div>
      )}

      {activeView === "performance" && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-100 mb-2">
              Top 15 Queries by Pre-warm Score
            </h3>
            <div className="text-sm text-slate-400 mb-4">
              Purple bars = Persistent queries (no expiration) | Cyan bars =
              Temporary (24h)
            </div>
            <ReactECharts
              option={horizontalBarOptions}
              style={{ height: "400px", width: "100%" }}
              opts={{ renderer: "svg" }}
            />
          </div>
        </div>
      )}

      {activeView === "persistent" && (
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-slate-100 mb-2">
                Persistent Queries
              </h3>
              <p className="text-sm text-slate-400">
                Queries cached indefinitely due to regular usage (3+ active
                days, 2+ avg hits/day)
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-lg">
              <Lock className="w-4 h-4 text-purple-400" />
              <span className="text-purple-400 font-semibold">
                {candidates.filter((q) => q.isPersistent).length} Persistent
              </span>
            </div>
          </div>

          <div className="space-y-4">
            {candidates.filter((q) => q.isPersistent).length === 0 ? (
              <div className="text-center py-12">
                <Lock className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                <p className="text-slate-400 text-lg">
                  No persistent queries yet
                </p>
                <p className="text-slate-500 text-sm mt-2">
                  Queries become persistent after showing consistent usage
                  patterns
                </p>
              </div>
            ) : (
              candidates
                .filter((q) => q.isPersistent)
                .slice(0, 20)
                .map((query, idx) => (
                  <div
                    key={query.queryHash}
                    className="bg-slate-800/50 border-2 border-purple-500/30 rounded-lg p-4 hover:border-purple-500/50 transition"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1">
                        <Lock className="w-5 h-5 text-purple-400" />
                        <span className="text-slate-400 font-mono text-sm">
                          #{idx + 1}
                        </span>
                        <span className="px-3 py-1 rounded-full text-sm font-bold bg-purple-500/20 text-purple-400 border border-purple-500/30">
                          Score: {query.score?.toFixed(1) || 0}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm items-center">
                        <div className="text-center">
                          <div className="text-slate-400 text-xs">
                            Recent (7d)
                          </div>
                          <div className="text-green-400 font-semibold">
                            {query.recentHits || 0}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-xs">
                            Active Days
                          </div>
                          <div className="text-cyan-400 font-semibold">
                            {query.activeDays || 0}/7
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-slate-400 text-xs">Hit Rate</div>
                          <div className="text-green-400 font-semibold">
                            {((query.hitRatio || 0) * 100).toFixed(1)}%
                          </div>
                        </div>
                        <button
                          onClick={() => handleDeleteQuery(query.queryHash)}
                          disabled={deletingQuery === query.queryHash}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete query"
                        >
                          {deletingQuery === query.queryHash ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 rounded p-3 border border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-slate-400 text-xs font-semibold uppercase">
                          SQL Query
                        </span>
                        <button
                          onClick={() =>
                            setExpandedQuery(
                              expandedQuery === query.queryHash
                                ? null
                                : query.queryHash
                            )
                          }
                          className="text-cyan-400 text-xs hover:text-cyan-300 transition"
                        >
                          {expandedQuery === query.queryHash
                            ? "Collapse"
                            : "Expand"}
                        </button>
                      </div>
                      <code className="text-sm text-purple-400 font-mono block break-words">
                        {expandedQuery === query.queryHash
                          ? query.sql || "SQL not available"
                          : formatSQL(query.sql)}
                      </code>
                    </div>

                    <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-purple-400">
                        <Lock className="w-3 h-3" />
                        No Expiration
                      </span>
                      <span>
                        Size: {((query.cacheSize || 0) / 1024).toFixed(1)} KB
                      </span>
                      <span>Total: {query.total || 0} executions</span>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      )}

      {activeView === "candidates" && (
        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            All Query Candidates
          </h3>
          <div className="text-sm text-slate-400 mb-6">
            {candidates.length} total queries (Purple = Persistent, Cyan =
            Temporary)
          </div>
          <div className="space-y-4">
            {candidates.map((query, idx) => (
              <div
                key={query.queryHash}
                className={`bg-slate-800/50 border rounded-lg p-4 hover:border-cyan-500/50 transition ${
                  query.isPersistent
                    ? "border-purple-500/30"
                    : "border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-slate-400 font-mono text-sm">
                      #{idx + 1}
                    </span>
                    {query.isPersistent && (
                      <Lock className="w-4 h-4 text-purple-400" />
                    )}
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ${
                        query.score > 50
                          ? "bg-green-500/20 text-green-400 border border-green-500/30"
                          : query.score > 20
                          ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                          : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                      }`}
                    >
                      Score: {query.score?.toFixed(1) || 0}
                    </span>
                    {query.consecutiveDaysNoHits > 0 && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded bg-red-500/20 text-red-400 text-xs">
                        <TrendingDown className="w-3 h-3" />
                        {query.consecutiveDaysNoHits}d no hits
                      </span>
                    )}
                  </div>
                  <div className="flex gap-4 text-sm items-center">
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Recent</div>
                      <div className="text-cyan-400 font-semibold">
                        {query.recentHits || 0}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Days</div>
                      <div className="text-slate-100 font-semibold">
                        {query.activeDays || 0}/7
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-400 text-xs">Hit Rate</div>
                      <div
                        className={`font-semibold ${
                          (query.hitRatio || 0) * 100 > 80
                            ? "text-green-400"
                            : (query.hitRatio || 0) * 100 > 50
                            ? "text-amber-400"
                            : "text-red-400"
                        }`}
                      >
                        {((query.hitRatio || 0) * 100).toFixed(1)}%
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteQuery(query.queryHash)}
                      disabled={deletingQuery === query.queryHash}
                      className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition border border-red-500/30 hover:border-red-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete query"
                    >
                      {deletingQuery === query.queryHash ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-red-400"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/50 rounded p-3 border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-semibold uppercase">
                      SQL Query
                    </span>
                    <button
                      onClick={() =>
                        setExpandedQuery(
                          expandedQuery === query.queryHash
                            ? null
                            : query.queryHash
                        )
                      }
                      className="text-cyan-400 text-xs hover:text-cyan-300 transition"
                    >
                      {expandedQuery === query.queryHash
                        ? "Collapse"
                        : "Expand"}
                    </button>
                  </div>
                  <code
                    className={`text-sm font-mono block break-words ${
                      query.isPersistent ? "text-purple-400" : "text-cyan-400"
                    }`}
                  >
                    {expandedQuery === query.queryHash
                      ? query.sql || "SQL not available"
                      : formatSQL(query.sql)}
                  </code>
                </div>

                {query.isCached && (
                  <div className="mt-2 flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      Currently Cached
                    </span>
                    <span>Size: {(query.cacheSize / 1024).toFixed(1)} KB</span>
                    {query.ttl && (
                      <span>TTL: {Math.floor(query.ttl / 60)}m</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QueryCacheVisualization;
