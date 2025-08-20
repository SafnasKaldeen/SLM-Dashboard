"use client";

import React from "react";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Car, Eye, Battery, Activity, MapPin } from "lucide-react";

// ------------------ Types ------------------
interface Vehicle {
  VEHICLE_ID: string;
  VIN: string;
  MODEL: string;
  BATTERY_TYPE: string;
  STATUS: string;
  TOTAL_SWAPS_DAILY: number;
  TOTAL_SWAPS_MONTHLY: number;
  TOTAL_CHARGING_SESSIONS: number;
  AVG_DISTANCE_PER_DAY: number;
  TOTAL_REVENUE: number;
}

// ------------------ Helpers ------------------
const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "active":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "inactive":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "maintenance":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-slate-700/20 text-slate-400 border-slate-600/30";
  }
};

const formatNumber = (num: number) =>
  num.toLocaleString("en-US", { maximumFractionDigits: 0 });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);

// ------------------ Individual Vehicle Card ------------------
const VehicleCard = ({ vehicle }: { vehicle: Vehicle }) => (
  <Card className="border-slate-700/50 backdrop-blur-xl hover:bg-slate-800/30 transition-all duration-200 group">
    <CardContent className="py-6 px-3">
      {/* Header Section */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-cyan-500/10 rounded-lg">
              <Car className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-slate-100 font-semibold text-lg">
                {vehicle.VEHICLE_ID}
              </h3>
              <p className="text-slate-400 text-sm">{vehicle.VIN}</p>
            </div>
          </div>
        </div>
        <Badge className={getStatusColor(vehicle.STATUS)}>
          {vehicle.STATUS}
        </Badge>
      </div>

      {/* Vehicle Details */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Badge className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-emerald-500/20 text-emerald-400">
          <Car className="h-4 w-4" />
          {vehicle.MODEL}
        </Badge>

        <Badge className="flex items-center gap-2 px-3 py-1 rounded-2xl bg-sky-500/20 text-sky-400">
          <Battery className="h-4 w-4" />
          {vehicle.BATTERY_TYPE}
        </Badge>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Total Swaps</div>
          <div className="text-slate-100 font-semibold">
            {formatNumber(vehicle.TOTAL_SWAPS_DAILY)}
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Total Charging</div>
          <div className="text-slate-100 font-semibold">
            {formatNumber(vehicle.TOTAL_CHARGING_SESSIONS)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-slate-400 text-xs mb-1">Total Distance</div>
          <div className="text-slate-100 font-semibold">
            {vehicle.AVG_DISTANCE_PER_DAY.toFixed(1)} km
          </div>
        </div>
      </div>

      {/* Revenue and Action */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <Activity className="h-4 w-4 text-green-400" />
          <span className="text-slate-300 text-sm">Total Revenue:</span>
          <span className="text-green-400 font-semibold">
            {formatCurrency(vehicle.TOTAL_REVENUE)}
          </span>
        </div>
        <Link href={`/vehicles/${vehicle.VEHICLE_ID}`}>
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <Eye className="w-4 h-4 mr-1" />
            View Details
          </Button>
        </Link>
      </div>
    </CardContent>
  </Card>
);

// ------------------ Pagination ------------------
const Pagination = ({
  currentPage,
  totalPages,
  itemsPerPage,
  totalItems,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
}) => (
  <div className="flex flex-col sm:flex-row items-center justify-between mt-12 gap-6">
    <div className="text-slate-400 text-sm bg-gradient-to-r from-slate-800/50 to-slate-700/50 px-4 py-2 rounded-full border border-slate-700/30">
      Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
      {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems}{" "}
      vehicles
    </div>
    <div className="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600/50 hover:from-slate-700 hover:to-slate-600 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        Previous
      </Button>
      <div className="flex items-center gap-2">
        <span className="text-slate-300 text-sm font-medium bg-gradient-to-r from-slate-800/70 to-slate-700/70 px-4 py-2 rounded-lg border border-slate-600/30">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="bg-gradient-to-r from-slate-800 to-slate-700 border-slate-600/50 hover:from-slate-700 hover:to-slate-600 hover:border-cyan-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
      >
        Next
      </Button>
    </div>
  </div>
);

// ------------------ Main Cards Component ------------------
const VehicleCards = ({
  vehicles,
  currentPage,
  totalPages,
  itemsPerPage,
  totalVehicles,
  onPageChange,
}: {
  vehicles: Vehicle[];
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  totalVehicles: number;
  onPageChange: (page: number) => void;
}) => {
  // Export as CSV
  const handleExport = () => {
    const headers = [
      "Vehicle ID",
      "VIN",
      "Model",
      "Battery Type",
      "Status",
      "Daily Swaps",
      "Monthly Swaps",
      "Charging Sessions",
      "Avg Distance/Day",
      "Total Revenue",
    ];

    const rows = vehicles.map((v) => [
      v.VEHICLE_ID,
      v.VIN,
      v.MODEL,
      v.BATTERY_TYPE,
      v.STATUS,
      v.TOTAL_SWAPS_DAILY,
      v.TOTAL_SWAPS_MONTHLY,
      v.TOTAL_CHARGING_SESSIONS,
      v.AVG_DISTANCE_PER_DAY,
      v.TOTAL_REVENUE,
    ]);

    const csvContent = [headers, ...rows].map((e) => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "vehicles.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Vehicle Cards Grid */}
      {vehicles.length > 0 ? (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {vehicles.map((vehicle, index) => (
              <div
                key={vehicle.VEHICLE_ID}
                className="animate-in fade-in-0 slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <VehicleCard vehicle={vehicle} />
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalVehicles}
              onPageChange={onPageChange}
            />
          )}
        </>
      ) : (
        <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-700/10 via-slate-600/10 to-slate-700/10"></div>
          <CardContent className="relative z-10 p-16 text-center">
            <div className="mb-6">
              <div className="relative inline-flex p-4 bg-gradient-to-br from-slate-700/30 to-slate-800/30 rounded-full">
                <Car className="h-16 w-16 text-slate-500" />
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-full animate-pulse"></div>
              </div>
            </div>
            <h3 className="text-slate-300 text-2xl font-bold mb-4 bg-clip-text text-transparent">
              No vehicles found
            </h3>
            <p className="text-slate-400 text-lg max-w-md mx-auto leading-relaxed">
              Try adjusting your filters to discover vehicles in your fleet.
            </p>
            <div className="mt-8">
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-full border border-slate-600/30">
                <span className="text-slate-400 text-sm">
                  Use the filters above to refine your search
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VehicleCards;
