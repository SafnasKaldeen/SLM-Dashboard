"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { format, subMonths, subYears } from "date-fns";
import type { DateRange } from "react-day-picker";

export interface SalesFilters {
  quickTime:
    | "last_month"
    | "last_3_months"
    | "last_6_months"
    | "last_year"
    | "custom";
  dateRange?: DateRange;
  selectedRegions: string[];
  selectedDealers: string[];
  selectedModels: string[];
  selectedPaymentMethods: string[];
  selectedCustomerTypes: string[];
  aggregation: "daily" | "weekly" | "monthly" | "quarterly" | "annually";
}

// Sample data for demonstration
const SAMPLE_DATA = {
  regions: ["North", "South", "East", "West"],
  dealers: ["Shavin", "Anoch", "Uthara", "Kamal", "Janaka", "Safnas"],
  models: ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
  paymentMethods: ["Cash", "Credit Card", "Loan", "Lease"],
  customerTypes: ["Individual", "Business", "Government", "Fleet"],
};

// Default filters to prevent undefined errors
const getDefaultFilters = (): SalesFilters => {
  const today = new Date();
  const from = subYears(today, 1);
  const to = subMonths(today, 1);

  return {
    quickTime: "last_year",
    dateRange: { from, to },
    selectedRegions: [],
    selectedDealers: [],
    selectedModels: [],
    selectedPaymentMethods: [],
    selectedCustomerTypes: [],
    aggregation: "monthly",
  };
};

