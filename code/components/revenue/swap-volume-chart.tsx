"use client";

import { useState, useMemo } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { AlertCircle } from "lucide-react";

import { ScrollArea } from "@/components/ui/scroll-area";

import { useSwaps } from "@/hooks/Snowflake/useSwaps";

function groupByCategory(areawiseData) {
  const categoriesMap = new Map();

  areawiseData.forEach(({ LOCATION, STATIONNAME, TOTAL_SWAPS }) => {
    if (!categoriesMap.has(LOCATION)) {
      categoriesMap.set(LOCATION, {
        category: LOCATION,
        areas: [],
        color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
      });
    }
    categoriesMap.get(LOCATION).areas.push({
      area: STATIONNAME,
      swaps: TOTAL_SWAPS,
      percentage: 0,
      key: STATIONNAME,
    });
  });

  // Calculate percentage per category
  for (const category of categoriesMap.values()) {
    const totalSwapsCategory = category.areas.reduce(
      (sum, a) => sum + a.swaps,
      0
    );
    category.areas = category.areas.map((area) => ({
      ...area,
      percentage: totalSwapsCategory
        ? ((area.swaps / totalSwapsCategory) * 100).toFixed(1)
        : 0,
    }));
  }

  // Create "All Stations" category combining all areas
  const allAreas = areawiseData.map(({ STATIONNAME, TOTAL_SWAPS }) => ({
    area: STATIONNAME,
    swaps: TOTAL_SWAPS,
    key: STATIONNAME,
  }));

  const totalSwapsAll = allAreas.reduce((sum, a) => sum + a.swaps, 0);

  const allStationsCategory = {
    category: "All Stations",
    areas: allAreas.map((area) => ({
      ...area,
      percentage: totalSwapsAll
        ? ((area.swaps / totalSwapsAll) * 100).toFixed(1)
        : 0,
    })),
    color: "#8884d8", // fixed color for all stations
  };

  // Return with "All Stations" first
  return [allStationsCategory, ...Array.from(categoriesMap.values())];
}

export default function AreaSwapsChart({ filters }) {
  const { areawiseData, loading, error } = useSwaps(filters);

  const categories = useMemo(() => {
    if (!areawiseData.length) return [];
    return groupByCategory(areawiseData);
  }, [areawiseData]);

  // Default selected index is 0 ("All Stations")
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);

  if (loading) return <div>Loading data...</div>;
  if (error)
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Unable to load chart data
            </p>
            <p className="text-xs text-red-500 mt-1">{error.message}</p>
          </div>
        </CardContent>
      </Card>
    );
  if (!categories.length) return <div>No data available</div>;

  const category = categories[selectedCategoryIndex];

  return (
    <ScrollArea className="h-[500px] rounded-md border p-2">
      <div className="space-y-4">
        {/* Dropdown Selector */}
        <div className="flex justify-center mb-4">
          <Select
            value={category.category}
            onValueChange={(value) => {
              const idx = categories.findIndex((c) => c.category === value);
              if (idx !== -1) setSelectedCategoryIndex(idx);
            }}
            className="w-64"
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.category} value={cat.category}>
                  {cat.category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Pie Chart Card */}
        <Card className="p-4 mx-auto max-w-4xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.category}
            </CardTitle>
            <CardDescription>
              Total:{" "}
              {category.areas
                .reduce((sum, area) => sum + area.swaps, 0)
                .toLocaleString()}{" "}
              swaps
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={category.areas}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="swaps"
                  >
                    {category.areas.map((entry, index) => (
                      <Cell
                        key={entry.key} // unique key
                        fill={`hsl(${(index * 40) % 360}, 70%, 60%)`}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="grid gap-2">
                              <div className="font-medium">{data.area}</div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Swaps
                                  </span>
                                  <div className="font-bold">
                                    {data.swaps.toLocaleString()}
                                  </div>
                                </div>
                                <div>
                                  <span className="text-[0.70rem] uppercase text-muted-foreground">
                                    Share
                                  </span>
                                  <div className="font-bold">
                                    {data.percentage}%
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="space-y-2">
                {category.areas.map((area, index) => (
                  <div
                    key={area.key} // unique key
                    className="flex items-center justify-between p-2 rounded border bg-card"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{
                          backgroundColor: `hsl(${
                            (index * 40) % 360
                          }, 70%, 60%)`,
                        }}
                      />
                      <span className="text-sm font-medium">{area.area}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">
                        {area.swaps.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {area.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Section */}
        {/* <Card className="mt-6">
          <CardHeader>
            <CardTitle>Category Summary</CardTitle>
            <CardDescription>Overview of all area categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categories.map((category) => {
                const totalSwaps = category.areas.reduce(
                  (sum, area) => sum + area.swaps,
                  0
                );
                return (
                  <div
                    key={category.category}
                    className="text-center p-4 rounded-lg border bg-card"
                  >
                    <div
                      className="w-8 h-8 rounded-full mx-auto mb-2"
                      style={{ backgroundColor: category.color }}
                    />
                    <div className="font-semibold text-lg">
                      {totalSwaps.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {category.category}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card> */}
      </div>
    </ScrollArea>
  );
}
