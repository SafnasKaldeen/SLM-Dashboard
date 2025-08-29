// =======================
// RegionalSalesTrend Component - Multi-Color Enhanced (No API)
// =======================
"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { TrendingUp, Calendar, DollarSign } from "lucide-react";

interface SalesData {
  city: string;
  region: string;
  totalSales: number;
  totalRevenue: number;
  averagePrice: number;
  marketShare: number;
  growthRate: number;
  subscriptionRate: number;
  rank: number;
}

interface SalesTrendData {
  month: string;
  [key: string]: number | string; // Dynamic keys for each region/category
}

interface RegionalSalesTrendProps {
  data: SalesData[];
  formatCurrency?: (num: number) => string;
  chartType?: "region" | "revenue" | "sales"; // Different chart types
}

// Dynamic color palette - consistent with other components
const COLOR_PALETTE = [
  "#06B6D4", // cyan
  "#10B981", // emerald
  "#8B5CF6", // violet
  "#F59E0B", // amber
  "#EF4444", // red
  "#EC4899", // pink
  "#84CC16", // lime
  "#F97316", // orange
  "#3B82F6", // blue
  "#FCD34D", // yellow
  "#14B8A6", // teal
  "#A855F7", // purple
];

export function RegionalSalesTrend({
  data = [],
  formatCurrency = (num) => `$${num.toLocaleString()}`,
  chartType = "region",
}: RegionalSalesTrendProps) {
  // Generate trend data based on the passed data
  const generateSalesTrendData = (): SalesTrendData[] => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Get unique regions/categories from data based on chart type
    const categories =
      chartType === "region"
        ? [...new Set(data.map((item) => item.region))]
        : [...new Set(data.map((item) => item.city))];

    return months.map((month, index) => {
      const monthData: SalesTrendData = { month };

      categories.forEach((category) => {
        // Get items in this category
        const categoryItems =
          chartType === "region"
            ? data.filter((item) => item.region === category)
            : data.filter((item) => item.city === category);

        const totalCategoryValue = categoryItems.reduce((sum, item) => {
          return (
            sum +
            (chartType === "revenue" ? item.totalRevenue : item.totalSales)
          );
        }, 0);

        // Generate trend with variation (simulate real data)
        const baseValue = totalCategoryValue / 12; // Average monthly value
        const seasonalFactor = 0.7 + 0.6 * Math.sin((index * Math.PI) / 6); // Seasonal variation
        const randomFactor = 0.8 + Math.random() * 0.4; // Random variation
        const growthTrend = 1 + index * 0.015; // Slight upward trend

        monthData[category] = Math.round(
          baseValue * seasonalFactor * randomFactor * growthTrend
        );
      });

      return monthData;
    });
  };

  const trendData = generateSalesTrendData();
  const categories =
    chartType === "region"
      ? [...new Set(data.map((item) => item.region))]
      : [...new Set(data.map((item) => item.city))];

  // Calculate total sales/revenue for header display
  const totalValue = data.reduce((sum, item) => {
    return (
      sum + (chartType === "revenue" ? item.totalRevenue : item.totalSales)
    );
  }, 0);

  // Generate dynamic color mapping
  const getCategoryColor = (category: string, index: number) => {
    return COLOR_PALETTE[index % COLOR_PALETTE.length];
  };

  // Create category color mapping object
  const categoryColors = categories.reduce((acc, category, index) => {
    acc[category] = getCategoryColor(category, index);
    return acc;
  }, {} as Record<string, string>);

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-lg">
          <p className="text-slate-300 font-medium mb-2">{`Month: ${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm">
              <span
                className="inline-block w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-slate-400">{entry.dataKey}:</span>
              <span className="text-white ml-1 font-medium">
                {chartType === "revenue"
                  ? formatCurrency(entry.value)
                  : entry.value.toLocaleString()}
              </span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Custom legend
  const CustomLegend = (props: any) => {
    const { payload } = props;
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-300 text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  };

  // Get chart title and description based on type
  const getChartInfo = () => {
    switch (chartType) {
      case "revenue":
        return {
          title: "Revenue Performance",
          description: "Monthly revenue trends by region",
          icon: <DollarSign className="h-5 w-5 text-cyan-400" />,
          valueLabel: "Total Revenue",
        };
      case "sales":
        return {
          title: "Sales Performance",
          description: "Monthly sales trends by city",
          icon: <TrendingUp className="h-5 w-5 text-cyan-400" />,
          valueLabel: "Total Sales",
        };
      default:
        return {
          title: "Regional Sales Trends",
          description: "Monthly sales performance by region",
          icon: <TrendingUp className="h-5 w-5 text-cyan-400" />,
          valueLabel: "Total Sales",
        };
    }
  };

  const chartInfo = getChartInfo();

  // Empty state
  if (!data || data.length === 0) {
    return (
      <Card className="col-span-4 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            {chartInfo.icon}
            {chartInfo.title}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {chartInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[350px] text-slate-400">
          <div className="text-center">
            <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No sales data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="col-span-4 border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              {chartInfo.icon}
              {chartInfo.title}
            </CardTitle>
            <CardDescription className="text-slate-400">
              {chartInfo.description}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-400">{chartInfo.valueLabel}</div>
            <div className="text-lg font-semibold text-white">
              {chartType === "revenue"
                ? formatCurrency(totalValue)
                : totalValue.toLocaleString()}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {categories.length}{" "}
              {chartType === "region" ? "Regions" : "Cities"}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pl-2">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={trendData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="month"
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fontSize: 12 }}
              />
              <YAxis
                stroke="#9CA3AF"
                fontSize={12}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) =>
                  chartType === "revenue"
                    ? formatCurrency(value)
                    : value.toLocaleString()
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />

              {categories.map((category, index) => (
                <Line
                  key={category}
                  type="monotone"
                  dataKey={category}
                  stroke={categoryColors[category]}
                  strokeWidth={2.5}
                  dot={{ fill: categoryColors[category], strokeWidth: 2, r: 4 }}
                  activeDot={{
                    r: 6,
                    stroke: categoryColors[category],
                    strokeWidth: 2,
                  }}
                  connectNulls={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
