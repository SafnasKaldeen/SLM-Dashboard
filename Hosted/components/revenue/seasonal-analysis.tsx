"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Bar, BarChart } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const monthlySeasonality = [
  { month: "Jan", revenue: 85, index: 0.85, weather: "Cold" },
  { month: "Feb", revenue: 88, index: 0.88, weather: "Cold" },
  { month: "Mar", revenue: 95, index: 0.95, weather: "Mild" },
  { month: "Apr", revenue: 105, index: 1.05, weather: "Mild" },
  { month: "May", revenue: 115, index: 1.15, weather: "Warm" },
  { month: "Jun", revenue: 125, index: 1.25, weather: "Warm" },
  { month: "Jul", revenue: 130, index: 1.3, weather: "Hot" },
  { month: "Aug", revenue: 128, index: 1.28, weather: "Hot" },
  { month: "Sep", revenue: 118, index: 1.18, weather: "Warm" },
  { month: "Oct", revenue: 108, index: 1.08, weather: "Mild" },
  { month: "Nov", revenue: 92, index: 0.92, weather: "Cool" },
  { month: "Dec", revenue: 82, index: 0.82, weather: "Cold" },
]

const weeklyPattern = [
  { day: "Monday", revenue: 95, trips: 280 },
  { day: "Tuesday", revenue: 98, trips: 290 },
  { day: "Wednesday", revenue: 102, trips: 305 },
  { day: "Thursday", revenue: 105, trips: 315 },
  { day: "Friday", revenue: 125, trips: 380 },
  { day: "Saturday", revenue: 135, trips: 420 },
  { day: "Sunday", revenue: 115, trips: 350 },
]

const hourlyPattern = [
  { hour: "6 AM", weekday: 45, weekend: 15 },
  { hour: "7 AM", weekday: 85, weekend: 25 },
  { hour: "8 AM", weekday: 125, weekend: 35 },
  { hour: "9 AM", weekday: 95, weekend: 45 },
  { hour: "10 AM", weekday: 75, weekend: 65 },
  { hour: "11 AM", weekday: 65, weekend: 85 },
  { hour: "12 PM", weekday: 85, weekend: 105 },
  { hour: "1 PM", weekday: 75, weekend: 95 },
  { hour: "2 PM", weekday: 65, weekend: 85 },
  { hour: "3 PM", weekday: 70, weekend: 90 },
  { hour: "4 PM", weekday: 85, weekend: 95 },
  { hour: "5 PM", weekday: 115, weekend: 105 },
  { hour: "6 PM", weekday: 135, weekend: 125 },
  { hour: "7 PM", weekday: 125, weekend: 135 },
  { hour: "8 PM", weekday: 95, weekend: 115 },
  { hour: "9 PM", weekday: 75, weekend: 95 },
]

export function SeasonalAnalysis() {
  return (
    <Tabs defaultValue="monthly" className="space-y-4">
      <TabsList>
        <TabsTrigger value="monthly">Monthly Patterns</TabsTrigger>
        <TabsTrigger value="weekly">Weekly Patterns</TabsTrigger>
        <TabsTrigger value="hourly">Hourly Patterns</TabsTrigger>
      </TabsList>

      <TabsContent value="monthly" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Seasonality Index</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlySeasonality}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} domain={[0.7, 1.4]} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="space-y-2">
                            <div className="font-medium">{label}</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Seasonality Index</div>
                                <div className="font-bold">{data.index.toFixed(2)}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Weather</div>
                                <div className="font-bold">{data.weather}</div>
                              </div>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {data.index > 1 ? "Above" : "Below"} average by{" "}
                              {Math.abs((data.index - 1) * 100).toFixed(0)}%
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="index"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey={1}
                  stroke="hsl(var(--muted-foreground))"
                  strokeWidth={1}
                  strokeDasharray="5 5"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Peak Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">July</div>
              <p className="text-xs text-muted-foreground">+30% above average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Low Season</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">December</div>
              <p className="text-xs text-muted-foreground">-18% below average</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Summer Premium</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">+25%</div>
              <p className="text-xs text-muted-foreground">Jun-Aug vs Winter</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Weather Impact</CardTitle>
            </CardHeader>
            <CardContent>Weather data here</CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="weekly" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Revenue Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={weeklyPattern}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="day" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="space-y-2">
                            <div className="font-medium">{label}</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Revenue</div>
                                <div className="font-bold">${data.revenue}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Trips</div>
                                <div className="font-bold">{data.trips}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="hourly" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Hourly Demand Pattern</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={hourlyPattern}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="hour" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <YAxis className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="rounded-lg border bg-background p-3 shadow-sm">
                          <div className="space-y-2">
                            <div className="font-medium">{label}</div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Weekday</div>
                                <div className="font-bold">{data.weekday}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Weekend</div>
                                <div className="font-bold">{data.weekend}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="weekday"
                  stroke="hsl(var(--primary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 5 }}
                />
                <Line
                  type="monotone"
                  dataKey="weekend"
                  stroke="hsl(var(--secondary))"
                  strokeWidth={3}
                  dot={{ fill: "hsl(var(--secondary))", strokeWidth: 2, r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
