"use client";

import React, { useState, useEffect } from "react";
import { HardDrive, AlertTriangle, Zap } from "lucide-react";

const RedisMemorySection = () => {
  const [memoryData, setMemoryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMemoryData();
    const interval = setInterval(fetchMemoryData, 300000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  const fetchMemoryData = async () => {
    try {
      const response = await fetch("/api/redis-memory");
      if (!response.ok) throw new Error("Failed to fetch memory data");
      const data = await response.json();
      setMemoryData(data);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error("Failed to fetch memory data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <HardDrive className="w-5 h-5 text-cyan-400" />
          <h3 className="text-lg font-semibold text-slate-100">Redis Memory</h3>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-slate-700 rounded w-full"></div>
          <div className="h-4 bg-slate-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !memoryData) {
    return (
      <div className="bg-slate-900/40 backdrop-blur-sm border border-red-500/20 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <AlertTriangle className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-semibold text-slate-100">Redis Memory</h3>
        </div>
        <p className="text-sm text-red-400">
          {error || "Unable to load memory data"}
        </p>
      </div>
    );
  }

  const {
    used_memory_mb,
    max_memory_mb,
    used_memory_human,
    max_memory_human,
    memory_usage_percent,
    evicted_keys,
    memory_status,
    peak_memory_mb,
    total_keys,
  } = memoryData;

  const memoryPercent = Math.min(memory_usage_percent, 100);
  const getColorClass = (percent) => {
    if (percent > 90) return "from-red-500 to-red-600";
    if (percent > 70) return "from-amber-500 to-amber-600";
    return "from-green-500 to-emerald-600";
  };

  const getStatusColor = (status) => {
    if (status === "critical")
      return "bg-red-500/20 border-red-500/40 text-red-400";
    if (status === "warning")
      return "bg-amber-500/20 border-amber-500/40 text-amber-400";
    return "bg-green-500/20 border-green-500/40 text-green-400";
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-cyan-500/20 rounded-lg">
            <HardDrive className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-100">
              Redis Memory Usage
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Real-time database storage metrics
            </p>
          </div>
        </div>
        <div
          className={`px-3 py-1 rounded-full border font-semibold text-sm ${getStatusColor(
            memory_status
          )}`}
        >
          {memory_status.charAt(0).toUpperCase() + memory_status.slice(1)}
        </div>
      </div>

      {/* Main Progress Bar */}
      <div className="space-y-3">
        <div className="flex items-end justify-between">
          <span className="text-sm font-semibold text-slate-100">
            Memory Allocated
          </span>
          <div className="text-right">
            <div className="text-lg font-bold text-slate-100">
              {memoryPercent.toFixed(1)}%
            </div>
            <div className="text-xs text-slate-400">
              {used_memory_human} / {max_memory_human}
            </div>
          </div>
        </div>

        <div className="relative h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className={`h-full bg-gradient-to-r ${getColorClass(
              memoryPercent
            )} rounded-full transition-all duration-300 shadow-lg`}
            style={{ width: `${memoryPercent}%` }}
          />
          <div
            className="absolute top-0 h-full w-1 bg-cyan-400/50 shadow-lg"
            style={{ left: `${memoryPercent}%`, filter: "blur(2px)" }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Used Memory */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
            Used
          </p>
          <p className="text-xl font-bold text-green-400">
            {used_memory_mb.toFixed(2)} MB
          </p>
          <p className="text-xs text-slate-500 mt-1">Current usage</p>
        </div>

        {/* Available Memory */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
            Available
          </p>
          <p className="text-xl font-bold text-cyan-400">
            {(max_memory_mb - used_memory_mb).toFixed(2)} MB
          </p>
          <p className="text-xs text-slate-500 mt-1">Free space</p>
        </div>

        {/* Maximum Memory */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
            Max
          </p>
          <p className="text-xl font-bold text-slate-100">
            {max_memory_mb.toFixed(2)} MB
          </p>
          <p className="text-xs text-slate-500 mt-1">Total limit</p>
        </div>

        {/* Peak Memory */}
        <div className="bg-slate-800/40 border border-slate-700 rounded-lg p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase mb-2">
            Peak
          </p>
          <p className="text-xl font-bold text-amber-400">
            {peak_memory_mb.toFixed(2)} MB
          </p>
          <p className="text-xs text-slate-500 mt-1">Highest usage</p>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Keys */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
              Total Keys
            </p>
            <p className="text-2xl font-bold text-slate-100">
              {total_keys.toLocaleString()}
            </p>
          </div>
          <Zap className="w-6 h-6 text-yellow-400 opacity-50" />
        </div>

        {/* Evicted Keys */}
        <div className="bg-gradient-to-br from-slate-800/40 to-slate-800/20 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-semibold uppercase mb-1">
              Evicted Keys
            </p>
            <p
              className={`text-2xl font-bold ${
                evicted_keys > 0 ? "text-red-400" : "text-green-400"
              }`}
            >
              {evicted_keys.toLocaleString()}
            </p>
          </div>
          <AlertTriangle
            className={`w-6 h-6 ${
              evicted_keys > 0 ? "text-red-400" : "text-green-400"
            } opacity-50`}
          />
        </div>
      </div>

      {/* Warning Message */}
      {memoryPercent > 85 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 flex gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-400 mb-1">
              Memory Usage High
            </p>
            <p className="text-xs text-amber-400/80">
              Your Redis instance is using {memoryPercent.toFixed(1)}% of
              available memory. Consider increasing max memory or clearing old
              cache entries.
            </p>
          </div>
        </div>
      )}

      {/* Refresh Indicator */}
      <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
        <span>Updates every 5 minutes</span>
      </div>
    </div>
  );
};

export default RedisMemorySection;
