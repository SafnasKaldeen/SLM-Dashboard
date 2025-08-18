export interface Vehicle {
  VEHICLE_ID: string
  VIN: string
  MODEL: string
  BATTERY_TYPE: string
  STATUS: "ACTIVE" | "INACTIVE" | "MAINTENANCE"
  REGION: string
  CREATED_DATE: string
  CUSTOMER_ID?: string
  CUSTOMER_NAME?: string
  EMAIL?: string
  PHONE?: string
  LATITUDE?: number
  LONGITUDE?: number
  ADDRESS?: string
  LAST_LOCATION_UPDATE?: string
  TOTAL_SWAPS_DAILY: number
  TOTAL_SWAPS_MONTHLY: number
  TOTAL_SWAPS_LIFETIME: number
  TOTAL_CHARGING_SESSIONS: number
  AVG_CHARGING_DURATION: number
  AVG_DISTANCE_PER_DAY: number
  TOTAL_DISTANCE: number
  AVG_SPEED: number
  SWAPPING_REVENUE: number
  CHARGING_REVENUE: number
  TOTAL_REVENUE: number
}

export interface ChargingPattern {
  HOUR_OF_DAY: number
  SESSION_COUNT: number
  AVG_DURATION: number
  AVG_ENERGY: number
  AVG_COST: number
}

export interface SwappingHistory {
  SWAP_DATE: string
  SWAP_TIME: string
  STATION_NAME: string
  LOCATION: string
  OLD_BATTERY_ID: string
  OLD_BATTERY_HEALTH: number
  NEW_BATTERY_ID: string
  NEW_BATTERY_HEALTH: number
  SWAP_DURATION_SECONDS: number
  SWAP_COST: number
}

export interface GPSAnalytics {
  TRAVEL_DATE: string
  FIRST_LOCATION_TIME: string
  LAST_LOCATION_TIME: string
  LOCATION_POINTS: number
  TOTAL_DISTANCE: number
  AVG_SPEED: number
  MAX_SPEED: number
  IDLE_POINTS: number
  ROUTE_EFFICIENCY: number
}

export interface BatteryHealth {
  BATTERY_ID: string
  BATTERY_TYPE: string
  CAPACITY_KWH: number
  HEALTH_PERCENTAGE: number
  CYCLE_COUNT: number
  LAST_MAINTENANCE_DATE: string
  REPLACEMENT_DATE?: string
  TOTAL_SWAPS: number
  LAST_SWAP_DATE: string
}

export interface FleetKPIs {
  TOTAL_VEHICLES: number
  CHARGING_SESSIONS: number
  CHARGING_REVENUE: number
  CO2_SAVED: number
}

