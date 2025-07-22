import type React from "react"
import { cn } from "@/lib/utils"

interface StatusItemProps {
  label: string
  value: string | number
  status?: "normal" | "warning" | "critical"
  icon?: React.ReactNode
}

export default function StatusItem({ label, value, status = "normal", icon }: StatusItemProps) {
  return (
    <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
      {icon && (
        <div
          className={cn(
            "p-2 rounded-full",
            status === "normal" && "bg-green-900/30 text-green-400",
            status === "warning" && "bg-amber-900/30 text-amber-400",
            status === "critical" && "bg-red-900/30 text-red-400",
          )}
        >
          {icon}
        </div>
      )}
      <div>
        <p className="text-sm font-medium text-slate-400">{label}</p>
        <p
          className={cn(
            "text-lg font-bold",
            status === "normal" && "text-green-400",
            status === "warning" && "text-amber-400",
            status === "critical" && "text-red-400",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  )
}
