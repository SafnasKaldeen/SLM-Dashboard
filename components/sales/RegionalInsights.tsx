import { Target, MapPin, Users, DollarSign } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";

interface RegionalData {
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

interface RegionalInsightsProps {
  data: RegionalData[];
}

export default function RegionalInsights({ data = [] }: RegionalInsightsProps) {
  // Helper functions to find leaders in different categories
  const getExpansionOpportunity = () => {
    return (
      [...data]
        .filter((r) => r.growthRate > 10)
        .sort((a, b) => b.growthRate - a.growthRate)[0]?.city || "N/A"
    );
  };

  const getMarketLeader = () => {
    return (
      [...data].sort((a, b) => b.marketShare - a.marketShare)[0]?.city || "N/A"
    );
  };

  const getSubscriptionLeader = () => {
    return (
      [...data].sort((a, b) => b.subscriptionRate - a.subscriptionRate)[0]
        ?.city || "N/A"
    );
  };

  const getPremiumMarket = () => {
    return (
      [...data].sort((a, b) => b.averagePrice - a.averagePrice)[0]?.city ||
      "N/A"
    );
  };

  // Get additional metrics for recommendations
  const getHighGrowthCitiesCount = () => {
    return data.filter((r) => r.growthRate > 10).length;
  };

  const getUnderperformingRegions = () => {
    return data.filter((r) => r.marketShare < 5).length;
  };

  return (
    <Card className="border-slate-700/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-white">Regional Insights</CardTitle>
        <CardDescription className="text-slate-400">
          Key performance indicators and strategic recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Expansion Opportunity */}
          <div className="bg-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-cyan-500" />
              <span className="text-sm font-medium text-slate-300">
                Expansion Opportunity
              </span>
            </div>
            <div className="text-lg font-bold text-white">
              {getExpansionOpportunity()}
            </div>
            <div className="text-xs text-slate-400">
              Highest growth potential
            </div>
          </div>

          {/* Market Leader */}
          <div className="bg-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium text-slate-300">
                Market Leader
              </span>
            </div>
            <div className="text-lg font-bold text-white">
              {getMarketLeader()}
            </div>
            <div className="text-xs text-slate-400">Largest market share</div>
          </div>

          {/* Subscription Leader */}
          <div className="bg-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium text-slate-300">
                Subscription Leader
              </span>
            </div>
            <div className="text-lg font-bold text-white">
              {getSubscriptionLeader()}
            </div>
            <div className="text-xs text-slate-400">
              Highest subscription rate
            </div>
          </div>

          {/* Premium Market */}
          <div className="bg-slate-700/50 p-4 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium text-slate-300">
                Premium Market
              </span>
            </div>
            <div className="text-lg font-bold text-white">
              {getPremiumMarket()}
            </div>
            <div className="text-xs text-slate-400">Highest average price</div>
          </div>
        </div>

        {/* Strategic Recommendations */}
        <div className="bg-cyan-500/10 border border-cyan-500/30 p-4 rounded-lg backdrop-blur-sm">
          <h4 className="text-cyan-400 font-medium mb-2">
            Strategic Recommendations
          </h4>
          <ul className="text-sm text-slate-300 space-y-1">
            <li>
              • Focus expansion efforts on high-growth cities
              {getHighGrowthCitiesCount() > 0 && (
                <span className="text-cyan-400 ml-1">
                  ({getHighGrowthCitiesCount()} identified)
                </span>
              )}
            </li>
            <li>
              • Increase dealer network in underperforming regions
              {getUnderperformingRegions() > 0 && (
                <span className="text-yellow-400 ml-1">
                  ({getUnderperformingRegions()} need attention)
                </span>
              )}
            </li>
            <li>• Develop region-specific marketing strategies</li>
            <li>• Optimize inventory based on regional preferences</li>
          </ul>
        </div>

        {/* Additional Insights */}
        {data.length > 0 && (
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="text-center p-2 bg-slate-700/30 rounded">
              <div className="text-slate-400">Total Regions</div>
              <div className="text-slate-200 font-medium text-sm">
                {data.length}
              </div>
            </div>
            <div className="text-center p-2 bg-slate-700/30 rounded">
              <div className="text-slate-400">Avg Growth Rate</div>
              <div className="text-slate-200 font-medium text-sm">
                {(
                  data.reduce((sum, r) => sum + r.growthRate, 0) / data.length
                ).toFixed(1)}
                %
              </div>
            </div>
            <div className="text-center p-2 bg-slate-700/30 rounded">
              <div className="text-slate-400">Top Performer</div>
              <div className="text-slate-200 font-medium text-sm">
                {data.find((r) => r.rank === 1)?.city || "N/A"}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
