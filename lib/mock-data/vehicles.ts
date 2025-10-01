export interface Vehicle {
  id: string
  model: string
  type: "scooter" | "bike" | "car"
  color: string
  batteryType: string
  batteryCapacity: number
  currentBatteryLevel: number
  status: "active" | "charging" | "maintenance" | "offline"
  location: {
    lat: number
    lng: number
    address: string
  }
  customer: {
    id: string
    name: string
    phone: string
    email: string
  } | null
  tboxData: {
    deviceId: string
    firmwareVersion: string
    signalStrength: number
    lastUpdate: string
    temperature: number
    voltage: number
    current: number
  }
  stats: {
    totalDistance: number
    totalRides: number
    totalSwaps: number
    efficiency: number
    uptime: number
  }
  createdAt: string
  lastSeen: string
}

export interface BatterySwap {
  id: string
  vehicleId: string
  stationId: string
  stationName: string
  oldBatteryId: string
  newBatteryId: string
  oldBatteryLevel: number
  newBatteryLevel: number
  swapTime: string
  duration: number // in seconds
  cost: number
}

export interface MaintenanceLog {
  id: string
  vehicleId: string
  type: "routine" | "repair" | "inspection" | "upgrade"
  description: string
  technician: string
  cost: number
  parts: string[]
  startTime: string
  endTime: string
  status: "completed" | "in-progress" | "scheduled"
  nextDue?: string
}

export interface HomeChargingLog {
  id: string
  vehicleId: string
  startTime: string
  endTime: string
  startLevel: number
  endLevel: number
  energyConsumed: number // kWh
  cost: number
  location: string
}

export interface RouteData {
  id: string
  vehicleId: string
  startTime: string
  endTime: string
  startLocation: { lat: number; lng: number; address: string }
  endLocation: { lat: number; lng: number; address: string }
  distance: number
  duration: number
  path: { lat: number; lng: number; timestamp: string }[]
  batteryUsed: number
  averageSpeed: number
}

