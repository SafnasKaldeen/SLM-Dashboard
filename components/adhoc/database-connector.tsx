"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ConnectionDialog } from "./connection-dialog";
import {
  Database,
  Plus,
  CheckCircle,
  AlertCircle,
  Trash2,
  RefreshCw,
  Clock,
  Table,
} from "lucide-react";

interface TableInfo {
  name: string;
  rows?: number;
}

interface DatabaseConnection {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected";
  lastConnected: Date;
  tables: TableInfo[];
  config: Record<string, string>;
}

interface DatabaseConnectorProps {
  onConnectionSelect: (connection: DatabaseConnection | null) => void;
  selectedConnection: DatabaseConnection | null;
}

export function DatabaseConnector({
  onConnectionSelect,
  selectedConnection,
}: DatabaseConnectorProps) {
  const [connections, setConnections] = useState<DatabaseConnection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // SQL Query state
  const [sqlQuery, setSqlQuery] = useState("");
  const [queryResult, setQueryResult] = useState<any | null>(null);
  const [queryError, setQueryError] = useState<string | null>(null);
  const [isQueryRunning, setIsQueryRunning] = useState(false);

  // Default Snowflake connection (tables will be replaced dynamically)
  const defaultSnowflakeConnection: DatabaseConnection = {
    id: "default_snowflake",
    name: "SLM Warehouse",
    type: "snowflake",
    status: "connected",
    lastConnected: new Date(),
    tables: [], // initially empty, will fetch real tables
    config: {
      account:
        process.env.NEXT_PUBLIC_SNOWFLAKE_ACCOUNT ||
        "default-account.snowflakecomputing.com",
      warehouse: "SNOWFLAKE_LEARNING_WH",
      database: "ADHOC",
      schema: "PUBLIC",
      role: "SYSADMIN",
      // username, privateKey etc. should come from env/config securely
    },
  };

  useEffect(() => {
    loadConnections();
  }, []);

  // Fetch real tables via your existing /api/RunSQLQuery
  const fetchTablesForConnection = async (
    conn: DatabaseConnection
  ): Promise<TableInfo[]> => {
    if (conn.type !== "snowflake") return [];

    const schema = conn.config.schema || "PUBLIC";
    const sql = `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = '${schema.toUpperCase()}' ORDER BY TABLE_NAME`;

    try {
      const response = await fetch("/api/RunSQLQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tables: ${response.statusText}`);
      }

      const json = await response.json();

      if (!json.success || !json.result || !Array.isArray(json.result.rows)) {
        throw new Error("Invalid response structure");
      }

      return json.result.rows.map((row: any) => ({
        name: row.TABLE_NAME,
      }));
    } catch (err) {
      console.error("Error fetching tables for connection", conn.name, err);
      return [];
    }
  };

  const loadConnections = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch("/api/connections");
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const connectionsArray: DatabaseConnection[] = Array.isArray(data)
        ? data
        : [];

      // Enrich Snowflake connections with real tables
      const enrichedConnections = await Promise.all(
        connectionsArray.map(async (conn) => {
          if (conn.type === "snowflake") {
            const tables = await fetchTablesForConnection(conn);
            return {
              ...conn,
              tables,
              lastConnected: new Date(conn.lastConnected),
            };
          }
          return {
            ...conn,
            lastConnected: new Date(conn.lastConnected),
          };
        })
      );

      // Add default Snowflake connection if missing, fetch tables for it
      const hasDefault = enrichedConnections.some(
        (c) => c.id === defaultSnowflakeConnection.id
      );
      if (!hasDefault) {
        const defaultTables = await fetchTablesForConnection(
          defaultSnowflakeConnection
        );
        enrichedConnections.unshift({
          ...defaultSnowflakeConnection,
          tables: defaultTables,
          lastConnected: new Date(),
        });
      }

      setConnections(enrichedConnections);

      if (!selectedConnection && enrichedConnections.length > 0) {
        onConnectionSelect(enrichedConnections[0]);
      }
    } catch (error) {
      console.error("Error loading connections:", error);
      setError("Failed to load connections. Please try again.");

      // Fallback mock with default snowflake
      setConnections([defaultSnowflakeConnection]);
      if (!selectedConnection) {
        onConnectionSelect(defaultSnowflakeConnection);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Run SQL query via backend API
  const runQuery = async () => {
    if (!sqlQuery.trim()) {
      setQueryError("Please enter a SQL query.");
      return;
    }
    setQueryError(null);
    setIsQueryRunning(true);
    setQueryResult(null);

    try {
      const response = await fetch("/api/RunSQLQuery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql: sqlQuery }),
      });
      const json = await response.json();

      if (!response.ok) {
        setQueryError(json.error || "Query failed");
      } else {
        setQueryResult(json.result);
      }
    } catch (err: any) {
      setQueryError(err.message || "Query failed");
    } finally {
      setIsQueryRunning(false);
    }
  };

  const handleConnectionDelete = async (connectionId: string) => {
    try {
      await fetch(`/api/connections?id=${connectionId}`, {
        method: "DELETE",
      });
    } catch (error) {
      console.error("Error deleting connection:", error);
    }

    setConnections((prev) => prev.filter((conn) => conn.id !== connectionId));

    if (selectedConnection?.id === connectionId) {
      const remaining = connections.filter((conn) => conn.id !== connectionId);
      onConnectionSelect(remaining.length > 0 ? remaining[0] : null);
    }
  };

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case "snowflake":
        return "❄️";
      case "csv":
        return "📄";
      case "postgres":
        return "🐘";
      case "mysql":
        return "🐬";
      default:
        return "🗄️";
    }
  };

  const formatLastConnected = (date: Date | string) => {
    const parsedDate = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - parsedDate.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minute(s) ago`;
    if (diffHours < 24) return `${diffHours} hour(s) ago`;
    return `${diffDays} day(s) ago`;
  };

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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">
            Database Connections
          </h3>
          <p className="text-sm text-slate-400">
            Connect to your data sources to start analyzing
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-yellow-500/50 bg-yellow-500/10">
          <AlertCircle className="h-4 w-4 text-yellow-400" />
          <AlertDescription className="text-yellow-400">
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Connections Grid */}
      {connections.length === 0 ? (
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-slate-600" />
            <h3 className="text-lg font-medium text-white mb-2">
              No Connections Found
            </h3>
            <p className="text-slate-400 mb-4">
              Add your first database connection to get started with data
              analysis
            </p>
            <Button
              onClick={() => setIsDialogOpen(true)}
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
            >
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
                    <div className="text-2xl">
                      {getConnectionIcon(connection.type)}
                    </div>
                    <div>
                      <CardTitle className="text-white text-sm">
                        {connection.name}
                      </CardTitle>
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
                        e.stopPropagation();
                        handleConnectionDelete(connection.id);
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
                      <span>
                        Last connected:{" "}
                        {formatLastConnected(connection.lastConnected)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Table className="h-3 w-3" />
                      <span>{connection.tables.length} tables available</span>
                    </div>
                  </div>

                  {/* Tables Preview */}
                  {connection.tables.length > 0 && (
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-slate-300">
                        Tables:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {connection.tables.slice(0, 3).map((table, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="text-xs text-slate-400 border-slate-600"
                          >
                            {table.name}
                          </Badge>
                        ))}
                        {connection.tables.length > 3 && (
                          <Badge
                            variant="outline"
                            className="text-xs text-slate-400 border-slate-600"
                          >
                            +{connection.tables.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Connection Config Preview */}
                  {connection.type === "snowflake" &&
                    connection.config.database && (
                      <div className="text-xs text-slate-500">
                        Database: {connection.config.database}
                      </div>
                    )}
                  {connection.type === "csv" && connection.config.filename && (
                    <div className="text-xs text-slate-500">
                      File: {connection.config.filename}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Connection Details and SQL Runner */}
      {selectedConnection && (
        <Card className="bg-slate-900 border border-slate-700 shadow-md">
          <CardHeader className="border-b border-slate-700">
            <CardTitle className="text-white flex items-center gap-2 text-lg font-semibold">
              <CheckCircle className="h-6 w-6 text-green-400" />
              Selected Connection:{" "}
              <span className="ml-1 text-cyan-400">
                {selectedConnection.name}
              </span>
            </CardTitle>
            <CardDescription className="text-slate-400 mt-1">
              Ready to query data from this connection
            </CardDescription>
          </CardHeader>

          <CardContent className="py-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Tables Section */}
              <section>
                <h4 className="text-sm font-semibold text-white mb-3 border-b border-slate-700 pb-1">
                  Available Tables
                </h4>
                <div className="space-y-2 max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900">
                  {selectedConnection.tables.length === 0 && (
                    <p className="text-slate-500 text-sm italic">
                      No tables available
                    </p>
                  )}
                  {selectedConnection.tables.map((table) => (
                    <div
                      key={table.name}
                      className="flex items-center justify-between px-3 py-2 rounded bg-slate-800 hover:bg-slate-700 transition-colors cursor-default"
                    >
                      <span className="text-sm text-slate-300 font-medium truncate">
                        {table.name}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs text-slate-400 border-slate-600 bg-transparent px-2 py-0.5 rounded"
                      >
                        {table.rows?.toLocaleString() ?? "N/A"} rows
                      </Badge>
                    </div>
                  ))}
                </div>
              </section>

              {/* Connection Info & SQL Runner Section */}
              <section>
                <h4 className="text-sm font-semibold text-white mb-3 border-b border-slate-700 pb-1">
                  Connection Info
                </h4>

                <dl className="space-y-1 text-sm text-slate-400 mb-6">
                  <div>
                    <dt className="font-semibold inline">Type:</dt>{" "}
                    <dd className="inline">
                      {selectedConnection.type.toUpperCase()}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Status:</dt>{" "}
                    <dd className="inline capitalize">
                      {selectedConnection.status}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-semibold inline">Connected:</dt>{" "}
                    <dd className="inline">
                      {formatLastConnected(selectedConnection.lastConnected)}
                    </dd>
                  </div>
                  {selectedConnection.config.database && (
                    <div>
                      <dt className="font-semibold inline">Database:</dt>{" "}
                      <dd className="inline">
                        {selectedConnection.config.database}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connection Dialog for adding new connections */}
      <ConnectionDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onConnectionAdded={async () => {
          setIsDialogOpen(false);
          await loadConnections();
        }}
      />
    </div>
  );
}
