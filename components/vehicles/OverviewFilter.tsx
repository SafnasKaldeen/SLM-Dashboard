"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Filter, X, Loader2, Search, Info } from "lucide-react";
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
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ============================================================================
// STATUS LOGIC
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

// Available status options for filtering (based on business logic)
const AVAILABLE_STATUSES = [
  "SOLD",
  "FACTORY_INSTOCK",
  "CUSTOMER_RESERVED",
  "DEALER_INSTOCK",
] as const;

// ============================================================================
// INTERFACES - Updated to include names
// ============================================================================

// Updated filter interface to use derived statuses and include names
export interface SimpleOverviewFilterType {
  selectedModels: string[];
  selectedBatteryTypes: string[]; // Still stores IDs internally
  selectedBatteryTypeNames: string[]; // New: stores names for display
  selectedStatuses: string[];
  customerTypes: string[];
  dealerIds: string[]; // Still stores IDs internally
  dealerNames: string[]; // New: stores names for display
  vehicleIdSearch: string;
  chassisNumberSearch: string;
  tboxIdSearch: string;
  dealerIdSearch: string; // New: dealer ID search field
}

interface FilterCombination {
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
  BATTERY_TYPE_ID: string;
  BATTERY_TYPE_NAME?: string; // New: battery type name
  CUSTOMER_ID?: string;
  DEALER_ID?: string;
  DEALER_NAME?: string; // New: dealer name
  STATUS: string; // This will be the derived status
  MODEL?: string;
}

interface SimpleOverviewFilterProps {
  onFiltersChange: (filters: Partial<SimpleOverviewFilterType>) => void;
  loading: boolean;
  initialFilters: SimpleOverviewFilterType;
  filterCombinations: FilterCombination[];
}

// Helper interfaces for managing ID to name mappings
interface BatteryTypeOption {
  id: string;
  name: string;
}

interface DealerOption {
  id: string;
  name: string;
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

  // Track original counts for cascading info
  const [originalCounts, setOriginalCounts] = useState({
    models: 0,
    batteryTypes: 0,
    statuses: 0,
    customerIds: 0,
    dealerIds: 0,
  });

