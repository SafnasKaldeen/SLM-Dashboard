"use client";

import { Car, Activity, DollarSign, Zap, Battery, Route } from "lucide-react";
import KPICard from "@/components/vehicles/KPICard";

// Utility functions
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Types
interface FleetKPIs {
  TOTAL_VEHICLES: number;
  TOTAL_CHARGING_SESSIONS: number;
  TOTAL_CHARGING_REVENUE: number;
  TOTAL_CO2_SAVED: number;
}

const KPICardsGrid = ({ fleetKPIs }: { fleetKPIs: FleetKPIs }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <KPICard
        icon={Car}
        label="Total Vehicles"
        value={fleetKPIs.TOTAL_VEHICLES}
        color="text-blue-400"
      />

      <KPICard
        icon={Battery}
        label="Total Revenue"
        value={fleetKPIs.TOTAL_CHARGING_REVENUE}
        color="text-cyan-400"
        // formatter={formatCurrency}
      />
      <KPICard
        icon={Activity}
        label="Distance travelled"
        value={fleetKPIs.TOTAL_CHARGING_SESSIONS}
        color="text-green-400"
      />
      <KPICard
        icon={Route}
        label="CO₂ Saved"
        value={Math.round(fleetKPIs.TOTAL_CO2_SAVED)}
        color="text-orange-400"
        formatter={(val) => `${formatNumber(val)} kg`}
      />
    </div>
  );
};

export default KPICardsGrid;
