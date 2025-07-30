"use client";

import { useState, useEffect } from "react";
import {
  CalendarIcon,
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

interface GPSFiltersProps {
  onFiltersChange?: (filters: GPSFilters) => void;
}

export interface GPSFilters {
  dateRange?: DateRange;
  selectedTboxes: string[];
  selectedBmses: string[];
  selectedBatteryTypes: string[];
  aggregation: "daily" | "monthly" | "quarterly" | "annually";
}

export function GPSFilters({ onFiltersChange }: GPSFiltersProps) {
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

  // Set default to exactly one year
  const [quickTime, setQuickTime] = useState<string>("last_year");

  // Dummy data
  const dummyTboxes = ["Tbox A", "Tbox B", "Tbox C"];
  const dummyBmses = ["BMS 1", "BMS 2", "BMS 3"];
  const dummyBatteryTypes = [
    "Lithium-ion",
    "Lead Acid",
    "Nickel Metal Hydride",
  ];

  const [filters, setFilters] = useState<GPSFilters>({
    dateRange: defaultRange,
    selectedTboxes: [],
    selectedBmses: [],
    selectedBatteryTypes: [],
    aggregation: "monthly",
  });

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (newFilters: Partial<GPSFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
  };

  const clearAllFilters = () => {
    const today = new Date();
    const oneYearFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const oneYearTo = new Date(today.getFullYear(), today.getMonth(), 0);

    const cleared: GPSFilters = {
      selectedTboxes: [],
      selectedBmses: [],
      selectedBatteryTypes: [],
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
    if (filters.selectedTboxes.length > 0) count++;
    if (filters.selectedBmses.length > 0) count++;
    if (filters.selectedBatteryTypes.length > 0) count++;
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

  const handleTboxChange = (tbox: string, checked: boolean) => {
    const newTboxes = checked
      ? [...filters.selectedTboxes, tbox]
      : filters.selectedTboxes.filter((t) => t !== tbox);
    updateFilters({ selectedTboxes: newTboxes });
  };

  const handleBmsChange = (bms: string, checked: boolean) => {
    const newBmses = checked
      ? [...filters.selectedBmses, bms]
      : filters.selectedBmses.filter((b) => b !== bms);
    updateFilters({ selectedBmses: newBmses });
  };

  const handleBatteryTypeChange = (batteryType: string, checked: boolean) => {
    const newBatteryTypes = checked
      ? [...filters.selectedBatteryTypes, batteryType]
      : filters.selectedBatteryTypes.filter((b) => b !== batteryType);
    updateFilters({ selectedBatteryTypes: newBatteryTypes });
  };

  const autoFixAggregation = (range: DateRange) => {
    const from = range.from;
    const to = range.to;
    if (!from || !to) return;

    const diff = Math.abs(to.getTime() - from.getTime());
    const dayDiff = Math.ceil(diff / (1000 * 60 * 60 * 24));

    if (dayDiff > 400 && filters.aggregation === "daily") {
      updateFilters({ aggregation: "monthly" });
    } else if (dayDiff < 30 && filters.aggregation !== "daily") {
      updateFilters({ aggregation: "daily" });
    }
  };

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

    const adjustedFrom = new Date(originalFrom);
    adjustedFrom.setDate(adjustedFrom.getDate() + 1);

    const extraDate = new Date(originalTo);
    extraDate.setDate(extraDate.getDate() + 1);

    if (adjustedFrom.getTime() > originalTo.getTime()) return;

    const filterRange = {
      from: originalFrom,
      to: originalTo,
      extraDate,
    };

    setDateRange({ from: originalFrom, to: originalTo });
    updateFilters({ dateRange: filterRange });
    autoFixAggregation(filterRange);
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

                      {/* Footer with selected range info and apply button */}
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
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tboxes */}
          <div className="space-y-2">
            <Label>Tboxes</Label>
            <Select onValueChange={(value) => handleTboxChange(value, true)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Tbox" />
              </SelectTrigger>
              <SelectContent>
                {dummyTboxes.map((tbox) => (
                  <SelectItem key={tbox} value={tbox}>
                    {tbox}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.selectedTboxes.map((tbox) => (
                <Badge key={tbox} variant="secondary">
                  {tbox}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleTboxChange(tbox, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* BMSes */}
          <div className="space-y-2">
            <Label>BMSes</Label>
            <Select onValueChange={(value) => handleBmsChange(value, true)}>
              <SelectTrigger>
                <SelectValue placeholder="Select BMS" />
              </SelectTrigger>
              <SelectContent>
                {dummyBmses.map((bms) => (
                  <SelectItem key={bms} value={bms}>
                    {bms}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.selectedBmses.map((bms) => (
                <Badge key={bms} variant="secondary">
                  {bms}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleBmsChange(bms, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Battery Types */}
          <div className="space-y-2">
            <Label>Battery Types</Label>
            <Select
              onValueChange={(value) => handleBatteryTypeChange(value, true)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select battery type" />
              </SelectTrigger>
              <SelectContent>
                {dummyBatteryTypes.map((type) => (
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
                    onClick={() => handleBatteryTypeChange(type, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
            {/* Expanded view could show more detailed filter options if needed */}
            <div className="space-y-2">
              <Label>Advanced Tbox Filters</Label>
              {/* Placeholder for additional Tbox filters */}
            </div>
            <div className="space-y-2">
              <Label>Advanced BMS Filters</Label>
              {/* Placeholder for additional BMS filters */}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