  // Extract unique values from filterCombinations with derived status logic
  const availableOptions = useMemo(() => {
    if (!filterCombinations.length) {
      return {
        models: [],
        batteryTypes: [] as BatteryTypeOption[],
        statuses: AVAILABLE_STATUSES.slice(), // Use business logic statuses
        customerIds: [],
        dealers: [] as DealerOption[],
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

    // Create battery type options with ID and name mapping
    const batteryTypeMap = new Map<string, string>();
    filterCombinations.forEach((f) => {
      if (f.BATTERY_TYPE_ID && f.BATTERY_TYPE_NAME) {
        batteryTypeMap.set(f.BATTERY_TYPE_ID, f.BATTERY_TYPE_NAME);
      } else if (f.BATTERY_TYPE_ID) {
        // Fallback to ID if name is not available
        batteryTypeMap.set(f.BATTERY_TYPE_ID, f.BATTERY_TYPE_ID);
      }
    });

    const batteryTypes: BatteryTypeOption[] = Array.from(
      batteryTypeMap.entries()
    )
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    // Use derived statuses instead of the raw STATUS field
    const derivedStatuses = [
      ...new Set(
        filterCombinations
          .map((f) => deriveVehicleStatus(f.CUSTOMER_ID, f.DEALER_ID))
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

    // Create dealer options with ID and name mapping
    const dealerMap = new Map<string, string>();
    filterCombinations.forEach((f) => {
      if (f.DEALER_ID) {
        // Use dealer name if available, otherwise use ID as fallback
        const dealerName = f.DEALER_NAME || f.DEALER_ID;
        dealerMap.set(f.DEALER_ID, dealerName);
      }
    });

    const dealers: DealerOption[] = Array.from(dealerMap.entries())
      .map(([id, name]) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return {
      models,
      batteryTypes,
      statuses: derivedStatuses,
      customerIds,
      dealers,
    };
  }, [filterCombinations]);

  // Update original counts when data first loads (no filters applied)
  useEffect(() => {
    const hasFilters =
      filters.selectedModels.length > 0 ||
      filters.selectedBatteryTypes.length > 0 ||
      filters.selectedStatuses.length > 0 ||
      filters.customerTypes.length > 0 ||
      filters.dealerIds.length > 0;

    if (!hasFilters && !loading) {
      setOriginalCounts({
        models: availableOptions.models.length,
        batteryTypes: availableOptions.batteryTypes.length,
        statuses: availableOptions.statuses.length,
        customerIds: availableOptions.customerIds.length,
        dealerIds: availableOptions.dealers.length,
      });
    }
  }, [availableOptions, loading, filters]);

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
      selectedBatteryTypeNames: [],
      selectedStatuses: [],
      customerTypes: [],
      dealerIds: [],
      dealerNames: [],
      vehicleIdSearch: "",
      chassisNumberSearch: "",
      tboxIdSearch: "",
      dealerIdSearch: "",
    };

    setFilters(cleared);
  }, []);

  // Updated handler for battery types (manages both ID and name)
  const handleBatteryTypeChange = useCallback(
    (batteryTypeId: string, checked: boolean) => {
      const batteryType = availableOptions.batteryTypes.find(
        (bt) => bt.id === batteryTypeId
      );
      if (!batteryType) return;

      if (checked) {
        updateFilters({
          selectedBatteryTypes: [
            ...filters.selectedBatteryTypes,
            batteryType.id,
          ],
          selectedBatteryTypeNames: [
            ...filters.selectedBatteryTypeNames,
            batteryType.name,
          ],
        });
      } else {
        updateFilters({
          selectedBatteryTypes: filters.selectedBatteryTypes.filter(
            (id) => id !== batteryType.id
          ),
          selectedBatteryTypeNames: filters.selectedBatteryTypeNames.filter(
            (name) => name !== batteryType.name
          ),
        });
      }
    },
    [filters, availableOptions.batteryTypes, updateFilters]
  );

  // Updated handler for dealers (manages both ID and name)
  const handleDealerChange = useCallback(
    (dealerId: string, checked: boolean) => {
      const dealer = availableOptions.dealers.find((d) => d.id === dealerId);
      if (!dealer) return;

      if (checked) {
        updateFilters({
          dealerIds: [...filters.dealerIds, dealer.id],
          dealerNames: [...filters.dealerNames, dealer.name],
        });
      } else {
        updateFilters({
          dealerIds: filters.dealerIds.filter((id) => id !== dealer.id),
          dealerNames: filters.dealerNames.filter(
            (name) => name !== dealer.name
          ),
        });
      }
    },
    [filters, availableOptions.dealers, updateFilters]
  );

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
    if (filters.tboxIdSearch) count++;
    if (filters.dealerIdSearch) count++;
    return count;
  }, [filters]);

  // Check if options are being filtered by cascading
  const isCascadingActive =
    filters.selectedModels.length > 0 ||
    filters.selectedBatteryTypes.length > 0 ||
    filters.selectedStatuses.length > 0 ||
    filters.customerTypes.length > 0 ||
    filters.dealerIds.length > 0;

  const getCascadingInfo = (
    type: "models" | "batteryTypes" | "statuses" | "customerIds" | "dealerIds"
  ) => {
    if (!isCascadingActive) return null;

    const currentCount =
      type === "batteryTypes"
        ? availableOptions.batteryTypes.length
        : type === "dealerIds"
        ? availableOptions.dealers.length
        : availableOptions[type].length;
    const originalCount = originalCounts[type];

    if (currentCount < originalCount) {
      return {
        filtered: currentCount,
        total: originalCount,
        isFiltered: true,
      };
    }
    return null;
  };

