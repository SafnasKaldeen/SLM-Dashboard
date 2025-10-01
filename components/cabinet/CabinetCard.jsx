import {
  AlertTriangle,
  Battery,
  Thermometer,
  Zap,
  Wifi,
  WifiOff,
  Power,
  PowerOff,
  XCircle,
  Activity,
  Gauge,
  DoorOpen,
  DoorClosed,
  BatteryIcon as BatteryX,
} from "lucide-react";
import React, { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CabinetCard({ cabinet, previous, anomalies, anomalyDetector }) {
  const statusInfo = anomalyDetector.getCabinetStatus(cabinet, previous);

  // Parse single voltage values for loose connection analysis
  const voltageValues = cabinet.single_vol
    ? cabinet.single_vol
        .split(",")
        .map((v) => Number.parseFloat(v.trim()))
        .filter((v) => !isNaN(v))
    : [];
  const voltageVariance =
    voltageValues.length > 1
      ? Math.max(...voltageValues) - Math.min(...voltageValues)
      : 0;

  // Check if battery is present
  const hasBattery = cabinet.is_battery === 1;
  const batteryId =
    cabinet.bid && cabinet.bid.trim() !== "" ? cabinet.bid : null;

  // Check charging status
  function getChargingStatus(cabinet, hasBattery) {
    if (cabinet.charger_online !== 1 || !hasBattery) {
      return "not_charging";
    }
    if (cabinet.door !== 0 && cabinet.kwh !== 100) {
      // Charger is online, battery present, but door is open
      return "door opened";
    }
    return cabinet.kwh === 100 ? "fully" : "charging";
  }

  const chargingStatus = getChargingStatus(cabinet, hasBattery);

  const connectionScore = cabinet.timestamp
    ? Math.max(10, Math.round(100 - voltageVariance * 50))
    : 0;

  const CabinatScore = useMemo(() => {
    if (!cabinet.timestamp) return 0;

    const commScore = cabinet.communication ? 30 : 0; // weight: 30%
    const tempScore = cabinet.cell_temp >= 0 && cabinet.cell_temp < 50 ? 20 : 0; // weight: 20%
    const anomalyScore =
      anomalies.length === 0 ? 10 : anomalies.length <= 2 ? 5 : 0; // weight: 10%

    return Math.min(
      100,
      connectionScore * 0.4 + // weight: 40%
        commScore +
        tempScore +
        anomalyScore
    );
  }, [cabinet, connectionScore, anomalies]);

  return (
    <Card
      className={`${statusInfo.bgClass} ${
        statusInfo.borderClass
      } border-2 transition-all duration-300 hover:scale-105 ${
        statusInfo.glow || ""
      } ${
        hasBattery
          ? "ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900"
          : ""
      } min-h-[420px] flex flex-col`}
    >
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base lg:text-lg text-slate-100 font-bold">
            Cabinet #{cabinet.no}
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* Charging Status Badge */}
            {cabinet.timestamp && (
              <Badge
                className={`text-white text-xs font-medium ${
                  chargingStatus === "fully"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : chargingStatus === "charging"
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : chargingStatus === "door opened"
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-slate-600 hover:bg-slate-700"
                }`}
              >
                <Zap className="w-3 h-3 mr-1" />
                {chargingStatus === "fully"
                  ? "Fully Charged"
                  : chargingStatus === "charging"
                  ? "Charging"
                  : chargingStatus === "door opened"
                  ? "door opened"
                  : "Not Charging"}
              </Badge>
            )}

            {/* Battery Status Badge */}
            {hasBattery ? (
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium">
                <Battery className="w-3 h-3 mr-1" />
                Active
              </Badge>
            ) : (
              <Badge className="bg-slate-600 hover:bg-slate-700 text-slate-300 text-xs font-medium">
                <BatteryX className="w-3 h-3 mr-1" />
                Empty
              </Badge>
            )}

            {anomalies.length > 0 && (
              <AlertTriangle className="w-4 h-4 lg:w-5 lg:h-5 text-red-400 animate-pulse" />
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 flex-grow flex flex-col">
        {cabinet.timestamp ? (
          <>
            {/* Battery Status Display - Always show */}
            <div
              className={`p-2 rounded-lg border ${
                hasBattery
                  ? "bg-blue-900/30 border-blue-500/40"
                  : "bg-slate-700/40 border-slate-500/40"
              }`}
            >
              <div
                className={`flex items-center gap-2 mb-1 ${
                  hasBattery ? "text-blue-200" : "text-slate-300"
                }`}
              >
                {hasBattery ? (
                  <Battery className="w-3 h-3" />
                ) : (
                  <BatteryX className="w-3 h-3" />
                )}
                <span className="text-xs font-medium">Battery Status:</span>
              </div>
              {hasBattery ? (
                <div>
                  <div className="text-xs text-green-300 mb-1">
                    Battery Present
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-300">ID: </span>
                    <span className="font-mono text-slate-100">
                      {batteryId || "No ID Available"}
                    </span>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-300">
                  No Battery Installed
                </span>
              )}
            </div>

            {/* Connection Analysis - Always show for active cabinets */}
            <div className="space-y-2">
              {/* Voltage Variance */}
              <div className="p-2 bg-orange-900/30 rounded-lg border border-orange-500/40">
                <div className="flex items-center gap-2 text-orange-200 mb-1">
                  <Activity className="w-3 h-3" />
                  <span className="text-xs font-medium">Voltage Variance:</span>
                </div>
                <span className="font-mono text-xs text-slate-100">
                  {voltageVariance > 0
                    ? `${voltageVariance.toFixed(2)}V`
                    : "0.00V"}
                </span>
              </div>

              {/* Connection Stability Score */}
              <div className="p-2 bg-green-900/30 rounded-lg border border-green-500/40">
                <div className="flex items-center gap-2 text-green-200 mb-1">
                  <Gauge className="w-3 h-3" />
                  <span className="text-xs font-medium">Connection Score:</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-slate-600 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        CabinatScore >= 90
                          ? "bg-green-500"
                          : CabinatScore >= 70
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{
                        width: `${CabinatScore.toFixed(0)}%`,
                      }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-100 min-w-[35px]">
                    {CabinatScore.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Anomaly Alerts - Show if present */}
            {anomalies.length > 0 && (
              <div className="space-y-1">
                {anomalies.slice(0, 1).map((anomaly, idx) => (
                  <Alert
                    key={idx}
                    className={`border-l-4 p-2 ${
                      anomaly.severity === "critical"
                        ? "border-red-400 bg-red-900/30 text-red-100"
                        : anomaly.severity === "high"
                        ? "border-red-400 bg-red-900/20 text-red-100"
                        : "border-yellow-400 bg-yellow-900/20 text-yellow-100"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <AlertDescription className="text-xs">
                        {anomaly.reason}
                      </AlertDescription>
                    </div>
                  </Alert>
                ))}
                {anomalies.length > 1 && (
                  <div className="text-xs text-slate-300 text-center bg-slate-700/40 p-1 rounded">
                    +{anomalies.length - 1} more anomalies
                  </div>
                )}
              </div>
            )}

            {/* Metrics Grid - Always show all metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs flex-grow">
              {/* Energy */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                <Battery
                  className={`w-3 h-3 ${
                    cabinet.kwh === 0 ? "text-slate-400" : "text-blue-400"
                  }`}
                />
                <div>
                  <div className="text-slate-300 text-xs">Charge</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.kwh > 0 ? `${cabinet.kwh}%` : "0"}
                  </div>
                </div>
              </div>

              {/* Temperature */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                <Thermometer
                  className={`w-3 h-3 ${
                    cabinet.cell_temp === 0
                      ? "text-slate-400"
                      : cabinet.cell_temp < 40
                      ? "text-blue-400"
                      : cabinet.cell_temp < 50
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                />
                <div>
                  <div className="text-slate-300 text-xs">Temp</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.cell_temp > 0 ? `${cabinet.cell_temp}°C` : "0°"}
                  </div>
                </div>
              </div>

              {/* Voltage */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                <Zap
                  className={`w-3 h-3 ${
                    cabinet.v === 0
                      ? "text-slate-400"
                      : cabinet.v > 100
                      ? "text-green-400"
                      : "text-yellow-400"
                  }`}
                />
                <div>
                  <div className="text-slate-300 text-xs">Voltage</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.v > 0 ? `${cabinet.v}V` : "0"}
                  </div>
                </div>
              </div>

              {/* Current */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                <Activity
                  className={`w-3 h-3 ${
                    cabinet.i === 0
                      ? "text-slate-400"
                      : cabinet.i > 0
                      ? "text-blue-400"
                      : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-slate-300 text-xs">Current</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.i !== 0 ? `${cabinet.i}A` : "0"}
                  </div>
                </div>
              </div>

              {/* Communication */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                {cabinet.communication ? (
                  <Wifi className="w-3 h-3 text-green-400" />
                ) : (
                  <WifiOff className="w-3 h-3 text-red-400" />
                )}
                <div>
                  <div className="text-slate-300 text-xs">Comm</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.communication ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Charger Status */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                {cabinet.charger_online ? (
                  <Power className="w-3 h-3 text-green-400" />
                ) : (
                  <PowerOff className="w-3 h-3 text-red-400" />
                )}
                <div>
                  <div className="text-slate-300 text-xs">Charger</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.charger_online ? "Online" : "Offline"}
                  </div>
                </div>
              </div>

              {/* Door Status */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                {cabinet.door ? (
                  <DoorOpen className="w-3 h-3 text-blue-400" />
                ) : (
                  <DoorClosed className="w-3 h-3 text-slate-400" />
                )}
                <div>
                  <div className="text-slate-300 text-xs">Door</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.door ? "Open" : "Closed"}
                  </div>
                </div>
              </div>

              {/* Battery Level */}
              <div className="flex items-center gap-2 p-2 bg-slate-700/60 rounded border border-slate-600/50">
                <Zap
                  className={`w-3 h-3 ${
                    cabinet.battery > 50
                      ? "text-green-400"
                      : cabinet.battery > 20
                      ? "text-yellow-400"
                      : cabinet.battery > 0
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                />
                <div>
                  <div className="text-slate-300 text-xs">Cabinet Volt</div>
                  <div className="font-mono text-slate-100 text-xs">
                    {cabinet.battery > 0 ? `${cabinet.battery}V` : "0"}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center text-slate-400 py-8 flex-grow flex items-center justify-center">
            <div>
              <XCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <span className="text-sm">No Data Available</span>
              <div className="mt-4 space-y-2">
                <div className="p-2 bg-slate-700/40 rounded border border-slate-600/50">
                  <div className="text-slate-300 text-xs">Status: Offline</div>
                </div>
                <div className="p-2 bg-slate-700/40 rounded border border-slate-600/50">
                  <div className="text-slate-300 text-xs">Connection: N/A</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
