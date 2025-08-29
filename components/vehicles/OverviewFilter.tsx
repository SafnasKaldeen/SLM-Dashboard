"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, X, Loader2, Search, Sparkles, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";

// Simplified filter interface without date range and aggregation
export interface SimpleOverviewFilterType {
  selectedModels: string[];
  selectedBatteryTypes: string[];
  selectedStatuses: string[];
  customerTypes: string[];
  dealerIds: string[];
  vehicleIdSearch: string;
  chassisNumberSearch: string;
}

interface FilterCombination {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
  BATTERY_TYPE_ID: string;
  CUSTOMER_ID?: string;
  DEALER_ID?: string;
  STATUS: string;
  MODEL?: string;
}

interface SimpleOverviewFilterProps {
  onFiltersChange: (filters: Partial<SimpleOverviewFilterType>) => void;
  loading: boolean;
  initialFilters: SimpleOverviewFilterType;
  filterCombinations: FilterCombination[];
}

export const SimpleOverviewFilter: React.FC<SimpleOverviewFilterProps> = ({
  onFiltersChange,
  loading,
  initialFilters,
  filterCombinations,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] =
    useState<SimpleOverviewFilterType>(initialFilters);

  // Extract unique values from filterCombinations
  const availableOptions = useMemo(() => {
    if (!filterCombinations.length) {
      return {
        models: [],
        batteryTypes: [],
        statuses: [],
        customerIds: [],
        dealerIds: [],
      };
    }

    const models = [
      ...new Set(
        filterCombinations
          .map((f) => f.MODEL)
          .filter(Boolean)
          .sort()
      ),
    ];

    const batteryTypes = [
      ...new Set(
        filterCombinations
          .map((f) => f.BATTERY_TYPE_ID)
          .filter(Boolean)
          .sort()
      ),
    ];

    const statuses = [
      ...new Set(
        filterCombinations
          .map((f) => f.STATUS)
          .filter(Boolean)
          .sort()
      ),
    ];

    const customerIds = [
      ...new Set(
        filterCombinations
          .map((f) => f.CUSTOMER_ID)
          .filter(Boolean)
          .sort()
      ),
    ];

    const dealerIds = [
      ...new Set(
        filterCombinations
          .map((f) => f.DEALER_ID)
          .filter(Boolean)
          .sort()
      ),
    ];

    return { models, batteryTypes, statuses, customerIds, dealerIds };
  }, [filterCombinations]);

  // Update parent filters when local filters change
  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = useCallback(
    (newFilters: Partial<SimpleOverviewFilterType>) => {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    },
    []
  );

  const clearAllFilters = useCallback(() => {
    const cleared: SimpleOverviewFilterType = {
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedStatuses: [],
      customerTypes: [],
      dealerIds: [],
      vehicleIdSearch: "",
      chassisNumberSearch: "",
    };

    setFilters(cleared);
  }, []);

  const handleArrayFilterChange = useCallback(
    (
      filterKey: keyof SimpleOverviewFilterType,
      value: string,
      checked: boolean
    ) => {
      const currentArray = filters[filterKey] as string[];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item) => item !== value);

      updateFilters({ [filterKey]: newArray });
    },
    [filters, updateFilters]
  );

  const getActiveFiltersCount = useCallback(() => {
    let count = 0;
    if (filters.selectedModels.length > 0) count++;
    if (filters.selectedBatteryTypes.length > 0) count++;
    if (filters.selectedStatuses.length > 0) count++;
    if (filters.customerTypes.length > 0) count++;
    if (filters.dealerIds.length > 0) count++;
    if (filters.vehicleIdSearch) count++;
    if (filters.chassisNumberSearch) count++;
    return count;
  }, [filters]);

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 backdrop-blur-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="animate-spin h-6 w-6 text-cyan-400" />
            <span className="text-slate-300 text-lg font-medium">
              Loading filters...
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-2 border-slate-700/60 backdrop-blur-xl shadow-2xl">
      <CardContent className="relative z-10 p-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative p-3 rounded-xl border-2 border-cyan-500/40 shadow-lg">
              <Filter className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <span className="font-bold text-xl text-slate-100 bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
                Fleet Filters
              </span>
              {getActiveFiltersCount() > 0 && (
                <Badge className="ml-3 bg-gradient-to-r from-cyan-500/20 to-cyan-400/10 text-cyan-400 border-2 border-cyan-500/40 px-3 py-1 text-sm font-bold">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {getActiveFiltersCount()} active
                </Badge>
              )}
            </div>
          </div>
          <div className="flex gap-4">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 border-2 border-transparent hover:border-red-500/30 transition-all duration-300 font-semibold"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border-2 border-transparent hover:border-cyan-500/30 transition-all duration-300 font-semibold"
            >
              <Settings className="h-4 w-4 mr-2" />
              {isExpanded ? "Less" : "More"} Filters
            </Button>
          </div>
        </div>

        {/* Main Filters Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Vehicle Status Multi-Select */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold">Status</Label>
            <Select
              onValueChange={(value) =>
                handleArrayFilterChange("selectedStatuses", value, true)
              }
            >
              <SelectTrigger className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-2 border-slate-600/60 hover:border-cyan-500/40 transition-all duration-300 text-slate-300 font-medium backdrop-blur-sm">
                <span>
                  {filters.selectedStatuses.length > 0
                    ? `${filters.selectedStatuses.length} selected`
                    : "Select status"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-slate-700/60 backdrop-blur-xl">
                {availableOptions.statuses.map((status) => (
                  <SelectItem
                    key={status}
                    value={status}
                    className="text-slate-300 hover:bg-slate-700/60"
                  >
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {filters.selectedStatuses.map((status) => (
                <Badge
                  key={status}
                  className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-300 border-2 border-slate-600/40 hover:border-red-500/40 transition-all duration-200"
                >
                  {status}
                  <X
                    className="h-3 w-3 ml-2 cursor-pointer hover:text-red-400 transition-colors duration-200"
                    onClick={() =>
                      handleArrayFilterChange("selectedStatuses", status, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Battery Types Multi-Select */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold">
              Battery Types
            </Label>
            <Select
              onValueChange={(value) =>
                handleArrayFilterChange("selectedBatteryTypes", value, true)
              }
            >
              <SelectTrigger className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-2 border-slate-600/60 hover:border-cyan-500/40 transition-all duration-300 text-slate-300 font-medium backdrop-blur-sm">
                <span>
                  {filters.selectedBatteryTypes.length > 0
                    ? `${filters.selectedBatteryTypes.length} selected`
                    : "Select battery types"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-slate-700/60 backdrop-blur-xl">
                {availableOptions.batteryTypes.map((type) => (
                  <SelectItem
                    key={type}
                    value={type}
                    className="text-slate-300 hover:bg-slate-700/60"
                  >
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {filters.selectedBatteryTypes.map((type) => (
                <Badge
                  key={type}
                  className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-300 border-2 border-slate-600/40 hover:border-red-500/40 transition-all duration-200"
                >
                  {type}
                  <X
                    className="h-3 w-3 ml-2 cursor-pointer hover:text-red-400 transition-colors duration-200"
                    onClick={() =>
                      handleArrayFilterChange(
                        "selectedBatteryTypes",
                        type,
                        false
                      )
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Models Multi-Select */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold">Models</Label>
            <Select
              onValueChange={(value) =>
                handleArrayFilterChange("selectedModels", value, true)
              }
            >
              <SelectTrigger className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-2 border-slate-600/60 hover:border-cyan-500/40 transition-all duration-300 text-slate-300 font-medium backdrop-blur-sm">
                <span>
                  {filters.selectedModels.length > 0
                    ? `${filters.selectedModels.length} selected`
                    : "Select models"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-slate-700/60 backdrop-blur-xl">
                {availableOptions.models.map((model) => (
                  <SelectItem
                    key={model}
                    value={model}
                    className="text-slate-300 hover:bg-slate-700/60"
                  >
                    {model}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {filters.selectedModels.map((model) => (
                <Badge
                  key={model}
                  className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-300 border-2 border-slate-600/40 hover:border-red-500/40 transition-all duration-200"
                >
                  {model}
                  <X
                    className="h-3 w-3 ml-2 cursor-pointer hover:text-red-400 transition-colors duration-200"
                    onClick={() =>
                      handleArrayFilterChange("selectedModels", model, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Customer Types Multi-Select */}
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold">Dealers</Label>
            <Select
              onValueChange={(value) =>
                handleArrayFilterChange("dealerIds", value, true)
              }
            >
              <SelectTrigger className="bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-2 border-slate-600/60 hover:border-cyan-500/40 transition-all duration-300 text-slate-300 font-medium backdrop-blur-sm">
                <span>
                  {filters.customerTypes.length > 0
                    ? `${filters.customerTypes.length} selected`
                    : "Select customer types"}
                </span>
              </SelectTrigger>
              <SelectContent className="bg-slate-800/90 border-slate-700/60 backdrop-blur-xl">
                {availableOptions.customerIds.map((customerId) => (
                  <SelectItem
                    key={customerId}
                    value={customerId}
                    className="text-slate-300 hover:bg-slate-700/60"
                  >
                    {customerId}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-2">
              {filters.customerTypes.map((type) => (
                <Badge
                  key={type}
                  className="bg-gradient-to-r from-slate-700/60 to-slate-600/60 text-slate-300 border-2 border-slate-600/40 hover:border-red-500/40 transition-all duration-200"
                >
                  {type}
                  <X
                    className="h-3 w-3 ml-2 cursor-pointer hover:text-red-400 transition-colors duration-200"
                    onClick={() =>
                      handleArrayFilterChange("customerTypes", type, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              Search Vehicle ID
            </Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={filters.vehicleIdSearch}
                onChange={(e) =>
                  updateFilters({ vehicleIdSearch: e.target.value })
                }
                placeholder="Enter vehicle ID..."
                className="pl-12 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-2 border-slate-600/60 hover:border-cyan-500/40 focus:border-cyan-500/60 text-slate-300 placeholder-slate-500 font-medium backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-slate-300 font-semibold flex items-center gap-2">
              <Search className="h-4 w-4 text-cyan-400" />
              Search Chassis Number
            </Label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                value={filters.chassisNumberSearch}
                onChange={(e) =>
                  updateFilters({ chassisNumberSearch: e.target.value })
                }
                placeholder="Enter chassis number..."
                className="pl-12 bg-gradient-to-r from-slate-800/60 to-slate-700/60 border-2 border-slate-600/60 hover:border-cyan-500/40 focus:border-cyan-500/60 text-slate-300 placeholder-slate-500 font-medium backdrop-blur-sm transition-all duration-300"
              />
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-6 border-t border-slate-700/50">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dealer IDs */}
              {availableOptions.dealerIds.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-slate-300">Dealer IDs</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {availableOptions.dealerIds.map((dealerId) => (
                      <div
                        key={dealerId}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          checked={filters.dealerIds.includes(dealerId)}
                          onCheckedChange={(checked) =>
                            handleArrayFilterChange(
                              "dealerIds",
                              dealerId,
                              checked as boolean
                            )
                          }
                          className="border-slate-600"
                        />
                        <Label className="text-slate-400 text-sm">
                          {dealerId}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
