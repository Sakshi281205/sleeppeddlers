"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Zap,
  Brain,
  Search,
  MessageSquare,
  RefreshCw,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  Server,
  Wifi,
} from "lucide-react"

interface ServiceStatus {
  id: string
  name: string
  status: "healthy" | "warning" | "error" | "maintenance"
  lastEvent: string
  errorRate: number
  queueDepth: number
  avgLatency: number
  uptime: number
  description: string
}

interface PipelineMetrics {
  totalStudies: number
  processedToday: number
  avgProcessingTime: number
  successRate: number
  queueBacklog: number
}

export function PipelineHealth() {
  const [selectedService, setSelectedService] = useState<ServiceStatus | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const mockServices: ServiceStatus[] = [
    {
      id: "healthlake",
      name: "HealthLake Imaging",
      status: "healthy",
      lastEvent: "2025-09-25T10:45:00Z",
      errorRate: 0.2,
      queueDepth: 3,
      avgLatency: 145,
      uptime: 99.8,
      description: "DICOM ingest from MRI/CT devices",
    },
    {
      id: "lambda",
      name: "Lambda Events",
      status: "healthy",
      lastEvent: "2025-09-25T10:44:30Z",
      errorRate: 0.1,
      queueDepth: 1,
      avgLatency: 89,
      uptime: 99.9,
      description: "Event processing and routing",
    },
    {
      id: "sagemaker",
      name: "SageMaker Inference",
      status: "warning",
      lastEvent: "2025-09-25T10:43:15Z",
      errorRate: 2.1,
      queueDepth: 15,
      avgLatency: 420,
      uptime: 98.5,
      description: "AI model inference and analysis",
    },
    {
      id: "opensearch",
      name: "OpenSearch Evidence",
      status: "healthy",
      lastEvent: "2025-09-25T10:44:45Z",
      errorRate: 0.3,
      queueDepth: 2,
      avgLatency: 67,
      uptime: 99.7,
      description: "Clinical guideline search and retrieval",
    },
    {
      id: "granite",
      name: "IBM Granite LLM",
      status: "healthy",
      lastEvent: "2025-09-25T10:44:20Z",
      errorRate: 0.8,
      queueDepth: 4,
      avgLatency: 850,
      uptime: 99.2,
      description: "Clinical summary generation",
    },
    {
      id: "apigateway",
      name: "API Gateway / SNS",
      status: "error",
      lastEvent: "2025-09-25T10:30:12Z",
      errorRate: 5.2,
      queueDepth: 8,
      avgLatency: 234,
      uptime: 97.1,
      description: "Notification delivery and API routing",
    },
  ]

  const mockMetrics: PipelineMetrics = {
    totalStudies: 1247,
    processedToday: 89,
    avgProcessingTime: 4.2,
    successRate: 97.8,
    queueBacklog: 33,
  }

  const getStatusIcon = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "maintenance":
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <Minus className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: ServiceStatus["status"]) => {
    switch (status) {
      case "healthy":
        return "text-green-500 border-green-500 bg-green-50 dark:bg-green-950"
      case "warning":
        return "text-yellow-500 border-yellow-500 bg-yellow-50 dark:bg-yellow-950"
      case "error":
        return "text-red-500 border-red-500 bg-red-50 dark:bg-red-950"
      case "maintenance":
        return "text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950"
      default:
        return "text-muted-foreground"
    }
  }

  const getServiceIcon = (serviceId: string) => {
    switch (serviceId) {
      case "healthlake":
        return <Database className="h-5 w-5" />
      case "lambda":
        return <Zap className="h-5 w-5" />
      case "sagemaker":
        return <Brain className="h-5 w-5" />
      case "opensearch":
        return <Search className="h-5 w-5" />
      case "granite":
        return <MessageSquare className="h-5 w-5" />
      case "apigateway":
        return <Wifi className="h-5 w-5" />
      default:
        return <Server className="h-5 w-5" />
    }
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
    return `${Math.floor(diffMins / 1440)}d ago`
  }

  const handleRefresh = () => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 2000)
  }

  const healthyServices = mockServices.filter((s) => s.status === "healthy").length
  const warningServices = mockServices.filter((s) => s.status === "warning").length
  const errorServices = mockServices.filter((s) => s.status === "error").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Pipeline Health & Integrations</h1>
          <p className="text-muted-foreground">Monitor system status and integration health</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="h-4 w-4 mr-2" />
            AWS Console
          </Button>
        </div>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Studies</p>
                <p className="text-2xl font-bold">{mockMetrics.totalStudies.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Processed Today</p>
                <p className="text-2xl font-bold">{mockMetrics.processedToday}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Processing</p>
                <p className="text-2xl font-bold">{mockMetrics.avgProcessingTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{mockMetrics.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Queue Backlog</p>
                <p className="text-2xl font-bold">{mockMetrics.queueBacklog}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>System Status</span>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span>Healthy ({healthyServices})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                <span>Warning ({warningServices})</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span>Error ({errorServices})</span>
              </div>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockServices.map((service) => (
              <Card
                key={service.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedService?.id === service.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedService(service)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getServiceIcon(service.id)}
                      <div>
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-xs text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(service.status)}
                      <Badge variant="outline" className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Uptime</span>
                      <span className="font-medium">{service.uptime}%</span>
                    </div>
                    <Progress value={service.uptime} className="h-2" />

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Error Rate</div>
                        <div className="font-medium">{service.errorRate}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Queue</div>
                        <div className="font-medium">{service.queueDepth}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Latency</div>
                        <div className="font-medium">{service.avgLatency}ms</div>
                      </div>
                    </div>

                    <div className="text-xs text-muted-foreground">Last event: {formatTimeAgo(service.lastEvent)}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Service Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedService ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    {getServiceIcon(selectedService.id)}
                    <div>
                      <h3 className="font-semibold">{selectedService.name}</h3>
                      <p className="text-sm text-muted-foreground">{selectedService.description}</p>
                    </div>
                    <Badge variant="outline" className={getStatusColor(selectedService.status)}>
                      {selectedService.status}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{selectedService.uptime}%</div>
                      <div className="text-xs text-muted-foreground">Uptime</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{selectedService.errorRate}%</div>
                      <div className="text-xs text-muted-foreground">Error Rate</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{selectedService.queueDepth}</div>
                      <div className="text-xs text-muted-foreground">Queue Depth</div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold">{selectedService.avgLatency}ms</div>
                      <div className="text-xs text-muted-foreground">Avg Latency</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Recent Events</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm p-2 bg-muted rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span>Service health check passed</span>
                        <span className="text-muted-foreground ml-auto">
                          {formatTimeAgo(selectedService.lastEvent)}
                        </span>
                      </div>
                      {selectedService.status === "warning" && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-yellow-50 dark:bg-yellow-950 rounded">
                          <AlertTriangle className="h-4 w-4 text-yellow-500" />
                          <span>Queue depth above threshold (15 items)</span>
                          <span className="text-muted-foreground ml-auto">5m ago</span>
                        </div>
                      )}
                      {selectedService.status === "error" && (
                        <div className="flex items-center gap-2 text-sm p-2 bg-red-50 dark:bg-red-950 rounded">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span>Connection timeout to downstream service</span>
                          <span className="text-muted-foreground ml-auto">15m ago</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Restart Service
                    </Button>
                    {selectedService.status === "error" && (
                      <Button variant="outline" size="sm">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Retry Failed Jobs
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Server className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">Select a service to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* DICOM Ingest Monitor */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                DICOM Ingest Monitor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-3 bg-muted rounded-lg">
                <div className="text-2xl font-bold">89</div>
                <div className="text-xs text-muted-foreground">Studies Today</div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Recent Studies</h4>
                <div className="space-y-2">
                  {[
                    { scanner: "CT-01", modality: "CT", time: "2m ago", status: "processed" },
                    { scanner: "MRI-02", modality: "MRI", time: "5m ago", status: "processing" },
                    { scanner: "CT-03", modality: "CT", time: "8m ago", status: "processed" },
                    { scanner: "MRI-01", modality: "MRI", time: "12m ago", status: "processed" },
                  ].map((study, index) => (
                    <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{study.scanner}</div>
                        <div className="text-xs text-muted-foreground">{study.modality}</div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant="outline"
                          className={
                            study.status === "processed"
                              ? "text-green-500 border-green-500"
                              : "text-yellow-500 border-yellow-500"
                          }
                        >
                          {study.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground">{study.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Scanner Status</h4>
                <div className="space-y-1">
                  {["CT-01", "CT-02", "CT-03", "MRI-01", "MRI-02"].map((scanner) => (
                    <div key={scanner} className="flex items-center justify-between text-sm">
                      <span>{scanner}</span>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-xs text-muted-foreground">Online</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
