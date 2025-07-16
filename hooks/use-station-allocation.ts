"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import type { StationAllocationInput, GeoStationAllocationInput, StationAllocationData } from "@/lib/types/api-types"

/**
 * Hook for station allocation using density-based or geo-based clustering
 */
export function useStationAllocation() {
  const [allocationType, setAllocationType] = useState<"density" | "geo">("density")

  const densityApi = useApi<StationAllocationData, StationAllocationInput>("/DensityBased-station-allocation")

  const geoApi = useApi<StationAllocationData, GeoStationAllocationInput>("/GeoBased-station-allocation")

  // Get the current API state based on allocation type
  const currentApi = allocationType === "density" ? densityApi : geoApi

  // Clean and transform station data
  const cleanedStationData = currentApi.data
    ? {
        ...currentApi.data,
        // Ensure clusters have valid centroids and stations
        clusters: currentApi.data.clusters
          .filter(
            (cluster) =>
              typeof cluster.centroid.lat === "number" &&
              typeof cluster.centroid.lng === "number" &&
              !isNaN(cluster.centroid.lat) &&
              !isNaN(cluster.centroid.lng),
          )
          .map((cluster) => ({
            ...cluster,
            // Filter out invalid stations
            stations: cluster.stations.filter(
              (station) =>
                typeof station.lat === "number" &&
                typeof station.lng === "number" &&
                !isNaN(station.lat) &&
                !isNaN(station.lng),
            ),
          }))
          // Filter out empty clusters
          .filter((cluster) => cluster.stations.length > 0),
      }
    : null

  // Function to run density-based allocation
  const runDensityAllocation = async (input: StationAllocationInput) => {
    setAllocationType("density")
    return await densityApi.execute(input)
  }

  // Function to run geo-based allocation
  const runGeoAllocation = async (input: GeoStationAllocationInput) => {
    setAllocationType("geo")
    return await geoApi.execute(input)
  }

  // Helper function to get color based on availability
  const getAvailabilityColor = (available: number, capacity: number): string => {
    const percentage = (available / capacity) * 100
    if (percentage > 50) return "#10b981" // green
    if (percentage > 20) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  // Prepare map data from station data for easy consumption by map components
  const mapData = cleanedStationData
    ? {
        markers: cleanedStationData.clusters.flatMap((cluster) =>
          cluster.stations.map((station) => ({
            position: [station.lat, station.lng] as [number, number],
            popup: `<strong>${station.name}</strong><br>Capacity: ${station.capacity}<br>Available: ${station.available}`,
            color: getAvailabilityColor(station.available, station.capacity),
          })),
        ),
        clusters: cleanedStationData.clusters.map((cluster) => ({
          center: [cluster.centroid.lat, cluster.centroid.lng] as [number, number],
          radius: 500, // Radius in meters
          color: "#06b6d4", // cyan
          fillColor: "#06b6d4",
          fillOpacity: 0.1,
        })),
        center:
          cleanedStationData.clusters.length > 0
            ? ([
                cleanedStationData.clusters.reduce((sum, cluster) => sum + cluster.centroid.lat, 0) /
                  cleanedStationData.clusters.length,
                cleanedStationData.clusters.reduce((sum, cluster) => sum + cluster.centroid.lng, 0) /
                  cleanedStationData.clusters.length,
              ] as [number, number])
            : ([0, 0] as [number, number]),
        zoom: 13,
      }
    : null

  return {
    stationData: cleanedStationData,
    mapData,
    isLoading: currentApi.isLoading,
    error: currentApi.error,
    allocationType,
    runDensityAllocation,
    runGeoAllocation,
    getAvailabilityColor,
  }
}
