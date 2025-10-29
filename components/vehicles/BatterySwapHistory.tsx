import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CreditCard,
  Wallet,
  TrendingUp,
  DollarSign,
  MapPin,
  Battery,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Users,
  Calendar,
  Activity,
  Star,
  Filter,
  Download,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Area,
  AreaChart,
} from "recharts";

// -------------------- Interfaces --------------------
interface PaymentTransaction {
  PAYMENT_ID: string;
  PAYMENT_METHOD_ID: string;
  APPROVED_SWAP_ID: string;
  CUSTOMER_ID: string;
  RATING_ID: string;
  PAYMENT_METHOD: string;
  PAYMENT_STATUS: string;
  AMOUNT: number;
  CURRENCY: string;
  TRANSACTION_ID: string;
  LOCATION_NAME: string;
  STATION_NAME: string;
  CREATED_EPOCH: number;
  CREATED_AT: number;
  AMOUNT_PAID: number;
  CHARGE_AMOUNT: number;
  CHARGE_PERCENTAGE: number;
  REFUND_AMOUNT: number;
  REFUND_PERCENTAGE: number;
  PAYMENT_TRIES: number;
  PREVIOUS_WALLET_BAL: number;
  WALLET_BALANCE: number;
  WALLET_MIN_BAL: number;
  WALLET_CODE: string;
  PAYMENT_METHOD_TYPE: string;
  PAYMENT_TYPE: string;
  REASON: string;
  AGREEMENT: string;
  EVENT_CODE: string;
  EVENT_MSG: string;
  CREATED_EPOCH: number;
  DETAILS_JSON: any;
}

interface DailyRevenue {
  date: string;
  revenue: number;
  swapCount: number;
  avgAmount: number;
  successfulPayments: number;
  failedPayments: number;
  refundAmount: number;
}

interface PaymentMethodStats {
  method: string;
  count: number;
  totalAmount: number;
  avgAmount: number;
  successRate: number;
  color: string;
}

interface LocationStats {
  locationName: string;
  stationName: string;
  swapCount: number;
  totalRevenue: number;
  avgAmount: number;
  successRate: number;
  topPaymentMethod: string;
}

interface FilterOptions {
  dateRange: string;
  paymentMethod: string;
  status: string;
  location: string;
}

// -------------------- Skeleton Components --------------------
const ChartSkeleton = () => (
  <div className="h-[300px] w-full bg-slate-800/50 animate-pulse rounded-lg flex items-center justify-center">
    <div className="text-slate-400">Loading chart data...</div>
  </div>
);

const MetricSkeleton = () => (
  <div className="h-24 bg-slate-800/50 animate-pulse rounded-lg" />
);

