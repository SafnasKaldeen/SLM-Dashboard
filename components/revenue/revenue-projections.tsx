"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

const yearlyProjections = [
  { year: "2024", conservative: 2100000, realistic: 2400000, optimistic: 2800000 },
  { year: "2025", conservative: 2300000, realistic: 2750000, optimistic: 3200000 },
  { year: "2026", conservative: 2500000, realistic: 3100000, optimistic: 3700000 },
  { year: "2027", conservative: 2700000, realistic: 3500000, optimistic: 4300000 },
]

const scenarioFactors = [
  { factor: "Fleet Size Expansion", impact: "+15%", probability: "High" },
  { factor: "New Market Entry", impact: "+25%", probability: "Medium" },
  { factor: "Premium Service Launch", impact: "+12%", probability: "High" },
  { factor: "Economic Downturn", impact: "-8%", probability: "Low" },
  { factor: "Increased Competition", impact: "-5%", probability: "Medium" },
  { factor: "Regulatory Changes", impact: "-3%", probability: "Low" },
]

export function RevenueProjections() {
  return (
    <div className="space-y-4">
      <Tabs defaultValue="projections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="projections">Revenue Projections</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Analysis</TabsTrigger>
          <TabsTrigger value="assumptions">Key Assumptions</TabsTrigger>
        </TabsList>

        <TabsContent value="projections" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Year Revenue Projections</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={yearlyProjections}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="year" className="text-xs fill-muted-foreground" tick={{ fontSize: 12 }} />
                  <YAxis
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload
                        return (
                          <div className="rounded-lg border bg-background p-3 shadow-sm">
                            <div className="space-y-2">
                              <div className="font-medium">{label} Projections</div>
                              <div className="grid gap-2">
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Conservative:</span>
                                  <span className="font-medium">${(data.conservative / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Realistic:</span>
                                  <span className="font-medium">${(data.realistic / 1000000).toFixed(1)}M</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-muted-foreground">Optimistic:</span>
                                  <span className="font-medium">${(data.optimistic / 1000000).toFixed(1)}M</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )
                      }
                      return null
                    }}
                  />
                  <Bar dataKey="conservative" fill="hsl(var(--chart-3))" name="Conservative" />
                  <Bar dataKey="realistic" fill="hsl(var(--primary))" name="Realistic" />
                  <Bar dataKey="optimistic" fill="hsl(var(--chart-1))" name="Optimistic" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">2027 Conservative</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">$2.7M</div>
                <p className="text-xs text-muted-foreground">+28% from 2024</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">2027 Realistic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">$3.5M</div>
                <p className="text-xs text-muted-foreground">+46% from 2024</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">2027 Optimistic</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">$4.3M</div>
                <p className="text-xs text-muted-foreground">+79% from 2024</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Impact Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarioFactors.map((factor, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="space-y-1">
                      <div className="font-medium">{factor.factor}</div>
                      <div className="text-sm text-muted-foreground">Probability: {factor.probability}</div>
                    </div>
                    <div className="text-right">
                      <Badge
                        className={
                          factor.impact.startsWith("+")
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                        }
                      >
                        {factor.impact}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assumptions" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Growth Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Annual Fleet Growth</span>
                    <span className="font-medium">15-20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Market Penetration</span>
                    <span className="font-medium">5-8%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Price Increases</span>
                    <span className="font-medium">3-5% annually</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Usage Growth</span>
                    <span className="font-medium">10-15%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Market Assumptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Market Size Growth</span>
                    <span className="font-medium">12% CAGR</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Competition Impact</span>
                    <span className="font-medium">-2% to -5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Economic Growth</span>
                    <span className="font-medium">2-3% GDP</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Regulatory Support</span>
                    <span className="font-medium">Stable</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
