"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface BatteryUsageChartProps {
  dateRange: { from: Date; to: Date };
}

interface BatteryData {
  date: string;
  [key: string]: string | number;
}

const bmsIds = [
  "BT10600A",
  "BT10600B",
  "BT10600C",
  "BT10600D",
  "BT10600E",
  "BT10600F",
  "BT10600G",
  "BT10600H",
  "BT10600I",
];

const colors = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#eab308", // yellow
  "#84cc16", // lime
  "#22c55e", // green
  "#10b981", // emerald
  "#14b8a6", // teal
  "#06b6d4", // cyan
  "#0ea5e9", // sky
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#a855f7", // purple
  "#d946ef", // fuchsia
  "#ec4899", // pink
  "#f43f5e", // rose
];

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: any[];
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.9)",
          border: "1px solid #475569",
          padding: "10px",
          color: "#e2e8f0",
        }}
      >
        <p style={{ marginBottom: "8px", fontWeight: "bold" }}>{label}</p>
        <ul style={{ margin: 0, padding: 0, listStyleType: "none" }}>
          {payload.map((entry, index) => (
            <li key={index} style={{ color: entry.color, marginBottom: 4 }}>
              <strong>{entry.name}:</strong> {entry.value} kWh
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return null;
};

export default function BatteryUsageChart({
  dateRange,
}: BatteryUsageChartProps) {
  const [data, setData] = useState<BatteryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // For demo purposes, generate sample data
        const sampleData: BatteryData[] = [];

        // Generate dates between the range
        const startDate = new Date(dateRange.from);
        const endDate = new Date(dateRange.to);
        const dayInterval = 7; // Weekly data points

        for (
          let date = new Date(startDate);
          date <= endDate;
          date.setDate(date.getDate() + dayInterval)
        ) {
          const entry: BatteryData = {
            date: `Feb ${date.getDate().toString().padStart(2, "0")}`,
          };

          // Add random usage for each BMS ID
          bmsIds.forEach((id) => {
            entry[id] = Math.floor(Math.random() * 70) + 10; // Random value between 10 and 80
          });

          sampleData.push(entry);
        }

        setData(sampleData);
      } catch (error) {
        console.error("Error fetching battery usage data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
          <XAxis dataKey="date" stroke="#94a3b8" tick={{ fill: "#94a3b8" }} />
          <YAxis
            stroke="#94a3b8"
            tick={{ fill: "#94a3b8" }}
            label={{
              value: "Usage (kWh)",
              angle: -90,
              position: "insideLeft",
              style: { fill: "#94a3b8" },
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{
              paddingTop: "10px",
              color: "#94a3b8",
            }}
          />
          {bmsIds.map((id, index) => (
            <Bar
              key={id}
              dataKey={id}
              stackId="a"
              fill={colors[index % colors.length]}
              name={id}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
