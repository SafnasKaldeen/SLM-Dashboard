"use client"

import { useState, useEffect, useCallback } from "react"

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  accuracy: number | null
  error: string | null
  isLoading: boolean
}

/**
 * Hook for accessing and monitoring the user's geolocation
 */
export function useGeolocation(options?: PositionOptions) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    isLoading: true,
  })

  // Function to get current position
  const getCurrentPosition = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "Geolocation is not supported by your browser",
        isLoading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          error: null,
          isLoading: false,
        })
      },
      (error) => {
        setState((prev) => ({
          ...prev,
          error: getGeolocationErrorMessage(error),
          isLoading: false,
        }))
      },
      options,
    )
  }, [options])

  // Get position on mount if options.enableHighAccuracy is true
  useEffect(() => {
    if (options?.enableHighAccuracy) {
      getCurrentPosition()
    } else {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [getCurrentPosition, options?.enableHighAccuracy])

  // Helper function to get human-readable error messages
  const getGeolocationErrorMessage = (error: GeolocationPositionError): string => {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "User denied the request for geolocation"
      case error.POSITION_UNAVAILABLE:
        return "Location information is unavailable"
      case error.TIMEOUT:
        return "The request to get user location timed out"
      default:
        return "An unknown error occurred"
    }
  }

  return {
    ...state,
    getCurrentPosition,
    // Formatted coordinates for display or API calls
    coordinates:
      state.latitude !== null && state.longitude !== null ? { lat: state.latitude, lng: state.longitude } : null,
  }
}