// Generate mock vehicles
export const mockVehicles: Vehicle[] = [
  {
    VEHICLE_ID: "EV001",
    VIN: "1HGBH41JXMN109186",
    MODEL: "Tesla Model 3",
    BATTERY_TYPE: "Lithium-Ion",
    STATUS: "ACTIVE",
    REGION: "North",
    CREATED_DATE: "2023-01-15T08:00:00Z",
    CUSTOMER_ID: "CUST001",
    CUSTOMER_NAME: "John Smith",
    EMAIL: "john.smith@email.com",
    PHONE: "+1-555-0123",
    LATITUDE: 40.7589,
    LONGITUDE: -73.9851,
    ADDRESS: "123 Main St, New York, NY",
    LAST_LOCATION_UPDATE: "2024-01-15T10:30:00Z",
    TOTAL_SWAPS_DAILY: 2,
    TOTAL_SWAPS_MONTHLY: 45,
    TOTAL_SWAPS_LIFETIME: 234,
    TOTAL_CHARGING_SESSIONS: 89,
    AVG_CHARGING_DURATION: 45.5,
    AVG_DISTANCE_PER_DAY: 85.2,
    TOTAL_DISTANCE: 2556,
    AVG_SPEED: 32.4,
    SWAPPING_REVENUE: 1250.75,
    CHARGING_REVENUE: 445.2,
    TOTAL_REVENUE: 1695.95,
  },
  {
    VEHICLE_ID: "EV002",
    VIN: "2HGBH41JXMN109187",
    MODEL: "Tesla Model Y",
    BATTERY_TYPE: "Lithium-Ion",
    STATUS: "ACTIVE",
    REGION: "South",
    CREATED_DATE: "2023-02-20T09:15:00Z",
    CUSTOMER_ID: "CUST002",
    CUSTOMER_NAME: "Sarah Johnson",
    EMAIL: "sarah.johnson@email.com",
    PHONE: "+1-555-0456",
    LATITUDE: 40.7505,
    LONGITUDE: -73.9934,
    ADDRESS: "456 Broadway, New York, NY",
    LAST_LOCATION_UPDATE: "2024-01-15T11:15:00Z",
    TOTAL_SWAPS_DAILY: 1,
    TOTAL_SWAPS_MONTHLY: 38,
    TOTAL_SWAPS_LIFETIME: 198,
    TOTAL_CHARGING_SESSIONS: 76,
    AVG_CHARGING_DURATION: 52.3,
    AVG_DISTANCE_PER_DAY: 92.8,
    TOTAL_DISTANCE: 2784,
    AVG_SPEED: 28.7,
    SWAPPING_REVENUE: 1089.5,
    CHARGING_REVENUE: 380.4,
    TOTAL_REVENUE: 1469.9,
  },
  {
    VEHICLE_ID: "EV003",
    VIN: "3HGBH41JXMN109188",
    MODEL: "BMW iX",
    BATTERY_TYPE: "LiFePO4",
    STATUS: "CHARGING",
    REGION: "East",
    CREATED_DATE: "2023-03-10T14:30:00Z",
    LATITUDE: 40.7614,
    LONGITUDE: -73.9776,
    ADDRESS: "789 Park Ave, New York, NY",
    LAST_LOCATION_UPDATE: "2024-01-15T09:45:00Z",
    TOTAL_SWAPS_DAILY: 0,
    TOTAL_SWAPS_MONTHLY: 42,
    TOTAL_SWAPS_LIFETIME: 267,
    TOTAL_CHARGING_SESSIONS: 95,
    AVG_CHARGING_DURATION: 38.7,
    AVG_DISTANCE_PER_DAY: 78.5,
    TOTAL_DISTANCE: 2355,
    AVG_SPEED: 35.2,
    SWAPPING_REVENUE: 1456.25,
    CHARGING_REVENUE: 475.8,
    TOTAL_REVENUE: 1932.05,
  },
  {
    VEHICLE_ID: "EV004",
    VIN: "4HGBH41JXMN109189",
    MODEL: "Audi e-tron",
    BATTERY_TYPE: "Solid State",
    STATUS: "MAINTENANCE",
    REGION: "West",
    CREATED_DATE: "2023-04-05T11:20:00Z",
    LATITUDE: 40.7282,
    LONGITUDE: -73.9942,
    ADDRESS: "321 Service Center, Brooklyn, NY",
    LAST_LOCATION_UPDATE: "2024-01-14T16:20:00Z",
    TOTAL_SWAPS_DAILY: 0,
    TOTAL_SWAPS_MONTHLY: 15,
    TOTAL_SWAPS_LIFETIME: 156,
    TOTAL_CHARGING_SESSIONS: 45,
    AVG_CHARGING_DURATION: 65.2,
    AVG_DISTANCE_PER_DAY: 45.3,
    TOTAL_DISTANCE: 1359,
    AVG_SPEED: 25.8,
    SWAPPING_REVENUE: 567.75,
    CHARGING_REVENUE: 225.6,
    TOTAL_REVENUE: 793.35,
  },
  {
    VEHICLE_ID: "EV005",
    VIN: "5HGBH41JXMN109190",
    MODEL: "Mercedes EQS",
    BATTERY_TYPE: "Lithium-Ion",
    STATUS: "ACTIVE",
    REGION: "North",
    CREATED_DATE: "2023-05-12T16:45:00Z",
    CUSTOMER_ID: "CUST003",
    CUSTOMER_NAME: "Michael Chen",
    EMAIL: "michael.chen@email.com",
    PHONE: "+1-555-0789",
    LATITUDE: 40.7505,
    LONGITUDE: -73.9934,
    ADDRESS: "654 Electric Ave, Manhattan, NY",
    LAST_LOCATION_UPDATE: "2024-01-15T12:10:00Z",
    TOTAL_SWAPS_DAILY: 3,
    TOTAL_SWAPS_MONTHLY: 52,
    TOTAL_SWAPS_LIFETIME: 289,
    TOTAL_CHARGING_SESSIONS: 112,
    AVG_CHARGING_DURATION: 42.8,
    AVG_DISTANCE_PER_DAY: 105.7,
    TOTAL_DISTANCE: 3171,
    AVG_SPEED: 38.9,
    SWAPPING_REVENUE: 1789.5,
    CHARGING_REVENUE: 560.8,
    TOTAL_REVENUE: 2350.3,
  },
]

