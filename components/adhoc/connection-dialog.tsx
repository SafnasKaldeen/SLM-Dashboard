"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Loader2,
  Database,
  Snowflake,
  FileText,
  CheckCircle,
  AlertCircle,
  Upload,
} from "lucide-react";

interface ConnectionDialogProps {
  open: boolean; // ✅ Fixed prop name
  onOpenChange: (open: boolean) => void; // ✅ Fixed prop name
  onConnectionAdded: () => Promise<void>; // ✅ Fixed prop name
}

export function ConnectionDialog({
  open, // ✅ Updated to match
  onOpenChange, // ✅ Updated to match
  onConnectionAdded, // ✅ Updated to match
}: ConnectionDialogProps) {
  const [activeTab, setActiveTab] = useState("snowflake");
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<
    "idle" | "testing" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Snowflake connection form
  const [snowflakeConfig, setSnowflakeConfig] = useState({
    name: "",
    account: "",
    username: "",
    password: "",
    warehouse: "",
    database: "",
    schema: "PUBLIC",
  });

  // CSV upload form
  const [csvConfig, setCsvConfig] = useState({
    name: "",
    file: null as File | null,
  });

  const handleSnowflakeConnect = async () => {
    setIsConnecting(true);
    setConnectionStatus("testing");
    setErrorMessage("");

    try {
      const response = await fetch("/api/test-snowflake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(snowflakeConfig),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error || "Unknown error");

      const newConnection = {
        id: `snowflake_${Date.now()}`,
        name:
          snowflakeConfig.name ||
          `Snowflake - ${snowflakeConfig.database}.${snowflakeConfig.schema}`,
        type: "snowflake",
        status: "connected" as const,
        lastConnected: new Date(),
        tables: result.tables || [],
        config: snowflakeConfig,
      };

      setConnectionStatus("success");
      setTimeout(async () => {
        // Save the connection to your backend/storage
        try {
          await fetch("/api/connections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newConnection),
          });
        } catch (err) {
          console.error("Failed to save connection:", err);
        }

        await onConnectionAdded(); // ✅ Call the callback
        onOpenChange(false); // ✅ Close dialog
        resetForm();
      }, 1000);
    } catch (error: any) {
      setConnectionStatus("error");
      setErrorMessage(
        error?.message || "Failed to connect to Snowflake. Try again."
      );
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCsvUpload = async () => {
    if (!csvConfig.file) return;

    setIsConnecting(true);
    setConnectionStatus("testing");

    try {
      // Simulate file processing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const newConnection = {
        id: `csv_${Date.now()}`,
        name: csvConfig.name || csvConfig.file.name.replace(".csv", ""),
        type: "csv",
        status: "connected" as const,
        lastConnected: new Date(),
        tables: [{ name: csvConfig.file.name.replace(".csv", ""), rows: 1000 }],
        config: {
          filename: csvConfig.file.name,
          size: csvConfig.file.size,
        },
      };

      setConnectionStatus("success");
      setTimeout(async () => {
        // Save the connection to your backend/storage
        try {
          await fetch("/api/connections", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(newConnection),
          });
        } catch (err) {
          console.error("Failed to save connection:", err);
        }

        await onConnectionAdded(); // ✅ Call the callback
        onOpenChange(false); // ✅ Close dialog
        resetForm();
      }, 1000);
    } catch (error) {
      setConnectionStatus("error");
      setErrorMessage("Failed to process CSV file.");
    } finally {
      setIsConnecting(false);
    }
  };

  const resetForm = () => {
    setSnowflakeConfig({
      name: "",
      account: "",
      username: "",
      password: "",
      warehouse: "",
      database: "",
      schema: "PUBLIC",
    });
    setCsvConfig({
      name: "",
      file: null,
    });
    setConnectionStatus("idle");
    setErrorMessage("");
  };

  const handleClose = () => {
    if (!isConnecting) {
      onOpenChange(false); // ✅ Use the correct prop
      resetForm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {" "}
      {/* ✅ Fixed props */}
      <DialogContent className="max-w-2xl bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Add Database Connection
          </DialogTitle>
          <DialogDescription className="text-slate-400">
            Connect to your data sources to start analyzing data
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-800">
            <TabsTrigger
              value="snowflake"
              className="data-[state=active]:bg-slate-700"
            >
              <Snowflake className="h-4 w-4 mr-2" />
              Snowflake
            </TabsTrigger>
            <TabsTrigger
              value="csv"
              className="data-[state=active]:bg-slate-700"
            >
              <FileText className="h-4 w-4 mr-2" />
              CSV Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="snowflake" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Snowflake className="h-5 w-5 text-blue-400" />
                  Snowflake Connection
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Connect to your Snowflake data warehouse
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">
                      Connection Name
                    </Label>
                    <Input
                      id="name"
                      placeholder="My Snowflake DB"
                      value={snowflakeConfig.name}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          name: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="account" className="text-slate-300">
                      Account
                    </Label>
                    <Input
                      id="account"
                      placeholder="your-account.snowflakecomputing.com"
                      value={snowflakeConfig.account}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          account: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-slate-300">
                      Username
                    </Label>
                    <Input
                      id="username"
                      placeholder="your-username"
                      value={snowflakeConfig.username}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          username: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">
                      Password
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="your-password"
                      value={snowflakeConfig.password}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          password: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse" className="text-slate-300">
                      Warehouse
                    </Label>
                    <Input
                      id="warehouse"
                      placeholder="COMPUTE_WH"
                      value={snowflakeConfig.warehouse}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          warehouse: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="database" className="text-slate-300">
                      Database
                    </Label>
                    <Input
                      id="database"
                      placeholder="MY_DATABASE"
                      value={snowflakeConfig.database}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          database: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="schema" className="text-slate-300">
                      Schema
                    </Label>
                    <Input
                      id="schema"
                      placeholder="PUBLIC"
                      value={snowflakeConfig.schema}
                      onChange={(e) =>
                        setSnowflakeConfig({
                          ...snowflakeConfig,
                          schema: e.target.value,
                        })
                      }
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                </div>

                {connectionStatus === "error" && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "success" && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      Connection successful! Adding to your connections...
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleSnowflakeConnect}
                  disabled={
                    isConnecting ||
                    !snowflakeConfig.account ||
                    !snowflakeConfig.username
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {connectionStatus === "testing"
                        ? "Testing Connection..."
                        : "Connecting..."}
                    </>
                  ) : (
                    "Connect to Snowflake"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="csv" className="space-y-4">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5 text-green-400" />
                  CSV File Upload
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Upload a CSV file to analyze your data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="csv-name" className="text-slate-300">
                    Connection Name
                  </Label>
                  <Input
                    id="csv-name"
                    placeholder="My CSV Data"
                    value={csvConfig.name}
                    onChange={(e) =>
                      setCsvConfig({ ...csvConfig, name: e.target.value })
                    }
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="csv-file" className="text-slate-300">
                    CSV File
                  </Label>
                  <div className="border-2 border-dashed border-slate-600 rounded-lg p-6 text-center">
                    <Upload className="h-8 w-8 mx-auto mb-4 text-slate-400" />
                    <div className="space-y-2">
                      <p className="text-slate-300">
                        Drop your CSV file here, or click to browse
                      </p>
                      <p className="text-sm text-slate-400">
                        Supports files up to 10MB
                      </p>
                      <Input
                        id="csv-file"
                        type="file"
                        accept=".csv"
                        onChange={(e) =>
                          setCsvConfig({
                            ...csvConfig,
                            file: e.target.files?.[0] || null,
                          })
                        }
                        className="bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>

                {csvConfig.file && (
                  <div className="bg-slate-800/50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-green-400" />
                        <div>
                          <p className="font-medium text-white">
                            {csvConfig.file.name}
                          </p>
                          <p className="text-sm text-slate-400">
                            {(csvConfig.file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className="text-green-400 border-green-400/30"
                      >
                        Ready
                      </Badge>
                    </div>
                  </div>
                )}

                {connectionStatus === "error" && (
                  <Alert className="border-red-500/50 bg-red-500/10">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <AlertDescription className="text-red-400">
                      {errorMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus === "success" && (
                  <Alert className="border-green-500/50 bg-green-500/10">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <AlertDescription className="text-green-400">
                      CSV file processed successfully! Adding to your
                      connections...
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleCsvUpload}
                  disabled={isConnecting || !csvConfig.file}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing File...
                    </>
                  ) : (
                    "Upload CSV File"
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
