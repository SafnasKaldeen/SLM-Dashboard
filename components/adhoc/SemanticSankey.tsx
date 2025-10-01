"use client";

import React, { useState, useMemo } from "react";
import ReactECharts from "echarts-for-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Network,
  Search,
  Filter,
  Users,
  Database,
  Shield,
  Eye,
  Edit,
  Lock,
  Unlock,
  Settings,
  ChevronRight,
  TrendingUp,
  BarChart3,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Zap,
  Clock,
  Calendar,
  Play,
  Loader2,
  History,
  Trash2,
} from "lucide-react";

type ColumnType = "integer" | "float" | "string" | "date";

interface ColumnMeta {
  type: ColumnType;
  synonyms: string[];
}

interface TableMeta {
  description: string;
  columns: Record<string, ColumnMeta>;
  synonyms: string[];
}

interface AccessControl {
  read: string[];
  write?: string[];
  columnConstraints?: Record<string, string[]>;
}

interface Catalog {
  tables: Record<string, TableMeta>;
  accessControl: Record<string, AccessControl>;
}

interface SankeyProps {
  catalog: Catalog;
  selectedTables: string[];
  currentUserRoles: string[];
  roles: string[];
  queryName?: string;
  loading?: boolean;
  onTableSelect?: (table: string) => void;
  onRoleChange?: (roles: string[]) => void;
}

// Loading spinner component
const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center py-16 space-y-6">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-slate-600 border-t-cyan-400 rounded-full animate-spin" />
      <div
        className="absolute inset-0 w-16 h-16 border-4 border-transparent border-l-cyan-400 rounded-full animate-spin"
        style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
      />
    </div>
    <div className="text-center space-y-2">
      <div className="flex items-center justify-center gap-2">
        <Network className="h-5 w-5 text-cyan-400 animate-pulse" />
        <h3 className="text-lg font-medium text-white">Building Access Flow</h3>
      </div>
      <div className="text-sm text-slate-400 space-y-1">
        <p className="animate-pulse">
          Analyzing permissions and relationships...
        </p>
        <div className="flex items-center justify-center gap-1">
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  </div>
);

