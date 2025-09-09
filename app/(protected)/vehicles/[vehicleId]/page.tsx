"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // ✅ instead of useSearchParams
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Car,
  Battery,
  MapPin,
  User,
  ArrowLeft,
  Zap,
  Activity,
  Settings,
  Route,
  ChevronRight,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  BarChart3,
  Target,
  Loader2,
  UserX,
  Info,
  Shield,
  Phone,
  Mail,
  CreditCard,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Bar,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";
import BatterySessionHistory from "@/components/vehicles/BatterySessionHistory";
import BatterySwapHistory from "@/components/vehicles/BatterySwapHistory";
import HomeChargingHistory from "@/components/vehicles/HomeChargingHistory";
import GPSHistory from "@/components/vehicles/GPSHistory";

// Skeleton Components with consistent dark theme styling
const ChartSkeleton = () => (
  <div className="h-[300px] w-full animate-pulse rounded-lg" />
);

const MetricCardSkeleton = () => (
  <div className="space-y-2">
    <div className="h-4 bg-slate-800/50 animate-pulse rounded" />
    <div className="h-8 bg-slate-800/50 animate-pulse rounded" />
    <div className="h-3 bg-slate-800/50 animate-pulse rounded" />
  </div>
);

const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="h-12 bg-slate-800/50 animate-pulse rounded" />
    ))}
  </div>
);

// Types
interface VehicleData {
  BATTERY_DETAILS: {
    BATTERY_CAPACITY: string;
    BATTERY_NAME: string;
  };
  CHASSIS_NUMBER: string;
  CUSTOMER_DETAILS: {
    EMAIL: string;
    FULL_NAME: string;
    MOBILE: number;
    NIC: string;
  };
  CUSTOMER_ID: string;
  SELLING_PRICE: number;
  TBOX_IMEI_NO: number;
  TOTAL_BATTERY_SWAPS: number;
  TOTAL_DISTANCE: number;
  TOTAL_HOME_CHARGINGS: number;
  TOTAL_REVENUE: number;
  TOTAL_SESSIONS: number;
  VEHICLE_ID: string;
}

