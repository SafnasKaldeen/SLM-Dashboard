"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  Car,
  Eye,
  Battery,
  Activity,
  MapPin,
  Zap,
  User,
  Building2,
  Hash,
  Calendar,
  TrendingUp,
  DollarSign,
  Route,
  AlertCircle,
  Wrench,
  Minus,
} from "lucide-react";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Vehicle {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
  TBOX_ID?: string;
  TBOX_IMEI_NO?: string;
  BATTERY_TYPE_ID: string;
  CUSTOMER_ID?: string;
  DEALER_ID?: string;
  MODEL?: string;
  STATUS: "ACTIVE" | "INACTIVE" | "MAINTENANCE" | "CHARGING";
  REGION?: string;

  // Performance metrics
  TOTAL_SWAPS_DAILY: number;
  TOTAL_SWAPS_MONTHLY: number;
  TOTAL_SWAPS_LIFETIME: number;
  TOTAL_CHARGING_SESSIONS: number;
  AVG_DISTANCE_PER_DAY: number;
  TOTAL_DISTANCE: number;

  // Revenue metrics
  SWAPPING_REVENUE: number;
  CHARGING_REVENUE: number;
  TOTAL_REVENUE: number;

  // Timestamps
  CREATED_DATE?: Date;
  LAST_UPDATED?: Date;
}

interface VehicleCardsProps {
  vehicles: Vehicle[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalVehicles: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500/10 text-green-400 border-green-500/20";
    case "inactive":
      return "bg-red-500/10 text-red-400 border-red-500/20";
    case "maintenance":
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    case "charging":
      return "bg-blue-500/10 text-blue-400 border-blue-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return Activity;
    case "inactive":
      return AlertCircle;
    case "maintenance":
      return Wrench;
    case "charging":
      return Zap;
    default:
      return Car;
  }
};

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined || isNaN(num)) return "N/A";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const formatCurrency = (amount: number | null | undefined) => {
  if (amount === null || amount === undefined || isNaN(amount)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatDistance = (distance: number | null | undefined) => {
  if (distance === null || distance === undefined || isNaN(distance))
    return "N/A";
  if (distance >= 1000) {
    return `${(distance / 1000).toFixed(1)}k km`;
  }
  return `${distance.toFixed(0)} km`;
};

// Helper function to display null/empty values appropriately
const displayValue = (
  value: string | number | null | undefined,
  fallback: string = "Not assigned"
) => {
  if (
    value === null ||
    value === undefined ||
    value === "" ||
    (typeof value === "string" && value.trim() === "")
  ) {
    return fallback;
  }
  return String(value);
};

// ============================================================================
// INDIVIDUAL VEHICLE CARD COMPONENT
// ============================================================================

const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  const StatusIcon = getStatusIcon(vehicle.STATUS);

  return (
    <Card className="bg-slate-900/50 border-slate-800 hover:border-slate-700 transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-slate-800 rounded-lg flex-shrink-0">
              <Car className="h-4 w-4 text-slate-400" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-slate-200 font-semibold text-lg break-all">
                {displayValue(vehicle.VEHICLE_ID, "Unknown Vehicle")}
              </h3>
              <p className="text-slate-400 text-sm font-mono break-all">
                {displayValue(vehicle.CHASSIS_NUMBER, "No chassis number")}
              </p>
            </div>
          </div>
          <Badge
            className={`${getStatusColor(
              vehicle.STATUS || "unknown"
            )} flex items-center gap-1.5 px-2.5 py-1 flex-shrink-0 ml-2`}
          >
            <StatusIcon className="h-3 w-3" />
            {vehicle.STATUS || "Unknown"}
          </Badge>
        </div>

        {/* Key Details */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Battery className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300 text-sm">Battery Type</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.BATTERY_TYPE_ID && (
                <Minus className="h-3 w-3 text-slate-500" />
              )}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.BATTERY_TYPE_ID
                    ? "text-slate-200"
                    : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.BATTERY_TYPE_ID, "No battery type")}
              </span>
            </div>
          </div>

          {/* Always show model field, even if null */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Hash className="h-4 w-4 text-purple-400" />
              <span className="text-slate-300 text-sm">Model</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.MODEL && <Minus className="h-3 w-3 text-slate-500" />}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.MODEL ? "text-slate-200" : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.MODEL, "Model not specified")}
              </span>
            </div>
          </div>

          {/* Always show customer field */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Customer</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.CUSTOMER_ID && (
                <Minus className="h-3 w-3 text-slate-500" />
              )}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.CUSTOMER_ID
                    ? "text-slate-200"
                    : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.CUSTOMER_ID, "Unassigned")}
              </span>
            </div>
          </div>

          {/* Always show dealer field */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Building2 className="h-4 w-4 text-orange-400" />
              <span className="text-slate-300 text-sm">Dealer</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.DEALER_ID && (
                <Minus className="h-3 w-3 text-slate-500" />
              )}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.DEALER_ID ? "text-slate-200" : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.DEALER_ID, "No dealer assigned")}
              </span>
            </div>
          </div>

          {/* Show T-Box information if available */}
          {vehicle.TBOX_ID && (
            <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 flex-shrink-0">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-slate-300 text-sm">T-Box ID</span>
              </div>
              <span className="text-slate-200 font-medium text-sm break-all text-right">
                {vehicle.TBOX_ID}
              </span>
            </div>
          )}

          {/* Show region if available */}
          {vehicle.REGION && (
            <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
              <div className="flex items-center gap-2 flex-shrink-0">
                <MapPin className="h-4 w-4 text-pink-400" />
                <span className="text-slate-300 text-sm">Region</span>
              </div>
              <span className="text-slate-200 font-medium text-sm break-all text-right">
                {vehicle.REGION}
              </span>
            </div>
          )}
        </div>

        {/* Action Button */}
        <Link href={`/vehicles/${vehicle.VEHICLE_ID || "unknown"}`}>
          <Button
            variant="ghost"
            size="sm"
            className="w-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-slate-800 text-slate-300 hover:text-slate-200"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// PAGINATION COMPONENT
