import { type NextRequest, NextResponse } from "next/server"
import MongoDBManager from "@/lib/mongodb"

interface DatabaseConnection {
  id: string
  name: string
  type: string
  status: "connected" | "disconnected"
  lastConnected: Date
  tables: any[]
  config: Record<string, any>
}

// GET - Fetch all connections
export async function GET() {
  try {
    const connections = await MongoDBManager.getConnections()
    return NextResponse.json(connections)
  } catch (error) {
    console.error("Error fetching connections:", error)

    // Return mock data as fallback
    const mockConnections: DatabaseConnection[] = [
      {
        id: "mock_snowflake_1",
        name: "Snowflake Production",
        type: "snowflake",
        status: "connected",
        lastConnected: new Date(),
        tables: [
          { name: "REVENUE_TRANSACTIONS", rows: 125000 },
          { name: "STATIONS", rows: 450 },
          { name: "BATTERY_SWAPS", rows: 89000 },
          { name: "BATTERY_HEALTH", rows: 2500 },
          { name: "USERS", rows: 15000 },
        ],
        config: {
          account: "demo-account.snowflakecomputing.com",
          database: "PRODUCTION_DB",
          warehouse: "COMPUTE_WH",
        },
      },
      {
        id: "mock_csv_1",
        name: "Revenue Data CSV",
        type: "csv",
        status: "connected",
        lastConnected: new Date(Date.now() - 3600000),
        tables: [{ name: "revenue_data", rows: 5000 }],
        config: {
          filename: "revenue_data.csv",
          size: "2.5MB",
        },
      },
    ]

    return NextResponse.json(mockConnections)
  }
}

// POST - Create new connection
export async function POST(request: NextRequest) {
  try {
    const connection: DatabaseConnection = await request.json()

    // Validate required fields
    if (!connection.id || !connection.name || !connection.type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await MongoDBManager.saveConnection(connection)
    return NextResponse.json({ success: true, connection })
  } catch (error) {
    console.error("Error saving connection:", error)
    return NextResponse.json({ error: "Failed to save connection" }, { status: 500 })
  }
}

// DELETE - Remove connection
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const connectionId = searchParams.get("id")

    if (!connectionId) {
      return NextResponse.json({ error: "Connection ID is required" }, { status: 400 })
    }

    await MongoDBManager.deleteConnection(connectionId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting connection:", error)
    return NextResponse.json({ error: "Failed to delete connection" }, { status: 500 })
  }
}
