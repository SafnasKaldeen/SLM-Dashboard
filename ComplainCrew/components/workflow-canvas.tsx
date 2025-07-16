import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  User,
  Bot,
  Wrench,
  MapPin,
  DollarSign,
  Search,
  Database,
  Bell,
  MessageSquare,
  Shield,
  Activity,
  Workflow,
  Play,
  RotateCcw,
  Pause,
} from "lucide-react";

// Types
interface WorkflowStep {
  id: string;
  agent: string;
  action: string;
  toolUsed?: string;
  duration: number;
  status: "pending" | "processing" | "completed" | "failed";
  result?: string;
  timestamp?: number;
}

interface WorkflowNode {
  id: string;
  name: string;
  type: "start" | "agent" | "tool" | "end";
  icon: string;
  layer: number;
  position: { x: number; y: number };
  width: number;
  height: number;
  color: string;
}

interface WorkflowEdge {
  from: string;
  to: string;
  type: "solid" | "dashed";
  label?: string;
}

interface EnhancedWorkflowCanvasProps {
  workflow: WorkflowStep[];
  isProcessing: boolean;
  onStartNodeClick: () => void;
  setIsProcessing: (processing: boolean) => void;
  onReset?: () => void;
}

// Enhanced icon mapping
const iconMap: { [key: string]: React.ElementType } = {
  User: User,
  Bot: Bot,
  Wrench: Wrench,
  MapPin: MapPin,
  DollarSign: DollarSign,
  Search: Search,
  Database: Database,
  Bell: Bell,
  CheckCircle: CheckCircle,
  Clock: Clock,
  AlertCircle: AlertCircle,
  Zap: Zap,
  MessageSquare: MessageSquare,
  Shield: Shield,
  Activity: Activity,
  Workflow: Workflow,
};

// Agent to visual node mapping
const agentToVisualNodeMap: { [key: string]: string } = {
  customer_submission: "customer_submission_node",
  support_agent: "support_agent_node",
  technician: "technician_node",
  finance_officer: "finance_officer_node",
  station_manager: "station_manager_node",
  complaint_manager: "complaint_manager_node",
  resolution_complete: "resolution_complete_node",
  analysis_tool: "analysis_tool_node",
  database_tool: "database_tool_node",
  notification_tool: "notification_tool_node",
  error_handler: "error_handler_node",
};

