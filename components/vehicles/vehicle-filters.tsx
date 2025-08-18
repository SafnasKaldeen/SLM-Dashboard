"use client";

import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Filter,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight,
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";

interface VehicleFiltersProps {
  onFiltersChange?: (filters: VehicleFilters) => void;
  loading?: boolean;
}

export interface VehicleFilters {
  dateRange?: DateRange;
  selectedModels: string[];
  selectedBatteryTypes: string[];
  selectedStatuses: string[];
  customerTypes: string[];
  aggregation: "daily" | "monthly" | "quarterly" | "annually";
}

export function VehicleFilters({
  onFiltersChange,
  loading = false,
}: VehicleFiltersProps) {
  // Calculate exactly one year: from first day of this month last year to last day of last month
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const defaultTo = new Date(today.getFullYear(), today.getMonth(), 0);
  const defaultRange: DateRange = { from: defaultFrom, to: defaultTo };

  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultRange
  );
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempRange, setTempRange] = useState<DateRange | undefined>(
    defaultRange
  );
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"from" | "to">("from");
  const [quickTime, setQuickTime] = useState<string>("last_year");

  const [filters, setFilters] = useState<VehicleFilters>({
    dateRange: defaultRange,
    selectedModels: [],
    selectedBatteryTypes: [],
    selectedStatuses: [],
    customerTypes: [],
    aggregation: "monthly",
  });

  // Vehicle-specific filter options
  const vehicleModels = [
    "Tesla Model 3",
    "Tesla Model Y",
    "BMW iX",
    "Audi e-tron",
    "Mercedes EQS",
    "Nissan Leaf",
    "Hyundai Ioniq",
  ];

  const batteryTypes = ["Lithium-Ion", "LiFePO4", "Solid State"];

  const regions = ["North", "South", "East", "West"];

  const vehicleStatuses = ["ACTIVE", "INACTIVE", "MAINTENANCE", "CHARGING"];

  const customerTypes = [
    "Individual",
    "Corporate",
    "Fleet Owner",
    "Rental Service",
    "Government",
  ];

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (newFilters: Partial<VehicleFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
  };

  const clearAllFilters = () => {
    const today = new Date();
    const oneYearFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const oneYearTo = new Date(today.getFullYear(), today.getMonth(), 0);

    const cleared: VehicleFilters = {
      selectedModels: [],
      selectedBatteryTypes: [],
      selectedStatuses: [],
      customerTypes: [],
      aggregation: "monthly",
      dateRange: { from: oneYearFrom, to: oneYearTo },
    };

    setFilters(cleared);
    setDateRange(cleared.dateRange);
    setTempRange(cleared.dateRange);
    setQuickTime("last_year");
  };

  // Custom month/year navigation components
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

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange?.from || dateRange?.to) count++;
    if (filters.selectedModels.length > 0) count++;
    if (filters.selectedBatteryTypes.length > 0) count++;
    if (filters.selectedStatuses.length > 0) count++;
    if (filters.customerTypes.length > 0) count++;
    if (filters.aggregation !== "monthly") count++;
    return count;
  };

  const handleQuickTimeChange = (value: string) => {
    setQuickTime(value);

    if (value === "custom") {
      return;
    }

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
    setDateRange(range);
    setTempRange(range);
    updateFilters({ dateRange: range, aggregation });
  };

  const handleArrayFilterChange = (
    filterKey: keyof VehicleFilters,
    value: string,
    checked: boolean
  ) => {
    const currentArray = filters[filterKey] as string[];
    const newArray = checked
      ? [...currentArray, value]
      : currentArray.filter((item) => item !== value);

    updateFilters({ [filterKey]: newArray });
  };

  // Handle single date selection in the calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const newRange = { ...tempRange } || {};

    if (datePickerMode === "from") {
      newRange.from = date;
      if (newRange.to && date > newRange.to) {
        newRange.to = undefined;
      }
    } else if (datePickerMode === "to") {
      newRange.to = date;
      if (newRange.from && date < newRange.from) {
        newRange.from = undefined;
      }
    }

    setTempRange(newRange);
  };

  const applyDateRange = () => {
    if (!tempRange?.from || !tempRange?.to) return;

    const originalFrom = new Date(tempRange.from);
    const originalTo = new Date(tempRange.to);

    if (originalFrom.getTime() > originalTo.getTime()) return;

    const filterRange = {
      from: originalFrom,
      to: originalTo,
    };

    setDateRange({ from: originalFrom, to: originalTo });
    updateFilters({ dateRange: filterRange });
    setQuickTime("custom");
    setIsCalendarOpen(false);
  };

  const handleCalendarMonthChange = (month: number) => {
    const newDate = new Date(currentMonth.getFullYear(), month);
    setCurrentMonth(newDate);
  };

  const handleCalendarYearChange = (year: number) => {
    const newDate = new Date(year, currentMonth.getMonth());
    setCurrentMonth(newDate);
  };

  const isDateRangeDisabled = quickTime !== "custom";
  const isDailyDisabled = quickTime === "history";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          <span>Loading vehicle filters...</span>
        </CardContent>
      </Card>
    );
  }

  return (
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
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, "MMM dd, yyyy")} -{" "}
                          {format(dateRange.to, "MMM dd, yyyy")}
                        </>
                      ) : (
                        format(dateRange.from, "MMM dd, yyyy")
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

                      {/* Single Calendar */}
                      <div className="space-y-2">
                        <MonthYearSelector
                          date={currentMonth}
                          onMonthChange={handleCalendarMonthChange}
                          onYearChange={handleCalendarYearChange}
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
                  aggregation: value as VehicleFilters["aggregation"],
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

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
            {/* Vehicle Status */}
            <div className="space-y-2">
              <Label>Vehicle Status</Label>
              {vehicleStatuses.map((status) => (
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
                  <Label>{status}</Label>
                </div>
              ))}
            </div>

            {/* Customer Types */}
            <div className="space-y-2">
              <Label>Customer Types</Label>
              {customerTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.customerTypes.includes(type)}
                    onCheckedChange={(checked) =>
                      handleArrayFilterChange(
                        "customerTypes",
                        type,
                        checked as boolean
                      )
                    }
                  />
                  <Label>{type}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
