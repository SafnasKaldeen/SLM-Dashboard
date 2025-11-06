import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { connectionId, sql } = await request.json()

    if (!connectionId || !sql) {
      return NextResponse.json({ error: "Connection ID and SQL query are required" }, { status: 400 })
    }

    // Simulate query execution time
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 2000))

    // Generate mock data based on SQL query patterns
    const mockResult = generateMockQueryResult(sql)

    return NextResponse.json({
      success: true,
      result: mockResult,
    })
  } catch (error) {
    console.error("Error executing query:", error)
    return NextResponse.json({ error: "Query execution failed" }, { status: 500 })
  }
}

function generateMockQueryResult(sql: string) {
  const sqlLower = sql.toLowerCase()

  if (sqlLower.includes("revenue") && sqlLower.includes("area")) {
    return {
      columns: ["AREA", "TOTAL_REVENUE", "SWAP_COUNT", "AVG_REVENUE_PER_SWAP", "MONTH"],
      rows: [
        ["Downtown", 25420.5, 2150, 11.82, "2024-01"],
        ["University District", 18965.25, 1580, 12.0, "2024-01"],
        ["Business District", 22350.75, 1850, 12.08, "2024-01"],
        ["Residential North", 15780.0, 1320, 11.95, "2024-01"],
        ["Industrial Zone", 12650.5, 1050, 12.05, "2024-01"],
        ["Downtown", 27200.75, 2280, 11.93, "2023-12"],
        ["University District", 19800.25, 1650, 12.0, "2023-12"],
        ["Business District", 23500.0, 1950, 12.05, "2023-12"],
        ["Residential North", 16500.0, 1375, 12.0, "2023-12"],
        ["Industrial Zone", 13200.5, 1100, 12.0, "2023-12"],
      ],
      executionTime: 1.45,
      rowCount: 10,
    }
  }

  if (sqlLower.includes("station") && sqlLower.includes("revenue")) {
    return {
      columns: ["STATION_NAME", "LOCATION", "TOTAL_REVENUE", "TOTAL_SWAPS", "AVG_REVENUE_PER_SWAP", "STATUS"],
      rows: [
        ["Central Plaza Hub", "Downtown Main St", 18750.25, 1520, 12.34, "Active"],
        ["Tech Campus Station", "University Ave", 15200.5, 1280, 11.88, "Active"],
        ["Business Tower", "Corporate Blvd", 16100.75, 1340, 12.01, "Active"],
        ["Metro Junction", "Transit Center", 14850.0, 1235, 12.02, "Active"],
        ["Shopping Complex", "Retail District", 13950.25, 1165, 11.97, "Active"],
        ["Airport Terminal", "Terminal 2", 12200.5, 1015, 12.02, "Maintenance"],
        ["Hospital Gateway", "Medical Center", 11850.75, 985, 12.03, "Active"],
        ["Residential Hub", "Suburb Center", 10950.0, 912, 12.01, "Active"],
      ],
      executionTime: 0.89,
      rowCount: 8,
    }
  }

  if (sqlLower.includes("battery") && sqlLower.includes("health")) {
    return {
      columns: ["BATTERY_ID", "HEALTH_SCORE", "CHARGE_CYCLES", "LAST_MAINTENANCE", "STATUS", "HEALTH_STATUS"],
      rows: [
        ["BAT_001", 45, 2850, "2024-01-15", "Critical", "Needs Maintenance"],
        ["BAT_002", 62, 2200, "2024-01-20", "Warning", "Needs Maintenance"],
        ["BAT_003", 68, 2100, "2024-01-18", "Warning", "Needs Maintenance"],
        ["BAT_004", 78, 1850, "2024-02-01", "Good", "Monitor"],
        ["BAT_005", 82, 1650, "2024-02-03", "Good", "Monitor"],
        ["BAT_006", 88, 1450, "2024-02-05", "Good", "Good"],
        ["BAT_007", 92, 1200, "2024-02-10", "Excellent", "Good"],
        ["BAT_008", 95, 980, "2024-02-12", "Excellent", "Good"],
      ],
      executionTime: 0.67,
      rowCount: 8,
    }
  }

  if (sqlLower.includes("usage") && sqlLower.includes("hour")) {
    return {
      columns: ["HOUR", "TOTAL_SWAPS", "AVG_WAIT_TIME", "PEAK_INDICATOR"],
      rows: [
        [6, 145, 2.5, "Low"],
        [7, 320, 3.2, "Medium"],
        [8, 580, 5.8, "High"],
        [9, 650, 7.2, "Peak"],
        [10, 420, 4.1, "Medium"],
        [11, 380, 3.5, "Medium"],
        [12, 720, 6.5, "High"],
        [13, 690, 5.9, "High"],
        [14, 400, 3.8, "Medium"],
        [15, 380, 3.2, "Medium"],
        [16, 540, 4.5, "Medium"],
        [17, 780, 8.1, "Peak"],
        [18, 820, 9.2, "Peak"],
        [19, 650, 7.8, "High"],
        [20, 480, 6.1, "High"],
        [21, 280, 3.9, "Medium"],
        [22, 220, 2.8, "Low"],
        [23, 180, 2.1, "Low"],
      ],
      executionTime: 0.45,
      rowCount: 18,
    }
  }

  if (sqlLower.includes("station") && sqlLower.includes("utilization")) {
    return {
      columns: ["STATION_NAME", "LOCATION", "TOTAL_SWAPS", "ACTIVE_DAYS", "SWAPS_PER_DAY", "STATUS"],
      rows: [
        ["Central Plaza Hub", "Downtown Main St", 1520, 30, 50.67, "Active"],
        ["Tech Campus Station", "University Ave", 1280, 30, 42.67, "Active"],
        ["Business Tower", "Corporate Blvd", 1340, 30, 44.67, "Active"],
        ["Metro Junction", "Transit Center", 1235, 30, 41.17, "Active"],
        ["Shopping Complex", "Retail District", 1165, 30, 38.83, "Active"],
        ["Airport Terminal", "Terminal 2", 1015, 25, 40.6, "Maintenance"],
        ["Hospital Gateway", "Medical Center", 985, 30, 32.83, "Active"],
        ["Residential Hub", "Suburb Center", 912, 30, 30.4, "Active"],
      ],
      executionTime: 0.78,
      rowCount: 8,
    }
  }

  // Default fallback query
  return {
    columns: ["TRANSACTION_ID", "STATION_ID", "AMOUNT", "TIMESTAMP", "PAYMENT_METHOD"],
    rows: [
      ["TXN_001", "STN_001", 12.5, "2024-01-15 08:30:00", "Credit Card"],
      ["TXN_002", "STN_002", 12.75, "2024-01-15 09:15:00", "Mobile Pay"],
      ["TXN_003", "STN_001", 12.25, "2024-01-15 10:45:00", "Credit Card"],
      ["TXN_004", "STN_003", 13.0, "2024-01-15 11:20:00", "Cash"],
      ["TXN_005", "STN_002", 12.5, "2024-01-15 12:30:00", "Mobile Pay"],
      ["TXN_006", "STN_004", 11.95, "2024-01-15 13:45:00", "Credit Card"],
      ["TXN_007", "STN_003", 12.8, "2024-01-15 14:20:00", "Mobile Pay"],
      ["TXN_008", "STN_001", 12.35, "2024-01-15 15:10:00", "Credit Card"],
    ],
    executionTime: 0.32,
    rowCount: 8,
  }
}
