"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
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
import { Send, Bot, User, Lightbulb } from "lucide-react"

interface DataChatInterfaceProps {
  filters?: any
}

interface ChatMessage {
  id: string
  type: "user" | "assistant"
  content: string
  timestamp: Date
  data?: any
  chartType?: "bar" | "line" | "pie"
  insights?: string[]
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

const sampleResponses = {
  "revenue by area": {
    content: "Here's the revenue breakdown by service area for the current period:",
    data: [
      { name: "Downtown", value: 82100, percentage: 35.2 },
      { name: "Business District", value: 63800, percentage: 27.4 },
      { name: "University District", value: 47600, percentage: 20.4 },
      { name: "Residential Areas", value: 25200, percentage: 10.8 },
      { name: "Tourist Zone", value: 14500, percentage: 6.2 },
    ],
    chartType: "pie" as const,
    insights: [
      "Downtown generates the highest revenue at 35.2% of total",
      "Top 3 areas account for 83% of total revenue",
      "Tourist Zone has the lowest revenue but highest profit margin per swap",
    ],
  },
  "profit trends": {
    content: "Here are the profit trends over the last 6 months:",
    data: [
      { month: "Jan", profit: 15863, margin: 12.7 },
      { month: "Feb", profit: 21489, margin: 15.8 },
      { month: "Mar", profit: 20256, margin: 14.2 },
      { month: "Apr", profit: 39889, margin: 25.4 },
      { month: "May", profit: 41734, margin: 24.8 },
      { month: "Jun", profit: 42732, margin: 24.4 },
    ],
    chartType: "line" as const,
    insights: [
      "Profit increased by 169% from January to June",
      "Significant improvement in April with 25.4% margin",
      "Consistent profitability above 20% for last 3 months",
    ],
  },
  "expense breakdown": {
    content: "Current monthly expense breakdown across all stations:",
    data: [
      { category: "Electricity", amount: 58200, percentage: 43.9 },
      { category: "Direct Pay", amount: 39500, percentage: 29.8 },
      { category: "Rent", amount: 35000, percentage: 26.4 },
    ],
    chartType: "bar" as const,
    insights: [
      "Electricity is the largest expense at 43.9% of total costs",
      "Total monthly expenses: $132,700",
      "Direct pay costs increased 12.1% vs last month",
    ],
  },
  "top performing stations": {
    content: "Top 5 performing stations by revenue and efficiency:",
    data: [
      { station: "Downtown Central", revenue: 28500, swaps: 1250, efficiency: 96 },
      { station: "Business Hub", revenue: 24200, swaps: 1080, efficiency: 94 },
      { station: "University Main", revenue: 19800, swaps: 890, efficiency: 92 },
      { station: "Downtown East", revenue: 18600, swaps: 820, efficiency: 91 },
      { station: "Business Plaza", revenue: 16900, swaps: 750, efficiency: 89 },
    ],
    chartType: "bar" as const,
    insights: [
      "Downtown Central leads with $28.5K revenue and 96% efficiency",
      "Top 5 stations generate 54% of total revenue",
      "Average efficiency across top stations: 92.4%",
    ],
  },
}

const quickQuestions = [
  "Show me revenue by area",
  "What are the profit trends?",
  "Break down expenses by category",
  "Which stations perform best?",
  "Compare this month vs last month",
  "Show battery swap efficiency",
]

export function DataChatInterface({ filters }: DataChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "assistant",
      content:
        "Hello! I'm your data analytics assistant. I can help you analyze revenue, expenses, profitability, and operational metrics. Ask me anything about your BSS data!",
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: message,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")
    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const response = generateResponse(message.toLowerCase())
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: response.content,
        timestamp: new Date(),
        data: response.data,
        chartType: response.chartType,
        insights: response.insights,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1500)
  }

  const generateResponse = (query: string) => {
    // Simple keyword matching for demo
    if (query.includes("revenue") && query.includes("area")) {
      return sampleResponses["revenue by area"]
    } else if (query.includes("profit") && query.includes("trend")) {
      return sampleResponses["profit trends"]
    } else if (query.includes("expense") || query.includes("cost")) {
      return sampleResponses["expense breakdown"]
    } else if (
      query.includes("station") &&
      (query.includes("top") || query.includes("best") || query.includes("perform"))
    ) {
      return sampleResponses["top performing stations"]
    } else {
      return {
        content:
          "I can help you analyze various aspects of your BSS data including revenue, expenses, profitability, and operational metrics. Try asking about revenue by area, profit trends, expense breakdown, or top performing stations.",
        insights: [
          "Ask about revenue patterns across different areas",
          "Inquire about profit trends and margins over time",
          "Request expense breakdowns and cost analysis",
          "Get insights on station performance and efficiency",
        ],
      }
    }
  }

  const renderChart = (message: ChatMessage) => {
    if (!message.data || !message.chartType) return null

    switch (message.chartType) {
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={message.data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey={message.data[0]?.category ? "category" : message.data[0]?.station ? "station" : "month"}
                tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
              />
              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "6px",
                  color: "hsl(var(--foreground))",
                }}
              />
              <Bar
                dataKey={message.data[0]?.amount ? "amount" : message.data[0]?.revenue ? "revenue" : "value"}
                fill={CHART_COLORS[0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )

      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={message.data}>
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
              <Line
                type="monotone"
                dataKey="profit"
                stroke={CHART_COLORS[0]}
                strokeWidth={2}
                dot={{ fill: CHART_COLORS[0], strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={message.data}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percentage }) => `${name} ${percentage}%`}
              >
                {message.data.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
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

  return (
    <div className="space-y-4">
      {/* Quick Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Quick Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((question, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleSendMessage(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Chat Messages */}
      <Card className="h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5" />
            Data Analytics Chat
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`flex gap-3 max-w-[80%] ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                    <div className="flex-shrink-0">
                      {message.type === "user" ? (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-primary-foreground" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-secondary-foreground" />
                        </div>
                      )}
                    </div>
                    <div className={`space-y-2 ${message.type === "user" ? "text-right" : ""}`}>
                      <div
                        className={`p-3 rounded-lg ${
                          message.type === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                        }`}
                      >
                        {message.content}
                      </div>

                      {message.data && (
                        <Card className="mt-2">
                          <CardContent className="p-4">{renderChart(message)}</CardContent>
                        </Card>
                      )}

                      {message.insights && (
                        <Card className="mt-2 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                          <CardContent className="p-3">
                            <div className="flex items-center gap-2 mb-2">
                              <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">Key Insights</span>
                            </div>
                            <ul className="space-y-1">
                              {message.insights.map((insight, index) => (
                                <li
                                  key={index}
                                  className="text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2"
                                >
                                  <span className="w-1 h-1 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                                  {insight}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      )}

                      <div className="text-xs text-muted-foreground">{message.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-secondary-foreground" />
                  </div>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.1s" }}
                      />
                      <div
                        className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"
                        style={{ animationDelay: "0.2s" }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="flex gap-2 mt-4">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about your data... (e.g., 'Show me revenue by area')"
              onKeyPress={(e) => e.key === "Enter" && handleSendMessage(inputValue)}
              disabled={isLoading}
            />
            <Button onClick={() => handleSendMessage(inputValue)} disabled={isLoading || !inputValue.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
