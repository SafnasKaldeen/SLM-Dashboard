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
  description: string;
  formatter?: (val: number) => string;
}

const KPICard = ({
  icon: Icon,
  label,
  value,
  prevValue,
  description,
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
          {description}
        </div>
      </CardContent>
    </Card>
  );
};

export default KPICard;
