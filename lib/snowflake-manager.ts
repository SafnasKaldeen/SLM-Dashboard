export interface SnowflakeConnection {
  account: string
  username: string
  password: string
  warehouse: string
  database: string
  schema: string
}

export interface QueryResult {
  columns: string[]
  rows: any[]
  executionTime: number
  rowCount: number
}

class SnowflakeManager {
  private static instance: SnowflakeManager
  private connections: Map<string, SnowflakeConnection> = new Map()

  static getInstance(): SnowflakeManager {
    if (!SnowflakeManager.instance) {
      SnowflakeManager.instance = new SnowflakeManager()
    }
    return SnowflakeManager.instance
  }

  async testConnection(config: SnowflakeConnection): Promise<boolean> {
    // Always return true for dummy connection
    await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate connection time
    return true
  }

  async connect(connectionId: string, config: SnowflakeConnection): Promise<void> {
    // Store connection config (dummy)
    this.connections.set(connectionId, config)
  }

  async getTables(connectionId: string): Promise<any[]> {
    // Return dummy BSS tables
    return [
      {
        name: "REVENUE_TRANSACTIONS",
        schema: "BSS_ANALYTICS",
        rowCount: 15420,
        columns: [
          { name: "TRANSACTION_ID", type: "VARCHAR", primaryKey: true },
          { name: "STATION_ID", type: "VARCHAR" },
          { name: "CUSTOMER_ID", type: "VARCHAR" },
          { name: "AMOUNT", type: "DECIMAL(10,2)" },
          { name: "TIMESTAMP", type: "TIMESTAMP" },
          { name: "PAYMENT_METHOD", type: "VARCHAR" },
          { name: "BATTERY_ID", type: "VARCHAR" }
        ]
      },
      {
        name: "STATIONS",
        schema: "BSS_ANALYTICS", 
        rowCount: 150,
        columns: [
          { name: "STATION_ID", type: "VARCHAR", primaryKey: true },
          { name: "STATION_NAME", type: "VARCHAR" },
          { name: "LOCATION", type: "VARCHAR" },
          { name: "AREA", type: "VARCHAR" },
          { name: "STATUS", type: "VARCHAR" },
          { name: "CAPACITY", type: "INTEGER" },
          { name: "MONTHLY_RENT", type: "DECIMAL(10,2)" }
        ]
      },
      {
        name: "BATTERY_HEALTH",
        schema: "BSS_ANALYTICS",
        rowCount: 2500,
        columns: [
          { name: "BATTERY_ID", type: "VARCHAR", primaryKey: true },
          { name: "HEALTH_SCORE", type: "INTEGER" },
          { name: "CHARGE_CYCLES", type: "INTEGER" },
          { name: "LAST_MAINTENANCE", type: "DATE" },
          { name: "STATUS", type: "VARCHAR" },
          { name: "TEMPERATURE", type: "DECIMAL(5,2)" }
        ]
      },
      {
        name: "USAGE_PATTERNS",
        schema: "BSS_ANALYTICS",
        rowCount: 24,
        columns: [
          { name: "HOUR", type: "INTEGER", primaryKey: true },
          { name: "TOTAL_SWAPS", type: "INTEGER" },
          { name: "AVG_WAIT_TIME", type: "DECIMAL(5,2)" },
          { name: "PEAK_INDICATOR", type: "VARCHAR" }
        ]
      },
      {
        name: "BATTERY_SWAPS",
        schema: "BSS_ANALYTICS",
        rowCount: 45680,
        columns: [
          { name: "SWAP_ID", type: "VARCHAR", primaryKey: true },
          { name: "STATION_ID", type: "VARCHAR" },
          { name: "CUSTOMER_ID", type: "VARCHAR" },
          { name: "OLD_BATTERY_ID", type: "VARCHAR" },
          { name: "NEW_BATTERY_ID", type: "VARCHAR" },
          { name: "SWAP_TIMESTAMP", type: "TIMESTAMP" },
          { name: "DURATION_SECONDS", type: "INTEGER" }
        ]
      }
    ]
  }

