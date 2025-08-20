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
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import type { GPSFilters } from "@/types/gps";

interface GPSFiltersProps {
  tboxes: string[];
  bmses: string[];
  batteryTypes: string[];
  filters: GPSFilters;
  onFiltersChange: (filters: GPSFilters) => void;
  loading?: boolean;
}

export function GPSFilters({
  tboxes,
  bmses,
  batteryTypes,
  filters,
  onFiltersChange,
  loading = false,
}: GPSFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    filters.dateRange
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"from" | "to">("from");

  // Track original counts for cascading info
  const [originalCounts, setOriginalCounts] = useState({
    tboxes: 0,
    bmses: 0,
    batteryTypes: 0,
  });

  // Update original counts when data first loads (no filters applied)
  useEffect(() => {
    const hasFilters =
      filters.selectedTboxes.length > 0 ||
      filters.selectedBmses.length > 0 ||
      filters.selectedBatteryTypes.length > 0;

    if (!hasFilters && !loading) {
      setOriginalCounts({
        tboxes: tboxes.length,
        bmses: bmses.length,
        batteryTypes: batteryTypes.length,
      });
    }
  }, [tboxes.length, bmses.length, batteryTypes.length, loading, filters]);

  // Sync tempRange with filters.dateRange
  useEffect(() => {
    setTempRange(filters.dateRange);
  }, [filters.dateRange]);

  const getDefaultDateRange = () => {
    const today = new Date();
    const from = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const to = new Date(today.getFullYear(), today.getMonth(), 0);
    return { from, to };
  };

  const updateFilters = (newFilters: Partial<GPSFilters>) => {
    onFiltersChange({ ...filters, ...newFilters });
  };

  const clearAllFilters = () => {
    const defaultRange = getDefaultDateRange();
    const clearedFilters: GPSFilters = {
      quickTime: "last_year",
      selectedTboxes: [],
      selectedBmses: [],
      selectedBatteryTypes: [],
      dateRange: defaultRange,
      aggregation: "monthly",
    };
    onFiltersChange(clearedFilters);
    setTempRange(defaultRange);
  };

  const handleQuickTimeChange = (value: string) => {
    const today = new Date();
    let newFrom = new Date();
    let newTo = new Date();

    if (value !== "custom") {
      switch (value) {
        case "history":
          newFrom = new Date(2020, 0, 1);
          newTo = today;
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
      updateFilters({
        quickTime: value,
        dateRange: range,
      });
    } else {
      // When switching to custom, preserve current date range or use existing one
      const currentRange = filters.dateRange || getDefaultDateRange();
      setTempRange(currentRange);
      updateFilters({
        quickTime: value,
        // Keep the existing date range when switching to custom
        dateRange: currentRange,
      });
      // Automatically open the calendar when switching to custom
      setIsCalendarOpen(true);
    }
  };

  const handleFilterArrayChange = (
    filterKey: "selectedTboxes" | "selectedBmses" | "selectedBatteryTypes",
    item: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey];
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
    if (filters.selectedTboxes.length > 0) count++;
    if (filters.selectedBmses.length > 0) count++;
    if (filters.selectedBatteryTypes.length > 0) count++;
    if (filters.aggregation !== "monthly") count++;
    return count;
  };

  const isDateRangeDisabled = filters.quickTime !== "custom";
  const isDailyDisabled = filters.quickTime === "history";

  // Check if options are being filtered by cascading
  const isCascadingActive =
    filters.selectedTboxes.length > 0 ||
    filters.selectedBmses.length > 0 ||
    filters.selectedBatteryTypes.length > 0;

  const getCascadingInfo = (type: "tboxes" | "bmses" | "batteryTypes") => {
    if (!isCascadingActive) return null;

    const currentCount =
      type === "tboxes"
        ? tboxes.length
        : type === "bmses"
        ? bmses.length
        : batteryTypes.length;
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

  const renderFilterSelect = (
    items: string[],
    selectedItems: string[],
    placeholder: string,
    onItemChange: (item: string, checked: boolean) => void,
    filterType: "tboxes" | "bmses" | "batteryTypes",
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
    <Card>
      <CardContent className="p-4 space-y-4">
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Quick Time Filter */}
          <div className="space-y-2">
            <Label>Quick Time</Label>
            <Select
              value={filters.quickTime}
              onValueChange={handleQuickTimeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="history">History (All Data)</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_year">Last Year (Default)</SelectItem>
                <SelectItem value="custom">Custom</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Picker */}
          <div className="space-y-2">
            <Label>
              Date Range
              {filters.quickTime === "custom" && (
                <span className="text-xs text-blue-600 ml-1">
                  (Custom Mode)
                </span>
              )}
            </Label>
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    isDateRangeDisabled
                      ? "opacity-50 cursor-not-allowed bg-muted"
                      : "hover:bg-accent hover:text-accent-foreground"
                  } ${filters.quickTime === "custom" ? "border-blue-300" : ""}`}
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
                      {/* Date Picker Mode Toggle */}
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
                          classNames={{
                            months: "flex flex-col space-y-4",
                            month: "space-y-2",
                            caption: "hidden",
                            nav: "hidden",
                            table: "w-full border-collapse space-y-1",
                            head_row: "flex",
                            head_cell:
                              "text-muted-foreground rounded-md w-8 font-normal text-[0.7rem] text-center",
                            row: "flex w-full mt-1",
                            cell: "text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
                            day: "h-8 w-8 p-0 font-normal text-xs hover:bg-accent hover:text-accent-foreground rounded-md transition-all duration-200 cursor-pointer",
                            day_selected:
                              "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
                            day_today:
                              "bg-accent/80 text-accent-foreground font-semibold",
                            day_outside: "text-muted-foreground/50 opacity-50",
                            day_disabled:
                              "text-muted-foreground/30 cursor-not-allowed",
                            day_hidden: "invisible",
                          }}
                        />
                      </div>

                      {/* Footer */}
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
                              <span className="text-muted-foreground">
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
                  aggregation: value as GPSFilters["aggregation"],
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
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* TBOX IDs */}
          <div className="space-y-2">
            <Label>TBOX IDs</Label>
            {renderFilterSelect(
              tboxes,
              filters.selectedTboxes,
              "Select TBOX IDs",
              (item, checked) =>
                handleFilterArrayChange("selectedTboxes", item, checked),
              "tboxes"
            )}
            <div className="flex flex-wrap gap-1">
              {filters.selectedTboxes.map((tbox) => (
                <Badge key={tbox} variant="secondary" className="text-xs">
                  {tbox}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleFilterArrayChange("selectedTboxes", tbox, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* BMS IDs */}
          <div className="space-y-2">
            <Label>BMS IDs</Label>
            {renderFilterSelect(
              bmses,
              filters.selectedBmses,
              "Select BMS IDs",
              (item, checked) =>
                handleFilterArrayChange("selectedBmses", item, checked),
              "bmses"
            )}
            <div className="flex flex-wrap gap-1">
              {filters.selectedBmses.map((bms) => (
                <Badge key={bms} variant="secondary" className="text-xs">
                  {bms}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleFilterArrayChange("selectedBmses", bms, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Battery Type IDs */}
          <div className="space-y-2">
            <Label>Battery Type IDs</Label>
            {renderFilterSelect(
              batteryTypes,
              filters.selectedBatteryTypes,
              "Select battery types",
              (item, checked) =>
                handleFilterArrayChange("selectedBatteryTypes", item, checked),
              "batteryTypes"
            )}
            <div className="flex flex-wrap gap-1">
              {filters.selectedBatteryTypes.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {type}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleFilterArrayChange(
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

        {isExpanded && (
          <>
            <div className="text-xs text-muted-foreground border-t pt-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span>Available filters:</span>
                <span className="px-2 py-1 bg-muted rounded">Date Range</span>
                <span className="px-2 py-1 bg-muted rounded">
                  TBOX IDs ({tboxes.length}
                  {originalCounts.tboxes > 0 &&
                  originalCounts.tboxes !== tboxes.length
                    ? `/${originalCounts.tboxes}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  BMS IDs ({bmses.length}
                  {originalCounts.bmses > 0 &&
                  originalCounts.bmses !== bmses.length
                    ? `/${originalCounts.bmses}`
                    : ""}
                  )
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Battery Type IDs ({batteryTypes.length}
                  {originalCounts.batteryTypes > 0 &&
                  originalCounts.batteryTypes !== batteryTypes.length
                    ? `/${originalCounts.batteryTypes}`
                    : ""}
                  )
                </span>
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
                    <span>Available TBOX IDs:</span>
                    <span className="font-mono">
                      {tboxes.length}
                      {originalCounts.tboxes > 0 &&
                        originalCounts.tboxes !== tboxes.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.tboxes}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available BMS IDs:</span>
                    <span className="font-mono">
                      {bmses.length}
                      {originalCounts.bmses > 0 &&
                        originalCounts.bmses !== bmses.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.bmses}
                          </span>
                        )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Battery Type IDs:</span>
                    <span className="font-mono">
                      {batteryTypes.length}
                      {originalCounts.batteryTypes > 0 &&
                        originalCounts.batteryTypes !== batteryTypes.length && (
                          <span className="text-muted-foreground">
                            {" "}
                            / {originalCounts.batteryTypes}
                          </span>
                        )}
                    </span>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Filter Tips</Label>
                <div className="text-xs text-muted-foreground space-y-1">
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
