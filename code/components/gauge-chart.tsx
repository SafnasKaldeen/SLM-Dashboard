"use client"

import { useEffect, useRef } from "react"

interface GaugeChartProps {
  value: number
  maxValue: number
  label: string
  units: string
  color: string
}

export function GaugeChart({ value, maxValue, label, units, color }: GaugeChartProps) {
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

    // Calculate angles
    const startAngle = Math.PI * 0.8
    const endAngle = Math.PI * 2.2
    const angleRange = endAngle - startAngle
    const valueAngle = startAngle + (value / maxValue) * angleRange

    // Clear canvas
    ctx.clearRect(0, 0, size, size)

    // Draw background arc
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.4, startAngle, endAngle)
    ctx.lineWidth = size * 0.08
    ctx.strokeStyle = "rgba(100, 116, 139, 0.2)"
    ctx.stroke()

    // Draw value arc
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.4, startAngle, valueAngle)
    ctx.lineWidth = size * 0.08
    ctx.strokeStyle = color
    ctx.stroke()

    // Draw center circle
    ctx.beginPath()
    ctx.arc(size / 2, size / 2, size * 0.3, 0, Math.PI * 2)
    ctx.fillStyle = "rgba(15, 23, 42, 0.7)"
    ctx.fill()

    // Draw value text
    ctx.font = `bold ${size * 0.15}px sans-serif`
    ctx.fillStyle = "#e2e8f0"
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    ctx.fillText(`${Math.round(value)}`, size / 2, size / 2 - size * 0.03)

    // Draw units text
    ctx.font = `${size * 0.08}px sans-serif`
    ctx.fillStyle = "#94a3b8"
    ctx.fillText(units, size / 2, size / 2 + size * 0.08)

    // Draw label text
    ctx.font = `${size * 0.08}px sans-serif`
    ctx.fillStyle = "#94a3b8"
    ctx.fillText(label, size / 2, size * 0.85)

    // Draw tick marks
    const tickCount = 5
    for (let i = 0; i <= tickCount; i++) {
      const tickAngle = startAngle + (i / tickCount) * angleRange
      const tickLength = i % tickCount === 0 ? size * 0.08 : size * 0.04

      const innerX = size / 2 + size * 0.35 * Math.cos(tickAngle)
      const innerY = size / 2 + size * 0.35 * Math.sin(tickAngle)
      const outerX = size / 2 + (size * 0.35 + tickLength) * Math.cos(tickAngle)
      const outerY = size / 2 + (size * 0.35 + tickLength) * Math.sin(tickAngle)

      ctx.beginPath()
      ctx.moveTo(innerX, innerY)
      ctx.lineTo(outerX, outerY)
      ctx.lineWidth = size * 0.01
      ctx.strokeStyle = "#475569"
      ctx.stroke()

      if (i % tickCount === 0 || i === tickCount) {
        const textX = size / 2 + (size * 0.35 + tickLength + size * 0.04) * Math.cos(tickAngle)
        const textY = size / 2 + (size * 0.35 + tickLength + size * 0.04) * Math.sin(tickAngle)

        ctx.font = `${size * 0.06}px sans-serif`
        ctx.fillStyle = "#94a3b8"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(`${Math.round((i / tickCount) * maxValue)}`, textX, textY)
      }
    }
  }, [value, maxValue, label, units, color])

  return <canvas ref={canvasRef} className="w-full max-w-[200px] h-auto" />
}
