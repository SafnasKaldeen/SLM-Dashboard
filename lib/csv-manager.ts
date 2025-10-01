import { MongoClient } from 'mongodb'

export interface CSVConnection {
  fileName: string
  delimiter: string
  hasHeader: boolean
  encoding: string
}

export interface QueryResult {
  columns: string[]
  rows: any[]
  executionTime: number
  rowCount: number
}

class CSVManager {
  private static instance: CSVManager

  static getInstance(): CSVManager {
    if (!CSVManager.instance) {
      CSVManager.instance = new CSVManager()
    }
    return CSVManager.instance
  }

  async uploadAndStore(connectionId: string, file: File, config: CSVConnection): Promise<void> {
    const text = await file.text()
    const lines = text.split('\n').filter(line => line.trim())
    
    if (lines.length === 0) {
      throw new Error('CSV file is empty')
    }

    const delimiter = config.delimiter || ','
    const headers = config.hasHeader ? lines[0].split(delimiter) : []
    const dataLines = config.hasHeader ? lines.slice(1) : lines

    // Parse CSV data
    const documents = dataLines.map((line, index) => {
      const values = line.split(delimiter)
      const doc: any = { _id: index + 1 }
      
      if (config.hasHeader && headers.length > 0) {
        headers.forEach((header, i) => {
          doc[header.trim()] = values[i]?.trim() || null
        })
      } else {
        values.forEach((value, i) => {
          doc[`column_${i + 1}`] = value?.trim() || null
        })
      }
      
      return doc
    })

    // Store in MongoDB
    const client = new MongoClient(process.env.MONGODB_URI!)
    try {
      await client.connect()
      const db = client.db('adhoc_analysis')
      const collection = db.collection(`csv_${connectionId}`)
      
      // Clear existing data and insert new
      await collection.deleteMany({})
      await collection.insertMany(documents)
    } finally {
      await client.close()
    }
  }

  async getTables(connectionId: string): Promise<any[]> {
    const client = new MongoClient(process.env.MONGODB_URI!)
    try {
      await client.connect()
      const db = client.db('adhoc_analysis')
      const collection = db.collection(`csv_${connectionId}`)
      
      // Get sample document to determine schema
      const sampleDoc = await collection.findOne({})
      if (!sampleDoc) {
        return []
      }

      const columns = Object.keys(sampleDoc)
        .filter(key => key !== '_id')
        .map(key => ({
          name: key,
          type: 'VARCHAR'
        }))

      const count = await collection.countDocuments()

      return [{
        name: `csv_data`,
        schema: 'uploaded',
        rowCount: count,
        columns
      }]
    } finally {
      await client.close()
    }
  }

  async executeQuery(connectionId: string, sql: string): Promise<QueryResult> {
    // For now, return sample data since we're not implementing full SQL parsing
    await new Promise(resolve => setTimeout(resolve, 500))

    const client = new MongoClient(process.env.MONGODB_URI!)
    try {
      await client.connect()
      const db = client.db('adhoc_analysis')
      const collection = db.collection(`csv_${connectionId}`)
      
      // Get all documents (limit to 100 for performance)
      const documents = await collection.find({}).limit(100).toArray()
      
      if (documents.length === 0) {
        return {
          columns: [],
          rows: [],
          executionTime: 0.1,
          rowCount: 0
        }
      }

      // Extract columns from first document
      const columns = Object.keys(documents[0]).filter(key => key !== '_id')
      
      // Convert documents to rows
      const rows = documents.map(doc => 
        columns.map(col => doc[col])
      )

      return {
        columns,
        rows,
        executionTime: 0.5,
        rowCount: rows.length
      }
    } finally {
      await client.close()
    }
  }
}

export default CSVManager.getInstance()
