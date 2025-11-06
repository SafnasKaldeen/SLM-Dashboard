"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, AlertTriangle, CheckCircle2, Clock } from "lucide-react"

export function FleetMaintenanceTable() {
  const [page, setPage] = useState(1)
  const itemsPerPage = 5

  // Sample maintenance data
  const maintenanceData = [
    {
      id: "M-1001",
      vehicleId: "EV-042",
      type: "Routine Inspection",
      status: "overdue",
      dueDate: "2024-02-10",
      assignedTo: "John Smith",
    },
    {
      id: "M-1002",
      vehicleId: "EV-087",
      type: "Battery Replacement",
      status: "scheduled",
      dueDate: "2024-02-15",
      assignedTo: "Sarah Johnson",
    },
    {
      id: "M-1003",
      vehicleId: "EV-103",
      type: "Motor Diagnostics",
      status: "in-progress",
      dueDate: "2024-02-12",
      assignedTo: "Mike Chen",
    },
    {
      id: "M-1004",
      vehicleId: "EV-056",
      type: "Tire Replacement",
      status: "scheduled",
      dueDate: "2024-02-18",
      assignedTo: "Lisa Wong",
    },
    {
      id: "M-1005",
      vehicleId: "EV-124",
      type: "Software Update",
      status: "completed",
      dueDate: "2024-02-08",
      assignedTo: "David Miller",
    },
    {
      id: "M-1006",
      vehicleId: "EV-078",
      type: "Brake Inspection",
      status: "overdue",
      dueDate: "2024-02-05",
      assignedTo: "James Wilson",
    },
    {
      id: "M-1007",
      vehicleId: "EV-091",
      type: "Suspension Check",
      status: "scheduled",
      dueDate: "2024-02-20",
      assignedTo: "Emily Davis",
    },
  ]

  const totalPages = Math.ceil(maintenanceData.length / itemsPerPage)
  const startIndex = (page - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentItems = maintenanceData.slice(startIndex, endIndex)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" /> Overdue
          </Badge>
        )
      case "scheduled":
        return (
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50 flex items-center gap-1">
            <Calendar className="h-3 w-3" /> Scheduled
          </Badge>
        )
      case "in-progress":
        return (
          <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50 flex items-center gap-1">
            <Clock className="h-3 w-3" /> In Progress
          </Badge>
        )
      case "completed":
        return (
          <Badge className="bg-green-500/20 text-green-400 border-green-500/50 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Completed
          </Badge>
        )
      default:
        return <Badge>{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  return (
    <div>
      <div className="rounded-md border border-slate-700/50 overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-800/50">
            <TableRow className="border-slate-700/50">
              <TableHead className="text-slate-400">ID</TableHead>
              <TableHead className="text-slate-400">Vehicle</TableHead>
              <TableHead className="text-slate-400">Maintenance Type</TableHead>
              <TableHead className="text-slate-400">Status</TableHead>
              <TableHead className="text-slate-400">Due Date</TableHead>
              <TableHead className="text-slate-400">Assigned To</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((item) => (
              <TableRow key={item.id} className="border-slate-700/30 hover:bg-slate-800/30">
                <TableCell className="font-medium text-slate-300">{item.id}</TableCell>
                <TableCell className="text-slate-300">{item.vehicleId}</TableCell>
                <TableCell className="text-slate-300">{item.type}</TableCell>
                <TableCell>{getStatusBadge(item.status)}</TableCell>
                <TableCell className="text-slate-300">{formatDate(item.dueDate)}</TableCell>
                <TableCell className="text-slate-300">{item.assignedTo}</TableCell>
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
          <ChevronLeft className="h-4 w-4 mr-1" />
          Previous
        </Button>
        <div className="text-sm text-slate-400">
          Page {page} of {totalPages}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
          disabled={page === totalPages}
          className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
        >
          Next
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
