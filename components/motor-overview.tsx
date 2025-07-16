import React, { useState } from "react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Sample motor data by scooter based on your CSV structure
const motorDataByScooter = {
  "Scooter 1": [
    { date: "Feb 02", MotorRPM: 2500, MotorTemp: 45, ThrottlePercent: 65 },
    { date: "Feb 03", MotorRPM: 3200, MotorTemp: 52, ThrottlePercent: 80 },
    { date: "Feb 04", MotorRPM: 2800, MotorTemp: 48, ThrottlePercent: 70 },
    { date: "Feb 05", MotorRPM: 3500, MotorTemp: 58, ThrottlePercent: 90 },
  ],
  "Scooter 2": [
    { date: "Feb 02", MotorRPM: 2800, MotorTemp: 50, ThrottlePercent: 75 },
    { date: "Feb 03", MotorRPM: 3100, MotorTemp: 55, ThrottlePercent: 85 },
    { date: "Feb 04", MotorRPM: 2600, MotorTemp: 46, ThrottlePercent: 60 },
    { date: "Feb 05", MotorRPM: 3400, MotorTemp: 60, ThrottlePercent: 95 },
  ],
};

const colors = [
  "#8884d8",
  "#82ca9d",
  "#ffc658",
  "#ff8042",
  "#8dd1e1",
  "#a4de6c",
];

const MotorAnalyticsChart = () => {
  const scooters = Object.keys(motorDataByScooter);
  const [selectedScooter, setSelectedScooter] = useState(scooters[0]);
  const data = motorDataByScooter[selectedScooter];

  return (
    <div style={{ width: "100%", maxWidth: 900, margin: "auto" }}>
      <h2>Motor Performance Analytics for {selectedScooter}</h2>
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

      {/* Motor RPM Chart */}
      <div style={{ marginBottom: 40 }}>
        <h3>Motor RPM Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorRPM" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[0]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[0]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              label={{
                value: "Motor RPM",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value) => [`${value} RPM`, "Motor RPM"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="MotorRPM"
              stroke={colors[0]}
              fill="url(#colorRPM)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Motor Temperature Chart */}
      <div style={{ marginBottom: 40 }}>
        <h3>Motor Temperature Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[3]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[3]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              label={{
                value: "Temperature (°C)",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value) => [`${value}°C`, "Motor Temperature"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="MotorTemp"
              stroke={colors[3]}
              fill="url(#colorTemp)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Throttle Percentage Chart */}
      <div style={{ marginBottom: 40 }}>
        <h3>Throttle Usage Percentage Over Time</h3>
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart
            data={data}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorThrottle" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[1]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[1]} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              label={{
                value: "Throttle Usage %",
                angle: -90,
                position: "insideLeft",
              }}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Throttle Usage"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Area
              type="monotone"
              dataKey="ThrottlePercent"
              stroke={colors[1]}
              fill="url(#colorThrottle)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Combined Motor Metrics */}
      <div style={{ marginBottom: 40 }}>
        <h3>Combined Motor Metrics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="MotorRPM"
              stroke={colors[0]}
              strokeWidth={2}
              name="Motor RPM"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="MotorTemp"
              stroke={colors[3]}
              strokeWidth={2}
              name="Motor Temperature (°C)"
            />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="ThrottlePercent"
              stroke={colors[1]}
              strokeWidth={2}
              name="Throttle Usage (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MotorAnalyticsChart;