export function SalesFilters() {
  // Sample data - in a real app, this would come from an API
  const [regions] = useState<string[]>(SAMPLE_DATA.regions);
  const [dealers] = useState<string[]>(SAMPLE_DATA.dealers);
  const [models] = useState<string[]>(SAMPLE_DATA.models);
  const [paymentMethods] = useState<string[]>(SAMPLE_DATA.paymentMethods);
  const [customerTypes] = useState<string[]>(SAMPLE_DATA.customerTypes);
  const [loading] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<SalesFilters>(getDefaultFilters());

  // Internal component state
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    filters.dateRange
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"from" | "to">("from");

  // Track original counts for cascading info
  const [originalCounts, setOriginalCounts] = useState({
    regions: 0,
    dealers: 0,
    models: 0,
    paymentMethods: 0,
    customerTypes: 0,
  });

  // Update original counts when data first loads (no filters applied)
  useEffect(() => {
    const hasFilters =
      (filters.selectedRegions?.length || 0) > 0 ||
      (filters.selectedDealers?.length || 0) > 0 ||
      (filters.selectedModels?.length || 0) > 0 ||
      (filters.selectedPaymentMethods?.length || 0) > 0 ||
      (filters.selectedCustomerTypes?.length || 0) > 0;

    if (!hasFilters && !loading) {
      setOriginalCounts({
        regions: regions.length,
        dealers: dealers.length,
        models: models.length,
        paymentMethods: paymentMethods.length,
        customerTypes: customerTypes.length,
      });
    }
  }, [
    regions.length,
    dealers.length,
    models.length,
    paymentMethods.length,
    customerTypes.length,
    loading,
    filters,
  ]);

  // Sync tempRange with filters.dateRange
  useEffect(() => {
    setTempRange(filters.dateRange);
  }, [filters.dateRange]);

  const getDefaultDateRange = () => {
    const today = new Date();
    const from = subYears(today, 1);
    const to = subMonths(today, 1);
    return { from, to };
  };

  const updateFilters = (newFilters: Partial<SalesFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const clearAllFilters = () => {
    const defaultFilters = getDefaultFilters();
    setFilters(defaultFilters);
    setTempRange(defaultFilters.dateRange);
  };

  const handleQuickTimeChange = (value: string) => {
    const today = new Date();
    let newFrom = new Date();
    let newTo = new Date();

    if (value !== "custom") {
      switch (value) {
        case "last_month":
          newFrom = subMonths(today, 1);
          newTo = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "last_3_months":
          newFrom = subMonths(today, 3);
          newTo = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "last_6_months":
          newFrom = subMonths(today, 6);
          newTo = new Date(today.getFullYear(), today.getMonth(), 0);
          break;
        case "last_year":
          newFrom = subYears(today, 1);
          newTo = subMonths(today, 1);
          break;
        default:
          return;
      }

      const range = { from: newFrom, to: newTo };
      setTempRange(range);
      updateFilters({
        quickTime: value as SalesFilters["quickTime"],
        dateRange: range,
      });
    } else {
      // When switching to custom, preserve current date range or use existing one
      const currentRange = filters.dateRange || getDefaultDateRange();
      setTempRange(currentRange);
      updateFilters({
        quickTime: value as SalesFilters["quickTime"],
        dateRange: currentRange,
      });
      // Automatically open the calendar when switching to custom
      setIsCalendarOpen(true);
    }
  };

  const handleFilterArrayChange = (
    filterKey:
      | "selectedRegions"
      | "selectedDealers"
      | "selectedModels"
      | "selectedPaymentMethods"
      | "selectedCustomerTypes",
    item: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey] || [];
    const newArray = checked
      ? [...currentArray, item]
      : currentArray.filter((i) => i !== item);

    updateFilters({ [filterKey]: newArray });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const newRange = { ...tempRange } || {};

    if (datePickerMode === "from") {
      newRange.from = date;
      // If the new from date is after the current to date, clear the to date
      if (newRange.to && date > newRange.to) {
        newRange.to = undefined;
      }
      // Auto-switch to "to" mode after selecting from date
      setDatePickerMode("to");
    } else if (datePickerMode === "to") {
      newRange.to = date;
      // If the new to date is before the current from date, clear the from date
      if (newRange.from && date < newRange.from) {
        newRange.from = undefined;
        setDatePickerMode("from");
      }
    }

    setTempRange(newRange);
  };

  const applyDateRange = () => {
    if (!tempRange?.from || !tempRange?.to) return;

    const range = {
      from: tempRange.from,
      to: tempRange.to,
    };

    updateFilters({
      dateRange: range,
      quickTime: "custom",
    });
    setIsCalendarOpen(false);
  };

  const cancelDateRange = () => {
    // Revert to the current filter's date range
    setTempRange(filters.dateRange);
    setIsCalendarOpen(false);
    setDatePickerMode("from");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.quickTime !== "last_year") count++; // Count non-default time selection
    if ((filters.selectedRegions?.length || 0) > 0) count++;
    if ((filters.selectedDealers?.length || 0) > 0) count++;
    if ((filters.selectedModels?.length || 0) > 0) count++;
    if ((filters.selectedPaymentMethods?.length || 0) > 0) count++;
    if ((filters.selectedCustomerTypes?.length || 0) > 0) count++;
    if (filters.aggregation !== "monthly") count++;
    return count;
  };

  const isDateRangeDisabled = filters.quickTime !== "custom";

  // Check if options are being filtered by cascading
  const isCascadingActive =
    (filters.selectedRegions?.length || 0) > 0 ||
    (filters.selectedDealers?.length || 0) > 0 ||
    (filters.selectedModels?.length || 0) > 0 ||
    (filters.selectedPaymentMethods?.length || 0) > 0 ||
    (filters.selectedCustomerTypes?.length || 0) > 0;

  const getCascadingInfo = (
    type: "regions" | "dealers" | "models" | "paymentMethods" | "customerTypes"
  ) => {
    if (!isCascadingActive) return null;

    const currentCount =
      type === "regions"
        ? regions.length
        : type === "dealers"
        ? dealers.length
        : type === "models"
        ? models.length
        : type === "paymentMethods"
        ? paymentMethods.length
        : customerTypes.length;
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
          onValueChange={(value) => onMonthChange(Number.parseInt(value))}
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
            onValueChange={(value) => onYearChange(Number.parseInt(value))}
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

  const renderFilterSelect = (
    items: string[],
    selectedItems: string[],
    placeholder: string,
    onItemChange: (item: string, checked: boolean) => void,
    filterType:
      | "regions"
      | "dealers"
      | "models"
      | "paymentMethods"
      | "customerTypes",
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
                      {item}
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
    <Card className="border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" />
            <span className="font-medium text-white">Filters</span>
            {getActiveFiltersCount() > 0 && (
              <Badge
                variant="secondary"
                className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30"
              >
                {getActiveFiltersCount()} active
              </Badge>
            )}
            {isCascadingActive && (
              <Badge
                variant="outline"
                className="text-amber-400 border-amber-300/50 bg-amber-500/10"
              >
                Cascading Active
              </Badge>
            )}
            {loading && (
              <div className="flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                <span className="text-xs text-slate-400">
                  Loading filters...
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-2">
            {getActiveFiltersCount() > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-slate-300 hover:text-white hover:bg-slate-700/50"
              >
                <X className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-slate-300 hover:text-white hover:bg-slate-700/50"
            >
              {isExpanded ? "Less" : "More"} Filters
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Quick Time Filter */}
          <div className="space-y-2">
            <Label className="text-slate-300">Quick Time</Label>
            <Select
              value={filters.quickTime}
              onValueChange={handleQuickTimeChange}
            >
              <SelectTrigger className="border-slate-600 text-white">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent className="border-slate-700">
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_6_months">Last 6 Months</SelectItem>
                <SelectItem value="last_year">Last Year (Default)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label className="text-slate-300">
              Date Range
              {filters.quickTime === "custom" && (
                <span className="text-xs text-cyan-400 ml-1">
                  (Custom Mode)
                </span>
              )}
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50 ${
                    isDateRangeDisabled ? "opacity-50 cursor-not-allowed" : ""
                  } ${
                    filters.quickTime === "custom" ? "border-cyan-400/50" : ""
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
                  <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-lg overflow-hidden">
                    <div className="p-4 space-y-4">
                      {/* Date Picker Mode Toggle */}
                      <div className="flex justify-center">
                        <div className="flex rounded-md bg-slate-700 p-1">
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

                      {/* Calendar */}
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
                          modifiers={{
                            selected_range_start: tempRange?.from,
                            selected_range_end: tempRange?.to,
                            selected_range_middle:
                              tempRange?.from && tempRange?.to
                                ? (date: Date) =>
                                    tempRange.from! < date &&
                                    date < tempRange.to!
                                : undefined,
                          }}
                          modifiersClassNames={{
                            selected_range_start:
                              "bg-primary text-primary-foreground rounded-r-none",
                            selected_range_end:
                              "bg-primary text-primary-foreground rounded-l-none",
                            selected_range_middle:
                              "bg-accent/30 text-accent-foreground rounded-none",
                          }}
                          className="bg-slate-800 text-white"
                        />
                      </div>

                      {/* Footer */}
                      <div className="border-t border-slate-700 pt-3 space-y-3">
                        {tempRange?.from && tempRange?.to && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="text-slate-400">
                              <span className="font-medium">
                                Selected Range:
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs">
                              <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md font-medium">
                                {format(tempRange.from, "MMM dd, yyyy")} -{" "}
                                {format(tempRange.to, "MMM dd, yyyy")}
                              </span>
                              <span className="text-slate-400">
                                (
                                {Math.ceil(
                                  (tempRange.to.getTime() -
                                    tempRange.from.getTime()) /
                                    (1000 * 60 * 60 * 24)
                                ) + 1}{" "}
                                days)
                              </span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-between">
                          <Button
                            onClick={cancelDateRange}
                            variant="outline"
                            size="sm"
                          >
                            Cancel
                          </Button>
                          <Button
                            onClick={applyDateRange}
                            disabled={!tempRange?.from || !tempRange?.to}
                            variant="default"
                            size="sm"
                            className="bg-cyan-600 hover:bg-cyan-700"
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
            <Label className="text-slate-300">Aggregation</Label>
            <Select
              value={filters.aggregation}
              onValueChange={(value) =>
                updateFilters({
                  aggregation: value as SalesFilters["aggregation"],
                })
              }
            >
              <SelectTrigger className="border-slate-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-slate-700">
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Regions */}
          <div className="space-y-2">
            <Label className="text-slate-300">Regions</Label>
            {renderFilterSelect(
              regions,
              filters.selectedRegions || [],
              "Select regions",
              (item, checked) =>
                handleFilterArrayChange("selectedRegions", item, checked),
              "regions"
            )}
            <div className="flex flex-wrap gap-1">
              {(filters.selectedRegions || []).map((region) => (
                <Badge
                  key={region}
                  variant="secondary"
                  className="text-xs bg-slate-700 text-slate-300"
                >
                  {region}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleFilterArrayChange("selectedRegions", region, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Dealers */}
          <div className="space-y-2">
            <Label className="text-slate-300">Dealers</Label>
            {renderFilterSelect(
              dealers,
              filters.selectedDealers || [],
              "Select dealers",
              (item, checked) =>
                handleFilterArrayChange("selectedDealers", item, checked),
              "dealers"
            )}
            <div className="flex flex-wrap gap-1">
              {(filters.selectedDealers || []).map((dealer) => (
                <Badge
                  key={dealer}
                  variant="secondary"
                  className="text-xs bg-slate-700 text-slate-300"
                >
                  {dealer}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleFilterArrayChange("selectedDealers", dealer, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Models */}
          <div className="space-y-2">
            <Label className="text-slate-300">Vehicle Models</Label>
            {renderFilterSelect(
              models,
              filters.selectedModels || [],
              "Select models",
              (item, checked) =>
                handleFilterArrayChange("selectedModels", item, checked),
              "models"
            )}
            <div className="flex flex-wrap gap-1">
              {(filters.selectedModels || []).map((model) => (
                <Badge
                  key={model}
                  variant="secondary"
                  className="text-xs bg-slate-700 text-slate-300"
                >
                  {model}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleFilterArrayChange("selectedModels", model, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
              {/* Payment Methods */}
              <div className="space-y-2">
                <Label className="text-slate-300">Payment Methods</Label>
                {renderFilterSelect(
                  paymentMethods,
                  filters.selectedPaymentMethods || [],
                  "Select payment methods",
                  (item, checked) =>
                    handleFilterArrayChange(
                      "selectedPaymentMethods",
                      item,
                      checked
                    ),
                  "paymentMethods"
                )}
                <div className="flex flex-wrap gap-1">
                  {(filters.selectedPaymentMethods || []).map((method) => (
                    <Badge
                      key={method}
                      variant="secondary"
                      className="text-xs bg-slate-700 text-slate-300"
                    >
                      {method}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() =>
                          handleFilterArrayChange(
                            "selectedPaymentMethods",
                            method,
                            false
                          )
                        }
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Dealer ID */}
              <div className="space-y-2">
                <Label className="text-slate-300">Dealer ID</Label>
                {renderFilterSelect(
                  customerTypes,
                  filters.selectedCustomerTypes || [],
                  "Select dealer IDs",
                  (item, checked) =>
                    handleFilterArrayChange(
                      "selectedCustomerTypes",
                      item,
                      checked
                    ),
                  "customerTypes"
                )}
                <div className="flex flex-wrap gap-1">
                  {(filters.selectedCustomerTypes || []).map((type) => (
                    <Badge
                      key={type}
                      variant="secondary"
                      className="text-xs bg-slate-700 text-slate-300"
                    >
                      {type}
                      <X
                        className="h-3 w-3 ml-1 cursor-pointer"
                        onClick={() =>
                          handleFilterArrayChange(
                            "selectedCustomerTypes",
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

            <div className="text-xs text-slate-400 border-t border-slate-700 pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Available filters:</span>
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Date Range
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Regions ({regions.length}
                  {originalCounts.regions > 0 &&
                  originalCounts.regions !== regions.length
                    ? `/${originalCounts.regions}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Dealers ({dealers.length}
                  {originalCounts.dealers > 0 &&
                  originalCounts.dealers !== dealers.length
                    ? `/${originalCounts.dealers}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Models ({models.length}
                  {originalCounts.models > 0 &&
                  originalCounts.models !== models.length
                    ? `/${originalCounts.models}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Payment Methods ({paymentMethods.length}
                  {originalCounts.paymentMethods > 0 &&
                  originalCounts.paymentMethods !== paymentMethods.length
                    ? `/${originalCounts.paymentMethods}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-slate-700 rounded">
                  Customer Types ({customerTypes.length}
                  {originalCounts.customerTypes > 0 &&
                  originalCounts.customerTypes !== customerTypes.length
                    ? `/${originalCounts.customerTypes}`
                    : ""}
                  )
                </span>
              </div>
              {isCascadingActive && (
                <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/30 rounded-md">
                  <div className="flex items-center gap-1 text-amber-400">
                    <Info className="h-4 w-4" />
                    <span className="font-medium">
                      Cascading Filters Active
                    </span>
                  </div>
                  <p className="text-xs text-amber-300 mt-1">
                    Filter options are automatically filtered based on your
                    current selections. Only combinations that exist in the data
                    are shown.
                  </p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700 mt-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Filter Statistics</Label>
                <div className="text-sm space-y-1 text-slate-400">
                  <div className="flex justify-between">
                    <span>Available Regions:</span>
                    <span className="font-mono">
                      {regions.length}
                      {originalCounts.regions > 0 &&
                        originalCounts.regions !== regions.length && (
                          <span className="text-slate-500">
                            {" "}
                            / {originalCounts.regions}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Dealers:</span>
                    <span className="font-mono">
                      {dealers.length}
                      {originalCounts.dealers > 0 &&
                        originalCounts.dealers !== dealers.length && (
                          <span className="text-slate-500">
                            {" "}
                            / {originalCounts.dealers}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Models:</span>
                    <span className="font-mono">
                      {models.length}
                      {originalCounts.models > 0 &&
                        originalCounts.models !== models.length && (
                          <span className="text-slate-500">
                            {" "}
                            / {originalCounts.models}
                          </span>
                        )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Filter Tips</Label>
                <div className="text-xs text-slate-400 space-y-1">
                  <p>
                    • Filters cascade automatically - selecting one filter
                    restricts others
                  </p>
                  <p>• Only valid combinations from the data are shown</p>
                  <p>• Use "Clear All" to reset all filters to defaults</p>
                  <p>
                    • Default range: Last year (this month last year to last
                    month)
                  </p>
                  <p>
                    • Select "Custom" in Quick Time to enable date range picker
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
