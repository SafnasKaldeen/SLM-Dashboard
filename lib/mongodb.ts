import { MongoClient } from 'mongodb'

interface DatabaseConnection {
  id: string
  name: string
  type: string
  status: "connected" | "disconnected"
  lastConnected: Date
  tables: any[]
  config: Record<string, any>
}

  interface PermissionFailure {
  semanticModel: object
  explanation: string
  timestamp: Date
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

  static getInstance(): MongoDBManager {
    if (!MongoDBManager.instance) {
      MongoDBManager.instance = new MongoDBManager()
    }
    return MongoDBManager.instance
  }

  private async getClient(): Promise<MongoClient> {
    if (!this.client) {
      this.client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017')
      await this.client.connect()
    }
    return this.client
  }

  async getConnectionById(id: string): Promise<DatabaseConnection | null> {
    const client = await this.getClient()
    const db = client.db('adhoc_analysis')
    return db.collection('connections').findOne({ id })
  }

  async saveConnection(connection: DatabaseConnection): Promise<void> {
    const client = await this.getClient()
    const db = client.db('adhoc_analysis')
    const collection = db.collection('connections')
    
    await collection.replaceOne(
      { id: connection.id },
      connection,
      { upsert: true }
    )
  }

  async getConnections(): Promise<DatabaseConnection[]> {
    try {
      const client = await this.getClient()
      const db = client.db('adhoc_analysis')
      const collection = db.collection('connections')
      
      const connections = await collection.find({}).toArray()
      return connections.map(conn => ({
        ...conn,
        lastConnected: new Date(conn.lastConnected)
      }))
    } catch (error) {
      console.error('Error getting connections:', error)
      return []
    }
  }

  async deleteConnection(connectionId: string): Promise<void> {
    const client = await this.getClient()
    const db = client.db('adhoc_analysis')
    const collection = db.collection('connections')
    
    await collection.deleteOne({ id: connectionId })
  }

  async saveQueryHistory(history: QueryHistory): Promise<void> {
    try {
      const client = await this.getClient()
      const db = client.db('adhoc_analysis')
      const collection = db.collection('query_history')
      
      await collection.insertOne(history)
    } catch (error) {
      console.error('Error saving query history:', error)
    }
  }

  async getQueryHistory(): Promise<QueryHistory[]> {
    try {
      const client = await this.getClient()
      const db = client.db('adhoc_analysis')
      const collection = db.collection('query_history')
      
      const history = await collection.find({}).sort({ timestamp: -1 }).limit(50).toArray()
      return history.map(h => ({
        ...h,
        timestamp: new Date(h.timestamp)
      }))
    } catch (error) {
      console.error('Error getting query history:', error)
      return []
    }
  }


async savePermissionFailure(failure: PermissionFailure): Promise<void> {
  try {
    const client = await this.getClient()
    const db = client.db('adhoc_analysis')
    const collection = db.collection('permission_failures')

    await collection.insertOne({
      ...failure,
      timestamp: failure.timestamp || new Date(),
    })
  } catch (error) {
    console.error('Error saving permission failure:', error)
  }
}
}

export default MongoDBManager.getInstance()
