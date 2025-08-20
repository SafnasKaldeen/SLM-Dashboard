"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

export interface OverviewFilterType {
  dateRange?: { from: Date; to: Date };
  selectedModels: string[];
  selectedBatteryTypes: string[];
  selectedStatuses: string[];
  customerTypes: string[];
  aggregation: "daily" | "monthly" | "quarterly" | "annually";
  vehicleIdSearch: string;
  chassisNumberSearch: string;
}

interface OverviewFilterProps {
  onFiltersChange?: (filters: Partial<OverviewFilterType>) => void;
  loading?: boolean;
  initialFilters?: OverviewFilterType;
  filterCombinations?: FilterCombination[];
}

interface FilterCombination {
  VEHICLE_MODEL_ID: string;
  BATTERY_TYPE_ID: string;
  STATUS: string;
  VEHICLE_ID: string;
  CHASSIS_NUMBER: string;
}

export function OverviewFilter({
  onFiltersChange,
  loading = false,
  initialFilters,
  filterCombinations = [],
}: OverviewFilterProps) {
  // Clean and normalize the filter combinations data
  const cleanFilterCombinations = useMemo(() => {
    return filterCombinations.map((item) => ({
      ...item,
      VEHICLE_MODEL_ID: item.VEHICLE_MODEL_ID?.trim() || "",
      BATTERY_TYPE_ID: item.BATTERY_TYPE_ID?.trim() || "",
      STATUS: item.STATUS?.trim() || "",
      CHASSIS_NUMBER: item.CHASSIS_NUMBER?.trim() || "",
    }));
  }, [filterCombinations]);

  // Create stable default date range
  const defaultDateRange = useMemo(() => {
    const today = new Date();
    return {
      from: new Date(today.getFullYear() - 1, today.getMonth(), 1),
      to: new Date(today.getFullYear(), today.getMonth(), 0),
    };
  }, []);

  // ============================================================================
  // STATE MANAGEMENT - STABILIZED
  // ============================================================================

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"from" | "to">("from");
  const [quickTime, setQuickTime] = useState<string>("last_year");

  // Use refs to prevent unnecessary re-renders
  const initializeRef = useRef(false);
  const lastNotifiedFiltersRef = useRef<string>("");

  // Initialize filters with stable state
  const [filters, setFilters] = useState<OverviewFilterType>(() => {
    if (initialFilters) {
      return {
        ...initialFilters,
        selectedModels: initialFilters.selectedModels || [],
        selectedBatteryTypes: initialFilters.selectedBatteryTypes || [],
        selectedStatuses: initialFilters.selectedStatuses || [],
        customerTypes: initialFilters.customerTypes || [],
      };
    }
    return {
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedStatuses: [],
      customerTypes: [],
      aggregation: "monthly",
      dateRange: defaultDateRange,
      vehicleIdSearch: "",
      chassisNumberSearch: "",
    };
  });

  const [tempRange, setTempRange] = useState<
    { from: Date; to: Date } | undefined
  >(initialFilters?.dateRange || defaultDateRange);

  // ============================================================================
  // STABLE UTILITIES
  // ============================================================================

  // Memoize unique values to prevent recalculation
  const uniqueValues = useMemo(() => {
    const getUniqueValues = (key: keyof FilterCombination) => {
      const values = cleanFilterCombinations
        .map((item) => {
          const value = item[key];
          return typeof value === "string" ? value.trim() : value;
        })
        .filter(
          (value): value is string =>
            value !== undefined &&
            value !== null &&
            value !== "" &&
            (typeof value === "string" ? value.trim() !== "" : true)
        );
      return Array.from(new Set(values)).sort();
    };

    return {
      vehicleModels: getUniqueValues("VEHICLE_MODEL_ID"),
      batteryTypes: getUniqueValues("BATTERY_TYPE_ID"),
      statuses: getUniqueValues("STATUS"),
    };
  }, [cleanFilterCombinations]);

  // ============================================================================
  // STABLE EVENT HANDLERS
  // ============================================================================

  const updateFilters = useCallback(
    (newFilters: Partial<OverviewFilterType>) => {
      setFilters((prevFilters) => {
        const updatedFilters = { ...prevFilters, ...newFilters };

        // Create a stable key for comparison
        const filtersKey = JSON.stringify({
          dateRange: updatedFilters.dateRange
            ? `${updatedFilters.dateRange.from?.getTime()}-${updatedFilters.dateRange.to?.getTime()}`
            : "no-date",
          selectedModels: updatedFilters.selectedModels.sort().join(","),
          selectedBatteryTypes: updatedFilters.selectedBatteryTypes
            .sort()
            .join(","),
          selectedStatuses: updatedFilters.selectedStatuses.sort().join(","),
          customerTypes: updatedFilters.customerTypes.sort().join(","),
          aggregation: updatedFilters.aggregation,
          vehicleIdSearch: updatedFilters.vehicleIdSearch,
          chassisNumberSearch: updatedFilters.chassisNumberSearch,
        });

        // Only notify parent if filters actually changed
        if (filtersKey !== lastNotifiedFiltersRef.current) {
          lastNotifiedFiltersRef.current = filtersKey;
          // Use setTimeout to prevent synchronous state updates
          setTimeout(() => {
            onFiltersChange?.(updatedFilters);
          }, 0);
        }

        return updatedFilters;
      });
    },
    [onFiltersChange]
  );

  const clearAllFilters = useCallback(() => {
    const cleared: OverviewFilterType = {
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedStatuses: [],
      customerTypes: [],
      aggregation: "monthly",
      dateRange: defaultDateRange,
      vehicleIdSearch: "",
      chassisNumberSearch: "",
    };

    setFilters(cleared);
    setTempRange(defaultDateRange);
    setQuickTime("last_year");
  }, [defaultDateRange]);

  const handleQuickTimeChange = useCallback(
    (value: string) => {
      setQuickTime(value);
      if (value === "custom") return;

      const today = new Date();
      let newFrom = new Date();
      let newTo = new Date();
      let aggregation = filters.aggregation;

      switch (value) {
        case "history":
          newFrom = new Date(2020, 0, 1);
          newTo = today;
          aggregation = "monthly";
          break;
        case "last_month":
          newFrom = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          newTo = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "last_3_months":
          newFrom = new Date(today.getFullYear(), today.getMonth() - 3, 1);
          newTo = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "last_year":
          newFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
          newTo = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        default:
          return;
      }

      const range = { from: newFrom, to: newTo };
      setTempRange(range);
      updateFilters({ dateRange: range, aggregation });
    },
    [filters.aggregation, updateFilters]
  );

  const handleArrayFilterChange = useCallback(
    (filterKey: keyof OverviewFilterType, value: string, checked: boolean) => {
      const currentArray = filters[filterKey] as string[];
      const newArray = checked
        ? [...currentArray, value]
        : currentArray.filter((item) => item !== value);
      updateFilters({ [filterKey]: newArray });
    },
    [filters, updateFilters]
  );

  const handleDisplayFilterChange = useCallback(
    (field: "vehicleIdSearch" | "chassisNumberSearch", value: string) => {
      updateFilters({ [field]: value });
    },
    [updateFilters]
  );

  const handleDateSelect = useCallback(
    (date: Date | undefined) => {
      if (!date) return;
      setTempRange((prev) => {
        const newRange = prev
          ? { ...prev }
          : { from: undefined, to: undefined };
        if (datePickerMode === "from") {
          newRange.from = date;
          if (newRange.to && date > newRange.to) newRange.to = undefined;
        } else {
          newRange.to = date;
          if (newRange.from && date < newRange.from) newRange.from = undefined;
        }
        return newRange;
      });
    },
    [datePickerMode]
  );

  const applyDateRange = useCallback(() => {
    if (!tempRange?.from || !tempRange?.to) return;
    const range = { from: tempRange.from, to: tempRange.to };
    updateFilters({ dateRange: range });
    setQuickTime("custom");
    setIsCalendarOpen(false);
  }, [tempRange, updateFilters]);

  // Get unique values from filter combinations
  const getUniqueValues = (key: keyof FilterCombination) => {
    const values = cleanFilterCombinations
      .map((item) => {
        const value = item[key];
        return typeof value === "string" ? value.trim() : value;
      })
      .filter(
        (value): value is string =>
          value !== undefined &&
          value !== null &&
          value !== "" &&
          (typeof value === "string" ? value.trim() !== "" : true)
      );
    return Array.from(new Set(values)).sort();
  };

  // ============================================================================
  // INITIALIZATION - FIXED
  // ============================================================================

  // Initialize only once when component mounts with initialFilters
  useEffect(() => {
    if (initialFilters && !initializeRef.current) {
      setFilters(initialFilters);
      if (initialFilters.dateRange) {
        setTempRange(initialFilters.dateRange);
      }
      initializeRef.current = true;
    }
  }, [initialFilters]);

  // ============================================================================
  // HELPER FUNCTIONS - FIXED
  // ============================================================================

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.dateRange?.from || filters.dateRange?.to) count++;
    if (filters.selectedModels.length > 0) count++;
    if (filters.selectedBatteryTypes.length > 0) count++;
    if (filters.selectedStatuses.length > 0) count++;
    if (filters.customerTypes.length > 0) count++;
    if (filters.aggregation !== "monthly") count++;
    if (filters.vehicleIdSearch) count++;
    if (filters.chassisNumberSearch) count++;
    return count;
  };

  const MonthYearSelector = ({
    date,
    onMonthChange,
    onYearChange,
  }: {
    date: Date;
    onMonthChange: (month: number) => void;
    onYearChange: (year: number) => void;
  }) => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    return (
      <div className="flex items-center justify-between px-2 py-1 mb-2">
        <Select
          value={date.getMonth().toString()}
          onValueChange={(value) => onMonthChange(parseInt(value))}
        >
          <SelectTrigger className="w-20 h-7 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {months.map((month, index) => (
              <SelectItem key={index} value={index.toString()}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onYearChange(date.getFullYear() - 1)}
          >
            <ChevronLeft className="h-3 w-3" />
          </Button>

          <Select
            value={date.getFullYear().toString()}
            onValueChange={(value) => onYearChange(parseInt(value))}
          >
            <SelectTrigger className="w-16 h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: 21 }, (_, i) => {
                const year = new Date().getFullYear() - 10 + i;
                return (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onYearChange(date.getFullYear() + 1)}
          >
            <ChevronRight className="h-3 w-3" />
          </Button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          <span>Loading filter combinations...</span>
        </CardContent>
      </Card>
    );
  }

  const isDateRangeDisabled = quickTime !== "custom";
  const isDailyDisabled = quickTime === "history";
  const vehicleModels = getUniqueValues("VEHICLE_MODEL_ID");
  const batteryTypes = getUniqueValues("BATTERY_TYPE_ID");
  const statuses = getUniqueValues("STATUS");

  return (
    <div className="space-y-4">
      {/* Main Filters Card */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              <span className="font-medium">Vehicle Filters</span>
              {getActiveFiltersCount() > 0 && (
                <Badge variant="secondary">
                  {getActiveFiltersCount()} active
                </Badge>
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

          {/* First Row - Primary Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Quick Time Filter */}
            <div className="space-y-2">
              <Label>Quick Time</Label>
              <Select value={quickTime} onValueChange={handleQuickTimeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="history">History (All Data)</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                  <SelectItem value="last_year">Last Year</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Date Range Picker */}
            <div className="space-y-2">
              <Label>Date Range</Label>
              <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={`w-full justify-start text-left font-normal ${
                      isDateRangeDisabled
                        ? "opacity-50 cursor-not-allowed bg-muted"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }`}
                    disabled={isDateRangeDisabled}
                    onClick={() =>
                      !isDateRangeDisabled && setIsCalendarOpen(true)
                    }
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">
                      {filters.dateRange?.from ? (
                        filters.dateRange.to ? (
                          <>
                            {format(filters.dateRange.from, "MMM dd, yyyy")} -{" "}
                            {format(filters.dateRange.to, "MMM dd, yyyy")}
                          </>
                        ) : (
                          format(filters.dateRange.from, "MMM dd, yyyy")
                        )
                      ) : (
                        "Pick a date range"
                      )}
                    </span>
                  </Button>
                </PopoverTrigger>
                {!isDateRangeDisabled && (
                  <PopoverContent
                    className="w-auto p-0 shadow-lg border-0"
                    align="start"
                  >
                    <div className="bg-background border border-border rounded-lg shadow-lg overflow-hidden">
                      <div className="p-4 space-y-4">
                        <div className="flex justify-center">
                          <div className="flex rounded-md bg-muted p-1">
                            <Button
                              variant={
                                datePickerMode === "from" ? "default" : "ghost"
                              }
                              size="sm"
                              className="px-3 py-1 text-xs"
                              onClick={() => setDatePickerMode("from")}
                            >
                              From Date
                            </Button>
                            <Button
                              variant={
                                datePickerMode === "to" ? "default" : "ghost"
                              }
                              size="sm"
                              className="px-3 py-1 text-xs"
                              onClick={() => setDatePickerMode("to")}
                            >
                              To Date
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <MonthYearSelector
                            date={currentMonth}
                            onMonthChange={(month) =>
                              setCurrentMonth(
                                new Date(currentMonth.getFullYear(), month)
                              )
                            }
                            onYearChange={(year) =>
                              setCurrentMonth(
                                new Date(year, currentMonth.getMonth())
                              )
                            }
                          />
                          <Calendar
                            selected={
                              datePickerMode === "from"
                                ? tempRange?.from
                                : tempRange?.to
                            }
                            onSelect={handleDateSelect}
                            mode="single"
                            month={currentMonth}
                            numberOfMonths={1}
                            showOutsideDays={false}
                            className="p-0"
                          />
                        </div>

                        <div className="border-t pt-3 space-y-3">
                          {tempRange?.from && tempRange?.to && (
                            <div className="flex items-center justify-between text-xs">
                              <div className="text-muted-foreground">
                                <span className="font-medium">
                                  Selected Range:
                                </span>
                              </div>
                              <div className="flex items-center space-x-2 text-xs">
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded-md font-medium">
                                  {format(tempRange.from, "MMM dd, yyyy")} -{" "}
                                  {format(tempRange.to, "MMM dd, yyyy")}
                                </span>
                              </div>
                            </div>
                          )}

                          <div className="flex justify-end">
                            <Button
                              onClick={applyDateRange}
                              disabled={!tempRange?.from || !tempRange?.to}
                              variant="default"
                              size="sm"
                            >
                              Apply Date Range
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </PopoverContent>
                )}
              </Popover>
            </div>

            {/* Aggregation */}
            <div className="space-y-2">
              <Label>Aggregation</Label>
              <Select
                value={filters.aggregation}
                onValueChange={(value) =>
                  updateFilters({
                    aggregation: value as OverviewFilterType["aggregation"],
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily" disabled={isDailyDisabled}>
                    Daily {isDailyDisabled && "(Not available for History)"}
                  </SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annually">Annually</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Vehicle Model */}
            <div className="space-y-2">
              <Label>Vehicle Model</Label>
              <Select
                onValueChange={(value) =>
                  handleArrayFilterChange("selectedModels", value, true)
                }
              >
                <SelectTrigger>
                  <span>
                    {filters.selectedModels.length > 0
                      ? `${filters.selectedModels.length} selected`
                      : "Select models"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {vehicleModels.map((model) => (
                    <SelectItem key={model} value={model}>
                      {model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.selectedModels.map((model) => (
                  <Badge key={model} variant="secondary">
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

            {/* Battery Type */}
            <div className="space-y-2">
              <Label>Battery Type</Label>
              <Select
                onValueChange={(value) =>
                  handleArrayFilterChange("selectedBatteryTypes", value, true)
                }
              >
                <SelectTrigger>
                  <span>
                    {filters.selectedBatteryTypes.length > 0
                      ? `${filters.selectedBatteryTypes.length} selected`
                      : "Select battery types"}
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {batteryTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.selectedBatteryTypes.map((type) => (
                  <Badge key={type} variant="secondary">
                    {type}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
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
          </div>

          {/* Second Row - Search Filters (Display Only) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
            {/* Vehicle ID Search */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-slate-300">Vehicle ID Search</Label>
                <Badge
                  variant="outline"
                  className="text-xs text-blue-400 border-blue-400/50"
                >
                  Display Only
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Vehicle ID..."
                  value={filters.vehicleIdSearch}
                  onChange={(e) =>
                    handleDisplayFilterChange("vehicleIdSearch", e.target.value)
                  }
                  className="pl-10 bg-slate-700/30 border-slate-600/30 text-slate-100 placeholder-slate-400 focus:border-blue-400/50"
                />
                {filters.vehicleIdSearch && (
                  <Button
                    onClick={() =>
                      handleDisplayFilterChange("vehicleIdSearch", "")
                    }
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-600/50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Chassis Number Search */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-slate-300">Chassis Number Search</Label>
                <Badge
                  variant="outline"
                  className="text-xs text-blue-400 border-blue-400/50"
                >
                  Display Only
                </Badge>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search by Chassis Number..."
                  value={filters.chassisNumberSearch}
                  onChange={(e) =>
                    handleDisplayFilterChange(
                      "chassisNumberSearch",
                      e.target.value
                    )
                  }
                  className="pl-10 bg-slate-700/30 border-slate-600/30 text-slate-100 placeholder-slate-400 focus:border-blue-400/50"
                />
                {filters.chassisNumberSearch && (
                  <Button
                    onClick={() =>
                      handleDisplayFilterChange("chassisNumberSearch", "")
                    }
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-600/50"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Expanded Filters Section */}
          {isExpanded && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
              {/* Vehicle Status */}
              <div className="space-y-2">
                <Label>Vehicle Status</Label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {statuses.map((status) => (
                    <div key={status} className="flex items-center space-x-2">
                      <Checkbox
                        checked={filters.selectedStatuses.includes(status)}
                        onCheckedChange={(checked) =>
                          handleArrayFilterChange(
                            "selectedStatuses",
                            status,
                            checked as boolean
                          )
                        }
                      />
                      <Label className="text-sm">{status}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
