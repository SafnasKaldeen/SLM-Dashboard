"use client";

import { useState, useEffect } from "react";
import { CalendarIcon, Filter, X, Loader2 } from "lucide-react";
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
import { Input } from "@/components/ui/input";
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

const today = new Date();
const to = new Date(today.getFullYear(), today.getMonth(), 0);
const from = new Date(to.getFullYear(), to.getMonth() - 11, 1);
const defaultRange: DateRange = { from, to };

export function RevenueFilters({ onFiltersChange }: RevenueFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(
    defaultRange
  );

  const { data: areaStations, loading, error } = useAreaStations();

  const [filters, setFilters] = useState<RevenueFilters>({
    dateRange: defaultRange,
    selectedAreas: [],
    selectedStations: [],
    customerSegments: [],
    revenueRange: {},
    paymentMethods: [],
    aggregation: "monthly",
  });

  useEffect(() => {
    onFiltersChange?.(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const areas = areaStations ? Object.keys(areaStations) : [];

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

  const updateFilters = (newFilters: Partial<RevenueFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange?.(updated);
  };

  const clearAllFilters = () => {
    const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisMonthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const cleared: RevenueFilters = {
      selectedAreas: [],
      selectedStations: [],
      customerSegments: [],
      revenueRange: {},
      paymentMethods: [],
      aggregation: "monthly",
      dateRange: { from: thisMonthStart, to: thisMonthEnd },
    };
    setFilters(cleared);
    setDateRange(cleared.dateRange);
    onFiltersChange?.(cleared);
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

  const handleAreaChange = (area: string, checked: boolean) => {
    const newAreas = checked
      ? [...filters.selectedAreas, area]
      : filters.selectedAreas.filter((a) => a !== area);

    let newStations = filters.selectedStations;
    if (!checked && areaStations) {
      const areaStationsList =
        areaStations[area as keyof typeof areaStations] || [];
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
    const updated = checked
      ? [...filters.customerSegments, segment]
      : filters.customerSegments.filter((s) => s !== segment);
    updateFilters({ customerSegments: updated });
  };

  const handlePaymentMethodChange = (method: string, checked: boolean) => {
    const updated = checked
      ? [...filters.paymentMethods, method]
      : filters.paymentMethods.filter((m) => m !== method);
    updateFilters({ paymentMethods: updated });
  };

  const getAvailableStations = () => {
    if (!areaStations || filters.selectedAreas.length === 0) return [];
    return filters.selectedAreas.flatMap(
      (area) => areaStations[area as keyof typeof areaStations] || []
    );
  };

  const handleQuickTimeChange = (value: string) => {
    const today = new Date();
    let newFrom = new Date();
    let newTo = new Date();

    switch (value) {
      case "this_month":
        newFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        newTo = new Date(today.getFullYear(), today.getMonth() + 1, 0);
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
    }

    const range = { from: newFrom, to: newTo };
    setDateRange(range);
    updateFilters({ dateRange: range });
  };

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
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
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
            <Select onValueChange={handleQuickTimeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="last_3_months">Last 3 Months</SelectItem>
                <SelectItem value="last_year">Last Year</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Date Range */}
          <div className="space-y-2">
            <Label>Date Range</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, "MMM dd")} -{" "}
                        {format(dateRange.to, "MMM dd")}
                      </>
                    ) : (
                      format(dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={(range) => {
                    setDateRange(range);
                    updateFilters({ dateRange: range });
                    if (range) autoFixAggregation(range);
                  }}
                  numberOfMonths={2}
                />
              </PopoverContent>
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
                {(() => {
                  const from = dateRange?.from;
                  const to = dateRange?.to;
                  let dayDiff = 0;

                  if (from && to) {
                    const diffTime = Math.abs(to.getTime() - from.getTime());
                    dayDiff = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  }

                  const disableDaily = dayDiff > 400;
                  const onlyDaily = dayDiff > 0 && dayDiff < 30;

                  return (
                    <>
                      <SelectItem
                        value="daily"
                        disabled={disableDaily ? true : false}
                      >
                        Daily
                      </SelectItem>
                      <SelectItem value="monthly" disabled={onlyDaily}>
                        Monthly
                      </SelectItem>
                      <SelectItem value="quarterly" disabled={onlyDaily}>
                        Quarterly
                      </SelectItem>
                      <SelectItem value="annually" disabled={onlyDaily}>
                        Annually
                      </SelectItem>
                    </>
                  );
                })()}
              </SelectContent>
            </Select>
          </div>

          {/* Area Filter */}
          <div className="space-y-2">
            <Label>Area</Label>
            <Select
              onValueChange={(value) => {
                if (!filters.selectedAreas.includes(value)) {
                  handleAreaChange(value, true);
                }
              }}
            >
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
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleAreaChange(area, false)}
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Station Filter */}
          {filters.selectedAreas.length > 0 && (
            <div className="space-y-2">
              <Label>BSS Stations</Label>
              <Select
                onValueChange={(value) => {
                  if (!filters.selectedStations.includes(value)) {
                    handleStationChange(value, true);
                  }
                }}
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
                  <Badge key={station} variant="secondary" className="text-xs">
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

          {/* Revenue Range */}
          <div className="space-y-2">
            <Label>Revenue Range ($)</Label>
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="Min"
                value={filters.revenueRange.min || ""}
                onChange={(e) =>
                  updateFilters({
                    revenueRange: {
                      ...filters.revenueRange,
                      min: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
              <Input
                type="number"
                placeholder="Max"
                value={filters.revenueRange.max || ""}
                onChange={(e) =>
                  updateFilters({
                    revenueRange: {
                      ...filters.revenueRange,
                      max: e.target.value ? Number(e.target.value) : undefined,
                    },
                  })
                }
              />
            </div>
          </div>
        </div>

        {/* Expanded Filter Section */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Segments */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Customer Segments</Label>
              {customerSegments.map((segment) => (
                <div key={segment} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.customerSegments.includes(segment)}
                    onCheckedChange={(checked) =>
                      handleCustomerSegmentChange(segment, checked as boolean)
                    }
                  />
                  <Label className="text-sm font-normal cursor-pointer">
                    {segment}
                  </Label>
                </div>
              ))}
            </div>

            {/* Payment Methods */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Payment Methods</Label>
              {paymentMethods.map((method) => (
                <div key={method} className="flex items-center space-x-2">
                  <Checkbox
                    checked={filters.paymentMethods.includes(method)}
                    onCheckedChange={(checked) =>
                      handlePaymentMethodChange(method, checked as boolean)
                    }
                  />
                  <Label className="text-sm font-normal cursor-pointer">
                    {method}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