// Mock data
export const mockVehicles: Vehicle[] = [
  {
    id: "VH001",
    model: "SL-Scooter Pro",
    type: "scooter",
    color: "Electric Blue",
    batteryType: "Li-ion 48V",
    batteryCapacity: 20,
    currentBatteryLevel: 85,
    status: "active",
    location: {
      lat: 40.7589,
      lng: -73.9851,
      address: "123 Main St, New York, NY",
    },
    customer: {
      id: "CU001",
      name: "John Doe",
      phone: "+1-555-0123",
      email: "john.doe@email.com",
    },
    tboxData: {
      deviceId: "TB001",
      firmwareVersion: "2.1.4",
      signalStrength: 85,
      lastUpdate: "2024-01-15T10:30:00Z",
      temperature: 25.5,
      voltage: 48.2,
      current: 12.5,
    },
    stats: {
      totalDistance: 2450,
      totalRides: 156,
      totalSwaps: 23,
      efficiency: 92,
      uptime: 98.5,
    },
    createdAt: "2023-06-15T08:00:00Z",
    lastSeen: "2024-01-15T10:30:00Z",
  },
  {
    id: "VH002",
    model: "SL-Scooter Lite",
    type: "scooter",
    color: "Midnight Black",
    batteryType: "Li-ion 36V",
    batteryCapacity: 15,
    currentBatteryLevel: 45,
    status: "charging",
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: "456 Broadway, New York, NY",
    },
    customer: null,
    tboxData: {
      deviceId: "TB002",
      firmwareVersion: "2.1.3",
      signalStrength: 78,
      lastUpdate: "2024-01-15T10:25:00Z",
      temperature: 28.2,
      voltage: 36.8,
      current: 8.3,
    },
    stats: {
      totalDistance: 1890,
      totalRides: 98,
      totalSwaps: 18,
      efficiency: 88,
      uptime: 96.2,
    },
    createdAt: "2023-07-20T09:15:00Z",
    lastSeen: "2024-01-15T10:25:00Z",
  },
  {
    id: "VH003",
    model: "SL-Bike Urban",
    type: "bike",
    color: "Forest Green",
    batteryType: "Li-ion 52V",
    batteryCapacity: 25,
    currentBatteryLevel: 92,
    status: "active",
    location: {
      lat: 40.7614,
      lng: -73.9776,
      address: "789 Park Ave, New York, NY",
    },
    customer: {
      id: "CU002",
      name: "Sarah Wilson",
      phone: "+1-555-0456",
      email: "sarah.wilson@email.com",
    },
    tboxData: {
      deviceId: "TB003",
      firmwareVersion: "2.2.1",
      signalStrength: 92,
      lastUpdate: "2024-01-15T10:35:00Z",
      temperature: 23.8,
      voltage: 52.1,
      current: 15.2,
    },
    stats: {
      totalDistance: 3200,
      totalRides: 201,
      totalSwaps: 31,
      efficiency: 94,
      uptime: 99.1,
    },
    createdAt: "2023-05-10T07:30:00Z",
    lastSeen: "2024-01-15T10:35:00Z",
  },
  {
    id: "VH004",
    model: "SL-Scooter Pro",
    type: "scooter",
    color: "Crimson Red",
    batteryType: "Li-ion 48V",
    batteryCapacity: 20,
    currentBatteryLevel: 15,
    status: "maintenance",
    location: {
      lat: 40.7282,
      lng: -73.9942,
      address: "321 Service Center, Brooklyn, NY",
    },
    customer: null,
    tboxData: {
      deviceId: "TB004",
      firmwareVersion: "2.1.4",
      signalStrength: 65,
      lastUpdate: "2024-01-14T16:20:00Z",
      temperature: 31.5,
      voltage: 47.8,
      current: 0,
    },
    stats: {
      totalDistance: 1650,
      totalRides: 89,
      totalSwaps: 15,
      efficiency: 85,
      uptime: 94.8,
    },
    createdAt: "2023-08-05T11:45:00Z",
    lastSeen: "2024-01-14T16:20:00Z",
  },
  {
    id: "VH005",
    model: "SL-Car Compact",
    type: "car",
    color: "Pearl White",
    batteryType: "Li-ion 400V",
    batteryCapacity: 60,
    currentBatteryLevel: 78,
    status: "active",
    location: {
      lat: 40.7505,
      lng: -73.9934,
      address: "654 Electric Ave, Manhattan, NY",
    },
    customer: {
      id: "CU003",
      name: "Michael Chen",
      phone: "+1-555-0789",
      email: "michael.chen@email.com",
    },
    tboxData: {
      deviceId: "TB005",
      firmwareVersion: "3.0.2",
      signalStrength: 88,
      lastUpdate: "2024-01-15T10:40:00Z",
      temperature: 22.1,
      voltage: 398.5,
      current: 45.8,
    },
    stats: {
      totalDistance: 5680,
      totalRides: 78,
      totalSwaps: 42,
      efficiency: 96,
      uptime: 97.3,
    },
    createdAt: "2023-04-12T14:20:00Z",
    lastSeen: "2024-01-15T10:40:00Z",
  },
]

export const mockBatterySwaps: BatterySwap[] = [
  {
    id: "BS001",
    vehicleId: "VH001",
    stationId: "BSS_001",
    stationName: "Downtown Hub",
    oldBatteryId: "BAT_001",
    newBatteryId: "BAT_045",
    oldBatteryLevel: 12,
    newBatteryLevel: 98,
    swapTime: "2024-01-15T09:15:00Z",
    duration: 45,
    cost: 8.5,
  },
  {
    id: "BS002",
    vehicleId: "VH001",
    stationId: "BSS_003",
    stationName: "Shopping Mall",
    oldBatteryId: "BAT_045",
    newBatteryId: "BAT_067",
    oldBatteryLevel: 8,
    newBatteryLevel: 95,
    swapTime: "2024-01-14T14:30:00Z",
    duration: 38,
    cost: 8.5,
  },
  {
    id: "BS003",
    vehicleId: "VH003",
    stationId: "BSS_002",
    stationName: "University Campus",
    oldBatteryId: "BAT_023",
    newBatteryId: "BAT_089",
    oldBatteryLevel: 15,
    newBatteryLevel: 97,
    swapTime: "2024-01-13T11:45:00Z",
    duration: 52,
    cost: 12.0,
  },
]

