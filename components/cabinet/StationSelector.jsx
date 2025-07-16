"use client";

import { Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function StationSelector({
  stations,
  selectedStation,
  onStationChange,
}) {
  return (
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
            <div className="text-xs text-slate-400 mb-1">Selected Station</div>
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
  );
}