// Generate additional mock vehicles
for (let i = 6; i <= 50; i++) {
  const models = [
    "Tesla Model 3",
    "Tesla Model Y",
    "BMW iX",
    "Audi e-tron",
    "Mercedes EQS",
    "Nissan Leaf",
    "Hyundai Ioniq",
  ]
  const batteryTypes = ["Lithium-Ion", "LiFePO4", "Solid State"]
  const statuses: Array<"ACTIVE" | "INACTIVE" | "MAINTENANCE"> = [
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "ACTIVE",
    "INACTIVE",
    "MAINTENANCE",
  ]
  const regions = ["North", "South", "East", "West"]

  const model = models[Math.floor(Math.random() * models.length)]
  const batteryType = batteryTypes[Math.floor(Math.random() * batteryTypes.length)]
  const status = statuses[Math.floor(Math.random() * statuses.length)]
  const region = regions[Math.floor(Math.random() * regions.length)]

  const dailySwaps = Math.floor(Math.random() * 4)
  const monthlySwaps = dailySwaps * 30 + Math.floor(Math.random() * 20)
  const lifetimeSwaps = monthlySwaps * 8 + Math.floor(Math.random() * 100)
  const chargingSessions = Math.floor(Math.random() * 150) + 20
  const avgDistance = Math.random() * 120 + 30
  const totalDistance = avgDistance * 30
  const swappingRevenue = monthlySwaps * (Math.random() * 15 + 20)
  const chargingRevenue = chargingSessions * (Math.random() * 8 + 3)

  mockVehicles.push({
    VEHICLE_ID: `EV${i.toString().padStart(3, "0")}`,
    VIN: `${i}HGBH41JXMN10918${i}`,
    MODEL: model,
    BATTERY_TYPE: batteryType,
    STATUS: status,
    REGION: region,
    CREATED_DATE: `2023-${Math.floor(Math.random() * 12) + 1}-${Math.floor(Math.random() * 28) + 1}T${Math.floor(Math.random() * 24)}:${Math.floor(Math.random() * 60)}:00Z`,
    CUSTOMER_ID: status === "ACTIVE" ? `CUST${i.toString().padStart(3, "0")}` : undefined,
    CUSTOMER_NAME: status === "ACTIVE" ? `Customer ${i}` : undefined,
    EMAIL: status === "ACTIVE" ? `customer${i}@email.com` : undefined,
    PHONE: status === "ACTIVE" ? `+1-555-${Math.floor(Math.random() * 9000) + 1000}` : undefined,
    LATITUDE: 40.7 + (Math.random() - 0.5) * 0.2,
    LONGITUDE: -73.9 + (Math.random() - 0.5) * 0.2,
    ADDRESS: `${Math.floor(Math.random() * 999) + 1} Street ${i}, New York, NY`,
    LAST_LOCATION_UPDATE: "2024-01-15T10:30:00Z",
    TOTAL_SWAPS_DAILY: dailySwaps,
    TOTAL_SWAPS_MONTHLY: monthlySwaps,
    TOTAL_SWAPS_LIFETIME: lifetimeSwaps,
    TOTAL_CHARGING_SESSIONS: chargingSessions,
    AVG_CHARGING_DURATION: Math.random() * 30 + 30,
    AVG_DISTANCE_PER_DAY: avgDistance,
    TOTAL_DISTANCE: totalDistance,
    AVG_SPEED: Math.random() * 20 + 25,
    SWAPPING_REVENUE: swappingRevenue,
    CHARGING_REVENUE: chargingRevenue,
    TOTAL_REVENUE: swappingRevenue + chargingRevenue,
  })
}