export default function VehicleDetailPage() {
  const params = useParams();
  const vehicleId = params.vehicleId as string; // ✅ dynamic from URL

  const [activeTab, setActiveTab] = useState("gps");
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data for tabs that don't have real data yet
  const MOCK_CHARGING_PATTERNS = [
    {
      HOUR_OF_DAY: 0,
      SESSION_COUNT: 3,
      AVG_DURATION: 52,
      AVG_ENERGY: 28,
      AVG_COST: 840,
    },
    {
      HOUR_OF_DAY: 1,
      SESSION_COUNT: 2,
      AVG_DURATION: 58,
      AVG_ENERGY: 32,
      AVG_COST: 960,
    },
    {
      HOUR_OF_DAY: 2,
      SESSION_COUNT: 1,
      AVG_DURATION: 45,
      AVG_ENERGY: 25,
      AVG_COST: 750,
    },
    {
      HOUR_OF_DAY: 6,
      SESSION_COUNT: 15,
      AVG_DURATION: 35,
      AVG_ENERGY: 20,
      AVG_COST: 600,
    },
    {
      HOUR_OF_DAY: 7,
      SESSION_COUNT: 25,
      AVG_DURATION: 32,
      AVG_ENERGY: 18,
      AVG_COST: 540,
    },
    {
      HOUR_OF_DAY: 8,
      SESSION_COUNT: 35,
      AVG_DURATION: 28,
      AVG_ENERGY: 16,
      AVG_COST: 480,
    },
    {
      HOUR_OF_DAY: 18,
      SESSION_COUNT: 18,
      AVG_DURATION: 55,
      AVG_ENERGY: 35,
      AVG_COST: 1050,
    },
    {
      HOUR_OF_DAY: 19,
      SESSION_COUNT: 15,
      AVG_DURATION: 58,
      AVG_ENERGY: 38,
      AVG_COST: 1140,
    },
    {
      HOUR_OF_DAY: 20,
      SESSION_COUNT: 12,
      AVG_DURATION: 60,
      AVG_ENERGY: 40,
      AVG_COST: 1200,
    },
  ];

  const MOCK_SWAPPING_HISTORY = [
    {
      STATION_NAME: "PowerSwap Colombo Fort",
      SWAP_DATE: "2024-08-30",
      SWAP_TIME: "14:25:00",
      OLD_BATTERY_HEALTH: 67,
      NEW_BATTERY_HEALTH: 96,
      SWAP_DURATION_SECONDS: 185,
      SWAP_COST: 2850.0,
      LOCATION: "Fort Railway Station",
    },
    {
      STATION_NAME: "QuickBattery Kandy Road",
      SWAP_DATE: "2024-08-18",
      SWAP_TIME: "10:45:00",
      OLD_BATTERY_HEALTH: 71,
      NEW_BATTERY_HEALTH: 98,
      SWAP_DURATION_SECONDS: 172,
      SWAP_COST: 2650.0,
      LOCATION: "Kandy Road Junction",
    },
    {
      STATION_NAME: "EcoSwap Galle Face",
      SWAP_DATE: "2024-08-05",
      SWAP_TIME: "16:20:00",
      OLD_BATTERY_HEALTH: 74,
      NEW_BATTERY_HEALTH: 94,
      SWAP_DURATION_SECONDS: 195,
      SWAP_COST: 3100.0,
      LOCATION: "Galle Face Green",
    },
  ];

  // Fetch vehicle data
  const fetchVehicleData = async () => {
    try {
      setLoading(true);
      setError(null);

      const query = `CALL REPORT_DB.GPS_DASHBOARD.GET_VEHICLE_SUMMARY_SQL('${vehicleId}')`;

      const response = await fetch("/api/snowflake/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      console.log("Fetching vehicle data with ID:", vehicleId);
      console.log("Query:", query);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const results = await response.json();

      // console.log("Fetched vehicle data:", results[0]);

      if (results && results.length > 0) {
        setVehicleData(results[0].GET_VEHICLE_SUMMARY_SQL);
      } else {
        throw new Error("No vehicle data found");
      }
    } catch (err) {
      console.error("Error fetching vehicle data:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch vehicle data"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicleData();
  }, [vehicleId]);

  // Simulate loading for other components
  const SimulateLoading = ({
    children,
    delay = 100,
    skeleton,
  }: {
    children: React.ReactNode;
    delay?: number;
    skeleton: React.ReactNode;
  }) => {
    const [componentLoading, setComponentLoading] = useState(true);
    useEffect(() => {
      const timer = setTimeout(() => setComponentLoading(false), delay);
      return () => clearTimeout(timer);
    }, [delay]);
    return <>{componentLoading ? skeleton : children}</>;
  };

  // Utility functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("en-LK");
    } catch {
      return "Invalid Date";
    }
  };

  const formatDistance = (distance: number) => {
    return distance ? `${distance.toFixed(1)}` : "0"; // Convert meters to km
  };

  // Helper function to check if customer is assigned
  const isCustomerAssigned = (customerDetails: any) => {
    return (
      customerDetails &&
      customerDetails.FULL_NAME &&
      customerDetails.FULL_NAME.trim() !== "" &&
      customerDetails.EMAIL &&
      customerDetails.EMAIL.trim() !== ""
    );
  };

  // Helper function to safely get value or return fallback
  const safeValue = (value: any, fallback: string = "Not available") => {
    return value && value.toString().trim() !== "" ? value : fallback;
  };

  // Loading state with consistent styling
  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
              <p className="text-slate-400">Loading vehicle data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with consistent styling
  if (error || !vehicleData) {
    return (
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <Card className="bg-red-500/10 border-red-500/20">
              <CardContent className="p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <h3 className="text-red-400 font-medium mb-2">
                  Error Loading Data
                </h3>
                <p className="text-slate-400 text-sm mb-4">
                  {error || "Vehicle data not found"}
                </p>
                <Button
                  onClick={fetchVehicleData}
                  variant="outline"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const customerAssigned = isCustomerAssigned(vehicleData.CUSTOMER_DETAILS);

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto space-y-12 p-6">
        {/* Header Section - Consistent with parent page */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center px-4 py-2 bg-cyan-500/10 border border-cyan-500/20 rounded-full">
            <Car className="h-4 w-4 text-cyan-400 mr-2" />
            <span className="text-cyan-400 text-sm font-medium">
              Vehicle Analytics
            </span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
            Vehicle 360 View
          </h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Comprehensive performance, charging, and maintenance insights for{" "}
            {safeValue(vehicleData.CHASSIS_NUMBER, "Unknown Vehicle")}
          </p>
        </div>

        {/* Key Metrics Cards - Consistent dark theme */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Battery Swaps
              </CardTitle>
              <Zap className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {vehicleData.TOTAL_BATTERY_SWAPS || 0}
              </div>
              <p className="text-xs text-slate-400">Lifetime swaps</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Home Charging Sessions
              </CardTitle>
              <Battery className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {vehicleData.TOTAL_HOME_CHARGINGS || 0}
              </div>
              <p className="text-xs text-slate-400">Total sessions</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Total Distance
              </CardTitle>
              <Route className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {formatDistance(vehicleData.TOTAL_DISTANCE || 0)} km
              </div>
              <p className="text-xs text-slate-400">Total traveled</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                Revenue Generated
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-100">
                {formatCurrency(vehicleData.TOTAL_REVENUE || 0)}
              </div>
              <p className="text-xs text-slate-400">Total revenue</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs
          defaultValue="gps"
          className="space-y-6 mb-8"
          onValueChange={(val) => setActiveTab(val)}
        >
          <div className="flex items-center justify-center">
            <TabsList className="grid w-full max-w-6xl grid-cols-8 bg-slate-900/50 border border-slate-700 rounded-lg">
              <TabsTrigger
                value="overview"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger
                value="session"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                Battery Sessions
              </TabsTrigger>
              <TabsTrigger
                value="swaps"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                Swaps
              </TabsTrigger>
              <TabsTrigger
                value="home_charging"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                Home Charging
              </TabsTrigger>
              <TabsTrigger
                value="gps"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 disable"
              >
                GPS Analytics
              </TabsTrigger>
              <TabsTrigger
                value="motor"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 disable"
              >
                Motor
              </TabsTrigger>
              <TabsTrigger
                value="battery"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 disable"
              >
                Battery
              </TabsTrigger>
              <TabsTrigger
                value="maintenance"
                className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400 disable"
              >
                Maintenance
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Enhanced Vehicle Details Card */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Car className="w-5 h-5 text-cyan-400" />
                        <CardTitle className="text-lg text-slate-100">
                          Vehicle Details
                        </CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className="border-green-500/20 text-green-400 bg-green-500/10"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      Vehicle specifications and technical information
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {/* Primary Identifiers */}
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                          <div>
                            <div className="text-sm font-medium text-slate-400 mb-1">
                              Vehicle ID
                            </div>
                            <div className="font-mono text-lg text-slate-100">
                              {safeValue(vehicleData.VEHICLE_ID)}
                            </div>
                          </div>
                          <Shield className="w-5 h-5 text-slate-500" />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                          <div>
                            <div className="text-sm font-medium text-slate-400 mb-1">
                              Chassis Number
                            </div>
                            <div className="font-mono text-sm text-slate-100">
                              {safeValue(vehicleData.CHASSIS_NUMBER)}
                            </div>
                          </div>
                          <Car className="w-5 h-5 text-slate-500" />
                        </div>
                      </div>

                      <Separator className="bg-slate-700/50" />

                      {/* Technical Details */}
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-slate-400 mb-2">
                              T-Box IMEI
                            </div>
                            <div className="font-mono text-sm text-slate-100 bg-slate-800/50 p-2 rounded border">
                              {safeValue(vehicleData.TBOX_IMEI_NO)}
                            </div>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-slate-400 mb-2">
                              Total BMS Sessions
                            </div>
                            <div className="font-mono text-sm font-semibold text-slate-100 bg-slate-800/50 p-2 rounded border text-center">
                              {vehicleData.TOTAL_SESSIONS || 0}
                            </div>
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Battery className="w-4 h-4 text-cyan-400" />
                            <div className="text-sm font-medium text-slate-400">
                              Battery Configuration
                            </div>
                          </div>
                          <div className="text-lg font-semibold text-slate-100">
                            {safeValue(
                              vehicleData.BATTERY_DETAILS?.BATTERY_NAME,
                              "Battery type not specified"
                            )}
                          </div>
                          <div className="text-sm text-slate-400 mt-1">
                            {safeValue(
                              vehicleData.BATTERY_DETAILS?.BATTERY_CAPACITY,
                              "Capacity not specified"
                            )}
                          </div>
                        </div>

                        <div className="p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CreditCard className="w-4 h-4 text-green-400" />
                            <div className="text-sm font-medium text-slate-400">
                              Vehicle Value
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-green-400">
                            {formatCurrency(vehicleData.SELLING_PRICE || 0)}
                          </div>
                          <div className="text-sm text-slate-400">
                            Selling price
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Enhanced Customer Details Card */}
                <Card className="bg-slate-900/50 border-slate-800">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {customerAssigned ? (
                          <User className="w-5 h-5 text-cyan-400" />
                        ) : (
                          <UserX className="w-5 h-5 text-orange-400" />
                        )}
                        <CardTitle className="text-lg text-slate-100">
                          Customer Details
                        </CardTitle>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          customerAssigned
                            ? "border-green-500/20 text-green-400 bg-green-500/10"
                            : "border-orange-500/20 text-orange-400 bg-orange-500/10"
                        }
                      >
                        {customerAssigned ? (
                          <>
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Assigned
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            Unassigned
                          </>
                        )}
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      {customerAssigned
                        ? "Customer information and contact details"
                        : "This vehicle is not currently assigned to a customer"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {customerAssigned ? (
                      <div className="space-y-6">
                        {/* Customer Identity */}
                        <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-lg">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                              <User className="w-6 h-6 text-slate-300" />
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-slate-100">
                                {safeValue(
                                  vehicleData.CUSTOMER_DETAILS.FULL_NAME
                                )}
                              </div>
                              <div className="text-sm text-slate-400">
                                Customer ID:{" "}
                                {safeValue(vehicleData.CUSTOMER_ID)}
                              </div>
                            </div>
                          </div>
                        </div>

                        <Separator className="bg-slate-700/50" />

                        {/* Contact Information */}
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <Mail className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-400">
                                Email Address
                              </div>
                              <div className="text-slate-100 break-all">
                                {safeValue(vehicleData.CUSTOMER_DETAILS.EMAIL)}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <Phone className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-400">
                                Mobile Number
                              </div>
                              <div className="text-slate-100">
                                {vehicleData.CUSTOMER_DETAILS.MOBILE
                                  ? `+${vehicleData.CUSTOMER_DETAILS.MOBILE}`
                                  : "Not provided"}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 p-3 bg-slate-800/30 rounded-lg border border-slate-700/50">
                            <Shield className="w-5 h-5 text-slate-400" />
                            <div>
                              <div className="text-sm font-medium text-slate-400">
                                NIC Number
                              </div>
                              <div className="font-mono text-slate-100">
                                {safeValue(vehicleData.CUSTOMER_DETAILS.NIC)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Customer Statistics */}
                        <div className="p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-lg">
                          <div className="text-sm font-medium text-slate-400 mb-2">
                            Customer Metrics
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <div className="text-lg font-semibold text-purple-400">
                                {formatCurrency(vehicleData.TOTAL_REVENUE || 0)}
                              </div>
                              <div className="text-xs text-slate-500">
                                Total Revenue
                              </div>
                            </div>
                            <div>
                              <div className="text-lg font-semibold text-pink-400">
                                {(vehicleData.TOTAL_BATTERY_SWAPS || 0) +
                                  (vehicleData.TOTAL_HOME_CHARGINGS || 0)}
                              </div>
                              <div className="text-xs text-slate-500">
                                Total Services
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <UserX className="w-8 h-8 text-orange-400" />
                        </div>
                        <h3 className="text-lg font-medium mb-2 text-slate-100">
                          Customer Not Assigned
                        </h3>
                        <p className="text-slate-400 mb-4 max-w-sm mx-auto">
                          This vehicle is currently not assigned to any
                          customer. The vehicle is available for assignment.
                        </p>
                        <div className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 max-w-sm mx-auto">
                          <div className="text-sm text-slate-400 mb-1">
                            Vehicle ID
                          </div>
                          <div className="font-mono text-slate-100">
                            {safeValue(vehicleData.VEHICLE_ID)}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Assign Customer
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}

          {/* Session Tab */}
          {activeTab === "session" && (
            <TabsContent value="session" className="space-y-6">
              <BatterySessionHistory IMEI={vehicleData.TBOX_IMEI_NO} />
            </TabsContent>
          )}

          {activeTab === "swaps" && (
            <TabsContent value="swaps" className="space-y-6">
              <BatterySwapHistory CustomerID={vehicleData.CUSTOMER_ID} />
            </TabsContent>
          )}

          {/* Home Charging Tab */}
          {activeTab === "home_charging" && (
            <TabsContent value="home_charging" className="space-y-6">
              <HomeChargingHistory CustomerID={vehicleData.CUSTOMER_ID} />
            </TabsContent>
          )}

          {/* GPS Analytics Tab */}
          {activeTab === "gps" && (
            <TabsContent value="gps" className="space-y-6">
              <GPSHistory IMEI={vehicleData.TBOX_IMEI_NO} />
            </TabsContent>
          )}

          {/* Maintenance Tab */}
          {activeTab === "maintenance" && (
            <TabsContent value="maintenance" className="space-y-6">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <Settings className="w-5 h-5 text-cyan-400" /> Vehicle
                    Maintenance Status
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Maintenance scheduling and service history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2 text-slate-100">
                      Maintenance System Integration
                    </h3>
                    <p className="text-slate-400 mb-4">
                      Vehicle maintenance tracking and scheduling will be
                      integrated with the service management system.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2 max-w-md mx-auto">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="text-sm text-slate-400">
                          Battery Swaps
                        </div>
                        <div className="text-lg font-semibold text-green-400">
                          {vehicleData.TOTAL_BATTERY_SWAPS}
                        </div>
                      </div>
                      <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                        <div className="text-sm text-slate-400">
                          Service Status
                        </div>
                        <div className="text-lg font-semibold text-cyan-400">
                          Active
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="mt-4 border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Battery Health Summary */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <Battery className="w-5 h-5 text-cyan-400" /> Battery Health
                    Summary
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Current battery performance and swap history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">
                          Estimated Battery Health
                        </span>
                        <span className="font-medium text-green-400">
                          {vehicleData.TOTAL_BATTERY_SWAPS > 0 ? "92%" : "N/A"}
                        </span>
                      </div>
                      {vehicleData.TOTAL_BATTERY_SWAPS > 0 && (
                        <Progress value={92} className="h-2 bg-slate-800" />
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                      <div>
                        <div className="text-sm text-slate-400">
                          Total Swaps
                        </div>
                        <div className="text-2xl font-semibold text-slate-100">
                          {vehicleData.TOTAL_BATTERY_SWAPS}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-400">
                          Battery Type
                        </div>
                        <div className="text-lg font-semibold text-slate-100">
                          {vehicleData.BATTERY_DETAILS.BATTERY_NAME}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <div className="text-sm text-slate-400">Capacity</div>
                      <div className="font-medium text-slate-100">
                        {vehicleData.BATTERY_DETAILS.BATTERY_CAPACITY}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Recommendations */}
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-slate-100">
                    <Target className="w-5 h-5 text-cyan-400" /> AI Maintenance
                    Insights
                  </CardTitle>
                  <CardDescription className="text-slate-400">
                    Intelligent recommendations based on vehicle usage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                      <h4 className="text-green-400 font-medium mb-1">
                        Battery Performance
                      </h4>
                      <p className="text-sm text-slate-400">
                        Battery swap frequency indicates healthy usage patterns
                        with {vehicleData.TOTAL_BATTERY_SWAPS} swaps completed.
                      </p>
                    </div>

                    <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
                      <Activity className="w-6 h-6 text-cyan-400 mb-2" />
                      <h4 className="text-cyan-400 font-medium mb-1">
                        Usage Analysis
                      </h4>
                      <p className="text-sm text-slate-400">
                        {formatDistance(vehicleData.TOTAL_DISTANCE)} km traveled
                        across {vehicleData.TOTAL_SESSIONS} sessions shows
                        consistent usage.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}
