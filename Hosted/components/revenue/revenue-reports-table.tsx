"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreHorizontal, Search, ArrowUpDown } from "lucide-react"

interface RevenueRecord {
  id: string
  date: string
  vehicleId: string
  vehicleType: string
  route: string
  duration: number
  distance: number
  revenue: number
  paymentMethod: string
  customerSegment: string
  status: "completed" | "refunded" | "disputed"
}

const mockData: RevenueRecord[] = [
  {
    id: "TXN-001",
    date: "2024-01-15",
    vehicleId: "SC-001",
    vehicleType: "E-Scooter",
    route: "Downtown → University",
    duration: 25,
    distance: 3.2,
    revenue: 8.5,
    paymentMethod: "Credit Card",
    customerSegment: "Regular User",
    status: "completed",
  },
  {
    id: "TXN-002",
    date: "2024-01-15",
    vehicleId: "EB-045",
    vehicleType: "E-Bike",
    route: "Business District → Airport",
    duration: 45,
    distance: 8.7,
    revenue: 15.25,
    paymentMethod: "Mobile Payment",
    customerSegment: "Premium Member",
    status: "completed",
  },
  {
    id: "TXN-003",
    date: "2024-01-14",
    vehicleId: "EM-012",
    vehicleType: "E-Moped",
    route: "Tourist Zone → Beach",
    duration: 35,
    distance: 5.4,
    revenue: 12.75,
    paymentMethod: "Subscription",
    customerSegment: "Tourist",
    status: "refunded",
  },
  // Add more mock data...
]

export function RevenueReportsTable() {
  const [data, setData] = useState(mockData)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<keyof RevenueRecord>("date")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")

  const handleSort = (field: keyof RevenueRecord) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const filteredAndSortedData = data
    .filter((record) =>
      Object.values(record).some((value) => value.toString().toLowerCase().includes(searchTerm.toLowerCase())),
    )
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      if (typeof aValue === "number" && typeof bValue === "number") {
        return sortDirection === "asc" ? aValue - bValue : bValue - aValue
      }

      return 0
    })

  const getStatusBadge = (status: RevenueRecord["status"]) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">Completed</Badge>
      case "refunded":
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">Refunded</Badge>
      case "disputed":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">Disputed</Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredAndSortedData.length} of {data.length} transactions
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("id")} className="h-auto p-0 font-medium">
                  Transaction ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("date")} className="h-auto p-0 font-medium">
                  Date
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Vehicle</TableHead>
              <TableHead>Route</TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("duration")} className="h-auto p-0 font-medium">
                  Duration
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("revenue")} className="h-auto p-0 font-medium">
                  Revenue
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Payment</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium">{record.id}</TableCell>
                <TableCell>{record.date}</TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.vehicleId}</div>
                    <div className="text-sm text-muted-foreground">{record.vehicleType}</div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <div className="font-medium">{record.route}</div>
                    <div className="text-sm text-muted-foreground">{record.distance} km</div>
                  </div>
                </TableCell>
                <TableCell>{record.duration} min</TableCell>
                <TableCell className="font-medium">${record.revenue.toFixed(2)}</TableCell>
                <TableCell>{record.paymentMethod}</TableCell>
                <TableCell>{record.customerSegment}</TableCell>
                <TableCell>{getStatusBadge(record.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Export</DropdownMenuItem>
                      <DropdownMenuItem>Refund</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
