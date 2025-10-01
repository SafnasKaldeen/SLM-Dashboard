// API Input Types
export interface EVRouteInput {
  source: string
  destination: string
  battery: number // in percentage
  efficiency: number // e.g., km/kWh
}

export interface StationAllocationInput {
  eps: number // DBSCAN epsilon parameter
  minSamples: number // DBSCAN minimum samples
  topN: number // Top N stations to return
  zoomLevel: number // Used for map rendering or clustering
  stageName: string // Snowflake stage
}

export interface GeoStationAllocationInput {
  maxRadiusKm: number
  outlierThresholdKm: number
  topN: number
  zoomLevel: number
  stageName: string
}

export interface ClosestStationInput {
  currentLat?: number
  currentLng?: number
  stageName: string
}

export interface ClosestStationWithDirectionInput {
  currentLat: number
  currentLng: number
  destinationLat: number
  destinationLng: number
  stageName: string
}

// API Response Types
export interface RoutePoint {
  lat: number
  lng: number
  name: string
}

export interface ChargingStop {
  name: string
  lat: number
  lng: number
  chargingTime: number
  batteryAdded: number
}

export interface EVRouteData {
  route: RoutePoint[]
  batteryUsage: number
  distance: number
  estimatedTime: number
  chargingStops: ChargingStop[]
}

export interface Station {
  id: string
  name: string
  lat: number
  lng: number
  capacity: number
  available: number
}

export interface StationCluster {
  id: number
  centroid: {
    lat: number
    lng: number
  }
  stations: Station[]
}

export interface StationAllocationData {
  clusters: StationCluster[]
  totalStations: number
  totalCapacity: number
  totalAvailable: number
}

export interface ClosestStationData extends Station {
  distance: number
}

// API Response Wrappers
export interface ApiResponse<T> {
  status: string
  data: T
}
