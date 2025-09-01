"use client";

import { Car, Users, ShoppingCart, Package } from "lucide-react";
import KPICard from "@/components/vehicles/KPICard";

// Utility functions
const formatNumber = (num: number) => {
  return new Intl.NumberFormat("en-US").format(num);
};

// Updated Types to match your requirements
interface FleetKPIs {
  TOTAL_VEHICLES: number;
  TOTAL_DEALERS: number;
  TOTAL_SOLD_VEHICLES: number;
  TOTAL_INSTOCK_VEHICLES: number;
}

interface KPICardsGridProps {
  fleetKPIs: FleetKPIs;
  loading?: boolean;
}

const KPICardsGrid = ({ fleetKPIs, loading = false }: KPICardsGridProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <KPICard
        icon={Car}
        label="Total Vehicles"
        value={fleetKPIs.TOTAL_VEHICLES}
        color="text-blue-400"
        formatter={formatNumber}
        loading={loading}
      />

      <KPICard
        icon={Users}
        label="Total Dealers"
        value={fleetKPIs.TOTAL_DEALERS}
        color="text-cyan-400"
        formatter={formatNumber}
        loading={loading}
      />

      <KPICard
        icon={ShoppingCart}
        label="Total Sold Vehicles"
        value={fleetKPIs.TOTAL_SOLD_VEHICLES}
        color="text-green-400"
        formatter={formatNumber}
        loading={loading}
      />

      <KPICard
        icon={Package}
        label="Total In-Stock Vehicles"
        value={fleetKPIs.TOTAL_INSTOCK_VEHICLES}
        color="text-orange-400"
        formatter={formatNumber}
        loading={loading}
      />
    </div>
  );
};

export default KPICardsGrid;
