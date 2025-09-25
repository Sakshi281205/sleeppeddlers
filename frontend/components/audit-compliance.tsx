"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTimeAgo } from "@/components/mock-services"
import { caseService, type Case } from "@/lib/case-service"
import {
  Shield,
  Eye,
  Download,
  Clock,
  User,
  Activity,
  FileText,
  AlertTriangle,
  CheckCircle,
  Brain,
  Search,
} from "lucide-react"

interface AuditEvent {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  details: string
  ipAddress: string
  userAgent: string
  phiAccessed: boolean
}

interface ModelVersion {
  id: string
  modelName: string
  version: string
  deployedDate: string
  accuracy: number
  driftScore: number
  casesProcessed: number
  status: "active" | "deprecated" | "testing"
}

export function AuditCompliance() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [auditFilter, setAuditFilter] = useState("all")
  const [timeRange, setTimeRange] = useState("24h")

  const mockAuditEvents: AuditEvent[] = [
    {
      id: "audit-001",
      timestamp: "2025-09-25T10:45:00Z",
      userId: "dr.s.johnson",
      userName: "Dr. Sarah Johnson",
      action: "VIEW_CASE",
      resource: "ACC-2025-09-25-12345",
      details: "Opened DICOM viewer for CT Head case",
      ipAddress: "10.0.1.45",
      userAgent: "Chrome/118.0.0.0",
      phiAccessed: true,
    },
    {
      id: "audit-002",
      timestamp: "2025-09-25T10:42:30Z",
      userId: "dr.r.kapoor",
      userName: "Dr. Robert Kapoor",
      action: "CASE_ASSIGNMENT",
      resource: "ACC-2025-09-25-12346",
      details: "Case assigned for review",
      ipAddress: "10.0.1.67",
      userAgent: "Chrome/118.0.0.0",
      phiAccessed: false,
    },
    {
      id: "audit-003",
      timestamp: "2025-09-25T10:40:15Z",
      userId: "system",
      userName: "System",
      action: "AI_INFERENCE",
      resource: "ACC-2025-09-25-12345",
      details: "SageMaker model ct-brain-3.2.1 completed inference",
      ipAddress: "internal",
      userAgent: "SageMaker/1.0",
      phiAccessed: false,
    },
    {
      id: "audit-004",
      timestamp: "2025-09-25T10:38:45Z",
      userId: "dr.s.johnson",
      userName: "Dr. Sarah Johnson",
      action: "PHI_ACCESS",
      resource: "ACC-2025-09-25-12345",
      details: "Revealed patient identifiers",
      ipAddress: "10.0.1.45",
      userAgent: "Chrome/118.0.0.0",
      phiAccessed: true,
    },
  ]

  const mockModelVersions: ModelVersion[] = [
    {
      id: "model-001",
      modelName: "ct-brain",
      version: "3.2.1",
      deployedDate: "2025-09-20T00:00:00Z",
      accuracy: 94.2,
      driftScore: 0.12,
      casesProcessed: 1247,
      status: "active",
    },
    {
      id: "model-002",
      modelName: "mri-brain",
      version: "2.1.0",
      deployedDate: "2025-09-15T00:00:00Z",
      accuracy: 91.8,
      driftScore: 0.08,
      casesProcessed: 892,
      status: "active",
    },
    {
      id: "model-003",
      modelName: "ct-chest",
      version: "1.8.3",
      deployedDate: "2025-09-10T00:00:00Z",
      accuracy: 89.5,
      driftScore: 0.25,
      casesProcessed: 654,
      status: "testing",
    },
  ]

  const filteredAuditEvents = mockAuditEvents.filter((event) => {
    if (auditFilter === "all") return true
    if (auditFilter === "phi") return event.phiAccessed
    if (auditFilter === "user") return event.userId !== "system"
    if (auditFilter === "system") return event.userId === "system"
    return true
  })

  const getActionIcon = (action: string) => {
    switch (action) {
      case "VIEW_CASE":
        return <Eye className="h-4 w-4 text-blue-500" />
      case "CASE_ASSIGNMENT":
        return <User className="h-4 w-4 text-green-500" />
      case "AI_INFERENCE":
        return <Brain className="h-4 w-4 text-purple-500" />
      case "PHI_ACCESS":
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <Activity className="h-4 w-4" />
    }
  }

  const getModelStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-green-500 border-green-500"
      case "deprecated":
        return "text-red-500 border-red-500"
      case "testing":
        return "text-yellow-500 border-yellow-500"
      default:
        return "text-muted-foreground"
    }
  }

  const getDriftColor = (score: number) => {
    if (score < 0.1) return "text-green-500"
    if (score < 0.2) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Audit & Compliance</h1>
          <p className="text-muted-foreground">Access logs, PHI tracking, and model governance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Compliance Report
          </Button>
        </div>
      </div>

      <Tabs defaultValue="timeline" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="timeline">Case Timeline</TabsTrigger>
          <TabsTrigger value="access">Access Logs</TabsTrigger>
          <TabsTrigger value="phi">PHI Tracking</TabsTrigger>
          <TabsTrigger value="models">Model Governance</TabsTrigger>
        </TabsList>

        <TabsContent value="timeline" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Case Selection */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Select Case</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {caseService.getAllCases().slice(0, 3).map((case_) => (
                      <Card
                        key={case_.caseId}
                        className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                          selectedCase?.caseId === case_.caseId ? "bg-accent" : ""
                        }`}
                        onClick={() => setSelectedCase(case_)}
                      >
                        <CardContent className="p-3">
                          <div className="font-medium text-sm">{case_.caseId}</div>
                          <div className="text-xs text-muted-foreground">
                            {case_.modality} - {case_.bodyPart}
                          </div>
                          <div className="text-xs text-muted-foreground">{case_.patient.display}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Case Timeline */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Case Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedCase ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Badge variant="outline">{selectedCase.caseId}</Badge>
                        <Badge variant="secondary">
                          {selectedCase.modality} - {selectedCase.bodyPart}
                        </Badge>
                      </div>

                      <div className="space-y-4">
                        {[
                          {
                            time: "10:45:00",
                            event: "Case viewed by Dr. Sarah Johnson",
                            type: "user",
                            icon: <Eye className="h-4 w-4 text-blue-500" />,
                          },
                          {
                            time: "10:42:30",
                            event: "Case assigned to Dr. Robert Kapoor",
                            type: "system",
                            icon: <User className="h-4 w-4 text-green-500" />,
                          },
                          {
                            time: "10:40:15",
                            event: "AI inference completed (ct-brain-3.2.1)",
                            type: "ai",
                            icon: <Brain className="h-4 w-4 text-purple-500" />,
                          },
                          {
                            time: "10:38:45",
                            event: "PHI accessed by Dr. Sarah Johnson",
                            type: "phi",
                            icon: <Shield className="h-4 w-4 text-red-500" />,
                          },
                          {
                            time: "10:35:20",
                            event: "OpenSearch evidence retrieval",
                            type: "system",
                            icon: <Search className="h-4 w-4 text-orange-500" />,
                          },
                          {
                            time: "10:30:12",
                            event: "DICOM study ingested from CT-01",
                            type: "ingest",
                            icon: <Activity className="h-4 w-4 text-teal-500" />,
                          },
                        ].map((item, index) => (
                          <div key={index} className="flex items-start gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                              {item.icon}
                            </div>
                            <div className="flex-1">
                              <div className="font-medium text-sm">{item.event}</div>
                              <div className="text-xs text-muted-foreground">{item.time}</div>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {item.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">Select a case to view timeline</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <Select value={auditFilter} onValueChange={setAuditFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="phi">PHI Access</SelectItem>
                    <SelectItem value="user">User Actions</SelectItem>
                    <SelectItem value="system">System Events</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1h">Last Hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                  </SelectContent>
                </Select>

                <Badge variant="outline">{filteredAuditEvents.length} events</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Access Logs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Access Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Resource</TableHead>
                      <TableHead>PHI</TableHead>
                      <TableHead>IP Address</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-mono text-sm">{formatTimeAgo(event.timestamp)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span>{event.userName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getActionIcon(event.action)}
                            <span className="text-sm">{event.action.replace("_", " ")}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">{event.resource}</TableCell>
                        <TableCell>
                          {event.phiAccessed ? (
                            <Badge variant="destructive" className="text-xs">
                              Yes
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="text-xs">
                              No
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-sm">{event.ipAddress}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="phi" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">PHI Access Events</p>
                    <p className="text-2xl font-bold">24</p>
                  </div>
                  <Shield className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Unique Users</p>
                    <p className="text-2xl font-bold">8</p>
                  </div>
                  <User className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Cases Accessed</p>
                    <p className="text-2xl font-bold">15</p>
                  </div>
                  <FileText className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>PHI Access Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { user: "Dr. Sarah Johnson", accesses: 8, lastAccess: "2m ago", role: "Radiologist" },
                  { user: "Dr. Robert Kapoor", accesses: 5, lastAccess: "15m ago", role: "Radiologist" },
                  { user: "Dr. Michael Chen", accesses: 4, lastAccess: "1h ago", role: "Radiologist" },
                  { user: "Dr. Lisa Rodriguez", accesses: 3, lastAccess: "2h ago", role: "Department Head" },
                ].map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5" />
                      <div>
                        <div className="font-medium">{user.user}</div>
                        <div className="text-sm text-muted-foreground">{user.role}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{user.accesses} accesses</div>
                      <div className="text-sm text-muted-foreground">Last: {user.lastAccess}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Model Governance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Model</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Deployed</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Drift Score</TableHead>
                      <TableHead>Cases</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockModelVersions.map((model) => (
                      <TableRow key={model.id}>
                        <TableCell className="font-medium">{model.modelName}</TableCell>
                        <TableCell className="font-mono">{model.version}</TableCell>
                        <TableCell>{formatTimeAgo(model.deployedDate)}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{model.accuracy}%</span>
                            {model.accuracy > 90 ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={getDriftColor(model.driftScore)}>{model.driftScore.toFixed(2)}</span>
                        </TableCell>
                        <TableCell>{model.casesProcessed.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getModelStatusColor(model.status)}>
                            {model.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
