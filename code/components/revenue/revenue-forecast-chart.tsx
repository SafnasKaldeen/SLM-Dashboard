"use client"

import { Line, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Area, AreaChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const forecastData = [
  { month: "Jan", actual: 124563, forecast: null, lower: null, upper: null },
  { month: "Feb", actual: 135789, forecast: null, lower: null, upper: null },
  { month: "Mar", actual: 142356, forecast: null, lower: null, upper: null },
  { month: "Apr", actual: 156789, forecast: null, lower: null, upper: null },
  { month: "May", actual: 168234, forecast: null, lower: null, upper: null },
  { month: "Jun", actual: 175432, forecast: null, lower: null, upper: null },
  { month: "Jul", actual: null, forecast: 185000, lower: 175000, upper: 195000 },
  { month: "Aug", actual: null, forecast: 192000, lower: 180000, upper: 204000 },
  { month: "Sep", actual: null, forecast: 188000, lower: 175000, upper: 201000 },
  { month: "Oct", actual: null, forecast: 195000, lower: 180000, upper: 210000 },
  { month: "Nov", actual: null, forecast: 205000, lower: 190000, upper: 220000 },
  { month: "Dec", actual: null, forecast: 215000, lower: 200000, upper: 230000 },
]

export function RevenueForecastChart() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Forecast Accuracy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94.2%</div>
            <p className="text-xs text-muted-foreground">Based on last 12 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Predicted Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">+18.5%</div>
            <p className="text-xs text-muted-foreground">Next 6 months</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Confidence Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">High confidence</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Revenue Forecast</CardTitle>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded-full"></div>
                <span>Actual</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-chart-2 rounded-full"></div>
                <span>Forecast</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-muted rounded-full"></div>
                <span>Confidence Range</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    return (
                      <div className="rounded-lg border bg-background p-3 shadow-sm">
                        <div className="space-y-2">
                          <div className="font-medium">{label} 2024</div>
                          {data.actual && (
                            <div>
                              <div className="text-xs text-muted-foreground">Actual Revenue</div>
                              <div className="font-bold text-primary">${data.actual.toLocaleString()}</div>
                            </div>
                          )}
                          {data.forecast && (
                            <>
                              <div>
                                <div className="text-xs text-muted-foreground">Forecasted Revenue</div>
                                <div className="font-bold text-chart-2">${data.forecast.toLocaleString()}</div>
                              </div>
                              <div className="text-xs">
                                Range: ${data.lower.toLocaleString()} - ${data.upper.toLocaleString()}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Area
                type="monotone"
                dataKey="upper"
                stackId="1"
                stroke="none"
                fill="hsl(var(--muted))"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stackId="1"
                stroke="none"
                fill="hsl(var(--background))"
                fillOpacity={1}
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="hsl(var(--primary))"
                strokeWidth={3}
                dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                stroke="hsl(var(--chart-2))"
                strokeWidth={3}
                strokeDasharray="5 5"
                dot={{ fill: "hsl(var(--chart-2))", strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Key Forecast Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Seasonal Trends</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  High Impact
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Fleet Expansion</span>
                <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                  High Impact
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Market Competition</span>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Medium Impact
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Economic Conditions</span>
                <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400">
                  Medium Impact
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Weather Patterns</span>
                <Badge variant="secondary">Low Impact</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Forecast Scenarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Optimistic</span>
                <span className="font-medium text-green-600">$1.35M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Most Likely</span>
                <span className="font-medium">$1.18M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Conservative</span>
                <span className="font-medium text-orange-600">$1.05M</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Current Trajectory</span>
                  <span className="font-bold text-primary">$1.18M</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
