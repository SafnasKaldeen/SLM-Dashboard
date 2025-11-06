"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { RevenueAnalyticsChart } from "@/components/revenue/revenue-analytics-chart";
import { default as TrendSection } from "@/components/revenue/trend_section"; // If it's a default export
import { RevenueHeatmap } from "@/components/revenue/revenue-heatmap";
import { RevenueComparison } from "@/components/revenue/revenue-comparison";
import { CustomerSegmentAnalysis } from "@/components/revenue/customer-segment-analysis";
import {
  RevenueFilters,
  type RevenueFilters as RevenueFiltersType,
} from "@/components/revenue/revenue-filters";
import { ExpenseAnalysis } from "@/components/revenue/expense-analysis";
import { ProfitabilityAnalysis } from "@/components/revenue/profitability-analysis";
import { PivotTableAnalysis } from "@/components/revenue/pivot-table-analysis";
import { DataChatInterface } from "@/components/revenue/data-chat-interface";
import {
  TrendingUp,
  Battery,
  MapPin,
  Users,
  BarChart3,
  PieChart,
  DollarSign,
  Zap,
  Table,
  MessageSquare,
} from "lucide-react";

import {
  ChartSkeleton,
  MetricCardSkeleton,
  TableSkeleton,
  HeatmapSkeleton,
  ChatSkeleton,
  PivotSkeleton,
} from "@/components/revenue/skeletons";

export default function RevenueAnalyticsPage() {
  const [filters, setFilters] = useState<RevenueFiltersType>({
    selectedAreas: [],
    selectedStations: [],
    customerSegments: [],
    revenueRange: {},
    paymentMethods: [],
    aggregation: "monthly",
  });
  const [activeTab, setActiveTab] = useState("trends");

  const handleFiltersChange = (newFilters: RevenueFiltersType) => {
    setFilters(newFilters);
  };

  const SimulateLoading = ({
    children,
    delay = 100,
    skeleton,
  }: {
    children: React.ReactNode;
    delay?: number;
    skeleton: React.ReactNode;
  }) => {
    const [loading, setLoading] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => setLoading(false), delay);
      return () => clearTimeout(timer);
    }, [delay]);
    return <>{loading ? skeleton : children}</>;
  };

  return (
    <div className="flex-1 space-y-6 p-4 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              Revenue & Expense Analytics
            </h1>
            <p className="text-muted-foreground">
              Comprehensive financial analysis including revenue, expenses, and
              profitability insights
            </p>
          </div>
          <Badge variant="secondary" className="hidden sm:flex">
            <Battery className="w-3 h-3 mr-1" /> Financial Analytics
          </Badge>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="border-dashed">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="w-5 h-5" /> Analytics Filters
          </CardTitle>
          <CardDescription>
            Customize your analysis by selecting areas, stations, and time
            periods
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RevenueFilters onFiltersChange={handleFiltersChange} />
        </CardContent>
      </Card>

      {/* Main Analytics Tabs */}
      <Tabs
        defaultValue="trends"
        className="space-y-6"
        onValueChange={(val) => setActiveTab(val)}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-full max-w-4xl grid-cols-8">
            <TabsTrigger value="trends">Swaps</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
            <TabsTrigger value="profitability">Profit</TabsTrigger>
            <TabsTrigger value="geographic">Geographic</TabsTrigger>
            <TabsTrigger value="comparison">Compare</TabsTrigger>
            <TabsTrigger value="Payment">Payment</TabsTrigger>
            <TabsTrigger disabled value="Customers">
              Customers
            </TabsTrigger>
            <TabsTrigger disabled value="chat">
              Chat
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Trends */}
        {activeTab === "trends" && (
          <TabsContent value="trends" className="space-y-6">
            <TrendSection filters={filters} />
          </TabsContent>
        )}

        {/* Expenses */}
        {activeTab === "expenses" && (
          <TabsContent value="expenses">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" /> Expense Analysis
                </CardTitle>
                <CardDescription>
                  Breakdown of operational expenses like electricity, payments,
                  and rent
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* <SimulateLoading skeleton={<ChartSkeleton />}> */}
                <ExpenseAnalysis filters={filters} />
                {/* </SimulateLoading> */}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Profitability */}
        {activeTab === "profitability" && (
          <TabsContent value="profitability">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" /> Profitability Analysis
                </CardTitle>
                <CardDescription>
                  Analyze revenue vs expenses to measure cost-efficiency
                </CardDescription>
              </CardHeader>
              <CardContent>
                {/* <SimulateLoading skeleton={<ChartSkeleton />}> */}
                <ProfitabilityAnalysis filters={filters} />
                {/* </SimulateLoading> */}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Pivot */}
        {/* {activeTab === "pivot" && (
          <TabsContent value="pivot">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Table className="w-5 h-5" /> Pivot Table
                </CardTitle>
                <CardDescription>
                  Create custom analysis by dragging dimensions and metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulateLoading skeleton={<PivotSkeleton />}>
                  <PivotTableAnalysis filters={filters} />
                </SimulateLoading>
              </CardContent>
            </Card>
          </TabsContent>
        )} */}

        {/* Chat */}
        {/* {activeTab === "chat" && (
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" /> Data Chat Assistant
                </CardTitle>
                <CardDescription>
                  Ask questions about your data to receive AI-powered answers
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulateLoading skeleton={<ChatSkeleton />}>
                  <DataChatInterface filters={filters} />
                </SimulateLoading>
              </CardContent>
            </Card>
          </TabsContent>
        )} */}

        {/* Heatmap */}
        {activeTab === "geographic" && (
          <TabsContent value="geographic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Geographic Heatmap
                </CardTitle>
                <CardDescription>
                  Visualize swap performance across locations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulateLoading skeleton={<HeatmapSkeleton />}>
                  <RevenueHeatmap filters={filters} />
                </SimulateLoading>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Comparison */}
        {activeTab === "comparison" && (
          <TabsContent value="comparison">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Performance Comparison
                </CardTitle>
                <CardDescription>
                  Compare swap metrics across different filters
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulateLoading skeleton={<ChartSkeleton />}>
                  <RevenueComparison filters={filters} />
                </SimulateLoading>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Customers */}
        {activeTab === "Customers" && (
          <TabsContent value="Customers">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Customer Segments
                </CardTitle>
                <CardDescription>
                  Understand revenue patterns across customer groups
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulateLoading skeleton={<ChartSkeleton />}>
                  <CustomerSegmentAnalysis filters={filters} />
                </SimulateLoading>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Payment */}
        {activeTab === "Payment" && (
          <TabsContent value="Payment">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" /> Payments Analysis
                </CardTitle>
                <CardDescription>
                  Understand revenue patterns across payment methods
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SimulateLoading skeleton={<ChartSkeleton />}>
                  <CustomerSegmentAnalysis filters={filters} />
                </SimulateLoading>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>

      {/* Quick Insights Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Quick Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Net Profit Margin
              </div>
              <div className="text-2xl font-bold text-green-600">23.5%</div>
              <div className="text-xs text-muted-foreground">
                +2.1% from last month
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Largest Expense
              </div>
              <div className="text-2xl font-bold text-orange-600">
                Electricity
              </div>
              <div className="text-xs text-muted-foreground">
                45% of total expenses
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Cost per Swap
              </div>
              <div className="text-2xl font-bold text-blue-600">$6.12</div>
              <div className="text-xs text-muted-foreground">
                -3.2% efficiency gain
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">
                Break-even Point
              </div>
              <div className="text-2xl font-bold text-purple-600">
                485 swaps
              </div>
              <div className="text-xs text-muted-foreground">
                Per station per month
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
