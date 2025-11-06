import { MongoClient } from "mongodb"

interface DatabaseConnection {
  id: string
  name: string
  type: string
  status: "connected" | "disconnected"
  lastConnected: Date
  tables: any[]
  config: Record<string, any>
}

interface QueryHistory {
  id: string
  connectionId: string
  query: string
  sql: string
  result: any
  timestamp: Date
}

class MongoDBManager {
  private static instance: MongoDBManager
  private client: MongoClient | null = null
  private isConnected = false

  static getInstance(): MongoDBManager {
    if (!MongoDBManager.instance) {
      MongoDBManager.instance = new MongoDBManager()
    }
    return MongoDBManager.instance
  }

  private async getClient(): Promise<MongoClient> {
    if (!this.client || !this.isConnected) {
      try {
        const uri = process.env.MONGODB_URI || "mongodb://localhost:27017"
        this.client = new MongoClient(uri)
        await this.client.connect()
        this.isConnected = true
        console.log("Connected to MongoDB")
      } catch (error) {
        console.error("Failed to connect to MongoDB:", error)
        this.isConnected = false
        throw error
      }
    }
    return this.client
  }

  async saveConnection(connection: DatabaseConnection): Promise<void> {
    try {
      const client = await this.getClient()
      const db = client.db("adhoc_analysis")
      const collection = db.collection("connections")

      await collection.replaceOne({ id: connection.id }, connection, { upsert: true })
      console.log("Connection saved successfully:", connection.id)
    } catch (error) {
      console.error("Error saving connection:", error)
      throw error
    }
  }

  async getConnections(): Promise<DatabaseConnection[]> {
    try {
      const client = await this.getClient()
      const db = client.db("adhoc_analysis")
      const collection = db.collection("connections")

      const connections = await collection.find({}).toArray()
      return connections.map((conn) => ({
        ...conn,
        lastConnected: new Date(conn.lastConnected),
      }))
    } catch (error) {
      console.error("Error getting connections:", error)
      // Return empty array instead of throwing to allow fallback
      return []
    }
  }

  async deleteConnection(connectionId: string): Promise<void> {
    try {
      const client = await this.getClient()
      const db = client.db("adhoc_analysis")
      const collection = db.collection("connections")

      await collection.deleteOne({ id: connectionId })
      console.log("Connection deleted successfully:", connectionId)
    } catch (error) {
      console.error("Error deleting connection:", error)
      throw error
    }
  }

  async saveQueryHistory(history: QueryHistory): Promise<void> {
    try {
      const client = await this.getClient()
      const db = client.db("adhoc_analysis")
      const collection = db.collection("query_history")

      await collection.insertOne(history)
      console.log("Query history saved successfully")
    } catch (error) {
      console.error("Error saving query history:", error)
      // Don't throw here as query history is not critical
    }
  }

  async getQueryHistory(): Promise<QueryHistory[]> {
    try {
      const client = await this.getClient()
      const db = client.db("adhoc_analysis")
      const collection = db.collection("query_history")

      const history = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray()
      return history.map((h) => ({
        ...h,
        timestamp: new Date(h.timestamp),
      }))
    } catch (error) {
      console.error("Error getting query history:", error)
      return []
    }
  }

  async disconnect(): Promise<void> {
    if (this.client && this.isConnected) {
      try {
        await this.client.close()
        this.isConnected = false
        console.log("Disconnected from MongoDB")
      } catch (error) {
        console.error("Error disconnecting from MongoDB:", error)
      }
    }
  }
}

export default MongoDBManager.getInstance()
