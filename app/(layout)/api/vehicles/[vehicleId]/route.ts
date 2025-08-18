import { type NextRequest, NextResponse } from "next/server"
import {
  mockVehicles,
  generateMockChargingPatterns,
  generateMockSwappingHistory,
  generateMockGPSAnalytics,
  generateMockBatteryHealth,
} from "@/lib/mock-data/fleet-data"

export async function GET(request: NextRequest, { params }: { params: { vehicleId: string } }) {
  const vehicleId = params.vehicleId

  try {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 300))

    // Find the vehicle
    const vehicle = mockVehicles.find((v) => v.VEHICLE_ID === vehicleId)

    if (!vehicle) {
      return NextResponse.json(
        {
          success: false,
          error: "Vehicle not found",
        },
        { status: 404 },
      )
    }

    // Generate mock data for this specific vehicle
    const chargingPatterns = generateMockChargingPatterns(vehicleId)
    const swappingHistory = generateMockSwappingHistory(vehicleId)
    const gpsAnalytics = generateMockGPSAnalytics(vehicleId)
    const batteryHealth = generateMockBatteryHealth(vehicleId)

    return NextResponse.json({
      success: true,
      data: {
        vehicle,
        chargingPatterns,
        swappingHistory,
        gpsAnalytics,
        batteryHealth,
      },
    })
  } catch (error) {
    console.error("Error fetching vehicle detail:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch vehicle data",
      },
      { status: 500 },
    )
  }
}
