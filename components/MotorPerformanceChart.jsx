import React from "react";
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

const sampleScooterData = [
  { MotorRPM: 1200, MotorTemp: 65, InverterTemp: 50 },
  { MotorRPM: 900, MotorTemp: 70, InverterTemp: 55 },
  { MotorRPM: 1100, MotorTemp: 60, InverterTemp: 48 },
  { MotorRPM: 1300, MotorTemp: 68, InverterTemp: 52 },
  { MotorRPM: 1000, MotorTemp: 66, InverterTemp: 51 },
];

function aggregateMotorData(scooters) {
  if (!scooters.length) return null;

  const keys = ["MotorRPM", "MotorTemp", "InverterTemp"];

  const agg = {};

  keys.forEach((key) => {
    const values = scooters
      .map((scooter) => Number(scooter[key]))
      .filter((v) => !isNaN(v));

    if (values.length === 0) {
      agg[key] = { avg: 0, min: 0, max: 0 };
      return;
    }

    const sum = values.reduce((a, b) => a + b, 0);
    agg[key] = {
      avg: parseFloat((sum / values.length).toFixed(2)),
      min: Math.min(...values),
      max: Math.max(...values),
    };
  });

  return agg;
}

export default function MotorPerformanceChart() {
  const scooters = sampleScooterData;

  const aggregated = aggregateMotorData(scooters);

  if (!aggregated) return <p>No data available.</p>;

  // Prepare data for bar charts (avg, min, max side by side per metric)
  const chartData = Object.entries(aggregated).map(([metric, stats]) => ({
    metric,
    Average: stats.avg,
    Minimum: stats.min,
    Maximum: stats.max,
  }));

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "auto",
        padding: "1rem",
        background: "#fafafa",
        borderRadius: 8,
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Motor Performance Summary (All Scooters)
      </h2>

      {Object.entries(aggregated).map(([metric, stats]) => (
        <div
          key={metric}
          style={{
            background: "#fff",
            borderRadius: 6,
            padding: "1rem",
            marginBottom: "1.5rem",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ textTransform: "capitalize" }}>{metric}</h3>
          <p>
            Average: <strong>{stats.avg}</strong>
          </p>
          <p>
            Minimum: <strong>{stats.min}</strong>
          </p>
          <p>
            Maximum: <strong>{stats.max}</strong>
          </p>
        </div>
      ))}

      <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
        Aggregated Motor Metrics Visualization
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="metric" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="Average" fill="#8884d8" />
          <Bar dataKey="Minimum" fill="#82ca9d" />
          <Bar dataKey="Maximum" fill="#ff7f50" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
