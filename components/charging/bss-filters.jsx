"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays as CalendarIcon,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// Dark theme UI components
const Button = ({
  children,
  variant = "default",
  size = "default",
  className = "",
  disabled = false,
  onClick,
  ...props
}) => (
  <button
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === "ghost"
        ? "text-gray-300 hover:bg-gray-800/50"
        : variant === "outline"
        ? "border border-gray-600 text-gray-300 hover:bg-gray-800/50"
        : "bg-gradient-to-r from-cyan-600 to-cyan-700 hover:from-cyan-700 hover:to-cyan-800 text-white"
    } ${size === "sm" ? "px-2 py-1 text-sm" : ""} ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    } ${className}`}
    disabled={disabled}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
);

const Card = ({ children, className = "" }) => (
  <div
    className={`bg-gradient-to-br from-gray-900/50 to-black/50 border border-white/10 backdrop-blur-sm rounded-lg ${className}`}
  >
    {children}
  </div>
);

const CardContent = ({ children, className = "" }) => (
  <div className={className}>{children}</div>
);

const Label = ({ children, className = "" }) => (
  <label className={`text-sm font-medium text-gray-300 ${className}`}>
    {children}
  </label>
);

const Badge = ({ children, variant = "default", className = "" }) => (
  <span
    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      variant === "secondary"
        ? "bg-gray-800/50 text-gray-300 border border-gray-700"
        : "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
    } ${className}`}
  >
    {children}
  </span>
);

const Select = ({
  children,
  value,
  onValueChange,
  placeholder = "Select...",
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleItemClick = (itemValue) => {
    onValueChange(itemValue);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="w-full px-3 py-2 text-left border border-gray-600 rounded-md bg-gray-800/50 hover:bg-gray-700/50 text-gray-200 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? "text-gray-200" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronLeft
          className={`h-4 w-4 transform transition-transform text-gray-400 ${
            isOpen ? "rotate-180" : "-rotate-90"
          }`}
        />
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-auto">
          {React.Children.map(children, (child) => {
            if (child.type === SelectItem) {
              return React.cloneElement(child, {
                onClick: () => handleItemClick(child.props.value),
              });
            }
            return child;
          })}
        </div>
      )}
    </div>
  );
};

const SelectContent = ({ children }) => children;
const SelectItem = ({ children, value, disabled, onClick }) => (
  <div
    className={`px-3 py-2 cursor-pointer hover:bg-gray-700/50 text-gray-200 ${
      disabled ? "opacity-50 cursor-not-allowed" : ""
    }`}
    onClick={disabled ? undefined : onClick}
  >
    {children}
  </div>
);

const SelectTrigger = ({ children, className = "", disabled = false }) =>
  children;
const SelectValue = ({ placeholder }) => null;

// Date picker components
const Popover = ({ children, open, onOpenChange }) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child, index) => {
        if (index === 0) return child; // PopoverTrigger
        if (index === 1 && open) return child; // PopoverContent
        return null;
      })}
    </div>
  );
};

const PopoverTrigger = ({ children, asChild }) => children;
const PopoverContent = ({ children, className = "", align = "center" }) => (
  <div
    className={`absolute z-50 mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-lg ${className} ${
      align === "start"
        ? "left-0"
        : align === "end"
        ? "right-0"
        : "left-1/2 transform -translate-x-1/2"
    }`}
  >
    {children}
  </div>
);