  async executeQuery(connectionId: string, sql: string): Promise<QueryResult> {
    // Simulate query execution time
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate mock data based on SQL query patterns
    const sqlLower = sql.toLowerCase()
    
    if (sqlLower.includes("revenue") && sqlLower.includes("area")) {
      return {
        columns: ["AREA", "TOTAL_REVENUE", "SWAP_COUNT", "AVG_REVENUE_PER_SWAP", "MONTH"],
        rows: [
          ["Downtown", 15420.50, 1250, 12.34, "2024-01"],
          ["University District", 12350.75, 980, 12.60, "2024-01"],
          ["Business District", 18750.25, 1450, 12.93, "2024-01"],
          ["Residential North", 9875.00, 825, 11.97, "2024-01"],
          ["Industrial Zone", 7650.50, 650, 11.77, "2024-01"],
          ["Downtown", 16200.75, 1320, 12.27, "2024-02"],
          ["University District", 13100.25, 1050, 12.48, "2024-02"],
          ["Business District", 19500.00, 1520, 12.83, "2024-02"]
        ],
        executionTime: 1.23,
        rowCount: 8
      }
    }

    if (sqlLower.includes("station") && sqlLower.includes("revenue")) {
      return {
        columns: ["STATION_NAME", "LOCATION", "TOTAL_REVENUE", "TOTAL_SWAPS", "AVG_REVENUE_PER_SWAP", "STATUS"],
        rows: [
          ["Central Hub", "Downtown Main St", 8750.25, 720, 12.15, "Active"],
          ["Tech Campus", "University Ave", 7200.50, 580, 12.42, "Active"],
          ["Business Plaza", "Corporate Blvd", 9100.75, 750, 12.13, "Active"],
          ["Metro Station", "Transit Center", 6850.00, 565, 12.12, "Active"],
          ["Shopping Mall", "Retail District", 5950.25, 485, 12.27, "Active"],
          ["Airport Terminal", "Terminal 2", 4200.50, 340, 12.35, "Maintenance"],
          ["Hospital Complex", "Medical Center", 3850.75, 315, 12.22, "Active"]
        ],
        executionTime: 0.89,
        rowCount: 7
      }
    }

    if (sqlLower.includes("battery") && sqlLower.includes("health")) {
      return {
        columns: ["BATTERY_ID", "HEALTH_SCORE", "CHARGE_CYCLES", "LAST_MAINTENANCE", "STATUS", "HEALTH_STATUS"],
        rows: [
          ["BAT_001", 45, 2850, "2024-01-15", "Critical", "Needs Maintenance"],
          ["BAT_002", 62, 2200, "2024-01-20", "Warning", "Needs Maintenance"],
          ["BAT_003", 78, 1850, "2024-02-01", "Good", "Monitor"],
          ["BAT_004", 92, 1200, "2024-02-10", "Excellent", "Good"],
          ["BAT_005", 88, 1450, "2024-02-05", "Good", "Good"],
          ["BAT_006", 55, 2650, "2024-01-18", "Warning", "Needs Maintenance"],
          ["BAT_007", 95, 980, "2024-02-12", "Excellent", "Good"]
        ],
        executionTime: 0.67,
        rowCount: 7
      }
    }

    if (sqlLower.includes("usage") && sqlLower.includes("hour")) {
      return {
        columns: ["HOUR", "TOTAL_SWAPS", "AVG_WAIT_TIME", "PEAK_INDICATOR"],
        rows: [
          [6, 45, 2.5, "Low"],
          [7, 120, 3.2, "Medium"],
          [8, 280, 5.8, "High"],
          [9, 350, 7.2, "Peak"],
          [10, 220, 4.1, "Medium"],
          [11, 180, 3.5, "Medium"],
          [12, 320, 6.5, "High"],
          [13, 290, 5.9, "High"],
          [14, 200, 3.8, "Medium"],
          [15, 180, 3.2, "Medium"],
          [16, 240, 4.5, "Medium"],
          [17, 380, 8.1, "Peak"],
          [18, 420, 9.2, "Peak"],
          [19, 350, 7.8, "High"],
          [20, 280, 6.1, "High"],
          [21, 180, 3.9, "Medium"],
          [22, 120, 2.8, "Low"],
          [23, 80, 2.1, "Low"]
        ],
        executionTime: 0.45,
        rowCount: 18
      }
    }

    if (sqlLower.includes("station") && sqlLower.includes("utilization")) {
      return {
        columns: ["STATION_NAME", "LOCATION", "TOTAL_SWAPS", "ACTIVE_DAYS", "SWAPS_PER_DAY", "STATUS"],
        rows: [
          ["Central Hub", "Downtown Main St", 720, 30, 24.0, "Active"],
          ["Tech Campus", "University Ave", 580, 30, 19.33, "Active"],
          ["Business Plaza", "Corporate Blvd", 750, 30, 25.0, "Active"],
          ["Metro Station", "Transit Center", 565, 30, 18.83, "Active"],
          ["Shopping Mall", "Retail District", 485, 30, 16.17, "Active"],
          ["Airport Terminal", "Terminal 2", 340, 25, 13.6, "Maintenance"],
          ["Hospital Complex", "Medical Center", 315, 30, 10.5, "Active"]
        ],
        executionTime: 0.78,
        rowCount: 7
      }
    }

    // Default fallback query
    return {
      columns: ["TRANSACTION_ID", "STATION_ID", "AMOUNT", "TIMESTAMP", "PAYMENT_METHOD"],
      rows: [
        ["TXN_001", "STN_001", 12.50, "2024-01-15 08:30:00", "Credit Card"],
        ["TXN_002", "STN_002", 12.75, "2024-01-15 09:15:00", "Mobile Pay"],
        ["TXN_003", "STN_001", 12.25, "2024-01-15 10:45:00", "Credit Card"],
        ["TXN_004", "STN_003", 13.00, "2024-01-15 11:20:00", "Cash"],
        ["TXN_005", "STN_002", 12.50, "2024-01-15 12:30:00", "Mobile Pay"]
      ],
      executionTime: 0.32,
      rowCount: 5
    }
  }

  disconnect(connectionId: string): void {
    this.connections.delete(connectionId)
  }
}

export default SnowflakeManager.getInstance()
