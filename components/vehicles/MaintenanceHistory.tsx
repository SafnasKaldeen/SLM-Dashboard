import React, { useState, useEffect } from "react";
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
  Settings,
  Wrench,
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  FileText,
  User,
  MapPin,
  DollarSign,
  TrendingUp,
  Activity,
  Shield,
  Zap,
  Battery,
  Car,
  Target,
  AlertCircle,
  Info,
  Filter,
  Download,
  Eye,
  Plus,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// Types for maintenance data
interface MaintenanceRecord {
  MAINTENANCE_ID: string;
  VEHICLE_ID: string;
  SERVICE_TYPE: string;
  SCHEDULED_DATE: string;
  COMPLETED_DATE?: string;
  STATUS: "Scheduled" | "In Progress" | "Completed" | "Overdue" | "Cancelled";
  TECHNICIAN_ID?: string;
  TECHNICIAN_NAME?: string;
  DESCRIPTION: string;
  COST: number;
  PARTS_REPLACED?: string[];
  MILEAGE_AT_SERVICE: number;
  NEXT_SERVICE_DUE?: string;
  PRIORITY: "Low" | "Medium" | "High" | "Critical";
  SERVICE_LOCATION: string;
  WARRANTY_STATUS: boolean;
  NOTES?: string;
  CREATED_DATE: string;
  UPDATED_DATE: string;
}

interface MaintenanceSchedule {
  SERVICE_TYPE: string;
  INTERVAL_KM: number;
  INTERVAL_MONTHS: number;
  LAST_SERVICE_DATE?: string;
  LAST_SERVICE_KM?: number;
  NEXT_DUE_DATE: string;
  NEXT_DUE_KM: number;
  STATUS: "Due" | "Overdue" | "Upcoming" | "Current";
  DAYS_UNTIL_DUE: number;
  KM_UNTIL_DUE: number;
}

interface MaintenanceCostAnalysis {
  TOTAL_COST_LAST_YEAR: number;
  TOTAL_COST_LAST_MONTH: number;
  AVERAGE_COST_PER_SERVICE: number;
  COST_TREND: "Increasing" | "Decreasing" | "Stable";
  MONTHLY_BREAKDOWN: Array<{
    MONTH: string;
    COST: number;
    SERVICE_COUNT: number;
  }>;
}

interface MaintenanceProps {
  IMEI?: string;
  VehicleId?: string;
  CustomerId?: string;
}

