"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { GripVertical, BarChart3, LineChartIcon, PieChartIcon } from "lucide-react"

interface PivotTableAnalysisProps {
  filters?: any
}

interface Field {
  id: string
  name: string
  type: "dimension" | "measure"
  category: "financial" | "operational" | "temporal" | "geographic"
}

interface PivotConfig {
  rows: Field[]
  columns: Field[]
  values: Field[]
  filters: Field[]
}

const availableFields: Field[] = [
  { id: "area", name: "Area", type: "dimension", category: "geographic" },
  { id: "station", name: "Station", type: "dimension", category: "geographic" },
  { id: "month", name: "Month", type: "dimension", category: "temporal" },
  { id: "quarter", name: "Quarter", type: "dimension", category: "temporal" },
  { id: "customerSegment", name: "Customer Segment", type: "dimension", category: "operational" },
  { id: "paymentMethod", name: "Payment Method", type: "dimension", category: "operational" },
  { id: "revenue", name: "Revenue", type: "measure", category: "financial" },
  { id: "expenses", name: "Expenses", type: "measure", category: "financial" },
  { id: "profit", name: "Profit", type: "measure", category: "financial" },
  { id: "swapCount", name: "Battery Swaps", type: "measure", category: "operational" },
  { id: "electricityCost", name: "Electricity Cost", type: "measure", category: "financial" },
  { id: "directPay", name: "Direct Pay", type: "measure", category: "financial" },
  { id: "rent", name: "Rent", type: "measure", category: "financial" },
  { id: "profitMargin", name: "Profit Margin %", type: "measure", category: "financial" },
  { id: "avgSwapTime", name: "Avg Swap Time", type: "measure", category: "operational" },
  { id: "utilization", name: "Utilization Rate", type: "measure", category: "operational" },
]

