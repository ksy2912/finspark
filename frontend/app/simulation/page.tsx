"use client"

import { useState, useCallback } from "react"
import {
  FlaskConical,
  Play,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  sampleInputJson,
  mockSimulationResult,
  mockFailedSimulationResult,
  type SimulationResult,
} from "@/lib/mock-data"

// ============================================
// TYPES - Ready for API integration
// ============================================

type SimulationStatus = "idle" | "loading" | "success" | "error"

interface SimulationState {
  status: SimulationStatus
  data: SimulationResult | null
  error: string | null
}

const initialState: SimulationState = {
  status: "idle",
  data: null,
  error: null,
}

// ============================================
// LOADING SKELETON COMPONENTS
// ============================================

function OutputLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  )
}

function LogsLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex gap-2">
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 flex-1" />
        </div>
      ))}
    </div>
  )
}

// ============================================
// ERROR ALERT COMPONENT
// ============================================

interface ErrorAlertProps {
  title: string
  message: string
  onRetry?: () => void
}

function ErrorAlert({ title, message, onRetry }: ErrorAlertProps) {
  return (
    <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function SimulationPage() {
  const [inputJson, setInputJson] = useState(sampleInputJson)
  const [jsonError, setJsonError] = useState<string | null>(null)
  const [simulation, setSimulation] = useState<SimulationState>(initialState)
  const [copied, setCopied] = useState(false)

  // Validate JSON on change
  const handleJsonChange = (value: string) => {
    setInputJson(value)
    setJsonError(null)
    
    if (value.trim()) {
      try {
        JSON.parse(value)
      } catch {
        setJsonError("Invalid JSON syntax")
      }
    }
  }

  // ============================================
  // API SIMULATION FUNCTION
  // Replace with real API call
  // ============================================

  const runSimulation = useCallback(async () => {
    // Validate JSON before running
    try {
      JSON.parse(inputJson)
    } catch {
      setJsonError("Invalid JSON syntax. Please fix before running simulation.")
      return
    }

    setSimulation({
      status: "loading",
      data: null,
      error: null,
    })

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2500))

      // Simulate occasional API error (10% chance)
      if (Math.random() < 0.1) {
        throw new Error("Simulation service temporarily unavailable. Please try again.")
      }

      // Mock response - replace with actual API call
      // const response = await fetch('/api/simulation/run', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ input: JSON.parse(inputJson), configId: 'cfg_xxx' }),
      // })
      // if (!response.ok) throw new Error('Simulation failed')
      // const data = await response.json()

      // Randomly choose success or failure for demo
      const isSuccess = Math.random() > 0.3
      
      setSimulation({
        status: "success",
        data: isSuccess ? mockSimulationResult : mockFailedSimulationResult,
        error: null,
      })
    } catch (error) {
      setSimulation({
        status: "error",
        data: null,
        error: error instanceof Error ? error.message : "An unexpected error occurred",
      })
    }
  }, [inputJson])

  const resetSimulation = () => {
    setSimulation(initialState)
    setInputJson(sampleInputJson)
    setJsonError(null)
  }

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const isRunDisabled = simulation.status === "loading" || !!jsonError || !inputJson.trim()

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Simulation" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Simulation Environment
            </h1>
            <p className="text-muted-foreground">
              Test your integration configurations with sample data
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={resetSimulation} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
            <Button onClick={runSimulation} disabled={isRunDisabled} className="gap-2">
              {simulation.status === "loading" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Simulation
                </>
              )}
            </Button>
          </div>
        </div>

        {/* API Error Alert */}
        {simulation.status === "error" && (
          <ErrorAlert
            title="Simulation Failed"
            message={simulation.error || "An unexpected error occurred"}
            onRetry={runSimulation}
          />
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Input Panel */}
          <Card className="lg:row-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FlaskConical className="h-5 w-5 text-primary" />
                Input JSON
              </CardTitle>
              <CardDescription>
                Enter or modify the JSON payload to test your integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* JSON Validation Error */}
              {jsonError && (
                <Alert variant="destructive" className="bg-destructive/10 border-destructive/30">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>JSON Error</AlertTitle>
                  <AlertDescription>{jsonError}</AlertDescription>
                </Alert>
              )}

              <div className="relative">
                <textarea
                  value={inputJson}
                  onChange={(e) => handleJsonChange(e.target.value)}
                  className={cn(
                    "w-full h-[500px] rounded-lg border bg-muted/30 p-4 font-mono text-sm text-foreground resize-none focus:outline-none focus:ring-2",
                    jsonError 
                      ? "border-destructive focus:ring-destructive/50" 
                      : "border-border focus:ring-ring"
                  )}
                  spellCheck={false}
                  disabled={simulation.status === "loading"}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => copyToClipboard(inputJson)}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Output Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  Output
                  {simulation.data && (
                    <Badge
                      variant="outline"
                      className={
                        simulation.data.status === "success"
                          ? "bg-success/20 text-success border-success/30"
                          : "bg-destructive/20 text-destructive border-destructive/30"
                      }
                    >
                      {simulation.data.status === "success" ? "Success" : "Failed"}
                    </Badge>
                  )}
                </span>
                {simulation.data && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {simulation.data.latency}ms
                  </div>
                )}
              </CardTitle>
              <CardDescription>
                {simulation.data
                  ? "Simulation completed - review the results below"
                  : simulation.status === "loading"
                    ? "Running simulation..."
                    : "Run a simulation to see the output"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {simulation.status === "loading" ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-center justify-center h-[100px] text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin mb-4" />
                    <p className="text-sm">Running simulation...</p>
                  </div>
                  <OutputLoadingSkeleton />
                </div>
              ) : simulation.data ? (
                <div className="space-y-4">
                  {/* Status */}
                  <div
                    className={cn(
                      "rounded-lg border p-4 flex items-center gap-3",
                      simulation.data.status === "success"
                        ? "bg-success/10 border-success/30"
                        : "bg-destructive/10 border-destructive/30"
                    )}
                  >
                    {simulation.data.status === "success" ? (
                      <CheckCircle2 className="h-6 w-6 text-success" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    )}
                    <div>
                      <p
                        className={cn(
                          "font-medium",
                          simulation.data.status === "success" ? "text-success" : "text-destructive"
                        )}
                      >
                        {simulation.data.status === "success"
                          ? "Simulation completed successfully"
                          : "Simulation failed"}
                      </p>
                      {simulation.data.fallbackTriggered && (
                        <p className="text-sm text-warning">Fallback provider was triggered</p>
                      )}
                    </div>
                  </div>

                  {/* API Response */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">
                      API Response
                    </h4>
                    <pre className="rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto font-mono text-sm text-foreground max-h-[150px]">
                      {JSON.stringify(simulation.data.apiResponse, null, 2)}
                    </pre>
                  </div>
                </div>
              ) : simulation.status === "error" ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-destructive border border-dashed border-destructive/30 rounded-lg bg-destructive/5">
                  <AlertCircle className="h-8 w-8 mb-4 opacity-50" />
                  <p className="text-sm font-medium">Simulation failed</p>
                  <p className="text-xs mt-1 text-muted-foreground">Check the error above and try again</p>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border border-dashed border-border rounded-lg">
                  <FlaskConical className="h-8 w-8 mb-4 opacity-50" />
                  <p className="text-sm">No simulation results yet</p>
                  <p className="text-xs mt-1">Click &quot;Run Simulation&quot; to test</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Logs Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Logs
                {simulation.data && (
                  <Badge variant="outline" className="text-xs">
                    {simulation.data.logs.length} entries
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Real-time execution logs from the simulation
              </CardDescription>
            </CardHeader>
            <CardContent>
              {simulation.status === "loading" ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Streaming logs...
                  </div>
                  <LogsLoadingSkeleton />
                </div>
              ) : simulation.data ? (
                <Tabs defaultValue="all">
                  <TabsList className="mb-4">
                    <TabsTrigger value="all">
                      All
                      <Badge variant="outline" className="ml-1.5 text-xs">
                        {simulation.data.logs.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="info">
                      Info
                      <Badge variant="outline" className="ml-1.5 text-xs bg-info/20 text-info border-info/30">
                        {simulation.data.logs.filter((l) => l.level === "info").length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="warn">
                      Warn
                      <Badge variant="outline" className="ml-1.5 text-xs bg-warning/20 text-warning border-warning/30">
                        {simulation.data.logs.filter((l) => l.level === "warn").length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="error">
                      Error
                      <Badge variant="outline" className="ml-1.5 text-xs bg-destructive/20 text-destructive border-destructive/30">
                        {simulation.data.logs.filter((l) => l.level === "error").length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="all" className="mt-0">
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 font-mono text-sm max-h-[200px] overflow-y-auto">
                      {simulation.data.logs.map((log, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <span className="text-muted-foreground text-xs whitespace-nowrap">
                            {new Date(log.timestamp).toLocaleTimeString()}
                          </span>
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-xs shrink-0",
                              log.level === "error"
                                ? "bg-destructive/20 text-destructive border-destructive/30"
                                : log.level === "warn"
                                  ? "bg-warning/20 text-warning border-warning/30"
                                  : "bg-info/20 text-info border-info/30"
                            )}
                          >
                            {log.level}
                          </Badge>
                          <span className="text-foreground">{log.message}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  <TabsContent value="info" className="mt-0">
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 font-mono text-sm max-h-[200px] overflow-y-auto">
                      {simulation.data.logs
                        .filter((log) => log.level === "info")
                        .map((log, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-info/20 text-info border-info/30"
                            >
                              info
                            </Badge>
                            <span className="text-foreground">{log.message}</span>
                          </div>
                        ))}
                      {simulation.data.logs.filter((log) => log.level === "info").length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No info logs
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="warn" className="mt-0">
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 font-mono text-sm max-h-[200px] overflow-y-auto">
                      {simulation.data.logs
                        .filter((log) => log.level === "warn")
                        .map((log, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-warning/20 text-warning border-warning/30"
                            >
                              warn
                            </Badge>
                            <span className="text-foreground">{log.message}</span>
                          </div>
                        ))}
                      {simulation.data.logs.filter((log) => log.level === "warn").length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No warnings
                        </p>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="error" className="mt-0">
                    <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 font-mono text-sm max-h-[200px] overflow-y-auto">
                      {simulation.data.logs
                        .filter((log) => log.level === "error")
                        .map((log, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground text-xs whitespace-nowrap">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-xs bg-destructive/20 text-destructive border-destructive/30"
                            >
                              error
                            </Badge>
                            <span className="text-foreground">{log.message}</span>
                          </div>
                        ))}
                      {simulation.data.logs.filter((log) => log.level === "error").length === 0 && (
                        <p className="text-muted-foreground text-center py-4">
                          No errors
                        </p>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="flex flex-col items-center justify-center h-[200px] text-muted-foreground border border-dashed border-border rounded-lg">
                  <p className="text-sm">Logs will appear here after simulation</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