// -------------------- Helper Functions --------------------
function formatCurrency(amount: number, currency: string = "LKR"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(timestamp: number): string {
  // Handle both 10-digit (seconds) and 13-digit (milliseconds) timestamps
  const date =
    timestamp > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatDateTime(timestamp: number): string {
  // Handle both 10-digit (seconds) and 13-digit (milliseconds) timestamps
  const date =
    timestamp > 9999999999 ? new Date(timestamp) : new Date(timestamp * 1000);
  return date.toLocaleString("en-US", {
    year: "2-digit",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethodColor(method: string): string {
  const colorMap: Record<string, string> = {
    WALLET: "#10b981",
    CARD: "#3b82f6",
    CASH: "#f59e0b",
    UPI: "#8b5cf6",
    BANK_TRANSFER: "#06b6d4",
    CREDIT_CARD: "#ef4444",
    DEBIT_CARD: "#84cc16",
  };
  return colorMap[method] || "#64748b";
}

// -------------------- Data Processing --------------------
function processPaymentData(rawData: PaymentTransaction[]) {
  try {
    // Filter for swap-related payments
    const swapPayments = rawData.filter(
      (payment) => payment.PAYMENT_TYPE === "BATTERY_SWAP"
    );

    // Daily revenue analysis
    const dailyData: Record<string, DailyRevenue> = {};

    swapPayments.forEach((payment) => {
      const date = new Date(payment.CREATED_EPOCH).toISOString().split("T")[0];

      if (!dailyData[date]) {
        dailyData[date] = {
          date,
          revenue: 0,
          swapCount: 0,
          avgAmount: 0,
          successfulPayments: 0,
          failedPayments: 0,
          refundAmount: 0,
        };
      }

      dailyData[date].swapCount += 1;
      dailyData[date].revenue += payment.AMOUNT || 0;
      dailyData[date].refundAmount += payment.REFUND_AMOUNT || 0;

      if (
        payment.PAYMENT_STATUS === "PAID" ||
        payment.PAYMENT_STATUS === "VOIDED"
      ) {
        dailyData[date].successfulPayments += 1;
      } else {
        dailyData[date].failedPayments += 1;
      }
    });

    // Calculate averages
    Object.values(dailyData).forEach((day) => {
      day.avgAmount = day.swapCount > 0 ? day.revenue / day.swapCount : 0;
    });

    const dailyRevenue = Object.values(dailyData)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reverse(); // Most recent first

    // Payment method analysis
    const methodStats: Record<string, PaymentMethodStats> = {};

    swapPayments.forEach((payment) => {
      const method =
        payment.PAYMENT_METHOD || payment.PAYMENT_METHOD_TYPE || "UNKNOWN";

      if (!methodStats[method]) {
        methodStats[method] = {
          method,
          count: 0,
          totalAmount: 0,
          avgAmount: 0,
          successRate: 0,
          color: getPaymentMethodColor(method),
        };
      }

      methodStats[method].count += 1;
      methodStats[method].totalAmount += payment.AMOUNT || 0;
    });

    // Calculate success rates and averages
    Object.values(methodStats).forEach((stat) => {
      stat.avgAmount = stat.count > 0 ? stat.totalAmount / stat.count : 0;
      const methodPayments = swapPayments.filter(
        (p) => (p.PAYMENT_METHOD || p.PAYMENT_METHOD_TYPE) === stat.method
      );
      const successfulPayments = methodPayments.filter(
        (p) => p.PAYMENT_STATUS === "PAID" || p.PAYMENT_STATUS === "VOIDED"
      ).length;
      stat.successRate =
        methodPayments.length > 0
          ? (successfulPayments / methodPayments.length) * 100
          : 0;
    });

    const paymentMethods = Object.values(methodStats);

    // Location analysis
    const locationStats: Record<string, LocationStats> = {};

    swapPayments.forEach((payment) => {
      const key = `${payment.LOCATION_NAME}-${payment.STATION_NAME}`;

      if (!locationStats[key]) {
        locationStats[key] = {
          locationName: payment.LOCATION_NAME || "Unknown Location",
          stationName: payment.STATION_NAME || "Unknown Station",
          swapCount: 0,
          totalRevenue: 0,
          avgAmount: 0,
          successRate: 0,
          topPaymentMethod: "UNKNOWN",
        };
      }

      locationStats[key].swapCount += 1;
      locationStats[key].totalRevenue += payment.AMOUNT || 0;
    });

    // Calculate location averages and success rates
    Object.values(locationStats).forEach((stat) => {
      stat.avgAmount =
        stat.swapCount > 0 ? stat.totalRevenue / stat.swapCount : 0;

      const locationPayments = swapPayments.filter(
        (p) =>
          p.LOCATION_NAME === stat.locationName &&
          p.STATION_NAME === stat.stationName
      );
      const successfulPayments = locationPayments.filter(
        (p) => p.PAYMENT_STATUS === "PAID" || p.PAYMENT_STATUS === "VOIDED"
      ).length;
      stat.successRate =
        locationPayments.length > 0
          ? (successfulPayments / locationPayments.length) * 100
          : 0;

      // Find top payment method for this location
      const methodCounts: Record<string, number> = {};
      locationPayments.forEach((p) => {
        const method = p.PAYMENT_METHOD || p.PAYMENT_METHOD_TYPE || "UNKNOWN";
        methodCounts[method] = (methodCounts[method] || 0) + 1;
      });
      stat.topPaymentMethod =
        Object.keys(methodCounts).reduce((a, b) =>
          methodCounts[a] > methodCounts[b] ? a : b
        ) || "UNKNOWN";
    });

    const locations = Object.values(locationStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 10); // Top 10 locations

    // Calculate overall metrics
    const totalRevenue = swapPayments.reduce(
      (sum, p) => sum + (p.AMOUNT_PAID || p.AMOUNT || 0),
      0
    );
    const totalSwaps = swapPayments.length;
    const totalRefunds = swapPayments.reduce(
      (sum, p) => sum + (p.REFUND_AMOUNT || 0),
      0
    );
    const successfulPayments = swapPayments.filter(
      (p) => p.PAYMENT_STATUS === "PAID" || p.PAYMENT_STATUS === "VOIDED"
    ).length;
    const successRate =
      totalSwaps > 0 ? (successfulPayments / totalSwaps) * 100 : 0;
    const avgTransactionValue = totalSwaps > 0 ? totalRevenue / totalSwaps : 0;
    const uniqueCustomers = new Set(swapPayments.map((p) => p.CUSTOMER_ID))
      .size;
    const uniqueLocations = new Set(
      swapPayments.map((p) => `${p.LOCATION_NAME}-${p.STATION_NAME}`)
    ).size;

    const uniqueStations = new Set(swapPayments.map((p) => p.STATION_NAME))
      .size;

    // Payment status distribution
    const statusDistribution = swapPayments.reduce((acc, payment) => {
      const status = payment.PAYMENT_STATUS || "UNKNOWN";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      dailyRevenue,
      paymentMethods,
      locations,
      swapPayments,
      metrics: {
        totalRevenue,
        totalSwaps,
        totalRefunds,
        successRate,
        avgTransactionValue,
        uniqueCustomers,
        uniqueLocations,
        uniqueStations,
      },
      statusDistribution,
    };
  } catch (error) {
    console.error("Error processing payment data:", error);
    return {
      dailyRevenue: [],
      paymentMethods: [],
      locations: [],
      swapPayments: [],
      metrics: {
        totalRevenue: 0,
        totalSwaps: 0,
        totalRefunds: 0,
        successRate: 0,
        avgTransactionValue: 0,
        uniqueCustomers: 0,
        uniqueLocations: 0,
        uniqueStations: 0,
      },
      statusDistribution: {},
    };
  }
}

// -------------------- Pagination Component --------------------
const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700">
      <div className="text-sm text-slate-400">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="p-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          let pageNum;
          if (totalPages <= 5) {
            pageNum = i + 1;
          } else if (currentPage <= 3) {
            pageNum = i + 1;
          } else if (currentPage >= totalPages - 2) {
            pageNum = totalPages - 4 + i;
          } else {
            pageNum = currentPage - 2 + i;
          }

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                currentPage === pageNum
                  ? "bg-cyan-600 text-white"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              }`}
            >
              {pageNum}
            </button>
          );
        })}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="p-2 text-slate-400 hover:text-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// -------------------- Main Component --------------------
export default function BatterySwapHistory({
  CustomerID,
}: {
  CustomerID: string;
}) {
  const [rawData, setRawData] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const rowsPerPage = 20;

  const fetchData = useCallback(async () => {
    try {
      setRefreshing(true);
      setError(null);

      const cutoffUnix = Date.now() - 100 * 24 * 60 * 60 * 1000; // 100 days ago in ms

      const response = await fetch("/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sql: `
            SELECT *
              FROM SOURCE_DATA.DYNAMO_DB.FACT_PAYMENT
              WHERE CUSTOMER_ID = '${CustomerID}'
                AND CREATED_EPOCH >= ${cutoffUnix}
                AND PAYMENT_TYPE = 'BATTERY_SWAP'
              ORDER BY CREATED_EPOCH DESC
              LIMIT 200;
            `,
        }),
      });

      if (!response.ok) {
        throw new Error(
          `API request failed with status ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Fetched payment data:", data);
      if (data.error) {
        throw new Error(data.error);
      }

      // Validate that we received an array
      if (!Array.isArray(data)) {
        throw new Error(
          "Invalid data format: expected an array of payment transactions"
        );
      }

      // Basic validation of data structure
      if (data.length > 0) {
        const firstRecord = data[0];
        const requiredFields = [
          "PAYMENT_ID",
          "CUSTOMER_ID",
          "PAYMENT_STATUS",
          "CREATED_EPOCH",
        ];
        const missingFields = requiredFields.filter(
          (field) => !(field in firstRecord)
        );

        if (missingFields.length > 0) {
          console.warn(
            `Warning: Missing expected fields in data: ${missingFields.join(
              ", "
            )}`
          );
        }
      }

      setRawData(data);
      console.log(`Loaded ${data.length} payment records`);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unknown error occurred while fetching data";
      setError(errorMessage);
      console.error("Error fetching payment data:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Memoize analytics processing for performance
  const analytics = useMemo(() => {
    console.log("Processing payment data for analytics...", rawData);
    return processPaymentData(rawData);
  }, [rawData]);

  // Pagination calculations
  const totalPages = Math.ceil(analytics.swapPayments.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPageData = useMemo(
    () =>
      analytics.swapPayments
        .sort((a, b) => b.CREATED_EPOCH - a.CREATED_EPOCH)
        .slice(startIndex, endIndex),
    [analytics.swapPayments, startIndex, endIndex]
  );

  const handleRefresh = useCallback(() => {
    if (!refreshing) {
      fetchData();
    }
  }, [refreshing, fetchData]);

  if (loading) {
    return (
      <div className="grid gap-6 p-6 min-h-screen">
        <div className="space-y-2">
          <div className="h-8 w-80 bg-slate-800/50 animate-pulse rounded" />
          <div className="h-4 w-96 bg-slate-800/50 animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <MetricSkeleton key={i} />
          ))}
        </div>
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-slate-950 min-h-screen">
        <Card className="bg-red-900/20 border-red-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              Error Loading Payment Data
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-red-300">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-100">
            Battery Swap Payment Analytics - Last 3 months
          </h1>
          <p className="text-slate-400">
            Comprehensive payment insights and financial metrics for battery
            swap operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
          <button
            className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors"
            onClick={() => {
              const csvContent = analytics.swapPayments
                .map((payment) => Object.values(payment).join(","))
                .join("\n");
              const blob = new Blob([csvContent], { type: "text/csv" });
              const url = window.URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "battery_swap_payments.csv";
              a.click();
            }}
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <span className="text-sm text-slate-400">Total Revenue</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(analytics.metrics.totalRevenue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              From {analytics.metrics.totalSwaps} swaps
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Battery className="w-4 h-4 text-cyan-400" />
              <span className="text-sm text-slate-400">Total Swaps</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {analytics.metrics.totalSwaps.toLocaleString()}
            </div>
            <div className="text-xs text-green-400 mt-1">
              {analytics.metrics.successRate.toFixed(1)}% success rate
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-slate-400">Avg Transaction</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {formatCurrency(analytics.metrics.avgTransactionValue)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Per swap transaction
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-orange-400" />
              <span className="text-sm text-slate-400">Stations Accessed</span>
            </div>
            <div className="text-2xl font-bold text-slate-100">
              {analytics.metrics.uniqueStations}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Across {analytics.metrics.uniqueLocations} locations
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Trend Chart */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Daily Revenue & Swap Volume
          </CardTitle>
          <CardDescription className="text-slate-400">
            Revenue trends and swap volume over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={analytics.dailyRevenue.slice(0, 30).reverse()}>
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="swapGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                className="stroke-slate-700"
              />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    year: "2-digit",
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                yAxisId="revenue"
                orientation="left"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
                tickFormatter={(value) => `${value} Rs`}
              />
              <YAxis
                yAxisId="swaps"
                orientation="right"
                tick={{ fontSize: 12, fill: "#94a3b8" }}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-lg border bg-slate-900/95 backdrop-blur-sm p-4 shadow-xl border-slate-700">
                        <div className="text-sm font-medium text-slate-200 mb-2">
                          {new Date(label).toLocaleDateString("en-US", {
                            weekday: "long",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-slate-400 mb-1">Revenue</div>
                            <div className="font-bold text-green-400">
                              {formatCurrency(data.revenue)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-1">Swaps</div>
                            <div className="font-bold text-blue-400">
                              {data.swapCount}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-1">
                              Avg Amount
                            </div>
                            <div className="font-bold text-purple-400">
                              {formatCurrency(data.avgAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-400 mb-1">
                              Success Rate
                            </div>
                            <div className="font-bold text-cyan-400">
                              {(
                                (data.successfulPayments /
                                  (data.successfulPayments +
                                    data.failedPayments)) *
                                100
                              ).toFixed(1)}
                              %
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                yAxisId="revenue"
                type="monotone"
                dataKey="revenue"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#revenueGradient)"
                name="Revenue"
              />
              <Line
                yAxisId="swaps"
                type="monotone"
                dataKey="swapCount"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                name="Swaps"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Payment Methods & Top Locations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods Distribution */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Payment Method Performance
            </CardTitle>
            <CardDescription className="text-slate-400">
              Usage, revenue, and success rates by payment method
            </CardDescription>
          </CardHeader>
          <CardContent>
            {analytics.paymentMethods.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {/* Payment Method Cards */}
                <div className="space-y-3">
                  {analytics.paymentMethods
                    .sort((a, b) => b.totalAmount - a.totalAmount)
                    .map((method, index) => (
                      <div
                        key={method.method}
                        className="bg-slate-800/40 rounded-lg p-4 border-l-4"
                        style={{ borderLeftColor: method.color }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: method.color }}
                            />
                            <div className="font-medium text-slate-200">
                              {method.method.replace("_", " ")}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-green-400">
                              {formatCurrency(method.totalAmount)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {method.count} transactions
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <div className="text-slate-500">Avg Amount</div>
                            <div className="font-medium text-slate-300">
                              {formatCurrency(method.avgAmount)}
                            </div>
                          </div>
                          <div>
                            <div className="text-slate-500">Success Rate</div>
                            <div className="font-medium text-cyan-400">
                              {method.successRate.toFixed(1)}%
                            </div>
                          </div>
                        </div>
                        <div className="mt-2">
                          <div className="w-full bg-slate-700 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${method.successRate}%`,
                                backgroundColor: method.color,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="h-[400px] flex items-center justify-center text-slate-400">
                No payment method data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Locations */}
        <Card className="bg-slate-900/50 border-slate-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-slate-100">
              <MapPin className="w-5 h-5 text-orange-400" />
              Hot usage Station
            </CardTitle>
            <CardDescription className="text-slate-400">
              Revenue, swap volume, and performance metrics by location
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.locations.slice(0, 3).map((location, index) => (
                <div
                  key={`${location.locationName}-${location.stationName}`}
                  className="bg-slate-800/40 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-red-500 flex items-center justify-center text-white text-sm font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="font-medium text-slate-200">
                          {location.locationName}
                        </div>
                        <div className="text-sm text-slate-400">
                          {location.stationName}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-400">
                        {formatCurrency(location.totalRevenue)}
                      </div>
                      <div className="text-xs text-slate-400">
                        {location.swapCount} swaps
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-xs">
                    <div>
                      <div className="text-slate-500">Avg Amount</div>
                      <div className="font-medium text-slate-300">
                        {formatCurrency(location.avgAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Success Rate</div>
                      <div className="font-medium text-cyan-400">
                        {location.successRate.toFixed(1)}%
                      </div>
                    </div>
                    <div>
                      <div className="text-slate-500">Top Method</div>
                      <div className="font-medium text-purple-400">
                        {location.topPaymentMethod}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <Activity className="w-5 h-5 text-cyan-400" />
            Payment Status Distribution
          </CardTitle>
          <CardDescription className="text-slate-400">
            Transaction success rates and payment status breakdown
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Status Pie Chart */}
            <div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Object.entries(analytics.statusDistribution).map(
                      ([status, count]) => ({
                        name: status,
                        value: count,
                        color:
                          status === "SUCCESS"
                            ? "#10b981"
                            : status === "FAILED"
                            ? "#ef4444"
                            : "#f59e0b",
                      })
                    )}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {Object.entries(analytics.statusDistribution).map(
                      ([status, count], index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            status === "SUCCESS"
                              ? "#10b981"
                              : status === "FAILED"
                              ? "#ef4444"
                              : "#f59e0b"
                          }
                        />
                      )
                    )}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        const total = Object.values(
                          analytics.statusDistribution
                        ).reduce((a, b) => a + b, 0);
                        const percentage = (
                          ((data.value as number) / total) *
                          100
                        ).toFixed(1);
                        return (
                          <div className="rounded-lg border bg-slate-900/95 backdrop-blur-sm p-3 shadow-xl border-slate-700">
                            <div className="font-medium text-slate-200 mb-1">
                              {data.name}
                            </div>
                            <div className="text-sm">
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">Count:</span>
                                <span className="text-slate-200 font-medium">
                                  {data.value}
                                </span>
                              </div>
                              <div className="flex justify-between gap-4">
                                <span className="text-slate-400">
                                  Percentage:
                                </span>
                                <span className="text-slate-200 font-medium">
                                  {percentage}%
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
            </div>

            {/* Status Summary Cards */}
            <div className="space-y-4">
              {Object.entries(analytics.statusDistribution).map(
                ([status, count]) => {
                  const total = Object.values(
                    analytics.statusDistribution
                  ).reduce((a, b) => a + b, 0);
                  const percentage = ((count / total) * 100).toFixed(1);
                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case "SUCCESS":
                        return (
                          <div className="w-3 h-3 bg-green-500 rounded-full" />
                        );
                      case "FAILED":
                        return (
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        );
                      default:
                        return (
                          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                        );
                    }
                  };
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "SUCCESS":
                        return "text-green-400";
                      case "FAILED":
                        return "text-red-400";
                      default:
                        return "text-yellow-400";
                    }
                  };

                  return (
                    <div
                      key={status}
                      className="bg-slate-800/40 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(status)}
                          <div>
                            <div className="font-medium text-slate-200">
                              {status.replace("_", " ")}
                            </div>
                            <div className="text-sm text-slate-400">
                              {percentage}% of transactions
                            </div>
                          </div>
                        </div>
                        <div
                          className={`text-2xl font-bold ${getStatusColor(
                            status
                          )}`}
                        >
                          {count.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction Details Table */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-slate-100">
            <CreditCard className="w-5 h-5 text-blue-400" />
            Recent Swap Transactions ({analytics.swapPayments.length} total)
          </CardTitle>
          <CardDescription className="text-slate-400">
            Detailed view of battery swap payment transactions with status and
            location info
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700 bg-slate-800/30">
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Payment ID
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Method
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Location
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Date
                  </th>
                  <th className="text-left py-3 px-4 text-slate-400 font-medium">
                    Tries
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentPageData.map((payment) => (
                  <tr
                    key={payment.PAYMENT_ID}
                    className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="py-3 px-4 text-slate-200 font-mono text-xs">
                      {payment.PAYMENT_ID}
                    </td>
                    <td className="py-3 px-4 text-slate-200 font-medium">
                      {formatCurrency(payment.AMOUNT)}
                      {payment.REFUND_AMOUNT > 0 && (
                        <div className="text-xs text-red-400">
                          -{formatCurrency(payment.REFUND_AMOUNT)} refund
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className="px-2 py-1 rounded text-xs font-medium"
                        style={{
                          backgroundColor: `${getPaymentMethodColor(
                            payment.PAYMENT_METHOD
                          )}20`,
                          color: getPaymentMethodColor(payment.PAYMENT_METHOD),
                          border: `1px solid ${getPaymentMethodColor(
                            payment.PAYMENT_METHOD
                          )}40`,
                        }}
                      >
                        {payment.PAYMENT_METHOD}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {payment.PAYMENT_STATUS === "SUCCESS" ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <span className="text-green-400 text-xs font-medium">
                              Success
                            </span>
                          </>
                        ) : payment.PAYMENT_STATUS === "FAILED" ? (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 text-xs font-medium">
                              Failed
                            </span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                            <span className="text-yellow-400 text-xs font-medium">
                              {payment.PAYMENT_STATUS}
                            </span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-xs">
                      <div>{payment.LOCATION_NAME}</div>
                      <div className="text-slate-500">
                        {payment.STATION_NAME}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-mono text-xs">
                      {formatDateTime(payment.CREATED_EPOCH)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          payment.PAYMENT_TRIES === 1
                            ? "bg-green-900/30 text-green-400 border border-green-700/40"
                            : payment.PAYMENT_TRIES <= 3
                            ? "bg-yellow-900/30 text-yellow-400 border border-yellow-700/40"
                            : "bg-red-900/30 text-red-400 border border-red-700/40"
                        }`}
                      >
                        {payment.PAYMENT_TRIES}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Component */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </CardContent>
      </Card>

      {/* Quick Summary Footer */}
      <Card className="bg-gradient-to-r from-slate-900/70 to-slate-800/70 border-slate-700">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-green-400">
                {formatCurrency(
                  analytics.metrics.totalRevenue -
                    analytics.metrics.totalRefunds
                )}
              </div>
              <div className="text-sm text-slate-400">Net Revenue</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-400">
                {analytics.metrics.totalSwaps > 0
                  ? (
                      analytics.metrics.totalRevenue /
                      analytics.metrics.totalSwaps
                    ).toFixed(0)
                  : "0"}
              </div>
              <div className="text-sm text-slate-400">Avg per Swap (LKR)</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-400">
                {analytics.metrics.uniqueCustomers > 0
                  ? (analytics.metrics.totalSwaps * 30).toFixed(1)
                  : "0"}
              </div>
              <div className="text-sm text-slate-400">Monthly Swaps</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-400">
                {formatCurrency(analytics.metrics.totalRefunds)}
              </div>
              <div className="text-sm text-slate-400">Total Refunds</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