export const mockFleetKPIs: FleetKPIs = {
  TOTAL_VEHICLES: mockVehicles.length,

  // Sum of all charging sessions
  CHARGING_SESSIONS: mockVehicles.reduce(
    (sum, v) => sum + v.TOTAL_CHARGING_SESSIONS,
    0
  ),

  // Sum of charging revenue
  CHARGING_REVENUE: mockVehicles.reduce(
    (sum, v) => sum + v.CHARGING_REVENUE,
    0
  ),

  // Approximate CO2 saved based on distance (assuming 0.12 kg CO2 per km avoided vs ICE)
  CO2_SAVED: mockVehicles.reduce(
    (sum, v) => sum + v.TOTAL_DISTANCE * 0.12,
    0
  ),
}


export const mockHomeChargingIncrease = [
  { percentageRange: "0-5", vehicleCount: 28, percentage: 2.5 },
  { percentageRange: "5-10", vehicleCount: 45, percentage: 7.8 },
  { percentageRange: "10-15", vehicleCount: 67, percentage: 12.3 },
  { percentageRange: "15-20", vehicleCount: 89, percentage: 17.6 },
  { percentageRange: "20-25", vehicleCount: 124, percentage: 22.4 },
  { percentageRange: "25-30", vehicleCount: 156, percentage: 27.8 },
  { percentageRange: "30-35", vehicleCount: 178, percentage: 32.1 },
  { percentageRange: "35-40", vehicleCount: 145, percentage: 37.5 },
  { percentageRange: "40-45", vehicleCount: 112, percentage: 42.3 },
  { percentageRange: "45-50", vehicleCount: 89, percentage: 47.2 },
  { percentageRange: "50-55", vehicleCount: 67, percentage: 52.6 },
  { percentageRange: "55-60", vehicleCount: 43, percentage: 57.1 },
  { percentageRange: "60-65", vehicleCount: 29, percentage: 62.8 },
  { percentageRange: "65-70", vehicleCount: 18, percentage: 67.4 },
  { percentageRange: "70-75", vehicleCount: 12, percentage: 72.1 },
  { percentageRange: "75-80", vehicleCount: 8, percentage: 77.5 },
  { percentageRange: "80-85", vehicleCount: 5, percentage: 82.3 },
  { percentageRange: "85-90", vehicleCount: 3, percentage: 87.2 },
  { percentageRange: "90-95", vehicleCount: 2, percentage: 92.1 },
  { percentageRange: "95-100", vehicleCount: 1, percentage: 97.8 }
];

