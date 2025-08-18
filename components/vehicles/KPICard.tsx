"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon } from "lucide-react";

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

interface KPICardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  prevValue?: number;
  formatter?: (val: number) => string;
}

const KPICard = ({
  icon: Icon,
  label,
  value,
  prevValue,
  formatter = (val: number) => formatNumber(val),
}: KPICardProps) => {
  const trend =
    prevValue && prevValue !== 0
      ? ((value - prevValue) / prevValue) * 100
      : null;
  const isIncrease = trend != null && trend >= 0;

  const formatPercent = (val: number) =>
    `${val >= 0 ? "+" : "-"}${Math.abs(val).toFixed(1)}%`;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatter(value)}</div>
        <div className="mt-3 flex justify-between items-center text-xs text-muted-foreground">
          {prevValue !== undefined && <div>Prev: {formatter(prevValue)}</div>}
          {trend === null ? (
            <span className="text-muted-foreground">N/A</span>
          ) : (
            <div className="flex items-center">
              {isIncrease ? (
                <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
              ) : (
                <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
              )}
              <span className={isIncrease ? "text-green-500" : "text-red-500"}>
                {formatPercent(trend)}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
