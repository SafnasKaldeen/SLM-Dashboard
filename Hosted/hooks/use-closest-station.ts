"use client"

import { useState } from "react"
import { useApi } from "./use-api"
import type { ClosestStationInput, ClosestStationWithDirectionInput, ClosestStationData } from "@/lib/types/api-types"

/**
 * Hook for finding closest charging stations
 */
export function useClosestStations() {
  const [searchType, setSearchType] = useState<"closest" | "direction">("closest")

  const closestApi = useApi<ClosestStationData[], ClosestStationInput>("/closest-station")

  const directionApi = useApi<ClosestStationData[], ClosestStationWithDirectionInput>("/closest-station-with-direction")

  // Get the current API state based on search type
  const currentApi = searchType === "closest" ? closestApi : directionApi

  // Clean and transform station data
  const cleanedStationData = currentApi.data
    ? currentApi.data
        .filter(
          (station) =>
            typeof station.lat === "number" &&
            typeof station.lng === "number" &&
            !isNaN(station.lat) &&
            !isNaN(station.lng) &&
            typeof station.distance === "number" &&
            !isNaN(station.distance),
        )
        .map((station) => ({
          ...station,
          // Round distance to 1 decimal place
          distance: Math.round(station.distance * 10) / 10,
        }))
        // Sort by distance
        .sort((a, b) => a.distance - b.distance)
    : null

  // Function to find closest stations
  const findClosestStations = async (input: ClosestStationInput) => {
    setSearchType("closest")
    return await closestApi.execute(input)
  }

  // Function to find stations with direction
  const findStationsWithDirection = async (input: ClosestStationWithDirectionInput) => {
    setSearchType("direction")
    return await directionApi.execute(input)
  }

  // Helper function to get color based on availability
  const getAvailabilityColor = (available: number, capacity: number): string => {
    const percentage = (available / capacity) * 100
    if (percentage > 50) return "#10b981" // green
    if (percentage > 20) return "#f59e0b" // amber
    return "#ef4444" // red
  }

  // Prepare map data for easy consumption by map components
  const prepareMapData = (
    stationData: ClosestStationData[] | null,
    currentLocation?: [number, number],
    destination?: [number, number],
  ) => {
    if (!stationData) return null

    const markers = []
    const routes = []

    // Add current location marker
    if (currentLocation) {
      markers.push({
        position: currentLocation,
        popup: "<strong>Current Location</strong>",
        color: "#3b82f6", // blue
        icon: "location",
      })
    }

    // Add destination marker if in direction mode
    if (searchType === "direction" && destination) {
      markers.push({
        position: destination,
        popup: "<strong>Destination</strong>",
        color: "#ef4444", // red
        icon: "location",
      })
    }

    // Add station markers
    stationData.forEach((station) => {
      markers.push({
        position: [station.lat, station.lng] as [number, number],
        popup: `<strong>${station.name}</strong><br>Distance: ${station.distance} km<br>Available: ${station.available}/${station.capacity}`,
        color: getAvailabilityColor(station.available, station.capacity),
        icon: "charging",
      })
    })

    // Create route if in direction mode
    if (searchType === "direction" && currentLocation && destination) {
      const routePoints = [currentLocation]

      // Add stations as waypoints
      stationData.forEach((station) => {
        routePoints.push([station.lat, station.lng] as [number, number])
      })

      routePoints.push(destination)

      routes.push({
        path: routePoints,
        color: "#3b82f6", // blue
        dashArray: "5, 10",
      })
    }

    // Calculate center point
    let center: [number, number]
    if (currentLocation && destination) {
      // Center between current location and destination
      center = [(currentLocation[0] + destination[0]) / 2, (currentLocation[1] + destination[1]) / 2]
    } else if (currentLocation) {
      center = currentLocation
    } else if (stationData.length > 0) {
      // Center on first station
      center = [stationData[0].lat, stationData[0].lng]
    } else {
      // Default center
      center = [0, 0]
    }

    return {
      markers,
      routes,
      center,
      zoom: 14,
    }
  }

  return {
    stationData: cleanedStationData,
    isLoading: currentApi.isLoading,
    error: currentApi.error,
    searchType,
    findClosestStations,
    findStationsWithDirection,
    getAvailabilityColor,
    prepareMapData,
  }
}
