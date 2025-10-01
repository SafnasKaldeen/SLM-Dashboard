import { NextRequest, NextResponse } from "next/server"

export async function POST(req: NextRequest) {
  const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!key) {
    return NextResponse.json({ error: "Missing Google Maps API key" }, { status: 500 })
  }

  try {
    const { origin, destination, waypoints } = await req.json()

    if (!origin || !origin.lat || !origin.lng) {
      return NextResponse.json({ error: "Origin is required and must include lat/lng" }, { status: 400 })
    }

    const intermediates =
      Array.isArray(waypoints) && waypoints.length > 0
        ? waypoints.map((w: any) => ({
            location: { latLng: { latitude: w.lat, longitude: w.lng } },
          }))
        : []

    // Determine if we need waypoint optimization
    const needsOptimization = intermediates.length > 0
    
    const requestBody = {
      origin: {
        location: { latLng: { latitude: origin.lat, longitude: origin.lng } },
      },
      destination: destination
        ? {
            location: { latLng: { latitude: destination.lat, longitude: destination.lng } },
          }
        : {
            location: { latLng: { latitude: origin.lat, longitude: origin.lng } }, // fallback to round-trip
          },
      intermediates,
      travelMode: "TWO_WHEELER",
      // Use TRAFFIC_AWARE when we need waypoint optimization, TRAFFIC_AWARE_OPTIMAL otherwise
      routingPreference: needsOptimization ? "TRAFFIC_AWARE" : "TRAFFIC_AWARE_OPTIMAL",
      optimizeWaypointOrder: needsOptimization,
      computeAlternativeRoutes: false,
    }

    const response = await fetch(
      `https://routes.googleapis.com/directions/v2:computeRoutes`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-FieldMask":
            "routes.optimizedIntermediateWaypointIndex,routes.distanceMeters,routes.duration,routes.staticDuration,routes.polyline.encodedPolyline,routes.legs.distanceMeters,routes.legs.duration,routes.legs.staticDuration,routes.legs.steps.navigationInstruction,routes.legs.steps.distanceMeters,routes.legs.steps.staticDuration,routes.legs.polyline.encodedPolyline",
          "X-Goog-Api-Key": key,
        },
        body: JSON.stringify(requestBody),
      }
    )

    const data = await response.json()

    if (!response.ok) {
      console.error("Google Routes API Error:", {
        status: response.status,
        statusText: response.statusText,
        error: data,
        requestBody: JSON.stringify(requestBody, null, 2)
      })
      return NextResponse.json({ 
        error: data?.error?.message || `Routes API failed with status ${response.status}` 
      }, { status: response.status })
    }

    // Transform the response to include step-by-step directions
    if (data.routes && data.routes.length > 0) {
      const route = data.routes[0]
      
      // Extract step-by-step directions from all legs
      const allSteps: any[] = []
      if (route.legs) {
        route.legs.forEach((leg: any) => {
          if (leg.steps) {
            leg.steps.forEach((step: any) => {
              if (step.navigationInstruction && step.navigationInstruction.instructions) {
                allSteps.push({
                  instruction: step.navigationInstruction.instructions,
                  distance: step.distanceMeters || 0,
                  duration: step.staticDuration || "0s",
                  maneuver: step.navigationInstruction.maneuver || "STRAIGHT",
                })
              }
            })
          }
        })
      }

      // Add the step-by-step directions to the route data
      const enhancedRoute = {
        ...route,
        stepByStepDirections: allSteps,
        // Ensure we have the required fields with fallbacks
        distanceMeters: route.distanceMeters || 0,
        duration: route.duration || route.staticDuration || "0s",
        polyline: route.polyline || { encodedPolyline: "" },
        optimizedIntermediateWaypointIndex: route.optimizedIntermediateWaypointIndex || [],
      }

      console.log("Enhanced route data:", {
        hasPolyline: !!route.polyline?.encodedPolyline,
        stepCount: allSteps.length,
        distanceMeters: route.distanceMeters,
        duration: route.duration,
        optimizedOrder: route.optimizedIntermediateWaypointIndex
      })

      return NextResponse.json({
        ...data,
        routes: [enhancedRoute, ...data.routes.slice(1)],
      })
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Unexpected Error:", err)
    return NextResponse.json({ error: err.message || "Unexpected error" }, { status: 500 })
  }
}
