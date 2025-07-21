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
import { useAreaStations } from "@/hooks/Snowflake/useAreaStations";

interface RevenueFiltersProps {
  onFiltersChange?: (filters: RevenueFilters) => void;
}

export interface RevenueFilters {
  dateRange?: DateRange;
  selectedAreas: string[];
  selectedStations: string[];
  customerSegments: string[];
  revenueRange: {
    min?: number;
    max?: number;
  };
  paymentMethods: string[];
  aggregation: "daily" | "monthly" | "quarterly" | "annually";
}

export function RevenueFilters({ onFiltersChange }: RevenueFiltersProps) {
  // Default to last year with monthly aggregation
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const defaultTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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

  // Set default to history (all available data with monthly aggregation)
  const [quickTime, setQuickTime] = useState<string>("last_year");

  const { data: areaStations, loading } = useAreaStations();

  const [filters, setFilters] = useState<RevenueFilters>({
    dateRange: defaultRange,
    selectedAreas: [],
    selectedStations: [],
    customerSegments: [],
    revenueRange: {},
    paymentMethods: [],
    aggregation: "monthly",
  });

  const customerSegments = [
    "Regular Users",
    "Premium Members",
    "Corporate",
    "Students",
    "Tourists",
  ];

  const paymentMethods = [
    "Credit Card",
    "Mobile Payment",
    "Subscription",
    "Cash",
    "Corporate Account",
  ];

  const areas = areaStations ? Object.keys(areaStations) : [];

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  const updateFilters = (newFilters: Partial<RevenueFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
  };

  const formatDate = (date?: Date) =>
    date ? date.toISOString().substring(0, 10) : undefined;

  const clearAllFilters = () => {
    const today = new Date();
    const lastYearFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
    const lastYearTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    const cleared: RevenueFilters = {
      selectedAreas: [],
      selectedStations: [],
      customerSegments: [],
      revenueRange: {},
      paymentMethods: [],
      aggregation: "monthly",
      dateRange: { from: lastYearFrom, to: lastYearTo },
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
    if (filters.selectedAreas.length > 0) count++;
    if (filters.selectedStations.length > 0) count++;
    if (filters.customerSegments.length > 0) count++;
    if (filters.revenueRange.min || filters.revenueRange.max) count++;
    if (filters.paymentMethods.length > 0) count++;
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
        newFrom = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        newTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "last_year":
        newFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
        newTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      default:
        return;
    }

    const range = { from: newFrom, to: newTo };
    setDateRange(range);
    setTempRange(range);
    updateFilters({ dateRange: range, aggregation });
  };

  const handleAreaChange = (area: string, checked: boolean) => {
    const newAreas = checked
      ? [...filters.selectedAreas, area]
      : filters.selectedAreas.filter((a) => a !== area);

    let newStations = filters.selectedStations;
    if (!checked && areaStations) {
      const areaStationsList = areaStations[area] || [];
      newStations = filters.selectedStations.filter(
        (s) => !areaStationsList.includes(s)
      );
    }

    updateFilters({ selectedAreas: newAreas, selectedStations: newStations });
  };

  const handleStationChange = (station: string, checked: boolean) => {
    const newStations = checked
      ? [...filters.selectedStations, station]
      : filters.selectedStations.filter((s) => s !== station);
    updateFilters({ selectedStations: newStations });
  };

  const handleCustomerSegmentChange = (segment: string, checked: boolean) => {
    const newSegments = checked
      ? [...filters.customerSegments, segment]
      : filters.customerSegments.filter((s) => s !== segment);
    updateFilters({ customerSegments: newSegments });
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const newMethods = checked
      ? [...filters.paymentMethods, method]
      : filters.paymentMethods.filter((m) => m !== method);
    updateFilters({ paymentMethods: newMethods });
  };

  const getAvailableStations = () => {
    if (!areaStations || filters.selectedAreas.length === 0) return [];
    return filters.selectedAreas.flatMap((area) => areaStations[area] || []);
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

  // Handle single date selection in the calendar
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const newRange = { ...tempRange } || {};

    if (datePickerMode === "from") {
      newRange.from = date;
      // If "to" date is before the new "from" date, clear "to"
      if (newRange.to && date > newRange.to) {
        newRange.to = undefined;
      }
    } else if (datePickerMode === "to") {
      newRange.to = date;
      // If "from" date is after the new "to" date, clear "from"
      if (newRange.from && date < newRange.from) {
        newRange.from = undefined;
      }
    }

    setTempRange(newRange);
  };

  // Use safe fallbacks if date is not defined
  const safeDateRange: DateRange = {
    from: dateRange?.from || defaultFrom,
    to: dateRange?.to || defaultTo,
  };

  const applyDateRange = () => {
    if (!tempRange?.from || !tempRange?.to) return;

    // Original UI dates (no change)
    const originalFrom = new Date(tempRange.from);
    const originalTo = new Date(tempRange.to);

    // Adjusted date for filtering: from + 1 day
    const adjustedFrom = new Date(originalFrom);
    adjustedFrom.setDate(adjustedFrom.getDate() + 1);

    // extraDate = to + 1 day
    const extraDate = new Date(originalTo);
    extraDate.setDate(extraDate.getDate() + 1);

    // Validate range
    if (adjustedFrom.getTime() > originalTo.getTime()) return;

    // Final filter range object with adjusted dates
    const filterRange = {
      from: adjustedFrom,
      to: originalTo,
      extraDate,
    };

    // Set UI dates exactly as user picked (no +1 day)
    setDateRange({ from: originalFrom, to: originalTo });

    // Update filters using adjusted range
    updateFilters({ dateRange: filterRange });

    autoFixAggregation(filterRange);
    setQuickTime("custom");
    setIsCalendarOpen(false);
  };

  // Handle month navigation for calendar
  const handleCalendarMonthChange = (month: number) => {
    const newDate = new Date(currentMonth.getFullYear(), month);
    setCurrentMonth(newDate);
  };

  const handleCalendarYearChange = (year: number) => {
    const newDate = new Date(year, currentMonth.getMonth());
    setCurrentMonth(newDate);
  };

  // Check if date range picker should be disabled and if daily aggregation should be disabled
  const isDateRangeDisabled = quickTime !== "custom";
  const isDailyDisabled = quickTime === "history";

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="animate-spin h-5 w-5 mr-2" />
          <span>Loading areas and stations...</span>
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
                  aggregation: value as RevenueFilters["aggregation"],
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

          {/* Area */}
          <div className="space-y-2">
            <Label>Area</Label>
            <Select onValueChange={(value) => handleAreaChange(value, true)}>
              <SelectTrigger>
                <span>
                  {filters.selectedAreas.length > 0
                    ? filters.selectedAreas.join(", ")
                    : "Select areas"}
                </span>
              </SelectTrigger>
              <SelectContent>
                {areas.map((area) => (
                  <SelectItem key={area} value={area}>
                    {area}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex flex-wrap gap-1">
              {filters.selectedAreas.map((area) => (
                <Badge key={area} variant="secondary">
                  {area}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleAreaChange(area, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* BSS Stations */}
          {filters.selectedAreas.length > 0 && (
            <div className="space-y-2">
              <Label>BSS Stations</Label>
              <Select
                onValueChange={(value) => handleStationChange(value, true)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select station" />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStations().map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-1">
                {filters.selectedStations.map((station) => (
                  <Badge key={station} variant="secondary">
                    {station}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => handleStationChange(station, false)}
                    />
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
            {/* Customer Segments */}
            <div className="space-y-2">
              <Label>Customer Segments</Label>
              {customerSegments.map((segment) => (
                <div key={segment} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.customerSegments.includes(segment)}
                    onCheckedChange={(checked) =>
                      handleCustomerSegmentChange(segment, checked as boolean)
                    }
                  />
                  <Label>{segment}</Label>
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="space-y-2">
              <Label>Payment Methods</Label>
              {paymentMethods.map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.paymentMethods.includes(method)}
                    onCheckedChange={(checked) =>
                      handlePaymentMethodChange(method, checked as boolean)
                    }
                  />
                  <Label>{method}</Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
