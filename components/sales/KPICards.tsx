import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ShoppingCart,
  DollarSign,
  CreditCard,
  Users,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface KPICardsProps {
  kpis: {
    totalSales: number;
    totalRevenue: number;
    averageOrderValue: number;
    subscriptionRate: number;
    salesGrowth: number;
    revenueGrowth: number;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-LK").format(num);
};

export const KPICards = ({ kpis }: KPICardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <Card className="border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-cyan-500" />
            Total Sales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatNumber(kpis.totalSales)}
          </div>
          <div className="flex items-center mt-2">
            {kpis.salesGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm ${
                kpis.salesGrowth >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {Math.abs(kpis.salesGrowth).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-sm ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-emerald-500" />
            Total Revenue
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(kpis.totalRevenue)}
          </div>
          <div className="flex items-center mt-2">
            {kpis.revenueGrowth >= 0 ? (
              <TrendingUp className="h-4 w-4 text-emerald-500 mr-1" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
            )}
            <span
              className={`text-sm ${
                kpis.revenueGrowth >= 0 ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {Math.abs(kpis.revenueGrowth).toFixed(1)}%
            </span>
            <span className="text-slate-400 text-sm ml-1">vs last month</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-purple-500" />
            Avg Order Value
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatCurrency(kpis.averageOrderValue)}
          </div>
          <div className="text-sm text-slate-400 mt-2">Per transaction</div>
        </CardContent>
      </Card>

      <Card className="border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-slate-400 flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            Subscription Rate
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {kpis.subscriptionRate.toFixed(1)}%
          </div>
          <div className="text-sm text-slate-400 mt-2">
            Battery subscription
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
