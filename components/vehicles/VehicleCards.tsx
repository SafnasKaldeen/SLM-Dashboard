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
  Bike,
  User,
  Building2,
  Hash,
  Smartphone,
  Calendar,
  TrendingUp,
  DollarSign,
  Route,
  AlertCircle,
  Wrench,
  Minus,
  CheckCircle,
  Package,
  Clock,
  Store,
  HelpCircle,
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
  BATTERY_TYPE_NAME?: string; // Added for display
  CUSTOMER_ID?: string;
  CUSTOMER_NAME?: string; // Added for display
  DEALER_ID?: string;
  DEALER_NAME?: string; // Added for display
  MODEL?: string;
  STATUS: string; // Original status field (kept for compatibility)
  REGION?: string;

  // Timestamps
  CREATED_DATE?: Date;
  LAST_UPDATED?: Date;
}

interface VehicleCardsProps {
  vehicles: Vehicle[];
  allVehicles: Vehicle[]; // full dataset
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalVehicles: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

// ============================================================================
// BUSINESS LOGIC FUNCTIONS
// ============================================================================

// Derive actual vehicle status based on customer and dealer assignment
const deriveVehicleStatus = (
  customerId?: string,
  dealerId?: string
): string => {
  const hasCustomer = customerId && customerId.trim() !== "";
  const hasDealer = dealerId && dealerId.trim() !== "";

  if (hasCustomer && hasDealer) {
    return "SOLD";
  } else if (!hasCustomer && !hasDealer) {
    return "FACTORY_INSTOCK";
  } else if (hasCustomer && !hasDealer) {
    return "CUSTOMER_RESERVED";
  } else if (!hasCustomer && hasDealer) {
    return "DEALER_INSTOCK";
  }

  return "UNKNOWN";
};

// Get status display properties
const getStatusDisplayInfo = (status: string) => {
  switch (status) {
    case "SOLD":
      return {
        label: "Sold",
        color: "bg-green-500/10 text-green-400 border-green-500/20",
        Icon: CheckCircle,
        description: "Vehicle sold to customer",
      };
    case "FACTORY_INSTOCK":
      return {
        label: "Factory Instock",
        color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
        Icon: Package,
        description: "Available at factory",
      };
    case "CUSTOMER_RESERVED":
      return {
        label: "Reserved",
        color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
        Icon: Clock,
        description: "Reserved by customer, awaiting dealer assignment",
      };
    case "DEALER_INSTOCK":
      return {
        label: "Dealer Instock",
        color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
        Icon: Store,
        description: "Available at dealer",
      };
    default:
      return {
        label: "Unknown",
        color: "bg-slate-500/10 text-slate-400 border-slate-500/20",
        Icon: HelpCircle,
        description: "Status could not be determined",
      };
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const formatNumber = (num: number | null | undefined) => {
  if (num === null || num === undefined || isNaN(num)) return "N/A";
  return num.toLocaleString("en-US", { maximumFractionDigits: 0 });
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

// Helper function to display ID with name
const displayIdWithName = (
  id: string | null | undefined,
  name: string | null | undefined,
  fallback: string = "Unassigned"
) => {
  const hasId = id && id.trim() !== "";
  const hasName = name && name.trim() !== "";

  if (!hasId) {
    return fallback;
  }

  if (hasName) {
    return `${name} (${id})`;
  }

  return id;
};

// ============================================================================
// INDIVIDUAL VEHICLE CARD COMPONENT
// ============================================================================

const VehicleCard: React.FC<{ vehicle: Vehicle }> = ({ vehicle }) => {
  // Derive the actual status based on business logic
  const derivedStatus = deriveVehicleStatus(
    vehicle.CUSTOMER_ID,
    vehicle.DEALER_ID
  );
  const statusInfo = getStatusDisplayInfo(derivedStatus);
  const { Icon: StatusIcon } = statusInfo;

  return (
    <Card className="border-slate-800 hover:border-slate-700 transition-all duration-200 group">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="p-2 bg-slate-800 rounded-lg flex-shrink-0">
              <Bike className="h-4 w-4 text-slate-400" />
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
            className={`${statusInfo.color} flex items-center gap-1.5 px-2.5 py-1 flex-shrink-0 ml-2`}
            title={statusInfo.description}
          >
            <StatusIcon className="h-3 w-3" />
            {statusInfo.label}
          </Badge>
        </div>

        {/* Key Details */}
        <div className="space-y-3 mb-6">
          {/* Assignment Status Summary */}
          <div className="bg-slate-800/30 rounded-lg p-3 space-y-2">
            <div className="text-xs text-slate-400 font-medium uppercase tracking-wide">
              Assignment Status
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Customer:</span>
                <span
                  className={
                    vehicle.CUSTOMER_ID ? "text-green-400" : "text-slate-500"
                  }
                >
                  {displayValue(vehicle.CUSTOMER_NAME, "Unassigned")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Dealer:</span>
                <span
                  className={
                    vehicle.DEALER_ID ? "text-green-400" : "text-slate-500"
                  }
                >
                  {displayValue(vehicle.DEALER_NAME, "Unassigned")}
                </span>
              </div>
            </div>
          </div>

          {/* Battery Type - Only show name */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Battery className="h-4 w-4 text-emerald-400" />
              <span className="text-slate-300 text-sm">Battery Type</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.BATTERY_TYPE_NAME && (
                <Minus className="h-3 w-3 text-slate-500" />
              )}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.BATTERY_TYPE_NAME
                    ? "text-slate-200"
                    : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.BATTERY_TYPE_NAME, "No battery type")}
              </span>
            </div>
          </div>

          {/* Model field */}
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

          {/* Customer ID field */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <User className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300 text-sm">Customer ID</span>
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

          {/* Dealer ID field */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Building2 className="h-4 w-4 text-orange-400" />
              <span className="text-slate-300 text-sm">Dealer ID</span>
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

          {/* Show T-Box information - always visible */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/50 rounded-lg">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Zap className="h-4 w-4 text-cyan-400" /> {/* cyan accent */}
              <span className="text-slate-300 text-sm">T-Box ID</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.TBOX_ID && <Minus className="h-3 w-3 text-slate-500" />}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.TBOX_ID ? "text-slate-200" : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.TBOX_ID, "Not assigned")}
              </span>
            </div>
          </div>

          {/* Show IMEI information - always visible */}
          <div className="flex items-center justify-between py-2 px-3 bg-slate-800/70 rounded-lg border">
            <div className="flex items-center gap-2 flex-shrink-0">
              <Smartphone className="h-4 w-4 text-yellow-400" />
              {/* different icon + purple accent */}
              <span className="text-slate-300 text-sm">IMEI No</span>
            </div>
            <div className="flex items-center gap-2 text-right">
              {!vehicle.TBOX_IMEI_NO && (
                <Minus className="h-3 w-3 text-slate-500" />
              )}
              <span
                className={`font-medium text-sm break-all ${
                  vehicle.TBOX_IMEI_NO
                    ? "text-slate-200"
                    : "text-slate-500 italic"
                }`}
              >
                {displayValue(vehicle.TBOX_IMEI_NO, "Not assigned")}
              </span>
            </div>
          </div>

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
        <Link
          href={`/vehicles/${vehicle.VEHICLE_ID || "unknown"}`}
          target="_blank"
          rel="noopener noreferrer" // ✅ security best practice
        >
          {" "}
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
  allVehicles,
  currentPage,
  totalPages,
  itemsPerPage,
  totalVehicles,
  onPageChange,
  loading = false,
}: VehicleCardsProps) {
  // Remove duplicates based on VEHICLE_ID
  const uniqueVehicles = React.useMemo(() => {
    const seen = new Set<string>();
    return vehicles.filter((v) => {
      const key = JSON.stringify(v);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [vehicles]);

  const uniqueAllVehicles = React.useMemo(() => {
    const seen = new Set<string>();
    return allVehicles.filter((v) => {
      const key = JSON.stringify(v);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [allVehicles]);

  const handleExport = () => {
    const headers = [
      "Vehicle ID",
      "Chassis Number",
      "T-Box ID",
      "Battery Type ID",
      "Battery Type Name",
      "Derived Status",
      "Customer ID",
      "Customer Name",
      "Dealer ID",
      "Dealer Name",
      "Model",
      "Region",
    ];

    const seen = new Set<string>();
    const uniqueExport = allVehicles.filter((v) => {
      const key = `${v.VEHICLE_ID || ""}-${v.CHASSIS_NUMBER || ""}-${
        v.TBOX_ID || ""
      }`.trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });

    const rows = uniqueExport.map((v) => [
      displayValue(v.VEHICLE_ID, ""),
      displayValue(v.CHASSIS_NUMBER, ""),
      displayValue(v.TBOX_ID, ""),
      displayValue(v.BATTERY_TYPE_ID, ""),
      displayValue(v.BATTERY_TYPE_NAME, ""),
      deriveVehicleStatus(v.CUSTOMER_ID, v.DEALER_ID),
      displayValue(v.CUSTOMER_ID, ""),
      displayValue(v.CUSTOMER_NAME, ""),
      displayValue(v.DEALER_ID, ""),
      displayValue(v.DEALER_NAME, ""),
      displayValue(v.MODEL, ""),
      displayValue(v.REGION, ""),
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

  if (uniqueVehicles.length === 0 && !loading) {
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
            Showing {uniqueVehicles.length} vehicle
            {uniqueVehicles.length !== 1 ? "s" : ""} with status derived from
            assignments
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
        {uniqueVehicles.map((vehicle) => (
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
