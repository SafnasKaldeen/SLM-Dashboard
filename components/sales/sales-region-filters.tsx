import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Calendar as CalendarIcon,
  Filter,
  MapPin,
  Clock,
  X,
  Search,
  TrendingUp,
  Info,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";

interface FilterState {
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  quickTime: string;
  province: string[];
  district: string[];
  area: string[];
  aggregation: string;
}

interface LocationData {
  provinces: string[];
  districts: Record<string, string[]>;
  areas: Record<string, string[]>;
}

const RegionalSalesFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: {
      from: new Date(new Date().getFullYear() - 1, new Date().getMonth(), 1),
      to: new Date(new Date().getFullYear(), new Date().getMonth(), 0),
    },
    quickTime: "last_year",
    province: [],
    district: [],
    area: [],
    aggregation: "monthly",
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempRange, setTempRange] = useState(filters.dateRange);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState<"from" | "to">("from");
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  // Mock location data - in real app, this would come from an API
  const locationData: LocationData = {
    provinces: [
      "Western",
      "Central",
      "Southern",
      "Northern",
      "Eastern",
      "North Western",
      "North Central",
      "Uva",
      "Sabaragamuwa",
    ],
    districts: {
      Western: ["Colombo", "Gampaha", "Kalutara"],
      Central: ["Kandy", "Matale", "Nuwara Eliya"],
      Southern: ["Galle", "Matara", "Hambantota"],
      Northern: ["Jaffna", "Kilinochchi", "Mannar", "Vavuniya", "Mullaitivu"],
      Eastern: ["Trincomalee", "Batticaloa", "Ampara"],
      "North Western": ["Kurunegala", "Puttalam"],
      "North Central": ["Anuradhapura", "Polonnaruwa"],
      Uva: ["Badulla", "Moneragala"],
      Sabaragamuwa: ["Ratnapura", "Kegalle"],
    },
    areas: {
      Colombo: [
        "Colombo 1",
        "Colombo 2",
        "Colombo 3",
        "Colombo 4",
        "Colombo 5",
        "Colombo 6",
        "Colombo 7",
        "Mount Lavinia",
        "Dehiwala",
        "Maharagama",
      ],
      Gampaha: [
        "Negombo",
        "Gampaha",
        "Minuwangoda",
        "Wattala",
        "Ja-Ela",
        "Kelaniya",
      ],
      Kalutara: ["Kalutara", "Panadura", "Horana", "Beruwala", "Aluthgama"],
      Kandy: ["Kandy", "Peradeniya", "Gampola", "Nawalapitiya", "Wattegama"],
      Galle: ["Galle", "Hikkaduwa", "Ambalangoda", "Bentota", "Balapitiya"],
    },
  };

  const quickTimeOptions = [
    { value: "history", label: "History (All Data)" },
    { value: "last_month", label: "Last Month" },
    { value: "last_3_months", label: "Last 3 Months" },
    { value: "last_year", label: "Last Year (Default)" },
    { value: "custom", label: "Custom" },
  ];

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

  const updateFilters = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
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
        dateRange: currentRange,
      });
      // Automatically open the calendar when switching to custom
      setIsCalendarOpen(true);
    }
  };

  const handleLocationFilter = (
    type: "province" | "district" | "area",
    value: string,
    checked: boolean
  ) => {
    setFilters((prev) => {
      const current = prev[type];
      const updated = checked
        ? [...current, value]
        : current.filter((item) => item !== value);

      // Clear child filters when parent changes
      let newFilters = { ...prev, [type]: updated };
      if (type === "province") {
        newFilters.district = [];
        newFilters.area = [];
      } else if (type === "district") {
        newFilters.area = [];
      }

      return newFilters;
    });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;

    const newRange = { ...tempRange } || {};

    if (datePickerMode === "from") {
      newRange.from = date;
      // If the new from date is after the current to date, clear the to date
      if (newRange.to && date > newRange.to) {
        newRange.to = null;
      }
      // Auto-switch to "to" mode after selecting from date
      setDatePickerMode("to");
    } else if (datePickerMode === "to") {
      newRange.to = date;
      // If the new to date is before the current from date, clear the from date
      if (newRange.from && date < newRange.from) {
        newRange.from = null;
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

  const clearAllFilters = () => {
    const defaultRange = getDefaultDateRange();
    const clearedFilters: FilterState = {
      dateRange: defaultRange,
      quickTime: "last_year",
      province: [],
      district: [],
      area: [],
      aggregation: "monthly",
    };
    setFilters(clearedFilters);
    setTempRange(defaultRange);
    setSearchTerm("");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.quickTime !== "last_year") count++;
    if (filters.province.length > 0) count++;
    if (filters.district.length > 0) count++;
    if (filters.area.length > 0) count++;
    if (filters.aggregation !== "monthly") count++;
    return count;
  };

  const availableDistricts =
    filters.province.length > 0
      ? filters.province.flatMap((prov) => locationData.districts[prov] || [])
      : Object.values(locationData.districts).flat();

  const availableAreas =
    filters.district.length > 0
      ? filters.district.flatMap((dist) => locationData.areas[dist] || [])
      : Object.values(locationData.areas).flat();

  const filteredProvinces = locationData.provinces.filter((province) =>
    province.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredDistricts = availableDistricts.filter((district) =>
    district.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredAreas = availableAreas.filter((area) =>
    area.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isDateRangeDisabled = filters.quickTime !== "custom";
  const isDailyDisabled = filters.quickTime === "history";
  const isCascadingActive =
    filters.province.length > 0 ||
    filters.district.length > 0 ||
    filters.area.length > 0;

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

  const renderLocationSelect = (
    items: string[],
    selectedItems: string[],
    placeholder: string,
    onItemChange: (item: string, checked: boolean) => void,
    disabled = false
  ) => {
    return (
      <div className="space-y-1">
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
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Regional Sales Filters</span>
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
                {quickTimeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
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
                              ? tempRange?.from || undefined
                              : tempRange?.to || undefined
                          }
                          onSelect={handleDateSelect}
                          modifiers={{
                            selected_range_start: tempRange?.from || undefined,
                            selected_range_end: tempRange?.to || undefined,
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
                  aggregation: value,
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

          {/* Provinces */}
          <div className="space-y-2">
            <Label>Provinces</Label>
            {renderLocationSelect(
              filteredProvinces,
              filters.province,
              "Select provinces",
              (item, checked) => handleLocationFilter("province", item, checked)
            )}
            <div className="flex flex-wrap gap-1">
              {filters.province.map((province) => (
                <Badge key={province} variant="secondary" className="text-xs">
                  {province}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleLocationFilter("province", province, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Districts */}
          <div className="space-y-2">
            <Label>Districts</Label>
            {renderLocationSelect(
              filteredDistricts,
              filters.district,
              "Select districts",
              (item, checked) =>
                handleLocationFilter("district", item, checked),
              filters.province.length > 0 && availableDistricts.length === 0
            )}
            <div className="flex flex-wrap gap-1">
              {filters.district.map((district) => (
                <Badge key={district} variant="secondary" className="text-xs">
                  {district}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() =>
                      handleLocationFilter("district", district, false)
                    }
                  />
                </Badge>
              ))}
            </div>
          </div>

          {/* Areas */}
          <div className="space-y-2">
            <Label>Areas</Label>
            {renderLocationSelect(
              filteredAreas,
              filters.area,
              "Select areas",
              (item, checked) => handleLocationFilter("area", item, checked),
              filters.district.length > 0 && availableAreas.length === 0
            )}
            <div className="flex flex-wrap gap-1">
              {filters.area.map((area) => (
                <Badge key={area} variant="secondary" className="text-xs">
                  {area}
                  <X
                    className="h-3 w-3 ml-1 cursor-pointer"
                    onClick={() => handleLocationFilter("area", area, false)}
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
                  Provinces ({locationData.provinces.length})
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Districts ({availableDistricts.length})
                </span>
                <span className="px-2 py-1 bg-muted rounded">
                  Areas ({availableAreas.length})
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

            {/* Advanced Location Filters */}
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Header with Search */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">
                        Advanced Location Search
                      </h3>
                    </div>
                    <div className="relative">
                      <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search locations..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-background border border-border rounded-md text-sm focus:ring-2 focus:ring-primary focus:border-primary w-64"
                      />
                    </div>
                  </div>

                  {/* Active Filters Summary */}
                  {getActiveFiltersCount() > 0 && (
                    <div className="flex items-center gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-primary text-sm font-medium">
                        Active Filters: {getActiveFiltersCount()} location(s)
                        selected
                      </span>
                      <div className="flex flex-wrap gap-1 ml-auto">
                        {[
                          ...filters.province,
                          ...filters.district,
                          ...filters.area,
                        ].map((location, index) => (
                          <Badge
                            key={index}
                            className="bg-primary/20 text-primary border-primary/30"
                          >
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Location Filter Sections */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Provinces */}
                    <div>
                      <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                        <div className="h-2 w-2 bg-cyan-400 rounded-full"></div>
                        Provinces ({filters.province.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredProvinces.map((province) => (
                          <label
                            key={province}
                            className="flex items-center space-x-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={filters.province.includes(province)}
                              onChange={(e) =>
                                handleLocationFilter(
                                  "province",
                                  province,
                                  e.target.checked
                                )
                              }
                              className="rounded border-border text-primary focus:ring-primary bg-background"
                            />
                            <span className="text-sm group-hover:text-primary transition-colors">
                              {province}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Districts */}
                    <div>
                      <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                        <div className="h-2 w-2 bg-emerald-400 rounded-full"></div>
                        Districts ({filters.district.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredDistricts.map((district) => (
                          <label
                            key={district}
                            className="flex items-center space-x-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={filters.district.includes(district)}
                              onChange={(e) =>
                                handleLocationFilter(
                                  "district",
                                  district,
                                  e.target.checked
                                )
                              }
                              className="rounded border-border text-emerald-600 focus:ring-emerald-500 bg-background"
                              disabled={
                                filters.province.length > 0 &&
                                !availableDistricts.includes(district)
                              }
                            />
                            <span
                              className={`text-sm transition-colors ${
                                filters.province.length > 0 &&
                                !availableDistricts.includes(district)
                                  ? "text-muted-foreground"
                                  : "group-hover:text-primary"
                              }`}
                            >
                              {district}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Areas */}
                    <div>
                      <h4 className="text-md font-medium mb-3 flex items-center gap-2">
                        <div className="h-2 w-2 bg-purple-400 rounded-full"></div>
                        Areas ({filters.area.length})
                      </h4>
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filteredAreas.slice(0, 20).map((area) => (
                          <label
                            key={area}
                            className="flex items-center space-x-2 cursor-pointer group"
                          >
                            <input
                              type="checkbox"
                              checked={filters.area.includes(area)}
                              onChange={(e) =>
                                handleLocationFilter(
                                  "area",
                                  area,
                                  e.target.checked
                                )
                              }
                              className="rounded border-border text-purple-600 focus:ring-purple-500 bg-background"
                              disabled={
                                filters.district.length > 0 &&
                                !availableAreas.includes(area)
                              }
                            />
                            <span
                              className={`text-sm transition-colors ${
                                filters.district.length > 0 &&
                                !availableAreas.includes(area)
                                  ? "text-muted-foreground"
                                  : "group-hover:text-primary"
                              }`}
                            >
                              {area}
                            </span>
                          </label>
                        ))}
                        {filteredAreas.length > 20 && (
                          <p className="text-xs text-muted-foreground italic">
                            ... and {filteredAreas.length - 20} more areas
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Apply Filters Button */}
                  <div className="flex justify-end pt-4 border-t">
                    <Button
                      className="bg-primary hover:bg-primary/90"
                      onClick={() => {
                        // Here you would typically call a function to apply the filters
                        console.log("Applying filters:", filters);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t mt-4">
              <div className="space-y-2">
                <Label>Filter Statistics</Label>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Available Provinces:</span>
                    <span className="font-mono">
                      {locationData.provinces.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Districts:</span>
                    <span className="font-mono">
                      {availableDistricts.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Available Areas:</span>
                    <span className="font-mono">{availableAreas.length}</span>
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
                  <p>• Use the search box to quickly find specific locations</p>
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default RegionalSalesFilters;