// Simple calendar component
const Calendar = ({ selected, onSelect, mode = "single", className = "" }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const today = new Date();

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const isSelected = (date) => {
    if (!date || !selected) return false;
    return date.toDateString() === selected.toDateString();
  };

  const isToday = (date) => {
    if (!date) return false;
    return date.toDateString() === today.toDateString();
  };

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  return (
    <div className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="p-1 hover:bg-gray-700/50 rounded text-gray-300"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="font-medium text-gray-200">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </div>
        <button
          onClick={nextMonth}
          className="p-1 hover:bg-gray-700/50 rounded text-gray-300"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-400 p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => (
          <button
            key={index}
            className={`p-2 text-sm rounded hover:bg-gray-700/50 text-gray-300 ${
              !date ? "invisible" : ""
            } ${
              isSelected(date) ? "bg-cyan-600 text-white hover:bg-cyan-700" : ""
            } ${isToday(date) && !isSelected(date) ? "bg-gray-700" : ""}`}
            onClick={() => date && onSelect(date)}
            disabled={!date}
          >
            {date ? date.getDate() : ""}
          </button>
        ))}
      </div>
    </div>
  );
};

// Format date function
const format = (date, formatStr) => {
  if (!date) return "";

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

  if (formatStr === "MMM dd, yyyy") {
    return `${months[date.getMonth()]} ${date
      .getDate()
      .toString()
      .padStart(2, "0")}, ${date.getFullYear()}`;
  }

  return date.toLocaleDateString();
};

