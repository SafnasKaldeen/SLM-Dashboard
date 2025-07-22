"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Clock } from "lucide-react";

export function RevenueOverview() {
  const kpis = [
    {
      label: "Revenue Growth",
      value: "12.5%",
      trend: "up",
      description: "Month over month",
      icon: TrendingUp,
    },
    {
      label: "Peak Hour Revenue",
      value: "$2,450",
      trend: "up",
      description: "8-9 AM daily avg",
      icon: Clock,
    },
    {
      label: "Weekend vs Weekday",
      value: "+18%",
      trend: "up",
      description: "Weekend premium",
      icon: DollarSign,
    },
    // {
    //   label: "Seasonal Impact",
    //   value: "-5.2%",
    //   trend: "down",
    //   description: "Winter decline",
    //   icon: TrendingDown,
    // },
  ];

  return (
    <div className="space-y-4">
      {kpis.map((kpi, index) => {
        const Icon = kpi.icon;
        const isPositive = kpi.trend === "up";

        return (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">{kpi.label}</p>
                  <p className="text-lg font-semibold">{kpi.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {kpi.description}
                  </p>
                </div>
                <div
                  className={`p-2 rounded-full ${
                    isPositive
                      ? "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
