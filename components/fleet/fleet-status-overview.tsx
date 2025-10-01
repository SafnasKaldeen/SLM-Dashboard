"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Battery, Activity, AlertTriangle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function FleetStatusOverview() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Battery className="mr-2 h-5 w-5 text-green-500" />
            Battery Status
          </CardTitle>
          <CardDescription className="text-slate-400">Fleet-wide battery health and charge levels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300">Battery Health Distribution</div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Excellent (90-100%)</span>
                    </div>
                    <span className="text-xs text-green-400">68 vehicles</span>
                  </div>
                  <Progress value={53} className="h-2 bg-slate-700">
                    <div className="h-full bg-green-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Good (75-89%)</span>
                    </div>
                    <span className="text-xs text-cyan-400">42 vehicles</span>
                  </div>
                  <Progress value={33} className="h-2 bg-slate-700">
                    <div className="h-full bg-cyan-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Fair (60-74%)</span>
                    </div>
                    <span className="text-xs text-amber-400">12 vehicles</span>
                  </div>
                  <Progress value={9} className="h-2 bg-slate-700">
                    <div className="h-full bg-amber-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Poor (Below 60%)</span>
                    </div>
                    <span className="text-xs text-red-400">6 vehicles</span>
                  </div>
                  <Progress value={5} className="h-2 bg-slate-700">
                    <div className="h-full bg-red-500 rounded-full"></div>
                  </Progress>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300">Current Charge Levels</div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Full (80-100%)</span>
                    </div>
                    <span className="text-xs text-green-400">45 vehicles</span>
                  </div>
                  <Progress value={35} className="h-2 bg-slate-700">
                    <div className="h-full bg-green-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Good (50-79%)</span>
                    </div>
                    <span className="text-xs text-cyan-400">52 vehicles</span>
                  </div>
                  <Progress value={41} className="h-2 bg-slate-700">
                    <div className="h-full bg-cyan-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Low (20-49%)</span>
                    </div>
                    <span className="text-xs text-amber-400">25 vehicles</span>
                  </div>
                  <Progress value={20} className="h-2 bg-slate-700">
                    <div className="h-full bg-amber-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Critical (Below 20%)</span>
                    </div>
                    <span className="text-xs text-red-400">6 vehicles</span>
                  </div>
                  <Progress value={5} className="h-2 bg-slate-700">
                    <div className="h-full bg-red-500 rounded-full"></div>
                  </Progress>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-700/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-slate-100 flex items-center">
            <Activity className="mr-2 h-5 w-5 text-blue-500" />
            Operational Status
          </CardTitle>
          <CardDescription className="text-slate-400">Current status of all vehicles in the fleet</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300">Vehicle Status</div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Active (In Use)</span>
                    </div>
                    <span className="text-xs text-green-400">72 vehicles</span>
                  </div>
                  <Progress value={56} className="h-2 bg-slate-700">
                    <div className="h-full bg-green-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-cyan-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Idle (Available)</span>
                    </div>
                    <span className="text-xs text-cyan-400">40 vehicles</span>
                  </div>
                  <Progress value={31} className="h-2 bg-slate-700">
                    <div className="h-full bg-cyan-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Charging</span>
                    </div>
                    <span className="text-xs text-amber-400">8 vehicles</span>
                  </div>
                  <Progress value={6} className="h-2 bg-slate-700">
                    <div className="h-full bg-amber-500 rounded-full"></div>
                  </Progress>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                      <span className="text-xs text-slate-400">Maintenance</span>
                    </div>
                    <span className="text-xs text-red-400">8 vehicles</span>
                  </div>
                  <Progress value={6} className="h-2 bg-slate-700">
                    <div className="h-full bg-red-500 rounded-full"></div>
                  </Progress>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300">Alert Distribution</div>
              </div>
              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 text-red-500 mr-2" />
                      <span className="text-xs text-slate-400">Critical Alerts</span>
                    </div>
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/50">3</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 text-amber-500 mr-2" />
                      <span className="text-xs text-slate-400">Warning Alerts</span>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/50">12</Badge>
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center">
                      <AlertTriangle className="h-3 w-3 text-blue-500 mr-2" />
                      <span className="text-xs text-slate-400">Information Alerts</span>
                    </div>
                    <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/50">24</Badge>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-slate-300">Recent Activity</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                    <span className="text-xs text-slate-300">Vehicle EV-087 started route</span>
                  </div>
                  <span className="text-xs text-slate-500">2m ago</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mr-2"></div>
                    <span className="text-xs text-slate-300">Vehicle EV-042 started charging</span>
                  </div>
                  <span className="text-xs text-slate-500">15m ago</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-md bg-slate-800/50 border border-slate-700/50">
                  <div className="flex items-center">
                    <div className="w-2 h-2 rounded-full bg-red-500 mr-2"></div>
                    <span className="text-xs text-slate-300">Vehicle EV-103 maintenance alert</span>
                  </div>
                  <span className="text-xs text-slate-500">32m ago</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
