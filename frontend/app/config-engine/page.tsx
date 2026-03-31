"use client"

import { useState, useCallback } from "react"
import {
  Upload,
  Sparkles,
  FileCode2,
  ArrowLeftRight,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  AlertCircle,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  mockFieldMappings,
  mockVersionDiff,
  type ParsedRequirements,
  type FieldMapping,
  type VersionDiff,
  type SimulationResult,
} from "@/lib/mock-data"
import {
  parseRequirements as parseRequirementsApi,
  generateConfig as generateConfigApi,
  runSimulation as runSimulationApi,
} from "@/src/services/api"

// ============================================
// TYPES - Ready for API integration
// ============================================

type StepStatus = "idle" | "loading" | "success" | "error"

interface StepState<T> {
  status: StepStatus
  data: T | null
  error: string | null
}

interface ConfigEngineState {
  requirements: string
  step1: StepState<null>
  step2: StepState<ParsedRequirements>
  step3: StepState<{ configId: string; configJson: string }>
  step4: StepState<{ mappings: FieldMapping[]; versionDiff: VersionDiff }>
  step5: StepState<null>
  step6: StepState<SimulationResult>
}

const initialState: ConfigEngineState = {
  requirements: "",
  step1: { status: "idle", data: null, error: null },
  step2: { status: "idle", data: null, error: null },
  step3: { status: "idle", data: null, error: null },
  step4: { status: "idle", data: null, error: null },
  step5: { status: "idle", data: null, error: null },
  step6: { status: "idle", data: null, error: null },
}

// ============================================
// STEP DEFINITIONS
// ============================================

const steps = [
  { id: 1, title: "Upload Requirement", icon: Upload, description: "Input your integration requirements" },
  { id: 2, title: "AI Parsed Output", icon: Sparkles, description: "Review detected services and fields" },
  { id: 3, title: "Generate Config", icon: FileCode2, description: "AI generates configuration" },
  { id: 4, title: "Mappings & Versions", icon: ArrowLeftRight, description: "Review field mappings" },
  { id: 5, title: "Run Simulation", icon: FlaskConical, description: "Test the configuration" },
  { id: 6, title: "Results", icon: CheckCircle2, description: "Review and deploy" },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

const confidenceColor = (confidence: number) => {
  if (confidence >= 90) return "text-success"
  if (confidence >= 75) return "text-warning"
  return "text-destructive"
}

const statusBadgeColor = (status: string) => {
  switch (status) {
    case "mapped":
      return "bg-success/20 text-success border-success/30"
    case "review":
      return "bg-warning/20 text-warning border-warning/30"
    default:
      return "bg-destructive/20 text-destructive border-destructive/30"
  }
}

// ============================================
// LOADING SKELETON COMPONENTS
// ============================================

function ServicesLoadingSkeleton() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-card p-4">
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
          </div>
          <Skeleton className="h-6 w-12" />
        </div>
      ))}
    </div>
  )
}

function FieldsLoadingSkeleton() {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Skeleton key={i} className="h-6 w-24" />
      ))}
    </div>
  )
}