// ============================================================================

const Pagination: React.FC<{
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}> = ({ currentPage, totalPages, itemsPerPage, totalItems, onPageChange }) => {
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between mt-8 gap-4">
      <div className="text-slate-400 text-sm">
        Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
        {Math.min(currentPage * itemsPerPage, totalItems)} of{" "}
        {formatNumber(totalItems)} vehicles
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 disabled:opacity-50"
        >
          Previous
        </Button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <React.Fragment key={index}>
              {page === "..." ? (
                <span className="px-3 py-1 text-slate-500">...</span>
              ) : (
                <Button
                  variant={currentPage === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[36px] ${
                    currentPage === page
                      ? "bg-slate-700 text-slate-200"
                      : "hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {page}
                </Button>
              )}
            </React.Fragment>
          ))}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="bg-slate-800 border-slate-700 hover:bg-slate-700 disabled:opacity-50"
        >
          Next
        </Button>
      </div>
    </div>
  );
};

// ============================================================================
// MAIN VEHICLE GRID COMPONENT
// ============================================================================

export function VehicleGrid({
  vehicles,
  currentPage,
  totalPages,
  itemsPerPage,
  totalVehicles,
  onPageChange,
  loading = false,
}: VehicleCardsProps) {
  // Export functionality with proper null handling
  const handleExport = () => {
    const headers = [
      "Vehicle ID",
      "Chassis Number",
      "T-Box ID",
      "Battery Type",
      "Status",
      "Customer ID",
      "Dealer ID",
      "Model",
      "Region",
      "Daily Swaps",
      "Monthly Swaps",
      "Lifetime Swaps",
      "Charging Sessions",
      "Avg Distance/Day",
      "Total Distance",
      "Swapping Revenue",
      "Charging Revenue",
      "Total Revenue",
    ];

    const rows = vehicles.map((v) => [
      displayValue(v.VEHICLE_ID, ""),
      displayValue(v.CHASSIS_NUMBER, ""),
      displayValue(v.TBOX_ID, ""),
      displayValue(v.BATTERY_TYPE_ID, ""),
      displayValue(v.STATUS, ""),
      displayValue(v.CUSTOMER_ID, ""),
      displayValue(v.DEALER_ID, ""),
      displayValue(v.MODEL, ""),
      displayValue(v.REGION, ""),
      formatNumber(v.TOTAL_SWAPS_DAILY),
      formatNumber(v.TOTAL_SWAPS_MONTHLY),
      formatNumber(v.TOTAL_SWAPS_LIFETIME),
      formatNumber(v.TOTAL_CHARGING_SESSIONS),
      formatNumber(v.AVG_DISTANCE_PER_DAY),
      formatNumber(v.TOTAL_DISTANCE),
      formatNumber(v.SWAPPING_REVENUE),
      formatNumber(v.CHARGING_REVENUE),
      formatNumber(v.TOTAL_REVENUE),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `vehicles_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (vehicles.length === 0 && !loading) {
    return (
      <div className="text-center py-12 bg-slate-900/50 rounded-lg border border-slate-800">
        <Car className="h-12 w-12 text-slate-500 mx-auto mb-4" />
        <h3 className="text-slate-300 text-xl font-semibold mb-2">
          No vehicles match the current filters
        </h3>
        <p className="text-slate-400">Try adjusting your filter settings</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-slate-800 rounded animate-pulse"></div>
          <div className="h-10 w-32 bg-slate-800 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <Card
              key={index}
              className="bg-slate-900/50 border-slate-800 animate-pulse"
            >
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="h-6 w-24 bg-slate-800 rounded"></div>
                      <div className="h-4 w-32 bg-slate-800 rounded"></div>
                    </div>
                    <div className="h-6 w-16 bg-slate-800 rounded"></div>
                  </div>
                  <div className="space-y-2">
                    <div className="h-10 bg-slate-800 rounded"></div>
                    <div className="h-10 bg-slate-800 rounded"></div>
                    <div className="h-10 bg-slate-800 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-slate-200 text-xl font-semibold">
            Vehicle Status Grid
          </h2>
          <p className="text-slate-400 text-sm">
            Showing {vehicles.length} vehicle{vehicles.length !== 1 ? "s" : ""}
          </p>
        </div>

        {vehicles.length > 0 && (
          <Button
            onClick={handleExport}
            variant="outline"
            size="sm"
            className="bg-slate-800 border-slate-700 hover:bg-slate-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>
        )}
      </div>

      {/* Vehicle Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-6">
        {vehicles.map((vehicle) => (
          <VehicleCard
            key={vehicle.VEHICLE_ID || `vehicle-${Math.random()}`}
            vehicle={vehicle}
          />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={totalVehicles}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}
