// BatteryAnalyticsChart.jsx
import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Sample hardcoded data by scooter
const dataByScooter = {
  "Scooter 1": [
    { date: "Feb 02", "BT10600-1": 40, "BT10600-2": 60, "BT10600-3": 0 },
    { date: "Feb 03", "BT10600-1": 30, "BT10600-2": 70, "BT10600-3": 0 },
    { date: "Feb 04", "BT10600-1": 20, "BT10600-2": 50, "BT10600-3": 30 },
    { date: "Feb 05", "BT10600-1": 35, "BT10600-2": 25, "BT10600-3": 40 },
  ],
  "Scooter 2": [
    { date: "Feb 02", "BT10600-4": 55, "BT10600-5": 45 },
    { date: "Feb 03", "BT10600-4": 50, "BT10600-5": 50 },
    { date: "Feb 04", "BT10600-4": 35, "BT10600-5": 65 },
    { date: "Feb 05", "BT10600-4": 20, "BT10600-5": 80 },
  ],
};

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
  "#d0ed57",
  "#888888",
  "#ffbb28",
];

const BatteryAnalyticsChart = () => {
  const scooters = Object.keys(dataByScooter);
  const [selectedScooter, setSelectedScooter] = useState(scooters[0]);
  const data = dataByScooter[selectedScooter];
  const batteryKeys = data.length
    ? Object.keys(data[0]).filter((key) => key !== "date")
    : [];

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "auto" }}>
      <h2>Battery Usage Percentage by Battery for {selectedScooter}</h2>
      <label>
        Select Scooter:{" "}
        <select
          value={selectedScooter}
          onChange={(e) => setSelectedScooter(e.target.value)}
          style={{ marginBottom: 20 }}
        >
          {scooters.map((scooter) => (
            <option key={scooter} value={scooter}>
              {scooter}
            </option>
          ))}
        </select>
      </label>

      <ResponsiveContainer width="100%" height={400}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {batteryKeys.map((key, index) => (
              <linearGradient
                key={key}
                id={`color${key}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor={colors[index % colors.length]}
                  stopOpacity={0}
                />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
            label={{
              value: "Battery Usage %",
              angle: -90,
              position: "insideLeft",
            }}
          />
          <Tooltip
            formatter={(value) => `${value}%`}
            labelFormatter={(label) => `Date: ${label}`}
          />
          {batteryKeys.map((key, index) => (
            <Area
              key={key}
              type="monotone"
              dataKey={key}
              stackId="1"
              stroke={colors[index % colors.length]}
              fill={`url(#color${key})`}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BatteryAnalyticsChart;
