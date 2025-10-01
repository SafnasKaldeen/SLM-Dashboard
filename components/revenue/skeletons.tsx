import { cn } from "@/lib/utils";

export function ChartSkeleton({ height = "h-[300px]" }: { height?: string }) {
  return (
    <div className={cn("bg-muted rounded-md animate-pulse", height)}>
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading chart...
      </div>
    </div>
  );
}

export function MetricCardSkeleton({ height = "h-32" }: { height?: string }) {
  return (
    <div className={cn("bg-muted rounded-lg animate-pulse p-4", height)}>
      <div className="space-y-2">
        <div className="w-1/2 h-4 bg-muted-foreground/30 rounded" />
        <div className="w-1/3 h-6 bg-muted-foreground/50 rounded" />
        <div className="w-1/4 h-3 bg-muted-foreground/20 rounded" />
      </div>
    </div>
  );
}

export function TableSkeleton({ height = "h-[500px]" }: { height?: string }) {
  return (
    <div className={cn("bg-muted rounded-md animate-pulse", height)}>
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading table...
      </div>
    </div>
  );
}

export function HeatmapSkeleton({ height = "h-[600px]" }: { height?: string }) {
  return (
    <div className={cn("bg-muted rounded-md animate-pulse", height)}>
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Generating heatmap...
      </div>
    </div>
  );
}

export function ChatSkeleton({ height = "h-[600px]" }: { height?: string }) {
  return (
    <div className={cn("bg-muted rounded-md animate-pulse", height)}>
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Loading chat assistant...
      </div>
    </div>
  );
}

export function PivotSkeleton({ height = "h-[700px]" }: { height?: string }) {
  return (
    <div className={cn("bg-muted rounded-md animate-pulse", height)}>
      <div className="flex items-center justify-center h-full text-sm text-muted-foreground">
        Building pivot view...
      </div>
    </div>
  );
}