// Main component - JavaScript version without TypeScript interfaces
export function BSSFilters({ onFiltersChange }) {
  // Calculate default date range (last year)
  const today = new Date();
  const defaultFrom = new Date(today.getFullYear() - 1, today.getMonth(), 1);
  const defaultTo = new Date(today.getFullYear(), today.getMonth(), 0);
  const defaultRange = { from: defaultFrom, to: defaultTo };

  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState(defaultRange);
  const [tempRange, setTempRange] = useState(defaultRange);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState("from");
  const [quickTime, setQuickTime] = useState("last_year");

  // Hierarchical data structure
  const hierarchicalData = {
    Western: {
      Colombo: {
        "Colombo Central": ["BSS-COL-001", "BSS-COL-002", "BSS-COL-003"],
        "Colombo North": ["BSS-COL-004", "BSS-COL-005"],
        "Colombo South": ["BSS-COL-006", "BSS-COL-007", "BSS-COL-008"],
      },
      Gampaha: {
        Negombo: ["BSS-GAM-001", "BSS-GAM-002"],
        Kelaniya: ["BSS-GAM-003", "BSS-GAM-004", "BSS-GAM-005"],
        Mirigama: ["BSS-GAM-006"],
      },
      Kalutara: {
        "Kalutara Central": ["BSS-KAL-001", "BSS-KAL-002"],
        Panadura: ["BSS-KAL-003", "BSS-KAL-004"],
      },
    },
    Central: {
      Kandy: {
        "Kandy City": ["BSS-KAN-001", "BSS-KAN-002", "BSS-KAN-003"],
        Peradeniya: ["BSS-KAN-004", "BSS-KAN-005"],
        Gampola: ["BSS-KAN-006"],
      },
      Matale: {
        "Matale Central": ["BSS-MAT-001", "BSS-MAT-002"],
        Dambulla: ["BSS-MAT-003", "BSS-MAT-004"],
      },
      "Nuwara Eliya": {
        "Nuwara Eliya Town": ["BSS-NUW-001", "BSS-NUW-002"],
        Hatton: ["BSS-NUW-003"],
      },
    },
    Southern: {
      Galle: {
        "Galle Fort": ["BSS-GAL-001", "BSS-GAL-002"],
        Hikkaduwa: ["BSS-GAL-003", "BSS-GAL-004"],
      },
      Matara: {
        "Matara Central": ["BSS-MAT-001", "BSS-MAT-002"],
        Weligama: ["BSS-MAT-003"],
      },
      Hambantota: {
        "Hambantota Port": ["BSS-HAM-001", "BSS-HAM-002"],
      },
    },
    Northern: {
      Jaffna: {
        "Jaffna Central": ["BSS-JAF-001", "BSS-JAF-002"],
        Chavakachcheri: ["BSS-JAF-003"],
      },
      Mannar: {
        "Mannar Town": ["BSS-MAN-001", "BSS-MAN-002"],
      },
    },
    Eastern: {
      Batticaloa: {
        "Batticaloa Central": ["BSS-BAT-001", "BSS-BAT-002"],
        Kalmunai: ["BSS-BAT-003"],
      },
      Ampara: {
        "Ampara Central": ["BSS-AMP-001", "BSS-AMP-002"],
      },
    },
  };

  const [filters, setFilters] = useState({
    dateRange: defaultRange,
    selectedProvinces: [],
    selectedDistricts: [],
    selectedAreas: [],
    selectedBSSes: [],
    quickTime: "last_year",
  });

  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // Get available options based on current selections
  const getAvailableProvinces = () => Object.keys(hierarchicalData);

  const getAvailableDistricts = () => {
    if (filters.selectedProvinces.length === 0) return [];

    const districts = new Set();
    filters.selectedProvinces.forEach((province) => {
      if (hierarchicalData[province]) {
        Object.keys(hierarchicalData[province]).forEach((district) => {
          districts.add(district);
        });
      }
    });
    return Array.from(districts);
  };

  const getAvailableAreas = () => {
    if (filters.selectedDistricts.length === 0) return [];

    const areas = new Set();
    filters.selectedProvinces.forEach((province) => {
      if (hierarchicalData[province]) {
        filters.selectedDistricts.forEach((district) => {
          if (hierarchicalData[province][district]) {
            Object.keys(hierarchicalData[province][district]).forEach(
              (area) => {
                areas.add(area);
              }
            );
          }
        });
      }
    });
    return Array.from(areas);
  };

  const getAvailableBSSes = () => {
    if (filters.selectedAreas.length === 0) return [];

    const bsses = new Set();
    filters.selectedProvinces.forEach((province) => {
      if (hierarchicalData[province]) {
        filters.selectedDistricts.forEach((district) => {
          if (hierarchicalData[province][district]) {
            filters.selectedAreas.forEach((area) => {
              if (hierarchicalData[province][district][area]) {
                hierarchicalData[province][district][area].forEach((bss) => {
                  bsses.add(bss);
                });
              }
            });
          }
        });
      }
    });
    return Array.from(bsses);
  };

  const updateFilters = (newFilters) => {
    const updated = { ...filters, ...newFilters };

    // Clear child selections when parent changes
    if (newFilters.selectedProvinces !== undefined) {
      updated.selectedDistricts = [];
      updated.selectedAreas = [];
      updated.selectedBSSes = [];
    }
    if (newFilters.selectedDistricts !== undefined) {
      updated.selectedAreas = [];
      updated.selectedBSSes = [];
    }
    if (newFilters.selectedAreas !== undefined) {
      updated.selectedBSSes = [];
    }

    setFilters(updated);
  };

  const clearAllFilters = () => {
    const cleared = {
      selectedProvinces: [],
      selectedDistricts: [],
      selectedAreas: [],
      selectedBSSes: [],
      quickTime: "last_year",
      dateRange: defaultRange,
    };

    setFilters(cleared);
    setDateRange(defaultRange);
    setTempRange(defaultRange);
    setQuickTime("last_year");
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (dateRange?.from || dateRange?.to) count++;
    if (filters.selectedProvinces.length > 0) count++;
    if (filters.selectedDistricts.length > 0) count++;
    if (filters.selectedAreas.length > 0) count++;
    if (filters.selectedBSSes.length > 0) count++;
    return count;
  };

  const handleQuickTimeChange = (value) => {
    setQuickTime(value);

    if (value === "custom") {
      return;
    }

    const today = new Date();
    let newFrom = new Date();
    let newTo = new Date();

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
    setDateRange(range);
    setTempRange(range);
    updateFilters({ dateRange: range, quickTime: value });
  };

  const handleMultiSelectChange = (type, item, checked) => {
    const fieldMap = {
      provinces: "selectedProvinces",
      districts: "selectedDistricts",
      areas: "selectedAreas",
      bsses: "selectedBSSes",
    };

    const field = fieldMap[type];
    const currentSelection = filters[field];

    const newSelection = checked
      ? [...currentSelection, item]
      : currentSelection.filter((i) => i !== item);

    updateFilters({ [field]: newSelection });
  };

  const handleDateSelect = (date) => {
    if (!date) return;

    const newRange = { ...tempRange };

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

    setDateRange(tempRange);
    updateFilters({ dateRange: tempRange, quickTime: "custom" });
    setQuickTime("custom");
    setIsCalendarOpen(false);
  };

  const isDateRangeDisabled = quickTime !== "custom";

  const renderMultiSelectField = (label, type, options = [], selectedItems) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select
        onValueChange={(value) => handleMultiSelectChange(type, value, true)}
        placeholder={`Select ${label.toLowerCase()}`}
      >
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter((option) => !selectedItems.includes(option))
            .map((option) => (
              <SelectItem key={option} value={option}>
                {option}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>
      <div className="flex flex-wrap gap-1">
        {selectedItems.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
            <X
              className="h-3 w-3 ml-1 cursor-pointer"
              onClick={() => handleMultiSelectChange(type, item, false)}
            />
          </Badge>
        ))}
      </div>
    </div>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-cyan-400" />
            <span className="font-medium text-gray-200">Filters</span>
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                  className={`w-full justify-start text-left font-normal flex items-center min-w-0 ${
                    isDateRangeDisabled
                      ? "opacity-50 cursor-not-allowed bg-gray-800/30"
                      : "hover:bg-gray-700/50"
                  }`}
                  disabled={isDateRangeDisabled}
                  onClick={() =>
                    !isDateRangeDisabled && setIsCalendarOpen(true)
                  }
                >
                  <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
                  <span className="truncate min-w-0 block">
                    {dateRange?.from
                      ? dateRange.to
                        ? `${format(dateRange.from, "MMM dd, yyyy")} - ${format(
                            dateRange.to,
                            "MMM dd, yyyy"
                          )}`
                        : format(dateRange.from, "MMM dd, yyyy")
                      : "Pick a date range"}
                  </span>
                </Button>
              </PopoverTrigger>
              {!isDateRangeDisabled && (
                <PopoverContent className="w-auto p-0" align="start">
                  <div className="p-4 space-y-4">
                    {/* Date Picker Mode Toggle */}
                    <div className="flex justify-center">
                      <div className="flex rounded-md bg-gray-700/50 p-1">
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
                    <Calendar
                      selected={
                        datePickerMode === "from"
                          ? tempRange?.from
                          : tempRange?.to
                      }
                      onSelect={handleDateSelect}
                      mode="single"
                    />

                    {/* Footer */}
                    <div className="border-t border-gray-700 pt-3 space-y-3">
                      {tempRange?.from && tempRange?.to && (
                        <div className="text-xs text-center">
                          <span className="bg-cyan-500/20 text-cyan-400 px-2 py-1 rounded-md font-medium">
                            {format(tempRange.from, "MMM dd, yyyy")} -{" "}
                            {format(tempRange.to, "MMM dd, yyyy")}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-end">
                        <Button
                          onClick={applyDateRange}
                          disabled={!tempRange?.from || !tempRange?.to}
                          size="sm"
                        >
                          Apply Date Range
                        </Button>
                      </div>
                    </div>
                  </div>
                </PopoverContent>
              )}
            </Popover>
          </div>

          {/* Province Filter */}
          {renderMultiSelectField(
            "Provinces",
            "provinces",
            getAvailableProvinces(),
            filters.selectedProvinces
          )}

          {/* District Filter */}
          {renderMultiSelectField(
            "Districts",
            "districts",
            getAvailableDistricts(),
            filters.selectedDistricts
          )}

          {/* Area Filter */}
          {renderMultiSelectField(
            "Areas",
            "areas",
            getAvailableAreas(),
            filters.selectedAreas
          )}
        </div>

        {isExpanded && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t">
            {renderMultiSelectField(
              "BSSes",
              "bsses",
              getAvailableBSSes(),
              filters.selectedBSSes
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
