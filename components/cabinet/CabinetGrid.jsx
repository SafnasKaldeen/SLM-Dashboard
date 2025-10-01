"use client";

import { CabinetCard } from "./CabinetCard";

export function CabinetGrid({ currentData, previousData, anomalyDetector }) {
  if (currentData.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-400 text-lg">
          No cabinets match the current filters
        </div>
        <div className="text-slate-500 text-sm mt-2">
          Try adjusting your filter settings
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-slate-200">
          Cabinet Status Grid
        </h2>
        <div className="text-sm text-slate-400">
          Showing {currentData.length} cabinet
          {currentData.length !== 1 ? "s" : ""}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
        {currentData.map((cabinet) => {
          const previous = previousData.find((p) => p.no === cabinet.no);
          const anomalies = cabinet.timestamp
            ? anomalyDetector.detectAnomalies(cabinet, previous)
            : [];

          return (
            <CabinetCard
              key={cabinet.no}
              cabinet={cabinet}
              previous={previous}
              anomalies={anomalies}
              anomalyDetector={anomalyDetector}
            />
          );
        })}
      </div>
    </div>
  );
}