export const mockMaintenanceLogs: MaintenanceLog[] = [
  {
    id: "ML001",
    vehicleId: "VH001",
    type: "routine",
    description: "Regular maintenance check - brake adjustment, tire pressure",
    technician: "Alex Rodriguez",
    cost: 45.0,
    parts: ["brake pads", "tire valve"],
    startTime: "2024-01-10T08:00:00Z",
    endTime: "2024-01-10T10:30:00Z",
    status: "completed",
    nextDue: "2024-04-10T08:00:00Z",
  },
  {
    id: "ML002",
    vehicleId: "VH004",
    type: "repair",
    description: "Motor controller replacement due to overheating",
    technician: "Maria Santos",
    cost: 285.0,
    parts: ["motor controller", "thermal paste", "cooling fan"],
    startTime: "2024-01-14T13:00:00Z",
    endTime: "2024-01-15T11:00:00Z",
    status: "in-progress",
  },
  {
    id: "ML003",
    vehicleId: "VH003",
    type: "inspection",
    description: "Safety inspection and performance test",
    technician: "David Kim",
    cost: 25.0,
    parts: [],
    startTime: "2024-01-12T14:00:00Z",
    endTime: "2024-01-12T15:30:00Z",
    status: "completed",
    nextDue: "2024-07-12T14:00:00Z",
  },
]

export const mockHomeChargingLogs: HomeChargingLog[] = [
  {
    id: "HC001",
    vehicleId: "VH001",
    startTime: "2024-01-14T22:00:00Z",
    endTime: "2024-01-15T06:00:00Z",
    startLevel: 25,
    endLevel: 100,
    energyConsumed: 15.2,
    cost: 4.56,
    location: "Home Garage - 123 Main St",
  },
  {
    id: "HC002",
    vehicleId: "VH003",
    startTime: "2024-01-13T20:30:00Z",
    endTime: "2024-01-14T05:30:00Z",
    startLevel: 18,
    endLevel: 95,
    energyConsumed: 19.8,
    cost: 5.94,
    location: "Home Driveway - 789 Park Ave",
  },
  {
    id: "HC003",
    vehicleId: "VH005",
    startTime: "2024-01-12T23:15:00Z",
    endTime: "2024-01-13T07:45:00Z",
    startLevel: 32,
    endLevel: 88,
    energyConsumed: 33.6,
    cost: 10.08,
    location: "Home Garage - 654 Electric Ave",
  },
]

export const mockRouteData: RouteData[] = [
  {
    id: "RT001",
    vehicleId: "VH001",
    startTime: "2024-01-15T08:30:00Z",
    endTime: "2024-01-15T09:15:00Z",
    startLocation: {
      lat: 40.7589,
      lng: -73.9851,
      address: "123 Main St, New York, NY",
    },
    endLocation: {
      lat: 40.7614,
      lng: -73.9776,
      address: "789 Park Ave, New York, NY",
    },
    distance: 2.8,
    duration: 45,
    path: [
      { lat: 40.7589, lng: -73.9851, timestamp: "2024-01-15T08:30:00Z" },
      { lat: 40.7595, lng: -73.984, timestamp: "2024-01-15T08:35:00Z" },
      { lat: 40.7605, lng: -73.982, timestamp: "2024-01-15T08:45:00Z" },
      { lat: 40.7614, lng: -73.9776, timestamp: "2024-01-15T09:15:00Z" },
    ],
    batteryUsed: 8,
    averageSpeed: 22.5,
  },
  {
    id: "RT002",
    vehicleId: "VH003",
    startTime: "2024-01-14T16:20:00Z",
    endTime: "2024-01-14T17:05:00Z",
    startLocation: {
      lat: 40.7614,
      lng: -73.9776,
      address: "789 Park Ave, New York, NY",
    },
    endLocation: {
      lat: 40.7505,
      lng: -73.9934,
      address: "456 Broadway, New York, NY",
    },
    distance: 3.2,
    duration: 45,
    path: [
      { lat: 40.7614, lng: -73.9776, timestamp: "2024-01-14T16:20:00Z" },
      { lat: 40.758, lng: -73.982, timestamp: "2024-01-14T16:30:00Z" },
      { lat: 40.755, lng: -73.988, timestamp: "2024-01-14T16:45:00Z" },
      { lat: 40.7505, lng: -73.9934, timestamp: "2024-01-14T17:05:00Z" },
    ],
    batteryUsed: 12,
    averageSpeed: 18.7,
  },
]