  // Helper function to get friendly status labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case "SOLD":
        return "Sold";
      case "FACTORY_INSTOCK":
        return "Factory Instock";
      case "CUSTOMER_RESERVED":
        return "Customer Reserved";
      case "DEALER_INSTOCK":
        return "Dealer Instock";
      default:
        return status;
    }
  };

  const renderFilterSelect = (
    items: string[],
    selectedItems: string[],
    placeholder: string,
    onItemChange: (item: string, checked: boolean) => void,
    filterType:
      | "models"
      | "batteryTypes"
      | "statuses"
      | "customerIds"
      | "dealerIds",
    disabled = false
  ) => {
    const cascadingInfo = getCascadingInfo(filterType);

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => onItemChange(value, true)}
            disabled={disabled || loading}
          >
            <SelectTrigger className={disabled ? "opacity-50" : ""}>
              <SelectValue
                placeholder={
                  loading
                    ? "Loading..."
                    : disabled
                    ? "No options available"
                    : selectedItems.length > 0
                    ? `${selectedItems.length} selected`
                    : placeholder
                }
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading...</span>
                </div>
              ) : items.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No options available
                </div>
              ) : (
                items
                  .filter((item) => !selectedItems.includes(item))
                  .map((item) => (
                    <SelectItem key={item} value={item}>
                      {filterType === "statuses" ? getStatusLabel(item) : item}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>

          {cascadingInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-amber-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Showing {cascadingInfo.filtered} of {cascadingInfo.total}{" "}
                    options
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Options filtered by other selections
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {cascadingInfo && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>
              {cascadingInfo.filtered} of {cascadingInfo.total} available
            </span>
          </div>
        )}
      </div>
    );
  };

  // Specialized render functions for battery types and dealers
  const renderBatteryTypeSelect = () => {
    const cascadingInfo = getCascadingInfo("batteryTypes");

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => handleBatteryTypeChange(value, true)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loading
                    ? "Loading..."
                    : filters.selectedBatteryTypeNames.length > 0
                    ? `${filters.selectedBatteryTypeNames.length} selected`
                    : "Select battery types"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading...</span>
                </div>
              ) : availableOptions.batteryTypes.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No options available
                </div>
              ) : (
                availableOptions.batteryTypes
                  .filter((bt) => !filters.selectedBatteryTypes.includes(bt.id))
                  .map((batteryType) => (
                    <SelectItem key={batteryType.id} value={batteryType.id}>
                      {batteryType.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>

          {cascadingInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-amber-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Showing {cascadingInfo.filtered} of {cascadingInfo.total}{" "}
                    options
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Options filtered by other selections
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {cascadingInfo && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>
              {cascadingInfo.filtered} of {cascadingInfo.total} available
            </span>
          </div>
        )}
      </div>
    );
  };

  const renderDealerSelect = () => {
    const cascadingInfo = getCascadingInfo("dealerIds");

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Select
            onValueChange={(value) => handleDealerChange(value, true)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  loading
                    ? "Loading..."
                    : filters.dealerNames.length > 0
                    ? `${filters.dealerNames.length} selected`
                    : "Select dealers"
                }
              />
            </SelectTrigger>
            <SelectContent>
              {loading ? (
                <div className="flex items-center justify-center p-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="ml-2 text-sm">Loading...</span>
                </div>
              ) : availableOptions.dealers.length === 0 ? (
                <div className="p-2 text-sm text-muted-foreground">
                  No options available
                </div>
              ) : (
                availableOptions.dealers
                  .filter((dealer) => !filters.dealerIds.includes(dealer.id))
                  .map((dealer) => (
                    <SelectItem key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </SelectItem>
                  ))
              )}
            </SelectContent>
          </Select>

          {cascadingInfo && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center">
                    <Info className="h-4 w-4 text-amber-500" />
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    Showing {cascadingInfo.filtered} of {cascadingInfo.total}{" "}
                    options
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Options filtered by other selections
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        {cascadingInfo && (
          <div className="text-xs text-amber-600 flex items-center gap-1">
            <Info className="h-3 w-3" />
            <span>
              {cascadingInfo.filtered} of {cascadingInfo.total} available
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
            {isCascadingActive && (
              <Badge
                variant="outline"
                className="text-amber-600 border-amber-300"
              >
                Cascading Active
              </Badge>
            )}
            {loading && (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span className="text-xs text-muted-foreground">
                  Loading filters...
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? "Less" : "More"} Filters
            </Button>
          </div>
        </div>

        {/* Main Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Models */}
          <div className="space-y-2">
            <Label>Models</Label>
            {renderFilterSelect(
              availableOptions.models,
              filters.selectedModels,
              "Select models",
              (item, checked) =>
                handleArrayFilterChange("selectedModels", item, checked),
              "models"
            )}
            <div className="flex flex-wrap gap-1">
              {filters.selectedModels.map((model) => (
                <Badge key={model} variant="secondary" className="text-xs">
                  {model}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleArrayFilterChange("selectedModels", model, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Battery Types - Now showing names */}
          <div className="space-y-2">
            <Label>Battery Types</Label>
            {renderBatteryTypeSelect()}
            <div className="flex flex-wrap gap-1">
              {filters.selectedBatteryTypeNames.map((typeName, index) => {
                const typeId = filters.selectedBatteryTypes[index];
                return (
                  <Badge key={typeId} variant="secondary" className="text-xs">
                    {typeName}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleBatteryTypeChange(typeId, false)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>

          {/* Status - Using derived status logic */}
          <div className="space-y-2">
            <Label>Status</Label>
            {renderFilterSelect(
              availableOptions.statuses,
              filters.selectedStatuses,
              "Select status",
              (item, checked) =>
                handleArrayFilterChange("selectedStatuses", item, checked),
              "statuses"
            )}
            <div className="flex flex-wrap gap-1">
              {filters.selectedStatuses.map((status) => (
                <Badge key={status} variant="secondary" className="text-xs">
                  {getStatusLabel(status)}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleArrayFilterChange("selectedStatuses", status, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Dealers - Now showing names */}
          <div className="space-y-2">
            <Label>Dealers</Label>
            {renderDealerSelect()}
            <div className="flex flex-wrap gap-1">
              {filters.dealerNames.map((dealerName, index) => {
                const dealerId = filters.dealerIds[index];
                return (
                  <Badge key={dealerId} variant="secondary" className="text-xs">
                    {dealerName}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleDealerChange(dealerId, false)}
                    />
                  </Badge>
                );
              })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search Vehicle ID */}
          <div className="space-y-2">
            <Label>Vehicle ID Search</Label>
            <Input
              value={filters.vehicleIdSearch}
              onChange={(e) =>
                updateFilters({ vehicleIdSearch: e.target.value })
              }
              placeholder="Enter vehicle ID..."
            />
          </div>

          {/* TBOX ID */}
          <div className="space-y-2">
            <Label>TBOX ID Search</Label>
            <Input
              value={filters.tboxIdSearch}
              onChange={(e) => updateFilters({ tboxIdSearch: e.target.value })}
              placeholder="Enter TBOX ID..."
            />
          </div>

          {/* Search Chassis Number */}
          <div className="space-y-2">
            <Label>Chassis Number Search</Label>
            <Input
              value={filters.chassisNumberSearch}
              onChange={(e) =>
                updateFilters({ chassisNumberSearch: e.target.value })
              }
              placeholder="Enter chassis number..."
            />
          </div>

          {/* Dealer ID Search */}
          <div className="space-y-2">
            <Label>Dealer ID Search</Label>
            <Input
              value={filters.dealerIdSearch}
              onChange={(e) =>
                updateFilters({ dealerIdSearch: e.target.value })
              }
              placeholder="Enter dealer ID..."
            />
          </div>
        </div>

        {/* Expanded Filters */}
        {isExpanded && (
          <>
            {/* Customer Types Section - Only show if there are customer IDs */}
            {availableOptions.customerIds.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label>Customer Types</Label>
                  {renderFilterSelect(
                    availableOptions.customerIds,
                    filters.customerTypes,
                    "Select customer types",
                    (item, checked) =>
                      handleArrayFilterChange("customerTypes", item, checked),
                    "customerIds"
                  )}
                  <div className="flex flex-wrap gap-1">
                    {filters.customerTypes.map((type) => (
                      <Badge key={type} variant="secondary" className="text-xs">
                        {type}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() =>
                            handleArrayFilterChange(
                              "customerTypes",
                              type,
                              false
                            )
                          }
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Status Legend */}
            <div className="pt-4 border-t">
              <Label className="mb-3 block">Status Legend</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="font-medium">Sold:</span>
                    <span className="text-muted-foreground">
                      Customer + Dealer assigned
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-medium">Factory Instock:</span>
                    <span className="text-muted-foreground">
                      No assignments
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="font-medium">Customer Reserved:</span>
                    <span className="text-muted-foreground">Customer only</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span className="font-medium">Dealer Instock:</span>
                    <span className="text-muted-foreground">Dealer only</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-muted-foreground border-t pt-2 mb-4">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Available filters:</span>
                <span className="px-2 py-1 bg-muted rounded">
                  Vehicle ID Search
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Chassis Number Search
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  TBOX ID Search
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Dealer ID Search
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Models ({availableOptions.models.length}
                  {originalCounts.models > 0 &&
                  originalCounts.models !== availableOptions.models.length
                    ? `/${originalCounts.models}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Battery Types ({availableOptions.batteryTypes.length}
                  {originalCounts.batteryTypes > 0 &&
                  originalCounts.batteryTypes !==
                    availableOptions.batteryTypes.length
                    ? `/${originalCounts.batteryTypes}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Status ({availableOptions.statuses.length}
                  {originalCounts.statuses > 0 &&
                  originalCounts.statuses !== availableOptions.statuses.length
                    ? `/${originalCounts.statuses}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Dealers ({availableOptions.dealers.length}
                  {originalCounts.dealerIds > 0 &&
                  originalCounts.dealerIds !== availableOptions.dealers.length
                    ? `/${originalCounts.dealerIds}`
                    : ""}
                  )
                </span>
                {availableOptions.customerIds.length > 0 && (
                  <span className="px-2 py-1 bg-muted rounded">
                    Customer Types ({availableOptions.customerIds.length}
                    {originalCounts.customerIds > 0 &&
                    originalCounts.customerIds !==
                      availableOptions.customerIds.length
                      ? `/${originalCounts.customerIds}`
                      : ""}
                    )
                  </span>
                )}
              </div>
              {isCascadingActive && (
                <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center gap-1 text-amber-700">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">
                      Cascading Filters Active
                    </span>
                  </div>
                  <p className="text-xs text-amber-600 mt-1">
                    Filter options are automatically filtered based on your
                    current selections. Only combinations that exist in the data
                    are shown.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
              <div className="space-y-2">
                <Label>Filter Statistics</Label>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Available Models:</span>
                    <span className="font-mono">
                      {availableOptions.models.length}
                      {originalCounts.models > 0 &&
                        originalCounts.models !==
                          availableOptions.models.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.models}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Battery Types:</span>
                    <span className="font-mono">
                      {availableOptions.batteryTypes.length}
                      {originalCounts.batteryTypes > 0 &&
                        originalCounts.batteryTypes !==
                          availableOptions.batteryTypes.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.batteryTypes}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Statuses:</span>
                    <span className="font-mono">
                      {availableOptions.statuses.length}
                      {originalCounts.statuses > 0 &&
                        originalCounts.statuses !==
                          availableOptions.statuses.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.statuses}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Dealers:</span>
                    <span className="font-mono">
                      {availableOptions.dealers.length}
                      {originalCounts.dealerIds > 0 &&
                        originalCounts.dealerIds !==
                          availableOptions.dealers.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.dealerIds}
                          </span>
                        )}
                    </span>
                  </div>
                  {availableOptions.customerIds.length > 0 && (
                    <div className="flex justify-between">
                      <span>Available Customer Types:</span>
                      <span className="font-mono">
                        {availableOptions.customerIds.length}
                        {originalCounts.customerIds > 0 &&
                          originalCounts.customerIds !==
                            availableOptions.customerIds.length && (
                            <span className="text-muted-foreground">
                              {" "}
                              / {originalCounts.customerIds}
                            </span>
                          )}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Filter Tips</Label>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Status is derived from customer/dealer assignments</p>
                  <p>
                    • Filters cascade automatically - selecting one filter
                    restricts others
                  </p>
                  <p>• Only valid combinations from the data are shown</p>
                  <p>• Use "Clear All" to reset all filters to defaults</p>
                  <p>• Search fields work independently of other filters</p>
                  <p>• Multiple items can be selected for each filter type</p>
                  <p>• Battery types and dealers show friendly names</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
