"use client";

import React from "react";
import { useAreaStations } from "../hooks/Snowflake/useAreaStations";

const StationList = () => {
  const { data, loading, error } = useAreaStations();

  if (loading) return <p>Loading station data...</p>;
  if (error) return <p style={{ color: "red" }}>Error: {error}</p>;

  return (
    <div>
      {Object.entries(data || {}).map(([area, stations]) => (
        <div key={area}>
          <h3>{area}</h3>
          <ul>
            {stations.map((station) => (
              <li key={station}>{station}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default StationList;
