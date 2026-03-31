"use client"

import { useState } from "react"
import { Search, Filter, Download, RefreshCw } from "lucide-react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

const mockLogs = [
  {
    id: "log-001",
    timestamp: "2026-03-31T14:32:15Z",
    level: "info",
    service: "KYC Service",
    message: "Customer verification initiated for user_12345",
    projectId: "proj-001",
  },
  {
    id: "log-002",
    timestamp: "2026-03-31T14:32:16Z",
    level: "info",
    service: "KYC Service",
    message: "Document validation passed",
    projectId: "proj-001",
  },
  {
    id: "log-003",
    timestamp: "2026-03-31T14:32:17Z",
    level: "warn",
    service: "Payment Gateway",
    message: "High latency detected: 450ms response time",
    projectId: "proj-001",
  },
  {
    id: "log-004",
    timestamp: "2026-03-31T14:32:18Z",
    level: "info",
    service: "Payment Gateway",
    message: "Transaction processed successfully: txn_abc123",
    projectId: "proj-001",
  },
  {
    id: "log-005",
    timestamp: "2026-03-31T14:30:10Z",
    level: "error",
    service: "Email Notification",
    message: "Failed to send notification: SMTP timeout",
    projectId: "proj-002",
  },
  {
    id: "log-006",
    timestamp: "2026-03-31T14:30:12Z",
    level: "warn",
    service: "Email Notification",
    message: "Retrying notification delivery (attempt 2/3)",
    projectId: "proj-002",
  },
  {
    id: "log-007",
    timestamp: "2026-03-31T14:30:15Z",
    level: "info",
    service: "Email Notification",
    message: "Notification delivered on retry",
    projectId: "proj-002",
  },
  {
    id: "log-008",
    timestamp: "2026-03-31T14:28:00Z",
    level: "info",
    service: "Audit Logger",
    message: "Compliance check completed for batch_789",
    projectId: "proj-001",
  },
  {
    id: "log-009",
    timestamp: "2026-03-31T14:25:30Z",
    level: "error",
    service: "KYC Service",
    message: "Identity verification failed: Document expired",
    projectId: "proj-002",
  },
  {
    id: "log-010",
    timestamp: "2026-03-31T14:20:00Z",
    level: "info",
    service: "Config Engine",
    message: "Configuration deployed to production",
    projectId: "proj-001",
  },
]

const levelColors = {
  info: "bg-info/20 text-info border-info/30",
  warn: "bg-warning/20 text-warning border-warning/30",
  error: "bg-destructive/20 text-destructive border-destructive/30",
}

export default function LogsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [levelFilter, setLevelFilter] = useState<"all" | "info" | "warn" | "error">("all")
  const [serviceFilter, setServiceFilter] = useState("all")

  const services = [...new Set(mockLogs.map((log) => log.service))]

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.service.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = levelFilter === "all" || log.level === levelFilter
    const matchesService = serviceFilter === "all" || log.service === serviceFilter
    return matchesSearch && matchesLevel && matchesService
  })

  const logCounts = {
    all: mockLogs.length,
    info: mockLogs.filter((l) => l.level === "info").length,
    warn: mockLogs.filter((l) => l.level === "warn").length,
    error: mockLogs.filter((l) => l.level === "error").length,
  }

  return (
    <DashboardLayout
      breadcrumbs={[
        { label: "Dashboard", href: "/" },
        { label: "Logs" },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              System Logs
            </h1>
            <p className="text-muted-foreground">
              Monitor and analyze integration activity across all services
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <Tabs
                value={levelFilter}
                onValueChange={(v) => setLevelFilter(v as typeof levelFilter)}
              >
                <TabsList>
                  <TabsTrigger value="all">
                    All <Badge variant="secondary" className="ml-2 text-xs">{logCounts.all}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="info">
                    Info <Badge variant="secondary" className="ml-2 text-xs">{logCounts.info}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="warn">
                    Warn <Badge variant="secondary" className="ml-2 text-xs">{logCounts.warn}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="error">
                    Error <Badge variant="secondary" className="ml-2 text-xs">{logCounts.error}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex gap-2">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search logs..."
                    className="pl-9 w-full sm:w-[250px]"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={serviceFilter} onValueChange={setServiceFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {services.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                  <span className="sr-only">Advanced filters</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Logs List */}
        <Card>
          <CardHeader>
            <CardTitle>Log Entries</CardTitle>
            <CardDescription>
              Showing {filteredLogs.length} of {mockLogs.length} log entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 rounded-lg border border-border bg-card p-4 hover:bg-muted/30 transition-colors"
                >
                  <Badge
                    variant="outline"
                    className={cn("shrink-0 mt-0.5", levelColors[log.level as keyof typeof levelColors])}
                  >
                    {log.level}
                  </Badge>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {log.service}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {log.message}
                    </p>
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border p-12 text-center">
                  <h3 className="mt-4 text-lg font-semibold text-foreground">
                    No logs found
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Try adjusting your filters or search query
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
