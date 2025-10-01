"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface FallbackMapProps {
  lat: number
  lng: number
  height?: string
  message?: string
}

export default function FallbackMap({ lat, lng, height = "500px", message = "Map loading..." }: FallbackMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // This is a placeholder for a real map implementation
    if (!mapRef.current) return

    const canvas = document.createElement("canvas")
    canvas.width = mapRef.current.offsetWidth
    canvas.height = mapRef.current.offsetHeight
    mapRef.current.innerHTML = ""
    mapRef.current.appendChild(canvas)

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw a simple map background
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
    gradient.addColorStop(0, "#1e293b")
    gradient.addColorStop(1, "#0f172a")
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid lines
    ctx.strokeStyle = "rgba(100, 116, 139, 0.2)"
    ctx.lineWidth = 1

    // Horizontal grid lines
    for (let y = 0; y < canvas.height; y += 40) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(canvas.width, y)
      ctx.stroke()
    }

    // Vertical grid lines
    for (let x = 0; x < canvas.width; x += 40) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, canvas.height)
      ctx.stroke()
    }

    // Draw some random roads
    ctx.strokeStyle = "rgba(100, 116, 139, 0.5)"
    ctx.lineWidth = 3

    // Main roads
    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 2)
    ctx.lineTo(canvas.width, canvas.height / 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(canvas.width / 2, 0)
    ctx.lineTo(canvas.width / 2, canvas.height)
    ctx.stroke()

    // Secondary roads
    ctx.strokeStyle = "rgba(100, 116, 139, 0.3)"
    ctx.lineWidth = 2

    ctx.beginPath()
    ctx.moveTo(canvas.width / 4, 0)
    ctx.lineTo(canvas.width / 4, canvas.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(canvas.width * 0.75, 0)
    ctx.lineTo(canvas.width * 0.75, canvas.height)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, canvas.height / 4)
    ctx.lineTo(canvas.width, canvas.height / 4)
    ctx.stroke()

    ctx.beginPath()
    ctx.moveTo(0, canvas.height * 0.75)
    ctx.lineTo(canvas.width, canvas.height * 0.75)
    ctx.stroke()

    // Draw a pulsing dot for the scooter location
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Draw scooter location
    ctx.beginPath()
    ctx.arc(centerX, centerY, 6, 0, Math.PI * 2)
    ctx.fillStyle = "#06b6d4"
    ctx.fill()
    ctx.strokeStyle = "#0e7490"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw direction indicator
    ctx.beginPath()
    ctx.moveTo(centerX, centerY - 12)
    ctx.lineTo(centerX + 8, centerY)
    ctx.lineTo(centerX - 8, centerY)
    ctx.closePath()
    ctx.fillStyle = "#06b6d4"
    ctx.fill()

    // Add lat/lng labels
    ctx.font = "12px monospace"
    ctx.fillStyle = "#94a3b8"
    ctx.fillText(`Lat: ${lat.toFixed(6)}`, 10, 20)
    ctx.fillText(`Lng: ${lng.toFixed(6)}`, 10, 40)

    // Add a compass
    const compassX = canvas.width - 50
    const compassY = 50
    const compassRadius = 30

    ctx.beginPath()
    ctx.arc(compassX, compassY, compassRadius, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)"
    ctx.fill()
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 1
    ctx.stroke()

    // N
    ctx.beginPath()
    ctx.moveTo(compassX, compassY - 25)
    ctx.lineTo(compassX, compassY)
    ctx.strokeStyle = "#06b6d4"
    ctx.lineWidth = 2
    ctx.stroke()

    ctx.font = "10px monospace"
    ctx.fillStyle = "#e2e8f0"
    ctx.fillText("N", compassX - 3, compassY - 30)
    ctx.fillText("E", compassX + 30, compassY + 3)
    ctx.fillText("S", compassX - 3, compassY + 35)
    ctx.fillText("W", compassX - 35, compassY + 3)

    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = ""
      }
    }
  }, [lat, lng])

  return (
    <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm overflow-hidden">
      <CardContent className="p-0">
        <div style={{ height, position: "relative" }} ref={mapRef}>
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
            <div className="flex flex-col items-center">
              <Loader2 className="h-8 w-8 text-cyan-500 animate-spin" />
              <p className="mt-2 text-sm text-slate-300">{message}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
