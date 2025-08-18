import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-950 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Skeleton */}
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto bg-slate-800" />
          <Skeleton className="h-12 w-96 mx-auto bg-slate-800" />
          <Skeleton className="h-6 w-64 mx-auto bg-slate-800" />
        </div>

        {/* KPI Cards Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/50 border-slate-700/50">
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2 bg-slate-700" />
                <Skeleton className="h-8 w-16 bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Charts Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="bg-slate-900/80 border-slate-700/50">
              <CardContent className="p-6">
                <Skeleton className="h-6 w-48 mb-4 bg-slate-700" />
                <Skeleton className="h-64 w-full bg-slate-700" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="flex items-center justify-center py-8">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
            <span className="text-slate-300">Loading vehicle data...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
