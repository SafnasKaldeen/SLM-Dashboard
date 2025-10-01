"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

// Mock data - replace with your actual data
const mockScooters = [
  { id: "SCT-001", status: "active", battery: 87, lastSeen: "2 mins ago", location: "Downtown" },
  { id: "SCT-002", status: "active", battery: 65, lastSeen: "5 mins ago", location: "North Park" },
  { id: "SCT-003", status: "inactive", battery: 12, lastSeen: "3 hours ago", location: "West End" },
  { id: "SCT-004", status: "maintenance", battery: 54, lastSeen: "1 day ago", location: "South Side" },
  { id: "SCT-005", status: "active", battery: 92, lastSeen: "1 min ago", location: "East Village" },
]

export default function ScooterStatusTable() {
  const [page, setPage] = useState(1)
  const itemsPerPage = 5
  const totalPages = Math.ceil(mockScooters.length / itemsPerPage)

  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = mockScooters.slice(startIndex, endIndex)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-900/30 text-green-400 border-green-500/30"
      case "inactive":
        return "bg-slate-800/50 text-slate-400 border-slate-600/30"
      case "maintenance":
        return "bg-amber-900/30 text-amber-400 border-amber-500/30"
      default:
        return "bg-slate-800/50 text-slate-400 border-slate-600/30"
    }
  }

  const getBatteryColor = (level: number) => {
    if (level < 20) return "text-red-400"
    if (level < 50) return "text-amber-400"
    return "text-green-400"
  }

  return (
    <div>
      <div className="rounded-md border border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow className="border-slate-700/50">
              <TableHead className="text-slate-400">Scooter ID</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Battery</TableHead>
              <TableHead className="text-slate-400">Last Seen</TableHead>
              <TableHead className="text-slate-400">Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((scooter) => (
              <TableRow key={scooter.id} className="border-slate-700/30 hover:bg-slate-800/30">
                <TableCell className="font-medium text-slate-300">{scooter.id}</TableCell>
                <TableCell>
                  <Badge className={getStatusColor(scooter.status)} variant="outline">
                    {scooter.status}
                  </Badge>
                </TableCell>
                <TableCell className={getBatteryColor(scooter.battery)}>{scooter.battery}%</TableCell>
                <TableCell className="text-slate-400">{scooter.lastSeen}</TableCell>
                <TableCell className="text-slate-400">{scooter.location}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page > 1 ? page - 1 : 1)}
          disabled={page === 1}
          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          disabled={page === totalPages}
          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