function MappingsLoadingSkeleton() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map((i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function ResultsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-24 w-full" />
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
// STEPPER COMPONENT
// ============================================

interface StepperProps {
  steps: typeof steps
  currentStep: number
  stepStates: ConfigEngineState
  onStepClick: (step: number) => void
}

function Stepper({ steps: stepsList, currentStep, stepStates, onStepClick }: StepperProps) {
  const getStepStatus = (stepId: number): "completed" | "current" | "upcoming" | "error" => {
    const stepKey = `step${stepId}` as keyof ConfigEngineState
    const stepState = stepStates[stepKey] as StepState<unknown>
    
    if (stepState?.status === "error") return "error"
    if (stepId < currentStep) return "completed"
    if (stepId === currentStep) return "current"
    return "upcoming"
  }

  return (
    <Card className="overflow-hidden">
      <CardContent className="pt-6 pb-4">
        {/* Desktop Stepper */}
        <div className="hidden lg:block">
          <div className="flex items-start justify-between gap-2">
            {stepsList.map((step, index) => {
              const status = getStepStatus(step.id)
              const isClickable = step.id <= currentStep && status !== "error"
              
              return (
                <div key={step.id} className="flex flex-1 items-center">
                  <button
                    onClick={() => isClickable && onStepClick(step.id)}
                    disabled={!isClickable}
                    className={cn(
                      "flex flex-col items-center gap-2 transition-all w-full",
                      isClickable ? "cursor-pointer" : "cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all",
                        status === "completed" && "border-primary bg-primary text-primary-foreground",
                        status === "current" && "border-primary bg-primary/10 text-primary ring-4 ring-primary/20",
                        status === "upcoming" && "border-border bg-background text-muted-foreground opacity-50",
                        status === "error" && "border-destructive bg-destructive/10 text-destructive"
                      )}
                    >
                      {status === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === "error" ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-center">
                      <span
                        className={cn(
                          "text-xs font-medium block",
                          status === "current" && "text-primary",
                          status === "completed" && "text-foreground",
                          status === "upcoming" && "text-muted-foreground",
                          status === "error" && "text-destructive"
                        )}
                      >
                        Step {step.id}
                      </span>
                      <span
                        className={cn(
                          "text-xs block mt-0.5",
                          status === "upcoming" ? "text-muted-foreground/60" : "text-muted-foreground"
                        )}
                      >
                        {step.title}
                      </span>
                    </div>
                  </button>
                  {index < stepsList.length - 1 && (
                    <div className="flex-1 h-px bg-border mx-2 mt-[-24px]">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          step.id < currentStep ? "bg-primary" : "bg-transparent"
                        )}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Mobile Stepper */}
        <div className="lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-foreground">
              Step {currentStep} of {stepsList.length}
            </span>
            <span className="text-sm text-muted-foreground">
              {stepsList[currentStep - 1].title}
            </span>
          </div>
          <div className="flex gap-1">
            {stepsList.map((step) => {
              const status = getStepStatus(step.id)
              return (
                <div
                  key={step.id}
                  className={cn(
                    "h-2 flex-1 rounded-full transition-colors",
                    status === "completed" && "bg-primary",
                    status === "current" && "bg-primary/50",
                    status === "upcoming" && "bg-border",
                    status === "error" && "bg-destructive"
                  )}
                />
              )
            })}
          </div>
        </div>

        <Progress value={(currentStep / 6) * 100} className="mt-6" />
      </CardContent>
    </Card>
  )
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function ConfigEnginePage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [state, setState] = useState<ConfigEngineState>(initialState)

  const parseRequirements = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      step2: { status: "loading", data: null, error: null },
    }))

    try {
      const response = await parseRequirementsApi(state.requirements)
      const parsedRaw = response?.parsed ?? response
      const parsedObj =
        typeof parsedRaw === "string"
          ? (() => {
              try {
                return JSON.parse(parsedRaw)
              } catch {
                return {}
              }
            })()
          : parsedRaw || {}

      const services = Array.isArray(parsedObj.services) ? parsedObj.services : []
      const fields = Array.isArray(parsedObj.fields) ? parsedObj.fields : []

      const parsedData: ParsedRequirements = {
        services: services.map((service: { name?: string; mandatory?: boolean }) => ({
          name: service?.name || "Unknown",
          version: "v1",
          type: service?.mandatory ? "mandatory" : "optional",
          confidence: 90,
        })),
        detectedFields: fields,
      }

      setState((prev) => ({
        ...prev,
        step2: { status: "success", data: parsedData, error: null },
      }))
      setCurrentStep(2)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step2: {
          status: "error",
          data: null,
          error: error instanceof Error ? error.message : "Failed to parse requirements",
        },
      }))
    }
  }, [state.requirements])

  const generateConfig = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      step3: { status: "loading", data: null, error: null },
    }))

    try {
      const data = await generateConfigApi({
        name: "Rahul Sharma",
        aadhaar: "123412341234",
      })

      setState((prev) => ({
        ...prev,
        step3: {
          status: "success",
          data: {
            configId: "cfg_" + Date.now(),
            configJson: JSON.stringify(data, null, 2),
          },
          error: null,
        },
      }))
      setCurrentStep(3)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step3: {
          status: "error",
          data: null,
          error: error instanceof Error ? error.message : "Failed to generate configuration",
        },
      }))
    }
  }, [])

  const loadMappings = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      step4: { status: "loading", data: null, error: null },
    }))

    try {
      await new Promise((resolve) => setTimeout(resolve, 1800))

      setState((prev) => ({
        ...prev,
        step4: {
          status: "success",
          data: {
            mappings: mockFieldMappings,
            versionDiff: mockVersionDiff,
          },
          error: null,
        },
      }))
      setCurrentStep(4)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step4: {
          status: "error",
          data: null,
          error: error instanceof Error ? error.message : "Failed to load field mappings",
        },
      }))
    }
  }, [])

  const runSimulation = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      step5: { status: "loading", data: null, error: null },
      step6: { status: "loading", data: null, error: null },
    }))

    try {
      setCurrentStep(5)
      const configPayload = state.step3.data?.configJson ? JSON.parse(state.step3.data.configJson) : {}
      const data = await runSimulationApi(configPayload.config || configPayload)

      const now = new Date().toISOString()
      const simulationData: SimulationResult = {
        status: data?.status === "success" ? "success" : "partial",
        latency: 0,
        logs: Array.isArray(data?.logs)
          ? data.logs.map((message: string) => ({
              level: "info" as const,
              message,
              timestamp: now,
            }))
          : [],
        fallbackTriggered: data?.status === "fallback",
        apiResponse: data,
      }

      setState((prev) => ({
        ...prev,
        step5: { status: "success", data: null, error: null },
        step6: { status: "success", data: simulationData, error: null },
      }))
      setCurrentStep(6)
    } catch (error) {
      setState((prev) => ({
        ...prev,
        step5: { status: "error", data: null, error: error instanceof Error ? error.message : "Simulation failed" },
        step6: { status: "idle", data: null, error: null },
      }))
    }
  }, [state.step3.data?.configJson])

  const goToStep = (step: number) => {
    if (step <= currentStep) {
      setCurrentStep(step)
    }
  }

  const resetWorkflow = () => {
    setCurrentStep(1)
    setState(initialState)
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Config Engine" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Config Engine
            </h1>
            <p className="text-muted-foreground">
              AI-powered configuration generation and mapping workflow
            </p>
          </div>
          {currentStep > 1 && (
            <Button variant="outline" onClick={resetWorkflow} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Start Over
            </Button>
          )}
        </div>

        {/* Stepper */}
        <Stepper
          steps={steps}
          currentStep={currentStep}
          stepStates={state}
          onStepClick={goToStep}
        />

        {/* Step Content */}
        <div className="grid gap-6">
          {/* Step 1: Upload Requirements */}
          {currentStep === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5 text-primary" />
                  Step 1: Upload Requirements
                </CardTitle>
                <CardDescription>
                  Paste or upload your integration requirements for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {state.step2.status === "error" && (
                  <ErrorAlert
                    title="Parsing Failed"
                    message={state.step2.error || "An unexpected error occurred"}
                    onRetry={parseRequirements}
                  />
                )}
                <Textarea
                  placeholder="Paste your integration requirements here...

Example:
- Need KYC verification for all new customers
- Payment processing with Stripe and PayPal fallback
- Email notifications for transaction status
- Audit logging for compliance"
                  rows={10}
                  value={state.requirements}
                  onChange={(e) => setState((prev) => ({ ...prev, requirements: e.target.value }))}
                  className="font-mono text-sm"
                  disabled={state.step2.status === "loading"}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={parseRequirements}
                    disabled={!state.requirements.trim() || state.step2.status === "loading"}
                    className="gap-2"
                  >
                    {state.step2.status === "loading" ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Parsing Requirements...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" />
                        Parse Requirements
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: AI Parsed Output */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  Step 2: AI Parsed Output
                </CardTitle>
                <CardDescription>
                  Review the services and fields detected by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {state.step3.status === "error" && (
                  <ErrorAlert
                    title="Generation Failed"
                    message={state.step3.error || "An unexpected error occurred"}
                    onRetry={generateConfig}
                  />
                )}

                {state.step2.status === "loading" ? (
                  <>
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Detecting Services...</h3>
                      <ServicesLoadingSkeleton />
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">Analyzing Fields...</h3>
                      <FieldsLoadingSkeleton />
                    </div>
                  </>
                ) : state.step2.data ? (
                  <>
                    {/* Detected Services */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">
                        Detected Services
                        <Badge variant="outline" className="ml-2">
                          {state.step2.data.services.length} found
                        </Badge>
                      </h3>
                      <div className="grid gap-3 sm:grid-cols-2">
                        {state.step2.data.services.map((service) => (
                          <div
                            key={service.name}
                            className="flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {service.name}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {service.version}
                                </Badge>
                              </div>
                              <Badge
                                variant="outline"
                                className={
                                  service.type === "mandatory"
                                    ? "bg-primary/10 text-primary border-primary/30"
                                    : "bg-muted text-muted-foreground"
                                }
                              >
                                {service.type}
                              </Badge>
                            </div>
                            <span className={cn("text-sm font-medium", confidenceColor(service.confidence))}>
                              {service.confidence}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator />

                    {/* Detected Fields */}
                    <div>
                      <h3 className="text-sm font-medium text-foreground mb-3">
                        Detected Fields
                        <Badge variant="outline" className="ml-2">
                          {state.step2.data.detectedFields.length} fields
                        </Badge>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {state.step2.data.detectedFields.map((field) => (
                          <Badge key={field} variant="secondary" className="font-mono">
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCurrentStep(1)}>
                        Back
                      </Button>
                      <Button
                        onClick={generateConfig}
                        disabled={state.step3.status === "loading"}
                        className="gap-2"
                      >
                        {state.step3.status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            Continue
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Step 3: Generate Config */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-primary" />
                  Step 3: Configuration Generated
                </CardTitle>
                <CardDescription>
                  Your integration configuration has been generated
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {state.step4.status === "error" && (
                  <ErrorAlert
                    title="Loading Mappings Failed"
                    message={state.step4.error || "An unexpected error occurred"}
                    onRetry={loadMappings}
                  />
                )}

                {state.step3.status === "loading" ? (
                  <div className="rounded-lg border border-border bg-muted/30 p-6 text-center">
                    <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-medium text-foreground mb-2">
                      Generating Configuration...
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      AI is processing your requirements and creating the optimal configuration
                    </p>
                  </div>
                ) : state.step3.data ? (
                  <>
                    <div className="rounded-lg border border-success/30 bg-success/10 p-4 flex items-center gap-3">
                      <CheckCircle2 className="h-6 w-6 text-success" />
                      <div>
                        <p className="font-medium text-success">Configuration Generated Successfully</p>
                        <p className="text-sm text-muted-foreground">
                          Config ID: <code className="font-mono">{state.step3.data.configId}</code>
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-2">Configuration Preview</h4>
                      <pre className="rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto font-mono text-sm text-foreground max-h-[200px]">
                        {state.step3.data.configJson}
                      </pre>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button variant="outline" onClick={() => setCurrentStep(2)}>
                        Back
                      </Button>
                      <Button
                        onClick={loadMappings}
                        disabled={state.step4.status === "loading"}
                        className="gap-2"
                      >
                        {state.step4.status === "loading" ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading Mappings...
                          </>
                        ) : (
                          <>
                            Review Mappings
                            <ChevronRight className="h-4 w-4" />
                          </>
                        )}
                      </Button>
                    </div>
                  </>
                ) : null}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Mappings & Version Comparison */}
          {currentStep === 4 && (
            <div className="space-y-6">
              {state.step5.status === "error" && (
                <ErrorAlert
                  title="Simulation Failed"
                  message={state.step5.error || "An unexpected error occurred"}
                  onRetry={runSimulation}
                />
              )}

              {/* Field Mappings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-primary" />
                    Step 4: Field Mappings
                  </CardTitle>
                  <CardDescription>
                    Review and adjust the automatically generated field mappings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {state.step4.status === "loading" ? (
                    <MappingsLoadingSkeleton />
                  ) : state.step4.data ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Source Field</TableHead>
                          <TableHead>Target Field</TableHead>
                          <TableHead className="text-center">Confidence</TableHead>
                          <TableHead className="text-center">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {state.step4.data.mappings.map((mapping) => (
                          <TableRow key={mapping.sourceField}>
                            <TableCell className="font-mono text-sm">
                              {mapping.sourceField}
                            </TableCell>
                            <TableCell className="font-mono text-sm">
                              {mapping.targetField}
                            </TableCell>
                            <TableCell className="text-center">
                              <span className={cn("font-medium", confidenceColor(mapping.confidence))}>
                                {mapping.confidence}%
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline" className={statusBadgeColor(mapping.status)}>
                                {mapping.status}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : null}
                </CardContent>
              </Card>

              {/* Version Differences */}
              {state.step4.data && (
                <Card>
                  <CardHeader>
                    <CardTitle>Version Differences</CardTitle>
                    <CardDescription>
                      Changes detected between configuration versions
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Added Fields */}
                    <div>
                      <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4" />
                        Added Fields
                        <Badge variant="outline" className="bg-success/20 text-success border-success/30">
                          {state.step4.data.versionDiff.added.length}
                        </Badge>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {state.step4.data.versionDiff.added.map((field) => (
                          <Badge key={field} className="bg-success/20 text-success border-success/30">
                            + {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Removed Fields */}
                    <div>
                      <h4 className="text-sm font-medium text-destructive mb-2 flex items-center gap-2">
                        <AlertCircle className="h-4 w-4" />
                        Removed Fields
                        <Badge variant="outline" className="bg-destructive/20 text-destructive border-destructive/30">
                          {state.step4.data.versionDiff.removed.length}
                        </Badge>
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {state.step4.data.versionDiff.removed.map((field) => (
                          <Badge key={field} className="bg-destructive/20 text-destructive border-destructive/30">
                            - {field}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Renamed Fields */}
                    <div>
                      <h4 className="text-sm font-medium text-warning mb-2 flex items-center gap-2">
                        <ArrowLeftRight className="h-4 w-4" />
                        Renamed Fields
                        <Badge variant="outline" className="bg-warning/20 text-warning border-warning/30">
                          {state.step4.data.versionDiff.renamed.length}
                        </Badge>
                      </h4>
                      <div className="space-y-2">
                        {state.step4.data.versionDiff.renamed.map((rename) => (
                          <div
                            key={rename.from}
                            className="flex items-center gap-2 text-sm text-muted-foreground"
                          >
                            <Badge variant="outline" className="font-mono">
                              {rename.from}
                            </Badge>
                            <ArrowLeftRight className="h-4 w-4" />
                            <Badge variant="outline" className="font-mono">
                              {rename.to}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button
                  onClick={runSimulation}
                  disabled={state.step5.status === "loading"}
                  className="gap-2"
                >
                  {state.step5.status === "loading" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing Simulation...
                    </>
                  ) : (
                    <>
                      <FlaskConical className="h-4 w-4" />
                      Run Simulation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Running Simulation */}
          {currentStep === 5 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FlaskConical className="h-5 w-5 text-primary" />
                  Step 5: Running Simulation
                </CardTitle>
                <CardDescription>
                  Testing your configuration with sample data
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {state.step5.status === "error" ? (
                  <>
                    <ErrorAlert
                      title="Simulation Failed"
                      message={state.step5.error || "An unexpected error occurred"}
                      onRetry={runSimulation}
                    />
                    <div className="flex justify-start">
                      <Button variant="outline" onClick={() => setCurrentStep(4)}>
                        Back to Mappings
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
                    <div className="relative inline-flex">
                      <FlaskConical className="h-16 w-16 text-primary" />
                      <Loader2 className="h-8 w-8 text-primary animate-spin absolute -top-2 -right-2" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mt-4 mb-2">
                      Simulation in Progress
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">
                      Testing your integration configuration against sample payloads.
                      This may take a few moments...
                    </p>
                    <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Connecting to services
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 6: Results */}
          {currentStep === 6 && (
            <div className="space-y-6">
              {state.step6.status === "loading" ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Step 6: Loading Results
                    </CardTitle>
                    <CardDescription>
                      Preparing simulation results...
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResultsLoadingSkeleton />
                  </CardContent>
                </Card>
              ) : state.step6.data ? (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                      Step 6: Simulation Results
                    </CardTitle>
                    <CardDescription>
                      Review the simulation output and results
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Status Banner */}
                    <div
                      className={cn(
                        "rounded-lg border p-4 flex items-center gap-4",
                        state.step6.data.status === "success"
                          ? "bg-success/10 border-success/30"
                          : "bg-destructive/10 border-destructive/30"
                      )}
                    >
                      {state.step6.data.status === "success" ? (
                        <CheckCircle2 className="h-8 w-8 text-success" />
                      ) : (
                        <AlertCircle className="h-8 w-8 text-destructive" />
                      )}
                      <div>
                        <h3
                          className={cn(
                            "font-semibold",
                            state.step6.data.status === "success"
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          Simulation {state.step6.data.status === "success" ? "Successful" : "Failed"}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Completed in {state.step6.data.latency}ms
                        </p>
                      </div>
                      <div className="ml-auto flex gap-2">
                        <Badge
                          variant="outline"
                          className={
                            state.step6.data.fallbackTriggered
                              ? "bg-warning/20 text-warning border-warning/30"
                              : "bg-success/20 text-success border-success/30"
                          }
                        >
                          {state.step6.data.fallbackTriggered ? "Fallback Triggered" : "No Fallback"}
                        </Badge>
                      </div>
                    </div>

                    {/* Logs */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                        Simulation Logs
                        <Badge variant="outline">{state.step6.data.logs.length} entries</Badge>
                      </h4>
                      <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2 font-mono text-sm max-h-[200px] overflow-y-auto">
                        {state.step6.data.logs.map((log, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <span className="text-muted-foreground text-xs">
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
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
                    </div>

                    {/* API Response */}
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-3">
                        API Response
                      </h4>
                      <pre className="rounded-lg border border-border bg-muted/30 p-4 overflow-x-auto font-mono text-sm text-foreground">
                        {JSON.stringify(state.step6.data.apiResponse, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(4)}>
                  Back to Mappings
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetWorkflow}>
                    Start New Configuration
                  </Button>
                  <Button className="gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Deploy Configuration
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
