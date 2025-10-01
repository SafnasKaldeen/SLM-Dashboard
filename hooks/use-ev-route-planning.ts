import { useApi } from "./use-api"
import type { EVRouteInput, EVRouteData } from "@/lib/types/api-types"

/**
 * Hook for planning EV routes with charging stops
 */
export function useEVRoutePlanning() {
  const { data: routeData, isLoading, error, execute } = useApi<EVRouteData, EVRouteInput>("/ev-route-plan")

  // Clean and transform route data
  const cleanedRouteData = routeData
    ? {
        ...routeData,
        // Ensure route points are valid
        route: routeData.route.filter(
          (point) =>
            typeof point.lat === "number" && typeof point.lng === "number" && !isNaN(point.lat) && !isNaN(point.lng),
        ),
        // Ensure charging stops are valid
        chargingStops: routeData.chargingStops.filter(
          (stop) =>
            typeof stop.lat === "number" && typeof stop.lng === "number" && !isNaN(stop.lat) && !isNaN(stop.lng),
        ),
        // Round numeric values for display
        distance: Math.round(routeData.distance * 10) / 10, // Round to 1 decimal place
        batteryUsage: Math.round(routeData.batteryUsage),
        estimatedTime: Math.round(routeData.estimatedTime),
      }
    : null

  // Function to plan a route
  const planRoute = async (input: EVRouteInput) => {
    return await execute(input)
  }

  // Prepare map data from route data for easy consumption by map components
  const mapData = cleanedRouteData
    ? {
        markers: [
          // Start marker
          {
            position: [cleanedRouteData.route[0].lat, cleanedRouteData.route[0].lng] as [number, number],
            popup: `<strong>Start:</strong> ${cleanedRouteData.route[0].name}`,
            color: "#10b981", // green
          },
          // End marker
          {
            position: [
              cleanedRouteData.route[cleanedRouteData.route.length - 1].lat,
              cleanedRouteData.route[cleanedRouteData.route.length - 1].lng,
            ] as [number, number],
            popup: `<strong>Destination:</strong> ${cleanedRouteData.route[cleanedRouteData.route.length - 1].name}`,
            color: "#ef4444", // red
          },
          // Charging stops
          ...cleanedRouteData.chargingStops.map((stop) => ({
            position: [stop.lat, stop.lng] as [number, number],
            popup: `<strong>${stop.name}</strong><br>Charging time: ${stop.chargingTime} min<br>Battery added: ${stop.batteryAdded}%`,
            icon: "charging",
            color: "#f59e0b", // amber
          })),
        ],
        routes: [
          {
            path: cleanedRouteData.route.map((point) => [point.lat, point.lng] as [number, number]),
            color: "#06b6d4", // cyan
            weight: 4,
          },
        ],
        center: [
          (cleanedRouteData.route[0].lat + cleanedRouteData.route[cleanedRouteData.route.length - 1].lat) / 2,
          (cleanedRouteData.route[0].lng + cleanedRouteData.route[cleanedRouteData.route.length - 1].lng) / 2,
        ] as [number, number],
        zoom: 12,
      }
    : null

  return {
    routeData: cleanedRouteData,
    mapData,
    isLoading,
    error,
    planRoute,
  }
}