export const mockChargingOverTime = [
  { CHARGING_DATE: "2024-01-01", SESSION_COUNT: 145, AVG_DURATION: 42.5, TOTAL_ENERGY: 2890 },
  { CHARGING_DATE: "2024-01-02", SESSION_COUNT: 132, AVG_DURATION: 45.2, TOTAL_ENERGY: 2640 },
  { CHARGING_DATE: "2024-01-03", SESSION_COUNT: 156, AVG_DURATION: 38.7, TOTAL_ENERGY: 3120 },
  { CHARGING_DATE: "2024-01-04", SESSION_COUNT: 178, AVG_DURATION: 41.3, TOTAL_ENERGY: 3560 },
  { CHARGING_DATE: "2024-01-05", SESSION_COUNT: 165, AVG_DURATION: 43.8, TOTAL_ENERGY: 3300 },
  { CHARGING_DATE: "2024-01-06", SESSION_COUNT: 142, AVG_DURATION: 46.1, TOTAL_ENERGY: 2840 },
  { CHARGING_DATE: "2024-01-07", SESSION_COUNT: 128, AVG_DURATION: 44.5, TOTAL_ENERGY: 2560 },
  { CHARGING_DATE: "2024-01-08", SESSION_COUNT: 167, AVG_DURATION: 40.2, TOTAL_ENERGY: 3340 },
  { CHARGING_DATE: "2024-01-09", SESSION_COUNT: 189, AVG_DURATION: 39.8, TOTAL_ENERGY: 3780 },
  { CHARGING_DATE: "2024-01-10", SESSION_COUNT: 172, AVG_DURATION: 42.7, TOTAL_ENERGY: 3440 },
  { CHARGING_DATE: "2024-01-11", SESSION_COUNT: 158, AVG_DURATION: 45.3, TOTAL_ENERGY: 3160 },
  { CHARGING_DATE: "2024-01-12", SESSION_COUNT: 143, AVG_DURATION: 47.1, TOTAL_ENERGY: 2860 },
  { CHARGING_DATE: "2024-01-13", SESSION_COUNT: 134, AVG_DURATION: 44.9, TOTAL_ENERGY: 2680 },
  { CHARGING_DATE: "2024-01-14", SESSION_COUNT: 151, AVG_DURATION: 41.6, TOTAL_ENERGY: 3020 },
  { CHARGING_DATE: "2024-01-15", SESSION_COUNT: 176, AVG_DURATION: 43.2, TOTAL_ENERGY: 3520 },
]

export const mockBatteryDistribution = [
  { BATTERY_TYPE: "Lithium-Ion", VEHICLE_COUNT: 28, ACTIVE_COUNT: 24, AVG_BATTERY_HEALTH: 87.5 },
  { BATTERY_TYPE: "LiFePO4", VEHICLE_COUNT: 12, ACTIVE_COUNT: 10, AVG_BATTERY_HEALTH: 92.3 },
  { BATTERY_TYPE: "Solid State", VEHICLE_COUNT: 10, ACTIVE_COUNT: 8, AVG_BATTERY_HEALTH: 95.1 },
]

// Generate mock data for individual vehicles
export const generateMockChargingPatterns = (vehicleId: string): ChargingPattern[] => {
  const patterns: ChargingPattern[] = []
  for (let hour = 0; hour < 24; hour++) {
    // Simulate realistic charging patterns (more charging during off-peak hours)
    let sessionCount = 0
    if (hour >= 22 || hour <= 6) {
      sessionCount = Math.floor(Math.random() * 15) + 5 // Peak charging hours
    } else if (hour >= 7 && hour <= 9) {
      sessionCount = Math.floor(Math.random() * 8) + 2 // Morning rush
    } else if (hour >= 17 && hour <= 19) {
      sessionCount = Math.floor(Math.random() * 10) + 3 // Evening rush
    } else {
      sessionCount = Math.floor(Math.random() * 5) + 1 // Regular hours
    }

    patterns.push({
      HOUR_OF_DAY: hour,
      SESSION_COUNT: sessionCount,
      AVG_DURATION: Math.random() * 30 + 30, // 30-60 minutes
      AVG_ENERGY: Math.random() * 40 + 20, // 20-60 kWh
      AVG_COST: Math.random() * 15 + 5, // $5-20
    })
  }
  return patterns
}

export const generateMockSwappingHistory = (vehicleId: string): SwappingHistory[] => {
  const history: SwappingHistory[] = []
  const stations = [
    { name: "Downtown Hub", location: "123 Main St, Downtown" },
    { name: "Shopping Mall", location: "456 Mall Ave, Midtown" },
    { name: "University Campus", location: "789 College Rd, Campus" },
    { name: "Airport Terminal", location: "321 Airport Blvd, Terminal 1" },
    { name: "Business District", location: "654 Corporate Dr, Business" },
  ]

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const station = stations[Math.floor(Math.random() * stations.length)]

    history.push({
      SWAP_DATE: date.toISOString().split("T")[0],
      SWAP_TIME: `${Math.floor(Math.random() * 24)
        .toString()
        .padStart(2, "0")}:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}:00`,
      STATION_NAME: station.name,
      LOCATION: station.location,
      OLD_BATTERY_ID: `BAT_${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      OLD_BATTERY_HEALTH: Math.floor(Math.random() * 40) + 10, // 10-50% (needs replacement)
      NEW_BATTERY_ID: `BAT_${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      NEW_BATTERY_HEALTH: Math.floor(Math.random() * 20) + 80, // 80-100% (fresh battery)
      SWAP_DURATION_SECONDS: Math.floor(Math.random() * 60) + 30, // 30-90 seconds
      SWAP_COST: Math.random() * 10 + 15, // $15-25
    })
  }

  return history.sort((a, b) => new Date(b.SWAP_DATE).getTime() - new Date(a.SWAP_DATE).getTime())
}