// Workflow nodes configuration
const workflowNodes: WorkflowNode[] = [
  {
    id: "customer_submission_node",
    name: "Customer Submission\nStart Complaint",
    type: "start",
    icon: "User",
    layer: 0,
    position: { x: 50, y: 250 },
    width: 180,
    height: 90,
    color: "green",
  },
  {
    id: "support_agent_node",
    name: "Support Agent\nTriage & Classify",
    type: "agent",
    icon: "MessageSquare",
    layer: 1,
    position: { x: 280, y: 250 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "analysis_tool_node",
    name: "Analysis Tool\nData Insights",
    type: "tool",
    icon: "Search",
    layer: 2,
    position: { x: 510, y: 50 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "database_tool_node",
    name: "Database Tool\nQuery Data",
    type: "tool",
    icon: "Database",
    layer: 2,
    position: { x: 510, y: 200 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "notification_tool_node",
    name: "Notification Tool\nSend Alerts",
    type: "tool",
    icon: "Bell",
    layer: 2,
    position: { x: 510, y: 350 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "technician_node",
    name: "Technician\nResolve Technical",
    type: "agent",
    icon: "Wrench",
    layer: 3,
    position: { x: 740, y: 50 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "finance_officer_node",
    name: "Finance Officer\nHandle Billing",
    type: "agent",
    icon: "DollarSign",
    layer: 3,
    position: { x: 740, y: 200 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "station_manager_node",
    name: "Station Manager\nManage Operations",
    type: "agent",
    icon: "MapPin",
    layer: 3,
    position: { x: 740, y: 350 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "complaint_manager_node",
    name: "Complaint Manager\nEscalate & Oversee",
    type: "agent",
    icon: "Shield",
    layer: 3,
    position: { x: 740, y: 500 },
    width: 180,
    height: 90,
    color: "gray",
  },
  {
    id: "error_handler_node",
    name: "Error Handler\nManual Review",
    type: "end",
    icon: "AlertCircle",
    layer: 3,
    position: { x: 970, y: 500 },
    width: 180,
    height: 90,
    color: "red",
  },
  {
    id: "resolution_complete_node",
    name: "Resolution Complete\nComplaint Closed",
    type: "end",
    icon: "CheckCircle",
    layer: 4,
    position: { x: 970, y: 250 },
    width: 180,
    height: 90,
    color: "orange",
  },
];

// Workflow edges configuration
const workflowEdges: WorkflowEdge[] = [
  {
    from: "customer_submission_node",
    to: "support_agent_node",
    type: "solid",
    label: "New Complaint",
  },
  {
    from: "support_agent_node",
    to: "analysis_tool_node",
    type: "dashed",
    label: "Use Analysis",
  },
  {
    from: "support_agent_node",
    to: "database_tool_node",
    type: "dashed",
    label: "Use Database",
  },
  {
    from: "support_agent_node",
    to: "notification_tool_node",
    type: "dashed",
    label: "Use Notification",
  },
  {
    from: "support_agent_node",
    to: "technician_node",
    type: "solid",
    label: "Route: Technical",
  },
  {
    from: "support_agent_node",
    to: "finance_officer_node",
    type: "solid",
    label: "Route: Billing",
  },
  {
    from: "support_agent_node",
    to: "station_manager_node",
    type: "solid",
    label: "Route: Operations",
  },
  {
    from: "support_agent_node",
    to: "complaint_manager_node",
    type: "solid",
    label: "Route: Complex",
  },
  {
    from: "analysis_tool_node",
    to: "technician_node",
    type: "solid",
    label: "Inform Tech",
  },
  {
    from: "database_tool_node",
    to: "finance_officer_node",
    type: "solid",
    label: "Inform Finance",
  },
  {
    from: "notification_tool_node",
    to: "station_manager_node",
    type: "solid",
    label: "Inform Station",
  },
  {
    from: "technician_node",
    to: "resolution_complete_node",
    type: "solid",
    label: "Resolved",
  },
  {
    from: "finance_officer_node",
    to: "resolution_complete_node",
    type: "solid",
    label: "Resolved",
  },
  {
    from: "station_manager_node",
    to: "resolution_complete_node",
    type: "solid",
    label: "Resolved",
  },
  {
    from: "complaint_manager_node",
    to: "resolution_complete_node",
    type: "solid",
    label: "Resolved",
  },
  {
    from: "support_agent_node",
    to: "error_handler_node",
    type: "dashed",
    label: "Error/Fallback",
  },
  {
    from: "technician_node",
    to: "error_handler_node",
    type: "dashed",
    label: "Error/Fallback",
  },
  {
    from: "finance_officer_node",
    to: "error_handler_node",
    type: "dashed",
    label: "Error/Fallback",
  },
  {
    from: "station_manager_node",
    to: "error_handler_node",
    type: "dashed",
    label: "Error/Fallback",
  },
  {
    from: "complaint_manager_node",
    to: "error_handler_node",
    type: "dashed",
    label: "Error/Fallback",
  },
];

export default function EnhancedWorkflowCanvas({
  workflow,
  isProcessing,
  onStartNodeClick,
  setIsProcessing,
  onReset,
}: EnhancedWorkflowCanvasProps) {
  // State management
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [currentActiveNode, setCurrentActiveNode] = useState<string | null>(
    null
  );
  const [currentActiveTool, setCurrentActiveTool] = useState<string | null>(
    null
  );
  const [currentActiveEdge, setCurrentActiveEdge] = useState<{
    from: string;
    to: string;
  } | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [activePathEdges, setActivePathEdges] = useState<Set<string>>(
    new Set()
  );
  const [isPaused, setIsPaused] = useState(false);
  const [processedSteps, setProcessedSteps] = useState<WorkflowStep[]>([]);

  // Memoized calculations
  const progress = useMemo(() => {
    return workflow.length > 0
      ? Math.min(((currentStepIndex + 1) / workflow.length) * 100, 100)
      : 0;
  }, [currentStepIndex, workflow.length]);

  const currentStep = useMemo(() => {
    return workflow[currentStepIndex];
  }, [workflow, currentStepIndex]);

  // Reset workflow visualization
  const resetWorkflow = useCallback(() => {
    setCurrentStepIndex(-1);
    setCompletedSteps(new Set());
    setActivePathEdges(new Set());
    setCurrentActiveNode(null);
    setCurrentActiveTool(null);
    setCurrentActiveEdge(null);
    setIsPaused(false);
    setProcessedSteps([]);
  }, []);

  // Reset when processing starts or workflow changes
  useEffect(() => {
    if (isProcessing && workflow.length > 0) {
      resetWorkflow();
      setCurrentStepIndex(0);
    } else if (!isProcessing && workflow.length === 0) {
      resetWorkflow();
    }
  }, [isProcessing, workflow.length, resetWorkflow]);

  // Main workflow processing logic
  useEffect(() => {
    if (
      !isProcessing ||
      isPaused ||
      currentStepIndex >= workflow.length ||
      currentStepIndex < 0
    ) {
      return;
    }

    const processCurrentStep = async () => {
      // Skip steps with zero duration
      let actualStepIndex = currentStepIndex;
      while (
        actualStepIndex < workflow.length &&
        workflow[actualStepIndex].duration === 0
      ) {
        const conceptualStep = workflow[actualStepIndex];
        const conceptualNodeId = agentToVisualNodeMap[conceptualStep.agent];
        if (conceptualNodeId) {
          setCompletedSteps((prev) => new Set([...prev, conceptualNodeId]));
        }
        actualStepIndex++;
      }

      if (actualStepIndex >= workflow.length) {
        setIsProcessing(false);
        return;
      }

      const currentComplaintStep = workflow[actualStepIndex];
      const visualAgentNodeId =
        agentToVisualNodeMap[currentComplaintStep.agent];
      const visualToolNodeId = currentComplaintStep.toolUsed
        ? agentToVisualNodeMap[currentComplaintStep.toolUsed]
        : null;

      // Set active nodes
      setCurrentActiveNode(visualAgentNodeId);
      setCurrentActiveTool(visualToolNodeId);

      // Determine edge to highlight
      const nextStep = workflow[actualStepIndex + 1];
      let edgeToHighlight: { from: string; to: string } | null = null;

      if (visualToolNodeId) {
        edgeToHighlight =
          workflowEdges.find(
            (edge) =>
              edge.from === visualAgentNodeId && edge.to === visualToolNodeId
          ) || null;
      } else if (nextStep) {
        const nextVisualNodeId = agentToVisualNodeMap[nextStep.agent];
        edgeToHighlight =
          workflowEdges.find(
            (edge) =>
              edge.from === visualAgentNodeId && edge.to === nextVisualNodeId
          ) || null;
      } else {
        edgeToHighlight =
          workflowEdges.find(
            (edge) =>
              edge.from === visualAgentNodeId &&
              edge.to === agentToVisualNodeMap["resolution_complete"]
          ) || null;
      }

      setCurrentActiveEdge(edgeToHighlight);

      // Add to processed steps
      setProcessedSteps((prev) => [
        ...prev,
        { ...currentComplaintStep, timestamp: Date.now() },
      ]);

      // Wait for step duration
      const stepDuration = Math.max(currentComplaintStep.duration, 1000);
      await new Promise((resolve) => setTimeout(resolve, stepDuration));

      // Complete the step
      setCompletedSteps((prev) => {
        const newSet = new Set(prev);
        newSet.add(visualAgentNodeId);
        if (visualToolNodeId) newSet.add(visualToolNodeId);
        return newSet;
      });

      // Add edge to active path
      if (edgeToHighlight) {
        setActivePathEdges(
          (prev) =>
            new Set([...prev, `${edgeToHighlight.from}-${edgeToHighlight.to}`])
        );
      }

      // Move to next step
      setCurrentStepIndex((prev) => prev + 1);
      setCurrentActiveNode(null);
      setCurrentActiveTool(null);
      setCurrentActiveEdge(null);
    };

    processCurrentStep();
  }, [isProcessing, isPaused, currentStepIndex, workflow, setIsProcessing]);

  // Handle completion
  useEffect(() => {
    if (
      isProcessing &&
      currentStepIndex >= workflow.length &&
      workflow.length > 0
    ) {
      const resolutionNodeId = agentToVisualNodeMap["resolution_complete"];
      setCurrentActiveNode(resolutionNodeId);
      setCompletedSteps((prev) => new Set([...prev, resolutionNodeId]));

      setTimeout(() => {
        setCurrentActiveNode(null);
        setIsProcessing(false);
      }, 1000);
    }
  }, [isProcessing, currentStepIndex, workflow.length, setIsProcessing]);

  // Helper functions
  const getNodeIcon = useCallback((iconName: string) => {
    const Icon = iconMap[iconName] || Bot;
    return <Icon className="w-6 h-6" />;
  }, []);

  const getStatusIcon = useCallback((status: string) => {
    const iconProps = "w-5 h-5 drop-shadow-lg";
    switch (status) {
      case "completed":
        return <CheckCircle className={`${iconProps} text-emerald-400`} />;
      case "processing":
        return <Zap className={`${iconProps} text-yellow-400 animate-pulse`} />;
      case "failed":
        return <AlertCircle className={`${iconProps} text-red-400`} />;
      default:
        return <Clock className={`${iconProps} text-slate-400`} />;
    }
  }, []);

  const getNodeStyles = useCallback(
    (node: WorkflowNode) => {
      const isActive =
        currentActiveNode === node.id || currentActiveTool === node.id;
      const isCompleted = completedSteps.has(node.id);

      if (isActive) {
        return "border-yellow-400 shadow-yellow-400/30 ring-4 ring-yellow-400/30 text-white";
      } else if (isCompleted) {
        return "border-emerald-400 shadow-emerald-400/20 text-white";
      } else {
        const colorMap = {
          green: "border-green-500 shadow-green-500/20 text-white",
          orange: "border-orange-500 shadow-orange-500/20 text-white",
          red: "border-red-500 shadow-red-500/20 text-white",
          gray: "border-slate-600 shadow-slate-900/50 text-slate-300",
        };
        return colorMap[node.color as keyof typeof colorMap] || colorMap.gray;
      }
    },
    [currentActiveNode, currentActiveTool, completedSteps]
  );

  const getNodeGradient = useCallback(
    (node: WorkflowNode) => {
      const isActive =
        currentActiveNode === node.id || currentActiveTool === node.id;
      const isCompleted = completedSteps.has(node.id);

      if (isActive) return "from-yellow-500/40 to-yellow-600/60";
      if (isCompleted) return "from-emerald-500/40 to-emerald-600/60";

      const colorMap = {
        green: "from-green-600/30 to-green-700/50",
        gray: "from-slate-700/30 to-slate-800/50",
        orange: "from-orange-600/30 to-orange-700/50",
        red: "from-red-600/30 to-red-700/50",
      };

      return colorMap[node.color as keyof typeof colorMap] || colorMap.gray;
    },
    [currentActiveNode, currentActiveTool, completedSteps]
  );

  const getEdgeStyles = useCallback(
    (edge: WorkflowEdge) => {
      const edgeKey = `${edge.from}-${edge.to}`;
      const isActiveEdge =
        currentActiveEdge &&
        currentActiveEdge.from === edge.from &&
        currentActiveEdge.to === edge.to;
      const isInActivePath = activePathEdges.has(edgeKey);

      if (isActiveEdge) {
        return {
          stroke: "#facc15",
          strokeWidth: "4",
          filter: "url(#glow)",
          marker: "url(#active-arrowhead)",
        };
      } else if (isInActivePath) {
        return {
          stroke: "#22c55e",
          strokeWidth: "3",
          filter: "url(#glow)",
          marker: "url(#path-arrowhead)",
        };
      }

      return {
        stroke: "#64748b",
        strokeWidth: "2",
        filter: "none",
        marker: "url(#default-arrowhead)",
      };
    },
    [currentActiveEdge, activePathEdges]
  );

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleReset = useCallback(() => {
    resetWorkflow();
    onReset?.();
  }, [resetWorkflow, onReset]);

  return (
    <div className="h-screen w-full bg-gradient-to-br from-slate-900 to-slate-800 flex flex-col">
      {/* Header */}
      <div className="bg-slate-800/90 border-b border-slate-700 p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-lg flex items-center justify-center">
            <Workflow className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">
              AI Complaint Workflow
            </h1>
            <p className="text-slate-400 text-sm">
              Real-time processing visualization
            </p>
          </div>
        </div>

        {/* Control buttons */}
        <div className="flex items-center gap-2">
          {isProcessing && (
            <button
              onClick={togglePause}
              className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded-md flex items-center gap-1 transition-colors"
            >
              {isPaused ? (
                <Play className="w-4 h-4" />
              ) : (
                <Pause className="w-4 h-4" />
              )}
              {isPaused ? "Resume" : "Pause"}
            </button>
          )}
          {(workflow.length > 0 || isProcessing) && (
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white rounded-md flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-800/50 border-b border-slate-700 p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-white font-medium">Workflow Progress</span>
          <div className="flex items-center gap-2">
            <div className="px-2 py-1 bg-slate-700 rounded text-sm text-slate-300">
              Step {Math.max(0, currentStepIndex + 1)} of {workflow.length}
            </div>
            {isProcessing && (
              <div className="px-2 py-1 bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 rounded text-sm flex items-center gap-1">
                <Activity className="w-3 h-3 animate-pulse" />
                {isPaused ? "Paused" : "Processing..."}
              </div>
            )}
          </div>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-400 to-blue-500 h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Workflow Canvas */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(56,189,248,0.05)_0%,_transparent_70%)]" />
        <svg className="w-full h-full" viewBox="0 0 1200 600">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <marker
              id="active-arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#facc15" />
            </marker>
            <marker
              id="path-arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#22c55e" />
            </marker>
            <marker
              id="default-arrowhead"
              markerWidth="12"
              markerHeight="8"
              refX="10"
              refY="4"
              orient="auto"
            >
              <polygon points="0 0, 12 4, 0 8" fill="#64748b" />
            </marker>
          </defs>

          {/* Render edges */}
          {workflowEdges.map((edge, index) => {
            const fromNode = workflowNodes.find((n) => n.id === edge.from);
            const toNode = workflowNodes.find((n) => n.id === edge.to);
            if (!fromNode || !toNode) return null;

            const startX = fromNode.position.x + fromNode.width;
            const startY = fromNode.position.y + fromNode.height / 2;
            const endX = toNode.position.x;
            const endY = toNode.position.y + toNode.height / 2;

            const styles = getEdgeStyles(edge);

            return (
              <g key={index}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke={styles.stroke}
                  strokeWidth={styles.strokeWidth}
                  strokeDasharray={edge.type === "dashed" ? "8,4" : "0"}
                  markerEnd={styles.marker}
                  filter={styles.filter}
                  className="transition-all duration-500"
                />
                {edge.label && (
                  <text
                    x={(startX + endX) / 2}
                    y={(startY + endY) / 2 - 8}
                    className="text-xs font-medium fill-slate-300"
                    textAnchor="middle"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Render nodes */}
          {workflowNodes.map((node) => {
            const isActive =
              currentActiveNode === node.id || currentActiveTool === node.id;
            const isCompleted = completedSteps.has(node.id);
            const isClickable =
              node.id === "customer_submission_node" && !isProcessing;

            return (
              <g key={node.id}>
                <defs>
                  <linearGradient
                    id={`node-gradient-${node.id}`}
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop
                      offset="0%"
                      stopColor={getNodeGradient(node)
                        .split(" ")[0]
                        .replace("from-", "")
                        .replace("/30", "")
                        .replace("/40", "")}
                    />
                    <stop
                      offset="100%"
                      stopColor={getNodeGradient(node)
                        .split(" ")[1]
                        .replace("to-", "")
                        .replace("/50", "")
                        .replace("/60", "")}
                    />
                  </linearGradient>
                </defs>

                <rect
                  x={node.position.x}
                  y={node.position.y}
                  width={node.width}
                  height={node.height}
                  rx="15"
                  ry="15"
                  fill={`url(#node-gradient-${node.id})`}
                  className={`stroke-2 ${getNodeStyles(
                    node
                  )} transition-all duration-500 ${
                    isClickable ? "cursor-pointer" : ""
                  }`}
                  filter={isActive ? "url(#glow)" : "none"}
                  onClick={isClickable ? onStartNodeClick : undefined}
                />

                <foreignObject
                  x={node.position.x}
                  y={node.position.y}
                  width={node.width}
                  height={node.height}
                  className="pointer-events-none"
                >
                  <div className="flex flex-col items-center justify-center h-full p-2 relative">
                    <div
                      className={`text-white mb-1 transition-all duration-300 ${
                        isActive ? "scale-110" : "scale-100"
                      }`}
                    >
                      {getNodeIcon(node.icon)}
                    </div>
                    {node.name.split("\n").map((line, i) => (
                      <p
                        key={i}
                        className="text-xs font-semibold text-white text-center leading-tight"
                      >
                        {line}
                      </p>
                    ))}

                    {(isActive || isCompleted) && (
                      <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-slate-800/80 rounded-full p-1 border border-slate-600">
                        {isActive
                          ? getStatusIcon("processing")
                          : getStatusIcon("completed")}
                      </div>
                    )}
                  </div>
                </foreignObject>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Current Step Info */}
      {currentStep && (
        <div className="bg-slate-800/90 border-t border-slate-700 p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <p className="text-white font-medium">
                Currently Processing: {currentStep.action}
              </p>
              <p className="text-slate-400 text-sm">
                Agent:{" "}
                {
                  workflowNodes
                    .find(
                      (n) => n.id === agentToVisualNodeMap[currentStep.agent]
                    )
                    ?.name.split("\n")[0]
                }
                {currentStep.toolUsed && (
                  <span>
                    {" "}
                    • Tool:{" "}
                    {
                      workflowNodes
                        .find(
                          (n) =>
                            n.id === agentToVisualNodeMap[currentStep.toolUsed!]
                        )
                        ?.name.split("\n")[0]
                    }
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