// Helper function to format dates
const formatDate = (dateString: string | undefined) => {
  if (!dateString) return "N/A";
  try {
    return new Date(dateString).toLocaleDateString("en-LK", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

// Helper function to format currency
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Status badge component
const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return "border-green-500/20 text-green-400 bg-green-500/10";
      case "in progress":
        return "border-blue-500/20 text-blue-400 bg-blue-500/10";
      case "scheduled":
        return "border-cyan-500/20 text-cyan-400 bg-cyan-500/10";
      case "overdue":
        return "border-red-500/20 text-red-400 bg-red-500/10";
      case "cancelled":
        return "border-gray-500/20 text-gray-400 bg-gray-500/10";
      default:
        return "border-slate-500/20 text-slate-400 bg-slate-500/10";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return <CheckCircle className="w-3 h-3" />;
      case "in progress":
        return <Clock className="w-3 h-3" />;
      case "scheduled":
        return <Calendar className="w-3 h-3" />;
      case "overdue":
        return <AlertTriangle className="w-3 h-3" />;
      case "cancelled":
        return <XCircle className="w-3 h-3" />;
      default:
        return <Info className="w-3 h-3" />;
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getStatusColor(status)} flex items-center gap-1`}
    >
      {getStatusIcon(status)}
      {status}
    </Badge>
  );
};

// Priority badge component
const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
        return "border-red-500/20 text-red-400 bg-red-500/10";
      case "high":
        return "border-orange-500/20 text-orange-400 bg-orange-500/10";
      case "medium":
        return "border-yellow-500/20 text-yellow-400 bg-yellow-500/10";
      case "low":
        return "border-green-500/20 text-green-400 bg-green-500/10";
      default:
        return "border-slate-500/20 text-slate-400 bg-slate-500/10";
    }
  };

  return (
    <Badge
      variant="outline"
      className={`${getPriorityColor(priority)} text-xs`}
    >
      {priority}
    </Badge>
  );
};

const MaintenanceHistory: React.FC<MaintenanceProps> = ({
  IMEI,
  VehicleId,
  CustomerId,
}) => {
  const [activeTab, setActiveTab] = useState("history");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<
    MaintenanceRecord[]
  >([]);
  const [maintenanceSchedule, setMaintenanceSchedule] = useState<
    MaintenanceSchedule[]
  >([]);
  const [costAnalysis, setCostAnalysis] =
    useState<MaintenanceCostAnalysis | null>(null);
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "30",
    serviceType: "all",
  });

  // Mock data - Replace with actual API calls
  const mockMaintenanceRecords: MaintenanceRecord[] = [
    {
      MAINTENANCE_ID: "MAINT_001",
      VEHICLE_ID: VehicleId || "VEHICLE_001",
      SERVICE_TYPE: "Battery Health Check",
      SCHEDULED_DATE: "2024-09-15",
      COMPLETED_DATE: "2024-09-15",
      STATUS: "Completed",
      TECHNICIAN_ID: "TECH_001",
      TECHNICIAN_NAME: "Kamal Perera",
      DESCRIPTION:
        "Comprehensive battery health assessment and cell balance check",
      COST: 2500,
      PARTS_REPLACED: [],
      MILEAGE_AT_SERVICE: 12450,
      NEXT_SERVICE_DUE: "2024-12-15",
      PRIORITY: "Medium",
      SERVICE_LOCATION: "Colombo Service Center",
      WARRANTY_STATUS: true,
      NOTES: "Battery performance within normal parameters",
      CREATED_DATE: "2024-09-10",
      UPDATED_DATE: "2024-09-15",
    },
    {
      MAINTENANCE_ID: "MAINT_002",
      VEHICLE_ID: VehicleId || "VEHICLE_001",
      SERVICE_TYPE: "Brake System Inspection",
      SCHEDULED_DATE: "2024-09-20",
      STATUS: "Scheduled",
      DESCRIPTION: "Routine brake pad and disc inspection",
      COST: 3500,
      PARTS_REPLACED: ["Brake Pads", "Brake Fluid"],
      MILEAGE_AT_SERVICE: 12500,
      PRIORITY: "High",
      SERVICE_LOCATION: "Kandy Service Center",
      WARRANTY_STATUS: false,
      CREATED_DATE: "2024-09-12",
      UPDATED_DATE: "2024-09-12",
    },
    {
      MAINTENANCE_ID: "MAINT_003",
      VEHICLE_ID: VehicleId || "VEHICLE_001",
      SERVICE_TYPE: "Tire Replacement",
      SCHEDULED_DATE: "2024-09-05",
      COMPLETED_DATE: "2024-09-08",
      STATUS: "Completed",
      TECHNICIAN_NAME: "Sunil Fernando",
      DESCRIPTION: "Replace worn front and rear tires",
      COST: 8500,
      PARTS_REPLACED: ["Front Tire", "Rear Tire", "Valve Stems"],
      MILEAGE_AT_SERVICE: 12200,
      NEXT_SERVICE_DUE: "2025-03-05",
      PRIORITY: "Medium",
      SERVICE_LOCATION: "Galle Service Center",
      WARRANTY_STATUS: true,
      NOTES: "New high-performance tires installed, improved grip expected",
      CREATED_DATE: "2024-08-30",
      UPDATED_DATE: "2024-09-08",
    },
    {
      MAINTENANCE_ID: "MAINT_004",
      VEHICLE_ID: VehicleId || "VEHICLE_001",
      SERVICE_TYPE: "Software Update",
      SCHEDULED_DATE: "2024-09-25",
      STATUS: "Overdue",
      DESCRIPTION: "BMS firmware update to version 2.4.1",
      COST: 1500,
      MILEAGE_AT_SERVICE: 12600,
      PRIORITY: "Critical",
      SERVICE_LOCATION: "Remote Update",
      WARRANTY_STATUS: true,
      NOTES: "Critical security and performance improvements",
      CREATED_DATE: "2024-09-18",
      UPDATED_DATE: "2024-09-25",
    },
  ];

  const mockMaintenanceSchedule: MaintenanceSchedule[] = [
    {
      SERVICE_TYPE: "Battery Health Check",
      INTERVAL_KM: 5000,
      INTERVAL_MONTHS: 3,
      LAST_SERVICE_DATE: "2024-09-15",
      LAST_SERVICE_KM: 12450,
      NEXT_DUE_DATE: "2024-12-15",
      NEXT_DUE_KM: 17450,
      STATUS: "Upcoming",
      DAYS_UNTIL_DUE: 58,
      KM_UNTIL_DUE: 5000,
    },
    {
      SERVICE_TYPE: "Brake System Inspection",
      INTERVAL_KM: 8000,
      INTERVAL_MONTHS: 6,
      NEXT_DUE_DATE: "2024-09-20",
      NEXT_DUE_KM: 12500,
      STATUS: "Due",
      DAYS_UNTIL_DUE: 3,
      KM_UNTIL_DUE: 50,
    },
    {
      SERVICE_TYPE: "Software Update",
      INTERVAL_KM: 0,
      INTERVAL_MONTHS: 2,
      NEXT_DUE_DATE: "2024-09-25",
      NEXT_DUE_KM: 0,
      STATUS: "Overdue",
      DAYS_UNTIL_DUE: -2,
      KM_UNTIL_DUE: 0,
    },
    {
      SERVICE_TYPE: "Tire Inspection",
      INTERVAL_KM: 10000,
      INTERVAL_MONTHS: 12,
      LAST_SERVICE_DATE: "2024-09-08",
      LAST_SERVICE_KM: 12200,
      NEXT_DUE_DATE: "2025-03-08",
      NEXT_DUE_KM: 22200,
      STATUS: "Current",
      DAYS_UNTIL_DUE: 160,
      KM_UNTIL_DUE: 9750,
    },
  ];

  const mockCostAnalysis: MaintenanceCostAnalysis = {
    TOTAL_COST_LAST_YEAR: 45000,
    TOTAL_COST_LAST_MONTH: 8500,
    AVERAGE_COST_PER_SERVICE: 3750,
    COST_TREND: "Stable",
    MONTHLY_BREAKDOWN: [
      { MONTH: "Jan", COST: 2500, SERVICE_COUNT: 1 },
      { MONTH: "Feb", COST: 5000, SERVICE_COUNT: 2 },
      { MONTH: "Mar", COST: 3200, SERVICE_COUNT: 1 },
      { MONTH: "Apr", COST: 4100, SERVICE_COUNT: 2 },
      { MONTH: "May", COST: 6800, SERVICE_COUNT: 3 },
      { MONTH: "Jun", COST: 2900, SERVICE_COUNT: 1 },
      { MONTH: "Jul", COST: 4500, SERVICE_COUNT: 2 },
      { MONTH: "Aug", COST: 7200, SERVICE_COUNT: 3 },
      { MONTH: "Sep", COST: 8500, SERVICE_COUNT: 3 },
    ],
  };

  // Simulate API call
  useEffect(() => {
    const fetchMaintenanceData = async () => {
      setLoading(true);
      try {
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setMaintenanceRecords(mockMaintenanceRecords);
        setMaintenanceSchedule(mockMaintenanceSchedule);
        setCostAnalysis(mockCostAnalysis);
      } catch (err) {
        setError("Failed to load maintenance data");
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenanceData();
  }, [VehicleId, IMEI, CustomerId]);

  // Filter maintenance records
  const filteredRecords = maintenanceRecords.filter((record) => {
    const statusMatch =
      filters.status === "all" ||
      record.STATUS.toLowerCase() === filters.status;
    const typeMatch =
      filters.serviceType === "all" ||
      record.SERVICE_TYPE.toLowerCase().includes(
        filters.serviceType.toLowerCase()
      );

    const recordDate = new Date(record.SCHEDULED_DATE);
    const daysAgo = parseInt(filters.dateRange);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysAgo);
    const dateMatch = filters.dateRange === "all" || recordDate >= cutoffDate;

    return statusMatch && typeMatch && dateMatch;
  });

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400" />
          <p className="text-slate-400">Loading maintenance data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <Card className="bg-red-500/10 border-red-500/20 max-w-md">
          <CardContent className="p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-red-400 font-medium mb-2">
              Error Loading Data
            </h3>
            <p className="text-slate-400 text-sm mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Colors for charts
  const statusColors = {
    Completed: "#10b981",
    "In Progress": "#3b82f6",
    Scheduled: "#06b6d4",
    Overdue: "#ef4444",
    Cancelled: "#6b7280",
  };

  const pieChartData = Object.entries(
    maintenanceRecords.reduce((acc, record) => {
      acc[record.STATUS] = (acc[record.STATUS] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([status, count]) => ({
    name: status,
    value: count,
    color: statusColors[status as keyof typeof statusColors] || "#6b7280",
  }));

  return (
    <div className="space-y-6">
      {/* Header with filters */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Settings className="w-6 h-6 text-cyan-400" />
            Maintenance Management
          </h2>
          <p className="text-slate-400 mt-1">
            Comprehensive service history and scheduled maintenance tracking
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <select
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="in progress">In Progress</option>
            <option value="scheduled">Scheduled</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
            }
            className="bg-slate-800 border border-slate-700 text-slate-200 px-3 py-2 rounded-lg text-sm"
          >
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
            <option value="365">Last Year</option>
            <option value="all">All Time</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            className="border-slate-700 text-slate-300 hover:bg-slate-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Service
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Services</p>
                <p className="text-2xl font-bold text-slate-100">
                  {maintenanceRecords.length}
                </p>
              </div>
              <Wrench className="w-8 h-8 text-cyan-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">This Month Cost</p>
                <p className="text-2xl font-bold text-slate-100">
                  {formatCurrency(costAnalysis?.TOTAL_COST_LAST_MONTH || 0)}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Overdue Services</p>
                <p className="text-2xl font-bold text-red-400">
                  {
                    maintenanceSchedule.filter((s) => s.STATUS === "Overdue")
                      .length
                  }
                </p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Service Cost</p>
                <p className="text-2xl font-bold text-slate-100">
                  {formatCurrency(costAnalysis?.AVERAGE_COST_PER_SERVICE || 0)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="grid w-full max-w-3xl grid-cols-4 bg-slate-900/50 border border-slate-700">
          <TabsTrigger
            value="history"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Service History
          </TabsTrigger>
          <TabsTrigger
            value="schedule"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Maintenance Schedule
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Cost Analysis
          </TabsTrigger>
          <TabsTrigger
            value="reports"
            className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
          >
            Reports
          </TabsTrigger>
        </TabsList>

        {/* Service History Tab */}
        <TabsContent value="history" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Status Distribution */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader className="pb-4">
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Service Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={20}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {pieChartData.map((entry, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        />
                        <span className="text-sm text-slate-300">
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-sm font-medium text-slate-200">
                        {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/50 border-slate-800">
                <CardHeader className="pb-4">
                  <CardTitle className="text-slate-100 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    Recent Services ({filteredRecords.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 h-80 overflow-y-auto">
                    {filteredRecords.length > 0 ? (
                      filteredRecords
                        .sort(
                          (a, b) =>
                            new Date(b.SCHEDULED_DATE).getTime() -
                            new Date(a.SCHEDULED_DATE).getTime()
                        )
                        .slice(0, 10)
                        .map((record) => (
                          <div
                            key={record.MAINTENANCE_ID}
                            className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-slate-200 mb-1">
                                  {record.SERVICE_TYPE}
                                </h4>
                                <p className="text-sm text-slate-400 mb-2">
                                  {record.DESCRIPTION}
                                </p>
                              </div>
                              <div className="flex flex-col items-end gap-2">
                                <StatusBadge status={record.STATUS} />
                                <PriorityBadge priority={record.PRIORITY} />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-slate-400">
                                  Scheduled:
                                </span>
                                <p className="text-slate-200">
                                  {formatDate(record.SCHEDULED_DATE)}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">Cost:</span>
                                <p className="text-slate-200 font-medium">
                                  {formatCurrency(record.COST)}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Technician:
                                </span>
                                <p className="text-slate-200">
                                  {record.TECHNICIAN_NAME || "TBA"}
                                </p>
                              </div>
                              <div>
                                <span className="text-slate-400">
                                  Location:
                                </span>
                                <p className="text-slate-200">
                                  {record.SERVICE_LOCATION}
                                </p>
                              </div>
                            </div>

                            {record.PARTS_REPLACED &&
                              record.PARTS_REPLACED.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-700/50">
                                  <span className="text-slate-400 text-sm">
                                    Parts Replaced:
                                  </span>
                                  <div className="flex flex-wrap gap-2 mt-1">
                                    {record.PARTS_REPLACED.map((part, idx) => (
                                      <Badge
                                        key={idx}
                                        variant="outline"
                                        className="border-slate-600 text-slate-300 bg-slate-800/50 text-xs"
                                      >
                                        {part}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}

                            <div className="flex justify-end mt-4">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-slate-700 text-slate-300 hover:bg-slate-700"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                View Details
                              </Button>
                            </div>
                          </div>
                        ))
                    ) : (
                      <div className="text-center py-24">
                        <FileText className="w-12 h-12 mx-auto text-slate-500 mb-4" />
                        <p className="text-slate-400">
                          No maintenance records found
                        </p>
                        <p className="text-slate-500 text-sm">
                          Try adjusting your filters or date range
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Maintenance Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan-400" />
                Upcoming Maintenance Schedule
              </CardTitle>
              <CardDescription className="text-slate-400">
                Scheduled services based on mileage and time intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceSchedule.map((schedule, index) => {
                  const getStatusColor = (status: string) => {
                    switch (status) {
                      case "Overdue":
                        return "border-l-red-500 bg-red-500/5";
                      case "Due":
                        return "border-l-orange-500 bg-orange-500/5";
                      case "Upcoming":
                        return "border-l-yellow-500 bg-yellow-500/5";
                      default:
                        return "border-l-green-500 bg-green-500/5";
                    }
                  };

                  const getStatusIcon = (status: string) => {
                    switch (status) {
                      case "Overdue":
                        return (
                          <AlertTriangle className="w-5 h-5 text-red-400" />
                        );
                      case "Due":
                        return <Clock className="w-5 h-5 text-orange-400" />;
                      case "Upcoming":
                        return <Calendar className="w-5 h-5 text-yellow-400" />;
                      default:
                        return (
                          <CheckCircle className="w-5 h-5 text-green-400" />
                        );
                    }
                  };

                  return (
                    <div
                      key={index}
                      className={`p-6 border-l-4 rounded-lg ${getStatusColor(
                        schedule.STATUS
                      )}`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(schedule.STATUS)}
                          <div>
                            <h3 className="font-medium text-slate-200 text-lg">
                              {schedule.SERVICE_TYPE}
                            </h3>
                            <StatusBadge status={schedule.STATUS} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-slate-300 font-medium">
                            {formatDate(schedule.NEXT_DUE_DATE)}
                          </p>
                          <p className="text-slate-400 text-sm">
                            {schedule.NEXT_DUE_KM > 0
                              ? `${schedule.NEXT_DUE_KM.toLocaleString()} km`
                              : "Date-based"}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <span className="text-slate-400 text-sm">
                            Days Until Due:
                          </span>
                          <p
                            className={`font-medium ${
                              schedule.DAYS_UNTIL_DUE < 0
                                ? "text-red-400"
                                : schedule.DAYS_UNTIL_DUE < 7
                                ? "text-orange-400"
                                : "text-slate-200"
                            }`}
                          >
                            {schedule.DAYS_UNTIL_DUE < 0
                              ? `${Math.abs(
                                  schedule.DAYS_UNTIL_DUE
                                )} days overdue`
                              : `${schedule.DAYS_UNTIL_DUE} days`}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">
                            KM Until Due:
                          </span>
                          <p className="text-slate-200 font-medium">
                            {schedule.KM_UNTIL_DUE > 0
                              ? `${schedule.KM_UNTIL_DUE.toLocaleString()} km`
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">
                            Service Interval:
                          </span>
                          <p className="text-slate-200 font-medium">
                            {schedule.INTERVAL_KM > 0
                              ? `${schedule.INTERVAL_KM.toLocaleString()} km`
                              : `${schedule.INTERVAL_MONTHS} months`}
                          </p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-sm">
                            Last Service:
                          </span>
                          <p className="text-slate-200 font-medium">
                            {schedule.LAST_SERVICE_DATE
                              ? formatDate(schedule.LAST_SERVICE_DATE)
                              : "Never"}
                          </p>
                        </div>
                      </div>

                      {/* Progress bar for time-based services */}
                      {schedule.STATUS !== "Overdue" &&
                        schedule.DAYS_UNTIL_DUE > 0 && (
                          <div className="mt-4">
                            <div className="flex justify-between text-sm text-slate-400 mb-2">
                              <span>Progress until next service</span>
                              <span>
                                {Math.max(
                                  0,
                                  100 -
                                    Math.round(
                                      (schedule.DAYS_UNTIL_DUE /
                                        (schedule.INTERVAL_MONTHS * 30)) *
                                        100
                                    )
                                )}
                                %
                              </span>
                            </div>
                            <Progress
                              value={Math.max(
                                0,
                                100 -
                                  Math.round(
                                    (schedule.DAYS_UNTIL_DUE /
                                      (schedule.INTERVAL_MONTHS * 30)) *
                                      100
                                  )
                              )}
                              className="h-2"
                            />
                          </div>
                        )}

                      <div className="flex justify-end mt-4 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 text-slate-300 hover:bg-slate-700"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Now
                        </Button>
                        {schedule.STATUS === "Overdue" && (
                          <Button
                            size="sm"
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Urgent
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cost Analysis Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Monthly Cost Trend */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                  Monthly Maintenance Costs
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Cost trends and service frequency over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={costAnalysis?.MONTHLY_BREAKDOWN || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                    <XAxis
                      dataKey="MONTH"
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#94a3b8" }}
                      tickFormatter={(value) =>
                        `₨${(value / 1000).toFixed(0)}K`
                      }
                    />
                    <Tooltip
                      formatter={(value, name) => [
                        name === "COST"
                          ? formatCurrency(value as number)
                          : value,
                        name === "COST" ? "Cost" : "Services",
                      ]}
                      labelFormatter={(label) => `Month: ${label}`}
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid #334155",
                        borderRadius: "8px",
                        color: "#e2e8f0",
                      }}
                    />
                    <Bar dataKey="COST" fill="#06b6d4" name="COST" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Cost Summary */}
            <Card className="bg-slate-900/50 border-slate-800">
              <CardHeader>
                <CardTitle className="text-slate-100 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-400" />
                  Cost Summary
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Financial overview of maintenance expenses
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-green-400 text-sm font-medium mb-1">
                      Last Year Total
                    </div>
                    <div className="text-2xl font-bold text-green-300">
                      {formatCurrency(costAnalysis?.TOTAL_COST_LAST_YEAR || 0)}
                    </div>
                  </div>
                  <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-blue-400 text-sm font-medium mb-1">
                      Monthly Average
                    </div>
                    <div className="text-2xl font-bold text-blue-300">
                      {formatCurrency(
                        (costAnalysis?.TOTAL_COST_LAST_YEAR || 0) / 12
                      )}
                    </div>
                  </div>
                </div>

                <Separator className="bg-slate-700/50" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">
                      Average Cost per Service:
                    </span>
                    <span className="font-medium text-slate-200">
                      {formatCurrency(
                        costAnalysis?.AVERAGE_COST_PER_SERVICE || 0
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Cost Trend:</span>
                    <Badge
                      variant="outline"
                      className={`${
                        costAnalysis?.COST_TREND === "Increasing"
                          ? "border-red-500/20 text-red-400 bg-red-500/10"
                          : costAnalysis?.COST_TREND === "Decreasing"
                          ? "border-green-500/20 text-green-400 bg-green-500/10"
                          : "border-blue-500/20 text-blue-400 bg-blue-500/10"
                      }`}
                    >
                      {costAnalysis?.COST_TREND}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Total Services:</span>
                    <span className="font-medium text-slate-200">
                      {
                        maintenanceRecords.filter(
                          (r) => r.STATUS === "Completed"
                        ).length
                      }
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                  <div className="text-slate-300 font-medium mb-2">
                    Cost Breakdown by Service Type
                  </div>
                  <div className="space-y-2">
                    {Object.entries(
                      maintenanceRecords
                        .filter((r) => r.STATUS === "Completed")
                        .reduce((acc, record) => {
                          acc[record.SERVICE_TYPE] =
                            (acc[record.SERVICE_TYPE] || 0) + record.COST;
                          return acc;
                        }, {} as Record<string, number>)
                    )
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 5)
                      .map(([service, cost]) => (
                        <div
                          key={service}
                          className="flex justify-between items-center"
                        >
                          <span className="text-slate-400 text-sm">
                            {service}:
                          </span>
                          <span className="font-medium text-slate-200 text-sm">
                            {formatCurrency(cost)}
                          </span>
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-slate-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                Maintenance Reports
              </CardTitle>
              <CardDescription className="text-slate-400">
                Generate and download detailed maintenance reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-6 h-6 text-blue-400" />
                    <div>
                      <h4 className="font-medium text-slate-200">
                        Service History Report
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Complete service history
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </Button>
                </div>

                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <DollarSign className="w-6 h-6 text-green-400" />
                    <div>
                      <h4 className="font-medium text-slate-200">
                        Cost Analysis Report
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Financial breakdown
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate Excel
                  </Button>
                </div>

                <div className="p-4 bg-slate-800/30 border border-slate-700/50 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-3 mb-3">
                    <Target className="w-6 h-6 text-purple-400" />
                    <div>
                      <h4 className="font-medium text-slate-200">
                        Maintenance Schedule
                      </h4>
                      <p className="text-slate-400 text-sm">
                        Upcoming services
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full border-slate-700 text-slate-300 hover:bg-slate-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Generate PDF
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-700/50 my-6" />

              {/* Quick Insights */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-slate-200 mb-4">
                  Maintenance Insights
                </h4>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <h5 className="font-medium text-green-300">
                        Positive Trends
                      </h5>
                    </div>
                    <ul className="text-sm text-green-200 space-y-1">
                      <li>• 95% service completion rate</li>
                      <li>• Average service time reduced by 15%</li>
                      <li>• Preventive maintenance up 20%</li>
                      <li>• Cost per service decreased 8%</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-5 h-5 text-yellow-400" />
                      <h5 className="font-medium text-yellow-300">
                        Areas for Improvement
                      </h5>
                    </div>
                    <ul className="text-sm text-yellow-200 space-y-1">
                      <li>• 2 overdue services require attention</li>
                      <li>• Battery services need optimization</li>
                      <li>• Consider bulk parts procurement</li>
                      <li>• Schedule more frequent inspections</li>
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MaintenanceHistory;