export const generateMockGPSAnalytics = (vehicleId: string): GPSAnalytics[] => {
  const analytics: GPSAnalytics[] = []

  for (let i = 0; i < 30; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)

    const totalDistance = Math.random() * 150 + 20 // 20-170 km per day
    const avgSpeed = Math.random() * 25 + 20 // 20-45 km/h
    const maxSpeed = avgSpeed + Math.random() * 30 + 10 // Higher than avg speed
    const locationPoints = Math.floor(Math.random() * 500) + 100 // 100-600 points
    const idlePoints = Math.floor(locationPoints * (Math.random() * 0.3 + 0.1)) // 10-40% idle

    analytics.push({
      TRAVEL_DATE: date.toISOString().split("T")[0],
      FIRST_LOCATION_TIME: `${date.toISOString().split("T")[0]}T06:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}:00Z`,
      LAST_LOCATION_TIME: `${date.toISOString().split("T")[0]}T22:${Math.floor(Math.random() * 60)
        .toString()
        .padStart(2, "0")}:00Z`,
      LOCATION_POINTS: locationPoints,
      TOTAL_DISTANCE: totalDistance,
      AVG_SPEED: avgSpeed,
      MAX_SPEED: maxSpeed,
      IDLE_POINTS: idlePoints,
      ROUTE_EFFICIENCY: Math.random() * 30 + 70, // 70-100% efficiency
    })
  }

  return analytics.sort((a, b) => new Date(b.TRAVEL_DATE).getTime() - new Date(a.TRAVEL_DATE).getTime())
}

export const generateMockBatteryHealth = (vehicleId: string): BatteryHealth[] => {
  const batteries: BatteryHealth[] = []
  const batteryTypes = ["Lithium-Ion", "LiFePO4", "Solid State"]

  // Generate 2-4 batteries per vehicle (current + recent history)
  const batteryCount = Math.floor(Math.random() * 3) + 2

  for (let i = 0; i < batteryCount; i++) {
    const lastSwapDate = new Date()
    lastSwapDate.setDate(lastSwapDate.getDate() - i * 30) // Each battery used for ~30 days

    const lastMaintenanceDate = new Date(lastSwapDate)
    lastMaintenanceDate.setDate(lastMaintenanceDate.getDate() - Math.floor(Math.random() * 60))

    batteries.push({
      BATTERY_ID: `BAT_${vehicleId}_${i.toString().padStart(2, "0")}`,
      BATTERY_TYPE: batteryTypes[Math.floor(Math.random() * batteryTypes.length)],
      CAPACITY_KWH: Math.floor(Math.random() * 40) + 40, // 40-80 kWh
      HEALTH_PERCENTAGE: Math.floor(Math.random() * 30) + (i === 0 ? 70 : 40), // Current battery healthier
      CYCLE_COUNT: Math.floor(Math.random() * 2000) + 500,
      LAST_MAINTENANCE_DATE: lastMaintenanceDate.toISOString().split("T")[0],
      REPLACEMENT_DATE: i > 0 ? lastSwapDate.toISOString().split("T")[0] : undefined,
      TOTAL_SWAPS: Math.floor(Math.random() * 50) + 10,
      LAST_SWAP_DATE: lastSwapDate.toISOString().split("T")[0],
    })
  }

  return batteries.sort((a, b) => new Date(b.LAST_SWAP_DATE).getTime() - new Date(a.LAST_SWAP_DATE).getTime())
}
