"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ConnectionDialog } from "./connection-dialog"
import { Database, Plus, CheckCircle, AlertCircle, Trash2, RefreshCw, Clock, Table } from "lucide-react"

interface DatabaseConnection {
  id: string
  name: string
  type: string
  status: "connected" | "disconnected"
  lastConnected: Date
  tables: any[]
  config: Record<string, string>
}

interface DatabaseConnectorProps {
  onConnectionSelect: (connection: DatabaseConnection) => void
  selectedConnection: DatabaseConnection | null
}

export function DatabaseConnector({ onConnectionSelect, selectedConnection }: DatabaseConnectorProps) {
  const [connections, setConnections] = useState<DatabaseConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load connections on mount
  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/connections")
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Ensure data is an array
      const connectionsArray = Array.isArray(data) ? data : []

      // Convert date strings back to Date objects
      const processedConnections = connectionsArray.map((conn: any) => ({
        ...conn,
        lastConnected: new Date(conn.lastConnected),
      }))

      setConnections(processedConnections)

      // Auto-select first connection if none selected
      if (!selectedConnection && processedConnections.length > 0) {
        onConnectionSelect(processedConnections[0])
      }
    } catch (error) {
      console.error("Error loading connections:", error)
      setError("Failed to load connections. Please try again.")

      // Fallback to mock data for development
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
          lastConnected: new Date(Date.now() - 3600000), // 1 hour ago
          tables: [{ name: "revenue_data", rows: 5000 }],
          config: {
            filename: "revenue_data.csv",
            size: "2.5MB",
          },
        },
      ]

      setConnections(mockConnections)
      if (!selectedConnection && mockConnections.length > 0) {
        onConnectionSelect(mockConnections[0])
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleConnectionAdd = async (newConnection: DatabaseConnection) => {
    try {
      // Save to backend
      const response = await fetch("/api/connections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newConnection),
      })

      if (!response.ok) {
        throw new Error("Failed to save connection")
      }

      // Add to local state
      setConnections((prev) => [newConnection, ...prev])
      onConnectionSelect(newConnection)
    } catch (error) {
      console.error("Error saving connection:", error)
      // Still add to local state for demo purposes
      setConnections((prev) => [newConnection, ...prev])
      onConnectionSelect(newConnection)
    }
  }

  const handleConnectionDelete = async (connectionId: string) => {
    try {
      await fetch(`/api/connections?id=${connectionId}`, {
        method: "DELETE",
      })
    } catch (error) {
      console.error("Error deleting connection:", error)
    }

    // Remove from local state
    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId))

    // If deleted connection was selected, select another one
    if (selectedConnection?.id === connectionId) {
      const remaining = connections.filter((conn) => conn.id !== connectionId)
      onConnectionSelect(remaining.length > 0 ? remaining[0] : null)
    }
  }

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case "snowflake":
        return "❄️"
      case "csv":
        return "📄"
      case "postgres":
        return "🐘"
      case "mysql":
        return "🐬"
      default:
        return "🗄️"
    }
  }

  const formatLastConnected = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  if (isLoading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-cyan-400 mr-3" />
            <span className="text-slate-300">Loading connections...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Database Connections</h3>
          <p className="text-sm text-slate-400">Connect to your data sources to start analyzing</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">{error}</AlertDescription>
        </Alert>
      )}

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">No Connections Found</h3>
            <p className="text-slate-400 mb-4">Add your first database connection to get started with data analysis</p>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-cyan-600 hover:bg-cyan-700 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Add Connection
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {connections.map((connection) => (
            <Card
              key={connection.id}
              className={`cursor-pointer transition-all duration-200 ${
                selectedConnection?.id === connection.id
                  ? "bg-cyan-900/30 border-cyan-500/50 ring-1 ring-cyan-500/30"
                  : "bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 hover:border-slate-600"
              }`}
              onClick={() => onConnectionSelect(connection)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getConnectionIcon(connection.type)}</div>
                    <div>
                      <CardTitle className="text-white text-sm">{connection.name}</CardTitle>
                      <CardDescription className="text-slate-400 text-xs">
                        {connection.type.toUpperCase()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className={
                        connection.status === "connected"
                          ? "text-green-400 border-green-400/30"
                          : "text-red-400 border-red-400/30"
                      }
                    >
                      {connection.status === "connected" ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <AlertCircle className="h-3 w-3 mr-1" />
                      )}
                      {connection.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-slate-400 hover:text-red-400"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleConnectionDelete(connection.id)
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Connection Details */}
                  <div className="text-xs text-slate-400">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="h-3 w-3" />
                      <span>Last connected: {formatLastConnected(connection.lastConnected)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Table className="h-3 w-3" />
                      <span>{connection.tables.length} tables available</span>
                    </div>
                  </div>

                  {/* Tables Preview */}
                  {connection.tables.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-300">Tables:</div>
                      <div className="flex flex-wrap gap-1">
                        {connection.tables.slice(0, 3).map((table, index) => (
                          <Badge key={index} variant="outline" className="text-xs text-slate-400 border-slate-600">
                            {table.name}
                          </Badge>
                        ))}
                        {connection.tables.length > 3 && (
                          <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                            +{connection.tables.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connection Config Preview */}
                  {connection.type === "snowflake" && connection.config.database && (
                    <div className="text-xs text-slate-500">Database: {connection.config.database}</div>
                  )}
                  {connection.type === "csv" && connection.config.filename && (
                    <div className="text-xs text-slate-500">File: {connection.config.filename}</div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Connection Details */}
      {selectedConnection && (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-400" />
              Selected Connection: {selectedConnection.name}
            </CardTitle>
            <CardDescription className="text-slate-400">Ready to query data from this connection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Available Tables</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedConnection.tables.map((table, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-slate-300">{table.name}</span>
                      <Badge variant="outline" className="text-xs text-slate-400 border-slate-600">
                        {table.rows?.toLocaleString() || "N/A"} rows
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-white mb-2">Connection Info</h4>
                <div className="space-y-1 text-sm text-slate-400">
                  <div>Type: {selectedConnection.type.toUpperCase()}</div>
                  <div>Status: {selectedConnection.status}</div>
                  <div>Connected: {formatLastConnected(selectedConnection.lastConnected)}</div>
                  {selectedConnection.config.database && <div>Database: {selectedConnection.config.database}</div>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Dialog */}
      <ConnectionDialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onConnectionAdd={handleConnectionAdd}
      />
    </div>
  )
}
