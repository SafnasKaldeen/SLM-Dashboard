"use client"

import { useEffect, useRef } from "react"

interface BatteryGaugeProps {
  percentage: number
}

export function BatteryGauge({ percentage }: BatteryGaugeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    const size = 200
    canvas.width = size
    canvas.height = size

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Battery body
    const batteryWidth = size * 0.6
    const batteryHeight = size * 0.3
    const batteryX = (size - batteryWidth) / 2
    const batteryY = (size - batteryHeight) / 2
    const cornerRadius = size * 0.02

    // Battery terminal
    const terminalWidth = size * 0.06
    const terminalHeight = size * 0.15
    const terminalX = batteryX + batteryWidth
    const terminalY = size / 2 - terminalHeight / 2

    // Draw battery outline
    ctx.beginPath()
    ctx.moveTo(batteryX + cornerRadius, batteryY)
    ctx.lineTo(batteryX + batteryWidth - cornerRadius, batteryY)
    ctx.arcTo(batteryX + batteryWidth, batteryY, batteryX + batteryWidth, batteryY + cornerRadius, cornerRadius)
    ctx.lineTo(batteryX + batteryWidth, batteryY + batteryHeight - cornerRadius)
    ctx.arcTo(
      batteryX + batteryWidth,
      batteryY + batteryHeight,
      batteryX + batteryWidth - cornerRadius,
      batteryY + batteryHeight,
      cornerRadius,
    )
    ctx.lineTo(batteryX + cornerRadius, batteryY + batteryHeight)
    ctx.arcTo(batteryX, batteryY + batteryHeight, batteryX, batteryY + batteryHeight - cornerRadius, cornerRadius)
    ctx.lineTo(batteryX, batteryY + cornerRadius)
    ctx.arcTo(batteryX, batteryY, batteryX + cornerRadius, batteryY, cornerRadius)
    ctx.closePath()
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)"
    ctx.fill()
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw battery terminal
    ctx.beginPath()
    ctx.moveTo(terminalX, terminalY + cornerRadius)
    ctx.lineTo(terminalX, terminalY + terminalHeight - cornerRadius)
    ctx.arcTo(terminalX, terminalY + terminalHeight, terminalX + cornerRadius, terminalY + terminalHeight, cornerRadius)
    ctx.lineTo(terminalX + terminalWidth - cornerRadius, terminalY + terminalHeight)
    ctx.arcTo(
      terminalX + terminalWidth,
      terminalY + terminalHeight,
      terminalX + terminalWidth,
      terminalY + terminalHeight - cornerRadius,
      cornerRadius,
    )
    ctx.lineTo(terminalX + terminalWidth, terminalY + cornerRadius)
    ctx.arcTo(terminalX + terminalWidth, terminalY, terminalX + terminalWidth - cornerRadius, terminalY, cornerRadius)
    ctx.lineTo(terminalX + cornerRadius, terminalY)
    ctx.arcTo(terminalX, terminalY, terminalX, terminalY + cornerRadius, cornerRadius)
    ctx.closePath()
    ctx.fillStyle = "rgba(30, 41, 59, 0.8)"
    ctx.fill()
    ctx.strokeStyle = "#475569"
    ctx.lineWidth = 2
    ctx.stroke()

    // Draw battery level
    const padding = size * 0.02
    const levelWidth = (batteryWidth - padding * 2) * (percentage / 100)
    const levelHeight = batteryHeight - padding * 2
    const levelX = batteryX + padding
    const levelY = batteryY + padding
    const levelCornerRadius = size * 0.01

    // Get color based on percentage
    let levelColor
    if (percentage > 60) {
      levelColor = "#10b981" // Green
    } else if (percentage > 30) {
      levelColor = "#f59e0b" // Amber
    } else {
      levelColor = "#ef4444" // Red
    }

    // Draw battery level
    ctx.beginPath()
    ctx.moveTo(levelX + levelCornerRadius, levelY)
    ctx.lineTo(levelX + levelWidth - levelCornerRadius, levelY)
    ctx.arcTo(levelX + levelWidth, levelY, levelX + levelWidth, levelY + levelCornerRadius, levelCornerRadius)
    ctx.lineTo(levelX + levelWidth, levelY + levelHeight - levelCornerRadius)
    ctx.arcTo(
      levelX + levelWidth,
      levelY + levelHeight,
      levelX + levelWidth - levelCornerRadius,
      levelY + levelHeight,
      levelCornerRadius,
    )
    ctx.lineTo(levelX + levelCornerRadius, levelY + levelHeight)
    ctx.arcTo(levelX, levelY + levelHeight, levelX, levelY + levelHeight - levelCornerRadius, levelCornerRadius)
    ctx.lineTo(levelX, levelY + levelCornerRadius)
    ctx.arcTo(levelX, levelY, levelX + levelCornerRadius, levelY, levelCornerRadius)
    ctx.closePath()

    // Create gradient
    const gradient = ctx.createLinearGradient(levelX, levelY, levelX + levelWidth, levelY)
    if (percentage > 60) {
      gradient.addColorStop(0, "#10b981") // Green
      gradient.addColorStop(1, "#06b6d4") // Cyan
    } else if (percentage > 30) {
      gradient.addColorStop(0, "#f59e0b") // Amber
      gradient.addColorStop(1, "#fb923c") // Orange
    } else {
      gradient.addColorStop(0, "#ef4444") // Red
      gradient.addColorStop(1, "#f43f5e") // Rose
    }

    ctx.fillStyle = gradient
    ctx.fill()

    // Add battery segments
    const segmentCount = 5
    const segmentWidth = (batteryWidth - padding * 2) / segmentCount

    for (let i = 1; i < segmentCount; i++) {
      const segmentX = levelX + segmentWidth * i

      if (segmentX < levelX + levelWidth) {
        ctx.beginPath()
        ctx.moveTo(segmentX, levelY)
        ctx.lineTo(segmentX, levelY + levelHeight)
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 1
        ctx.stroke()
      }
    }

    // Add shine effect
    ctx.beginPath()
    ctx.moveTo(levelX, levelY + levelHeight * 0.2)
    ctx.lineTo(levelX + levelWidth, levelY + levelHeight * 0.2)
    ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
    ctx.lineWidth = 1
    ctx.stroke()

    // Add battery icon
    if (percentage > 80) {
      // Lightning bolt for charging/full
      const boltX = size / 2
      const boltY = size * 0.7
      const boltWidth = size * 0.1
      const boltHeight = size * 0.15

      ctx.beginPath()
      ctx.moveTo(boltX - boltWidth * 0.3, boltY)
      ctx.lineTo(boltX + boltWidth * 0.2, boltY)
      ctx.lineTo(boltX, boltY + boltHeight * 0.6)
      ctx.lineTo(boltX + boltWidth * 0.3, boltY + boltHeight * 0.6)
      ctx.lineTo(boltX - boltWidth * 0.2, boltY + boltHeight)
      ctx.lineTo(boltX, boltY + boltHeight * 0.4)
      ctx.lineTo(boltX - boltWidth * 0.3, boltY + boltHeight * 0.4)
      ctx.closePath()

      ctx.fillStyle = "#f0f9ff"
      ctx.fill()
    }
  }, [percentage])

  return <canvas ref={canvasRef} className="w-full max-w-[200px] h-auto" />
}