const samplePivotData = [
  {
    area: "Downtown",
    month: "Jan",
    revenue: 75200,
    expenses: 46300,
    profit: 28900,
    swapCount: 1250,
    profitMargin: 38.4,
  },
  {
    area: "Downtown",
    month: "Feb",
    revenue: 78500,
    expenses: 48100,
    profit: 30400,
    swapCount: 1320,
    profitMargin: 38.7,
  },
  {
    area: "Downtown",
    month: "Mar",
    revenue: 82100,
    expenses: 49800,
    profit: 32300,
    swapCount: 1380,
    profitMargin: 39.3,
  },
  {
    area: "University District",
    month: "Jan",
    revenue: 42800,
    expenses: 28600,
    profit: 14200,
    swapCount: 850,
    profitMargin: 33.2,
  },
  {
    area: "University District",
    month: "Feb",
    revenue: 45200,
    expenses: 29800,
    profit: 15400,
    swapCount: 890,
    profitMargin: 34.1,
  },
  {
    area: "University District",
    month: "Mar",
    revenue: 47600,
    expenses: 31200,
    profit: 16400,
    swapCount: 920,
    profitMargin: 34.5,
  },
  {
    area: "Business District",
    month: "Jan",
    revenue: 58600,
    expenses: 35500,
    profit: 23100,
    swapCount: 980,
    profitMargin: 39.4,
  },
  {
    area: "Business District",
    month: "Feb",
    revenue: 61200,
    expenses: 36800,
    profit: 24400,
    swapCount: 1020,
    profitMargin: 39.9,
  },
  {
    area: "Business District",
    month: "Mar",
    revenue: 63800,
    expenses: 38200,
    profit: 25600,
    swapCount: 1060,
    profitMargin: 40.1,
  },
]

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function PivotTableAnalysis({ filters }: PivotTableAnalysisProps) {
  const [pivotConfig, setPivotConfig] = useState<PivotConfig>({
    rows: [availableFields.find((f) => f.id === "area")!],
    columns: [availableFields.find((f) => f.id === "month")!],
    values: [availableFields.find((f) => f.id === "revenue")!, availableFields.find((f) => f.id === "profit")!],
    filters: [],
  })

  const [chartType, setChartType] = useState<"bar" | "line" | "pie">("bar")
  const [viewMode, setViewMode] = useState<"builder" | "table" | "chart">("builder")

  const onDragEnd = useCallback(
    (result: any) => {
      if (!result.destination) return

      const { source, destination } = result
      const sourceDroppableId = source.droppableId
      const destDroppableId = destination.droppableId

      // Handle moving between different areas
      if (sourceDroppableId !== destDroppableId) {
        const sourceField =
          sourceDroppableId === "available"
            ? availableFields[source.index]
            : (pivotConfig[sourceDroppableId as keyof PivotConfig][source.index] as Field)

        if (sourceDroppableId === "available") {
          // Moving from available fields to a pivot area
          setPivotConfig((prev) => ({
            ...prev,
            [destDroppableId]: [...(prev[destDroppableId as keyof PivotConfig] as Field[]), sourceField],
          }))
        } else if (destDroppableId === "available") {
          // Moving from pivot area back to available
          setPivotConfig((prev) => ({
            ...prev,
            [sourceDroppableId]: (prev[sourceDroppableId as keyof PivotConfig] as Field[]).filter(
              (_, index) => index !== source.index,
            ),
          }))
        } else {
          // Moving between pivot areas
          setPivotConfig((prev) => {
            const newConfig = { ...prev }
            const sourceList = [...(newConfig[sourceDroppableId as keyof PivotConfig] as Field[])]
            const destList = [...(newConfig[destDroppableId as keyof PivotConfig] as Field[])]

            const [removed] = sourceList.splice(source.index, 1)
            destList.splice(destination.index, 0, removed)

            return {
              ...newConfig,
              [sourceDroppableId]: sourceList,
              [destDroppableId]: destList,
            }
          })
        }
      }
    },
    [pivotConfig],
  )

  const generateChart = () => {
    const data = samplePivotData.slice(0, 6) // Simplified for demo

    switch (chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="area" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))",
                }}
              />
              {pivotConfig.values.map((field, index) => (
                <Bar
                  key={field.id}
                  dataKey={field.id}
                  fill={CHART_COLORS[index % CHART_COLORS.length]}
                  name={field.name}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))",
                }}
              />
              {pivotConfig.values.map((field, index) => (
                <Line
                  key={field.id}
                  type="monotone"
                  dataKey={field.id}
                  stroke={CHART_COLORS[index % CHART_COLORS.length]}
                  strokeWidth={2}
                  dot={{ fill: CHART_COLORS[index % CHART_COLORS.length], strokeWidth: 2, r: 4 }}
                  name={field.name}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        const pieData = data.map((item, index) => ({
          name: item.area,
          value: item[pivotConfig.values[0]?.id] || 0,
          fill: CHART_COLORS[index % CHART_COLORS.length],
        }))

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )

      default:
        return null
    }
  }

  const FieldBadge = ({ field, isDragging }: { field: Field; isDragging?: boolean }) => (
    <Badge
      variant={field.type === "measure" ? "default" : "secondary"}
      className={`flex items-center gap-1 cursor-move ${isDragging ? "opacity-50" : ""}`}
    >
      <GripVertical className="w-3 h-3" />
      {field.name}
    </Badge>
  )

  return (
    <div className="space-y-6">
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="builder">Pivot Builder</TabsTrigger>
          <TabsTrigger value="table">Data Table</TabsTrigger>
          <TabsTrigger value="chart">Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="builder" className="space-y-4">
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Available Fields */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Available Fields</CardTitle>
                </CardHeader>
                <CardContent>
                  <Droppable droppableId="available">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[200px] space-y-2">
                        {availableFields
                          .filter(
                            (field) =>
                              !pivotConfig.rows.some((r) => r.id === field.id) &&
                              !pivotConfig.columns.some((c) => c.id === field.id) &&
                              !pivotConfig.values.some((v) => v.id === field.id) &&
                              !pivotConfig.filters.some((f) => f.id === field.id),
                          )
                          .map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <FieldBadge field={field} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </CardContent>
              </Card>

              {/* Pivot Configuration */}
              <div className="space-y-4">
                {/* Rows */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Rows</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="rows">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[60px] space-y-2">
                          {pivotConfig.rows.map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <FieldBadge field={field} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>

                {/* Columns */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Columns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="columns">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[60px] space-y-2">
                          {pivotConfig.columns.map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <FieldBadge field={field} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>

                {/* Values */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Values</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Droppable droppableId="values">
                      {(provided) => (
                        <div {...provided.droppableProps} ref={provided.innerRef} className="min-h-[60px] space-y-2">
                          {pivotConfig.values.map((field, index) => (
                            <Draggable key={field.id} draggableId={field.id} index={index}>
                              {(provided, snapshot) => (
                                <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                                  <FieldBadge field={field} isDragging={snapshot.isDragging} />
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DragDropContext>
        </TabsContent>

        <TabsContent value="table" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pivot Table Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left p-2 font-medium text-foreground">Area</th>
                      <th className="text-left p-2 font-medium text-foreground">Month</th>
                      {pivotConfig.values.map((field) => (
                        <th key={field.id} className="text-right p-2 font-medium text-foreground">
                          {field.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {samplePivotData.map((row, index) => (
                      <tr key={index} className="border-b border-border hover:bg-muted/50">
                        <td className="p-2 text-foreground">{row.area}</td>
                        <td className="p-2 text-foreground">{row.month}</td>
                        {pivotConfig.values.map((field) => (
                          <td key={field.id} className="p-2 text-right font-mono text-foreground">
                            {field.type === "measure" && field.category === "financial"
                              ? `$${row[field.id as keyof typeof row]?.toLocaleString()}`
                              : row[field.id as keyof typeof row]?.toLocaleString()}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chart" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Dynamic Visualization</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant={chartType === "bar" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("bar")}
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Bar
                  </Button>
                  <Button
                    variant={chartType === "line" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("line")}
                  >
                    <LineChartIcon className="w-4 h-4 mr-1" />
                    Line
                  </Button>
                  <Button
                    variant={chartType === "pie" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setChartType("pie")}
                  >
                    <PieChartIcon className="w-4 h-4 mr-1" />
                    Pie
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>{generateChart()}</CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
