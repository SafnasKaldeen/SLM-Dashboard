import { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, ArrowDownUp, MapPin } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

export default function RegionalPerformanceCards({
  filteredData = [],
  formatNumber = (num: number) => num.toLocaleString(),
  formatCurrency = (num: number) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num),
}) {
  const [isDescending, setIsDescending] = useState(true);
  const [sortBy, setSortBy] = useState("totalRevenue"); // Default sort by revenue

  // Sort data based on current settings
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];
      return isDescending ? bValue - aValue : aValue - bValue;
    });
  }, [filteredData, isDescending, sortBy]);

  const toggleOrder = () => setIsDescending((prev) => !prev);

  // Get max values for progress bars
  const maxRevenue = Math.max(
    ...filteredData.map((item) => item.totalRevenue),
    0
  );

  const getRankBadge = (index: number, originalRank: number) => {
    if (originalRank <= 3) {
      const badges = {
        1: { icon: "🥇", text: "Gold", class: "bg-yellow-400/90 text-black" },
        2: { icon: "🥈", text: "Silver", class: "bg-gray-300 text-black" },
        3: { icon: "🥉", text: "Bronze", class: "bg-orange-300 text-black" },
      };
      const badge = badges[originalRank];
      return (
        <Badge className={`${badge.class} rounded-full px-2 py-1 shadow-sm`}>
          {badge.icon} <span className="ml-1 font-medium">{badge.text}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="rounded-full px-2 py-1">
        #{originalRank}
      </Badge>
    );
  };

  const getRegionColor = (region: string) => {
    const colors: Record<string, string> = {
      "North America": "bg-blue-100 text-blue-800",
      Europe: "bg-green-100 text-green-800",
      "Asia Pacific": "bg-purple-100 text-purple-800",
      "South America": "bg-orange-100 text-orange-800",
      Africa: "bg-red-100 text-red-800",
      "Middle East": "bg-yellow-100 text-yellow-800",
    };
    return colors[region] || "bg-gray-100 text-gray-800";
  };

  // Empty state
  if (!filteredData || filteredData.length === 0) {
    return (
      <Card className="border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">
            Regional Performance Details
          </CardTitle>
          <CardDescription className="text-slate-400">
            Comprehensive performance metrics by city
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64 text-slate-400">
          <div className="text-center">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No regional data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-700/50 backdrop-blur-sm h-full flex flex-col">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 flex-shrink-0">
        <div>
          <CardTitle className="text-white">
            Regional Performance Details
          </CardTitle>
          <CardDescription className="text-slate-400">
            Comprehensive performance metrics by city
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={toggleOrder}
            className="text-xs gap-1 border-slate-600 text-slate-300 hover:bg-slate-700"
          >
            <ArrowDownUp className="w-4 h-4" />
            {isDescending ? "High to Low" : "Low to High"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 px-6 pb-6">
        <div
          className="h-full overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600 hover:scrollbar-thumb-slate-500"
          style={{ maxHeight: "calc(3 * 180px + 2 * 16px)" }} // 3 cards height + gaps
        >
          <div className="space-y-4">
            {sortedData.map((region, index) => {
              const revenuePercentage =
                maxRevenue > 0 ? (region.totalRevenue / maxRevenue) * 100 : 0;

              return (
                <div
                  key={region.city}
                  className="p-4 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors min-h-[180px] flex-shrink-0"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3
                          className="text-sm font-semibold text-slate-200 truncate max-w-[120px]"
                          title={region.city}
                        >
                          {region.city}
                        </h3>
                        <Badge
                          className={`text-xs font-medium rounded-full px-2 py-1 ${getRegionColor(
                            region.region
                          )}`}
                        >
                          {region.region}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2"></div>
                    </div>
                    <div className="text-right space-y-1">
                      <div className="flex items-center">
                        <span
                          className={`text-xs font-medium ${
                            region.growthRate >= 0
                              ? "text-emerald-500"
                              : "text-red-500"
                          }`}
                        >
                          {getRankBadge(index, region.rank)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-3 text-xs">
                    <div className="text-center p-2 bg-slate-700/30 rounded">
                      <div className="text-slate-400">Avg Price</div>
                      <div className="text-slate-200 font-medium">
                        {formatCurrency(region.averagePrice)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded">
                      <div className="text-slate-400">Total Revenue</div>
                      <div className="text-slate-200 font-medium">
                        {formatCurrency(region.totalRevenue)}
                      </div>
                    </div>
                    <div className="text-center p-2 bg-slate-700/30 rounded">
                      <div className="text-slate-400">Total Sales</div>
                      <div className="text-slate-200 font-medium">
                        {formatNumber(region.totalSales)}
                      </div>
                    </div>
                  </div>

                  {/* Revenue Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        Revenue Performance
                      </span>
                      <span className="text-slate-300">
                        {revenuePercentage.toFixed(1)}% of top
                      </span>
                    </div>
                    <Progress
                      value={revenuePercentage}
                      className="h-2 bg-slate-700"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
