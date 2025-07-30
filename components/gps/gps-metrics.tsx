import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Title } from "@radix-ui/react-toast";
import { MapPin, Satellite, Battery, Cpu } from "lucide-react";

interface GPSMetricsProps {
  GPSData: Array<{ GPS: number }>;
  filters: {
    selectedTboxes: string[];
    selectedBmses: string[];
    selectedBatteryTypes: string[];
  };
  loading?: boolean; // Make loading optional
  error?: any;
}

export function GPSMetrics({
  GPSData,
  filters,
  loading,
  error,
}: GPSMetricsProps) {
  if (loading || error || !GPSData || GPSData.length === 0) return null;

  const totalGPSPoints = GPSData.reduce((acc, cur) => acc + cur.GPS, 0);
  const selectedTboxesCount = filters.selectedTboxes.length;
  const selectedBmsesCount = filters.selectedBmses.length;
  const selectedBatteryTypesCount = filters.selectedBatteryTypes.length;

  const metrics = [
    {
      title: "Total GPS Points",
      value: totalGPSPoints.toLocaleString(),
      description: "Sum over the selected period",
      icon: Satellite,
    },
    {
      title: "Total distance",
      value: GPSData.reduce((acc, cur) => acc + cur.GPS, 0).toLocaleString(),
      description: "Total distance travelled over the period",
      icon: MapPin,
    },
    {
      title: "Average distance per GPS Point",
      value: (totalGPSPoints / selectedTboxesCount || 0).toLocaleString(),
      description: "Average distance per over the period",
      icon: Cpu,
    },

    {
      title: "Total Scooters",
      value: selectedTboxesCount.toString(),
      description: "Sum of Scooters over the period",
      icon: Cpu,
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metrics.map(({ title, value, description, icon: Icon }) => (
        <Card key={title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            <Icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
