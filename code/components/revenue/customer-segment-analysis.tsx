"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, CreditCard, DollarSign } from "lucide-react";

const paymentMethodData = [
  {
    method: "Credit Cards",
    revenue: 425000,
    transactions: 12850,
    avgTransaction: 33.1,
    growth: 5.2,
    color: "hsl(var(--chart-1))",
  },
  {
    method: "Digital Wallets",
    revenue: 385000,
    transactions: 18200,
    avgTransaction: 21.2,
    growth: 18.7,
    color: "hsl(var(--chart-2))",
  },
  {
    method: "Bank Transfers",
    revenue: 295000,
    transactions: 3450,
    avgTransaction: 85.5,
    growth: 12.3,
    color: "hsl(var(--chart-3))",
  },
  {
    method: "Mobile Payments",
    revenue: 165000,
    transactions: 9800,
    avgTransaction: 16.8,
    growth: 22.4,
    color: "hsl(var(--chart-4))",
  },
  // {
  //   method: "Cash on Delivery",
  //   revenue: 95000,
  //   transactions: 2100,
  //   avgTransaction: 45.2,
  //   growth: -3.1,
  //   color: "hsl(var(--chart-5))",
  // },
];

const monthlyTrends = [
  {
    month: "Jan",
    creditCard: 38000,
    digitalWallet: 32000,
    bankTransfer: 24000,
    mobilePay: 12000,
    // cashOnDelivery: 8500,
  },
  {
    month: "Feb",
    creditCard: 39500,
    digitalWallet: 34500,
    bankTransfer: 25200,
    mobilePay: 13800,
    // cashOnDelivery: 8200,
  },
  {
    month: "Mar",
    creditCard: 41000,
    digitalWallet: 36000,
    bankTransfer: 26500,
    mobilePay: 15200,
    // cashOnDelivery: 7800,
  },
  {
    month: "Apr",
    creditCard: 40200,
    digitalWallet: 35200,
    bankTransfer: 25800,
    mobilePay: 14900,
    // cashOnDelivery: 7600,
  },
  {
    month: "May",
    creditCard: 42500,
    digitalWallet: 37800,
    bankTransfer: 27200,
    mobilePay: 16500,
    // cashOnDelivery: 7200,
  },
  {
    month: "Jun",
    creditCard: 44200,
    digitalWallet: 39800,
    bankTransfer: 28800,
    mobilePay: 18100,
    // cashOnDelivery: 6900,
  },
];

export function CustomerSegmentAnalysis() {
  const totalRevenue = paymentMethodData.reduce(
    (sum, method) => sum + method.revenue,
    0
  );
  const totalTransactions = paymentMethodData.reduce(
    (sum, method) => sum + method.transactions,
    0
  );

  const averageTransactionValue = totalRevenue / totalTransactions;
  const fastestGrowingMethod = paymentMethodData.reduce((prev, current) =>
    prev.growth > current.growth ? prev : current
  );

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalRevenue.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              All payment methods
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalTransactions.toLocaleString()}
            </div>
            <div className="text-xs text-muted-foreground">
              Processed payments
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Avg Transaction Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageTransactionValue.toFixed(2)}
            </div>
            <div className="text-xs text-muted-foreground">Per transaction</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              Fastest Growing
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              +{fastestGrowingMethod.growth}%
            </div>
            <div className="text-xs text-muted-foreground">
              {fastestGrowingMethod.method}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Payment Method</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center items-center">
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={paymentMethodData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  paddingAngle={2}
                  outerRadius={160}
                  fill="#8884d8"
                  dataKey="revenue"
                >
                  {paymentMethodData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="font-medium mb-2">{data.method}</div>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                              <span className="text-sm text-muted-foreground">
                                Revenue:
                              </span>
                              <span className="font-bold">
                                ${data.revenue.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-sm text-muted-foreground">
                                Transactions:
                              </span>
                              <span className="font-bold">
                                {data.transactions.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-sm text-muted-foreground">
                                Avg Value:
                              </span>
                              <span className="font-bold">
                                ${data.avgTransaction.toFixed(2)}
                              </span>
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
          </CardContent>
        </Card>

        {/* Payment Method Details */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Method Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentMethodData.map((method) => (
                <div
                  key={method.method}
                  className="flex items-center justify-between p-3 border rounded-lg h-[85px]"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: method.color }}
                    />
                    <div>
                      <div className="font-medium">{method.method}</div>
                      <div className="text-sm text-muted-foreground">
                        {method.transactions.toLocaleString()} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      {method.revenue.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {method.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600" />
                      )}
                      <span
                        className={
                          method.growth > 0 ? "text-green-600" : "text-red-600"
                        }
                      >
                        {method.growth > 0 ? "+" : ""}
                        {method.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Revenue Trends by Payment Method</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={monthlyTrends}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="month"
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <YAxis
                className="text-xs fill-muted-foreground"
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Bar
                dataKey="creditCard"
                stackId="a"
                fill="hsl(var(--chart-1))"
                name="Credit Cards"
              />
              <Bar
                dataKey="digitalWallet"
                stackId="a"
                fill="hsl(var(--chart-2))"
                name="Digital Wallets"
              />
              <Bar
                dataKey="bankTransfer"
                stackId="a"
                fill="hsl(var(--chart-3))"
                name="Bank Transfers"
              />
              <Bar
                dataKey="mobilePay"
                stackId="a"
                fill="hsl(var(--chart-4))"
                name="Mobile Payments"
              />
              {/* <Bar
                dataKey="cashOnDelivery"
                stackId="a"
                fill="hsl(var(--chart-5))"
                name="Cash on Delivery"
              /> */}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
