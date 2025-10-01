"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"

interface ScooterMapProps {
  lat?: number
  lng?: number
}

export default function ScooterMap({ lat = 6.696449, lng = 79.985743 }: ScooterMapProps) {
  const [isClient, setIsClient] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !canvasRef.current) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Draw futuristic map background
    const drawMap = () => {
      if (!ctx) return

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "#0f172a")
      gradient.addColorStop(1, "#1e293b")
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

      // Draw pulse effect
      const time = Date.now() * 0.001
      const pulseSize = 10 + Math.sin(time * 2) * 5

      ctx.beginPath()
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(6, 182, 212, 0.3)"
      ctx.fill()

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

      // Request next frame
      requestAnimationFrame(drawMap)
    }

    // Start animation
    drawMap()

    // Handle resize
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth
        canvasRef.current.height = canvasRef.current.offsetHeight
      }
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [isClient, lat, lng])

  if (!isClient) {
    return (
      <div className="h-full w-full bg-slate-800 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-t-cyan-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading map...</p>
        </div>
      </div>
    )
  }

  return (
    <Card className="h-full w-full bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
      <CardContent className="p-0 h-full">
        <canvas ref={canvasRef} className="w-full h-full rounded-lg" />
      </CardContent>
    </Card>
  )
}