export default function EnhancedSemanticSankey({
  catalog,
  selectedTables,
  currentUserRoles,
  roles,
  queryName = "Current Query",
  loading = false,
  onTableSelect,
  onRoleChange,
}: SankeyProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");
  const [showOnlyAccessible, setShowOnlyAccessible] = useState(false);
  const [viewMode, setViewMode] = useState<"flow" | "matrix">("flow");

  // Calculate access statistics
  const accessStats = useMemo(() => {
    const totalTables = Object.keys(catalog.tables).length;
    const accessibleTables = Object.keys(catalog.tables).filter((table) => {
      const accessRoles = catalog.accessControl[table]?.read || [];
      return currentUserRoles.some((role) => accessRoles.includes(role));
    }).length;

    const blockedTables = selectedTables.filter((table) => {
      const accessRoles = catalog.accessControl[table]?.read || [];
      return !currentUserRoles.some((role) => accessRoles.includes(role));
    }).length;

    return {
      totalTables,
      accessibleTables,
      blockedTables,
      accessRate:
        totalTables > 0
          ? Math.round((accessibleTables / totalTables) * 100)
          : 0,
    };
  }, [catalog, currentUserRoles, selectedTables]);

  // Filter tables based on search and role
  const filteredTables = useMemo(() => {
    let tables = Object.keys(catalog.tables);

    if (searchTerm) {
      tables = tables.filter(
        (table) =>
          table.toLowerCase().includes(searchTerm.toLowerCase()) ||
          catalog.tables[table].description
            .toLowerCase()
            .includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRole !== "All Roles") {
      tables = tables.filter((table) => {
        const accessRoles = catalog.accessControl[table]?.read || [];
        return accessRoles.includes(selectedRole);
      });
    }

    if (showOnlyAccessible) {
      tables = tables.filter((table) => {
        const accessRoles = catalog.accessControl[table]?.read || [];
        return currentUserRoles.some((role) => accessRoles.includes(role));
      });
    }

    return tables;
  }, [catalog, searchTerm, selectedRole, showOnlyAccessible, currentUserRoles]);

  const nodes = [
    // Roles on the left
    ...roles.map((role, index) => {
      const isCurrentUserRole = currentUserRoles.includes(role);
      return {
        name: `role:${role}`,
        label: {
          show: true,
          fontSize: 12,
          fontWeight: isCurrentUserRole ? "bold" : "normal",
          color: isCurrentUserRole ? "#06b6d4" : "#94a3b8",
        },
        itemStyle: {
          color: isCurrentUserRole ? "#0891b2" : "#6b7280",
          borderColor: isCurrentUserRole ? "#06b6d4" : "transparent",
          borderWidth: isCurrentUserRole ? 2 : 0,
        },
        x: 0.1,
        y: (index + 1) / (roles.length + 1),
      };
    }),

    // Tables in the middle
    ...filteredTables.map((table, index) => {
      const accessRoles = catalog.accessControl[table]?.read || [];
      const hasAccess = currentUserRoles.some((role) =>
        accessRoles.includes(role)
      );
      const isSelected = selectedTables.includes(table);

      let color = "rgba(100, 116, 139, 0.3)";

      if (isSelected && hasAccess)
        color = "#10b981"; // green for accessible selected
      else if (isSelected && !hasAccess)
        color = "#ef4444"; // red for blocked selected
      else if (hasAccess) color = "#6b7280"; // light gray for accessible

      return {
        name: `table:${table}`,
        label: {
          show: true,
          fontSize: 11,
          fontWeight: isSelected ? "bold" : "normal",
          color: isSelected ? "#ffffff" : "#d1d5db",
        },
        itemStyle: {
          color,
          borderColor: isSelected ? "#ffffff" : "transparent",
          borderWidth: isSelected ? 2 : 0,
        },
        x: 0.5,
        y: (index + 1) / (filteredTables.length + 1),
      };
    }),

    // Query on the right
    {
      name: `Query`,
      label: {
        show: true,
        fontSize: 14,
        fontWeight: "bold",
        color: "#ffffff",
      },
      itemStyle: {
        color: accessStats.blockedTables > 0 ? "#f59e0b" : "#8b5cf6",
        borderColor: "#ffffff",
        borderWidth: 2,
      },
      x: 0.9,
      y: 0.5,
    },
  ];

  const roleToTableLinks = Object.entries(catalog.accessControl)
    .filter(([tableName]) => filteredTables.includes(tableName))
    .flatMap(([tableName, ac]) => {
      if (!ac.read) return [];
      return ac.read.map((role) => ({
        source: `role:${role}`,
        target: `table:${tableName}`,
        value: 1,
        lineStyle: {
          color: currentUserRoles.includes(role) ? "#0891b2" : "#6b7280",
          opacity: currentUserRoles.includes(role) ? 0.7 : 0.3,
          width: currentUserRoles.includes(role) ? 2 : 1,
        },
      }));
    });

  const queryToTableLinks = selectedTables
    .filter((table) => filteredTables.includes(table))
    .map((table) => {
      const accessRoles = catalog.accessControl[table]?.read || [];
      const hasAccess = currentUserRoles.some((role) =>
        accessRoles.includes(role)
      );

      return {
        source: `table:${table}`,
        target: `Query`,
        value: 2,
        lineStyle: {
          color: hasAccess ? "#10b981" : "#ef4444",
          opacity: 0.8,
          width: 3,
        },
      };
    });

  const option = {
    backgroundColor: "transparent",
    tooltip: {
      trigger: "item",
      triggerOn: "mousemove",
      backgroundColor: "#1e293b",
      borderColor: "#334155",
      borderWidth: 1,
      textStyle: {
        color: "#ffffff",
        fontSize: 12,
      },
      formatter: (params: any) => {
        if (params.dataType === "node") {
          if (params.name.startsWith("role:")) {
            const role = params.name.replace("role:", "");
            const isActive = currentUserRoles.includes(role);
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; color: #06b6d4;">${role}</div>
                <div style="color: #94a3b8; font-size: 11px;">
                  ${isActive ? "✓ Active Role" : "Available Role"}
                </div>
              </div>
            `;
          }
          if (params.name.startsWith("table:")) {
            const table = params.name.replace("table:", "");
            const accessRoles = catalog.accessControl[table]?.read || [];
            const hasAccess = currentUserRoles.some((role) =>
              accessRoles.includes(role)
            );
            const isSelected = selectedTables.includes(table);

            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; color: #ffffff;">${table}</div>
                <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">
                  ${catalog.tables[table]?.description || "No description"}
                </div>
                <div style="margin-top: 8px;">
                  <div style="color: ${
                    hasAccess ? "#10b981" : "#ef4444"
                  }; font-size: 11px;">
                    ${hasAccess ? "✓ Accessible" : "✗ Access Denied"}
                  </div>
                  <div style="color: ${
                    isSelected ? "#8b5cf6" : "#64748b"
                  }; font-size: 11px;">
                    ${isSelected ? "● Selected" : "○ Available"}
                  </div>
                </div>
                <div style="margin-top: 4px; color: #64748b; font-size: 10px;">
                  Access: ${accessRoles.join(", ") || "No access"}
                </div>
              </div>
            `;
          }
          if (params.name.startsWith("query:")) {
            return `
              <div style="padding: 8px;">
                <div style="font-weight: bold; color: #8b5cf6;">${queryName}</div>
                <div style="color: #94a3b8; font-size: 11px; margin-top: 4px;">
                  ${selectedTables.length} tables selected
                </div>
                ${
                  accessStats.blockedTables > 0
                    ? `
                  <div style="color: #ef4444; font-size: 11px; margin-top: 4px;">
                    ⚠ ${accessStats.blockedTables} blocked tables
                  </div>
                `
                    : ""
                }
              </div>
            `;
          }
        }
        return params.name;
      },
    },
    series: [
      {
        type: "sankey",
        layout: "none", // keep as none or try 'sankey'
        nodeAlign: "justify", // NEW: distribute nodes evenly vertically
        emphasis: {
          focus: "adjacency",
        },
        blur: {
          itemStyle: {
            opacity: 0.3,
          },
          lineStyle: {
            opacity: 0.1,
          },
        },
        data: nodes,
        links: [...roleToTableLinks, ...queryToTableLinks],
        lineStyle: {
          curveness: 0.6,
        },
        nodeWidth: 14,
        nodeGap: 8,
        draggable: false,
      },
    ],
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Network className="h-5 w-5" />
            Semantic Access Flow
          </CardTitle>
          <CardDescription className="text-slate-400">
            Visualize role-based access patterns and query dependencies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  placeholder="Search tables..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                />
              </div>

              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger className="w-48 bg-slate-700 border-slate-600 text-white">
                  <Users className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700">
                  <SelectItem
                    value="All Roles"
                    className="text-white hover:bg-slate-700"
                  >
                    All Roles
                  </SelectItem>
                  {roles.map((role) => (
                    <SelectItem
                      key={role}
                      value={role}
                      className="text-white hover:bg-slate-700"
                    >
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Button
                variant={showOnlyAccessible ? "default" : "outline"}
                size="sm"
                onClick={() => setShowOnlyAccessible(!showOnlyAccessible)}
                className={
                  showOnlyAccessible
                    ? "bg-cyan-600 text-white hover:bg-cyan-700"
                    : "border-slate-600 text-slate-300 hover:bg-slate-700"
                }
              >
                <Shield className="h-4 w-4 mr-2" />
                Accessible Only
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-xs border-slate-600 text-slate-300"
              >
                {filteredTables.length} tables visible
              </Badge>
              <Badge
                variant="outline"
                className={`text-xs border-slate-600 ${
                  accessStats.blockedTables > 0
                    ? "text-red-400"
                    : "text-green-400"
                }`}
              >
                {accessStats.blockedTables > 0
                  ? `${accessStats.blockedTables} blocked`
                  : "All accessible"}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current User Roles */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium text-white">
                Accessed User Role:
              </span>
              <div className="flex gap-2">
                {currentUserRoles.map((role) => (
                  <Badge
                    key={role}
                    variant="outline"
                    className="text-xs border-cyan-400 text-cyan-400"
                  >
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white">Query:</span>
              <Badge
                variant="outline"
                className="text-xs border-purple-400 text-purple-400"
              >
                {queryName}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sankey Diagram */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-6">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <ReactECharts
              option={option}
              style={{
                height: Math.max(filteredTables.length * 30, 600),
                width: "100%",
              }}
              opts={{ renderer: "canvas" }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Access Statistics */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <Database className="h-4 w-4 text-slate-400" />
                <p className="text-2xl font-bold text-white">
                  {accessStats.totalTables}
                </p>
              </div>
              <p className="text-sm text-slate-400">Total Tables</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <p className="text-2xl font-bold text-white">
                  {accessStats.accessibleTables}
                </p>
              </div>
              <p className="text-sm text-slate-400">Accessible</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <XCircle className="h-4 w-4 text-red-400" />
                <p className="text-2xl font-bold text-white">
                  {accessStats.blockedTables}
                </p>
              </div>
              <p className="text-sm text-slate-400">Blocked</p>
            </div>
            <div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-cyan-400" />
                <p className="text-2xl font-bold text-white">
                  {accessStats.accessRate}%
                </p>
              </div>
              <p className="text-sm text-slate-400">Access Rate</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Issues Warning */}
      {accessStats.blockedTables > 0 && (
        <Card className="bg-red-900/20 border-red-800">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-200 mb-1">
                  Access Issues Detected
                </h4>
                <p className="text-sm text-red-300 mb-3">
                  {accessStats.blockedTables} selected table
                  {accessStats.blockedTables > 1 ? "s " : " "}
                  cannot be accessed with your current roles. This may cause
                  query failures.
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedTables
                    .filter((table) => {
                      const accessRoles =
                        catalog.accessControl[table]?.read || [];
                      return !currentUserRoles.some((role) =>
                        accessRoles.includes(role)
                      );
                    })
                    .map((table) => (
                      <Badge
                        key={table}
                        variant="outline"
                        className="text-xs border-red-400 text-red-400"
                      >
                        {table}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
