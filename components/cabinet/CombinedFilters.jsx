"use client";

import { useState } from "react";
import {
  Filter,
  Building2,
  X,
  Battery,
  Wifi,
  AlertTriangle,
  Thermometer,
  Zap,
  Eye,
  EyeOff,
  Activity,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LooseConnectionAnalyzer } from "@/components/cabinet/LooseConnectionAnalyzer";

export function CombinedFilters({
  stations,
  selectedStation,
  onStationChange,
  selectedCabinets,
  onCabinetChange,
  filterType,
  onFilterTypeChange,
  currentData,
  previousData,
  anomalyDetector,
  historicalData,
  filteredCurrentData,
}) {
  const [isManualSelectionOpen, setIsManualSelectionOpen] = useState(false);

  const allCabinets = Array.from({ length: 12 }, (_, i) => i + 1);

  const toggleCabinet = (cabinetNo) => {
    if (selectedCabinets.includes(cabinetNo)) {
      onCabinetChange(selectedCabinets.filter((c) => c !== cabinetNo));
    } else {
      onCabinetChange([...selectedCabinets, cabinetNo]);
    }
  };

  const selectAll = () => {
    onCabinetChange(allCabinets);
  };

  const clearAll = () => {
    onCabinetChange([]);
  };

  // Smart filter options with counts
  const getFilterOptions = () => {
    const withBattery = currentData.filter((c) => c.is_battery === 1).length;
    const withoutBattery = currentData.filter(
      (c) => c.is_battery === 0 || !c.timestamp
    ).length;
    const online = currentData.filter(
      (c) => c.communication === 1 && c.timestamp
    ).length;
    const offline = currentData.filter(
      (c) => c.communication === 0 || !c.timestamp
    ).length;
    const charging = currentData.filter(
      (c) => c.charger_online === 1 && c.timestamp
    ).length;
    const highTemp = currentData.filter(
      (c) => c.cell_temp > 40 && c.timestamp
    ).length;
    const lowBattery = currentData.filter(
      (c) => c.battery < 30 && c.timestamp
    ).length;

    const anomalies = currentData.filter((cabinet) => {
      if (!cabinet.timestamp) return false;
      const previous = previousData.find((p) => p.no === cabinet.no);
      const detectedAnomalies = anomalyDetector.detectAnomalies(
        cabinet,
        previous
      );
      return detectedAnomalies.length > 0;
    }).length;

    return [
      {
        value: "all",
        label: "All Cabinets",
        count: currentData.length,
        icon: Filter,
        color: "text-slate-400",
      },
      {
        value: "with-battery",
        label: "With Battery",
        count: withBattery,
        icon: Battery,
        color: "text-green-400",
      },
      {
        value: "without-battery",
        label: "Empty Slots",
        count: withoutBattery,
        icon: Battery,
        color: "text-gray-400",
      },
      {
        value: "online",
        label: "Online",
        count: online,
        icon: Wifi,
        color: "text-blue-400",
      },
      {
        value: "offline",
        label: "Offline",
        count: offline,
        icon: Wifi,
        color: "text-red-400",
      },
      {
        value: "charging",
        label: "Charging",
        count: charging,
        icon: Zap,
        color: "text-yellow-400",
      },
      {
        value: "anomalies",
        label: "With Anomalies",
        count: anomalies,
        icon: AlertTriangle,
        color: "text-orange-400",
      },
      {
        value: "high-temp",
        label: "High Temperature",
        count: highTemp,
        icon: Thermometer,
        color: "text-red-400",
      },
      {
        value: "low-battery",
        label: "Low Battery",
        count: lowBattery,
        icon: Battery,
        color: "text-orange-400",
      },
    ];
  };

  const filterOptions = getFilterOptions();
  const currentFilter = filterOptions.find(
    (option) => option.value === filterType
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Station Selection */}
      <Card className="border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Station Selection
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <label className="text-sm text-slate-400 font-medium">
              Available Stations
            </label>
            <select
              value={selectedStation}
              onChange={(e) => onStationChange(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            >
              <option value="" className="bg-slate-700 text-slate-400">
                Select a station...
              </option>
              {stations.map((station) => (
                <option
                  key={station}
                  value={station}
                  className="bg-slate-700 text-slate-200"
                >
                  {station}
                </option>
              ))}
            </select>
          </div>

          {selectedStation && (
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <div className="text-xs text-slate-400 mb-1">
                Selected Station
              </div>
              <div className="text-slate-200 font-mono text-sm">
                {selectedStation}
              </div>
            </div>
          )}

          <div className="text-xs text-slate-400">
            Total Stations: {stations.length}
          </div>
        </CardContent>
      </Card>

      {/* Cabinet Filters */}
      <Card className="border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Cabinet Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Filter Display */}
          {currentFilter && (
            <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
              <div className="flex items-center gap-2 mb-2">
                <currentFilter.icon
                  className={`w-4 h-4 ${currentFilter.color}`}
                />
                <span className="text-sm font-medium text-slate-200">
                  {currentFilter.label}
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Showing {currentFilter.count} cabinet
                {currentFilter.count !== 1 ? "s" : ""}
              </div>
            </div>
          )}

          {/* Smart Filters */}
          <div className="space-y-3">
            <label className="text-sm text-slate-400 font-medium">
              Smart Filters
            </label>
            <select
              value={filterType}
              onChange={(e) => onFilterTypeChange(e.target.value)}
              className="w-full p-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:border-blue-500 focus:outline-none transition-colors"
            >
              {filterOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  className="bg-slate-700 text-slate-200"
                >
                  {option.label} ({option.count})
                </option>
              ))}
            </select>
          </div>

          {/* Manual Cabinet Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-slate-400 font-medium">
                Manual Selection
              </label>
              <Button
                onClick={() => setIsManualSelectionOpen(!isManualSelectionOpen)}
                size="sm"
                variant="outline"
                className="border-slate-600 hover:bg-slate-700 bg-transparent text-slate-300"
              >
                {isManualSelectionOpen ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
                {isManualSelectionOpen ? "Hide" : "Show"}
              </Button>
            </div>

            <div className="text-xs text-slate-400">
              Selected: {selectedCabinets.length}/12 cabinets
            </div>

            {isManualSelectionOpen && (
              <div className="space-y-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                <div className="flex gap-2">
                  <Button
                    onClick={selectAll}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    Select All
                  </Button>
                  <Button
                    onClick={clearAll}
                    size="sm"
                    variant="outline"
                    className="border-slate-600 hover:bg-slate-700 bg-transparent text-slate-300 flex-1"
                  >
                    Clear All
                  </Button>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {allCabinets.map((cabinetNo) => (
                    <Button
                      key={cabinetNo}
                      onClick={() => toggleCabinet(cabinetNo)}
                      size="sm"
                      variant={
                        selectedCabinets.includes(cabinetNo)
                          ? "default"
                          : "outline"
                      }
                      className={
                        selectedCabinets.includes(cabinetNo)
                          ? "bg-blue-600 hover:bg-blue-700 text-white"
                          : "border-slate-600 hover:bg-slate-700 bg-transparent text-slate-300"
                      }
                    >
                      {cabinetNo}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {selectedCabinets.length > 0 && selectedCabinets.length < 12 && (
              <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-slate-700/20 rounded border border-slate-600/30">
                {selectedCabinets
                  .sort((a, b) => a - b)
                  .map((cabinetNo) => (
                    <Badge
                      key={cabinetNo}
                      className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                      onClick={() => toggleCabinet(cabinetNo)}
                    >
                      {cabinetNo}
                      <X className="w-3 h-3 ml-1" />
                    </Badge>
                  ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Connection Analysis */}
      <Card className="border-slate-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg text-slate-200 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Connection Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <LooseConnectionAnalyzer
            currentData={filteredCurrentData}
            historicalData={historicalData}
            anomalyDetector={anomalyDetector}
          />
        </CardContent>
      </Card>
    </div>
  );
}
