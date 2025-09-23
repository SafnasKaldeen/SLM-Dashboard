"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import type { RouteData } from "@/app/optimize/page"
import { Navigation, Clock, MapPin, ChevronDown, ChevronUp } from "lucide-react"

interface RouteResultsProps {
  routeData: RouteData
  onStartJourney: () => void
}

export function RouteResults({ routeData, onStartJourney }: RouteResultsProps) {
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false)

  // Use real directions from API or fallback to mock data
  const directions = routeData.stepByStepDirections && routeData.stepByStepDirections.length > 0 
    ? routeData.stepByStepDirections.map(step => step.instruction)
    : [
        "Head north on Main St toward 1st Ave",
        "Turn right onto 1st Ave", 
        "Continue for 2.3 miles",
        "Turn left onto Highway 101",
        "Take exit 15 toward Downtown",
        "Turn right onto Oak Street",
        "Destination will be on your right",
      ]

  // Helper function to format distance
  const formatDistance = (distanceMeters?: number) => {
    if (!distanceMeters) return ""
    if (distanceMeters < 1000) {
      return `${distanceMeters}m`
    }
    return `${(distanceMeters / 1000).toFixed(1)}km`
  }

  // Helper function to format duration  
  const formatDuration = (duration?: string) => {
    if (!duration) return ""
    const seconds = parseFloat(duration.replace('s', ''))
    if (seconds < 60) {
      return `${Math.round(seconds)}s`
    }
    return `${Math.round(seconds / 60)}min`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Navigation className="w-5 h-5" />
          Optimized Route
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Route Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Distance</p>
              <p className="font-semibold">{routeData.distance}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Duration</p>
              <p className="font-semibold">{routeData.duration}</p>
            </div>
          </div>
        </div>

        {/* Start Journey Button */}
        <Button onClick={onStartJourney} className="w-full" size="lg">
          <Navigation className="w-4 h-4 mr-2" />
          Start Journey in Google Maps
        </Button>

        {/* Step-by-step Directions */}
        <Collapsible open={isDirectionsOpen} onOpenChange={setIsDirectionsOpen}>
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="w-full justify-between bg-transparent">
              Step-by-step Directions
              {isDirectionsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-2 mt-2">
            {directions.map((direction: string, index: number) => (
              <div key={index} className="flex gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 dark:text-gray-300">{direction}</p>
                  {routeData.stepByStepDirections && routeData.stepByStepDirections[index] && (
                    <div className="flex gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      {routeData.stepByStepDirections[index].distance && (
                        <span>{formatDistance(routeData.stepByStepDirections[index].distance)}</span>
                      )}
                      {routeData.stepByStepDirections[index].duration && (
                        <span>{formatDuration(routeData.stepByStepDirections[index].duration)}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
