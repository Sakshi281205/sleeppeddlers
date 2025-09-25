"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatTimeAgo, getSeverityColor } from "@/components/mock-services"
import { caseService, type Case } from "@/lib/case-service"
import {
  Search,
  Filter,
  Eye,
  Clock,
  AlertTriangle,
  CheckCircle,
  Brain,
  User,
  Activity,
  FileText,
  RefreshCw,
} from "lucide-react"

interface WorklistDashboardProps {
  initialFilter?: string
}

export function WorklistDashboard({ initialFilter }: WorklistDashboardProps) {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState(initialFilter || "all")
  const [cases, setCases] = useState<Case[]>([])

  // Load cases on mount
  useEffect(() => {
    const loadCases = () => {
      setCases(caseService.getAllCases())
    }
    
    loadCases()
    
    // Update cases every 2 seconds
    const interval = setInterval(loadCases, 2000)
    return () => clearInterval(interval)
  }, [])

  const filteredCases = cases.filter((case_) => {
    const matchesSearch =
      case_.caseId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.patient.display.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.modality.toLowerCase().includes(searchTerm.toLowerCase()) ||
      case_.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || case_.status === statusFilter
    const matchesPriority = priorityFilter === "all" || case_.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const getStatusIcon = (status: Case["status"]) => {
    switch (status) {
      case "AI_COMPLETE":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "PENDING_AI":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "HUMAN_VERIFIED":
        return <User className="h-4 w-4 text-blue-500" />
      case "ERROR":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      default:
        return <Brain className="h-4 w-4 text-primary" />
    }
  }

  const getStatusText = (status: Case["status"]) => {
    switch (status) {
      case "AI_COMPLETE":
        return "AI Complete"
      case "PENDING_AI":
        return "Pending AI"
      case "HUMAN_VERIFIED":
        return "Verified"
      case "ERROR":
        return "Error"
      default:
        return status
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Patients</h1>
          <p className="text-muted-foreground">Comprehensive case management and review</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by Accession ID, Patient, Modality..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="PENDING_AI">Pending AI</SelectItem>
                <SelectItem value="AI_COMPLETE">AI Complete</SelectItem>
                <SelectItem value="HUMAN_VERIFIED">Verified</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="STAT">STAT</SelectItem>
                <SelectItem value="URGENT">URGENT</SelectItem>
                <SelectItem value="ROUTINE">ROUTINE</SelectItem>
                <SelectItem value="QA">QA</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cases Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Cases ({filteredCases.length})</span>
                <Badge variant="outline">
                  {filteredCases.length} of {cases.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Accession ID</TableHead>
                      <TableHead>Patient</TableHead>
                      <TableHead>Study</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>SLA</TableHead>
                      <TableHead>Assigned</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCases.map((case_) => (
                      <TableRow
                        key={case_.caseId}
                        className={`cursor-pointer hover:bg-accent/50 ${
                          selectedCase?.caseId === case_.caseId ? "bg-accent" : ""
                        }`}
                        onClick={() => {
                          setSelectedCase(case_)
                          // Open patient file in new tab
                          window.open(`/patient/${case_.caseId}`, '_blank')
                        }}
                      >
                        <TableCell className="font-mono text-sm">{case_.caseId.split("-").pop()}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{case_.patient.display}</div>
                            <div className="text-xs text-muted-foreground">{case_.patient.mrnMasked}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {case_.modality} - {case_.bodyPart}
                            </div>
                            <div className="text-xs text-muted-foreground">{formatTimeAgo(case_.studyDateTime)}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(case_.status)}
                            <span className="text-sm">{getStatusText(case_.status)}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={getSeverityColor(case_.priority)}>
                            {case_.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm">{case_.slaMinutesRemaining}m</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {case_.assignedTo.replace("dr.", "Dr. ").replace(".", " ")}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Case Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Case Preview</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCase ? (
                <div className="space-y-4">
                  {/* Case Header */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className={getSeverityColor(selectedCase.priority)}>
                        {selectedCase.priority}
                      </Badge>
                      {selectedCase.anonymized && (
                        <Badge variant="secondary" className="text-xs">
                          Anonymized
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold">
                      {selectedCase.modality} - {selectedCase.bodyPart}
                    </h3>
                    <p className="text-sm text-muted-foreground">{selectedCase.patient.display}</p>
                  </div>

                  {/* Key Image Placeholder */}
                  <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Key Image</p>
                      <p className="text-xs text-muted-foreground">Series 1 of 3</p>
                    </div>
                  </div>

                  {/* AI Findings */}
                  {selectedCase.ai.findings.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI Findings
                      </h4>
                      <div className="space-y-1">
                        {selectedCase.ai.findings.map((finding, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{finding.replace("_", " ")}</span>
                            <Badge variant="outline">{(selectedCase.ai.confidenceTop * 100).toFixed(0)}%</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Status & Timeline */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(selectedCase.status)}
                        <span className="text-sm">{getStatusText(selectedCase.status)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">Model: {selectedCase.ai.modelVersion}</div>
                      <div className="text-xs text-muted-foreground">
                        Evidence: {selectedCase.evidence.openSearchHits} guideline matches
                      </div>
                      <div className="text-xs text-muted-foreground">Summary: {selectedCase.summary.graniteStatus}</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button className="w-full" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Open Viewer
                    </Button>
                    <div className="grid grid-cols-2 gap-2">
                      <Button variant="outline" size="sm">
                        Claim
                      </Button>
                      <Button variant="outline" size="sm">
                        Reassign
                      </Button>
                    </div>
                  </div>

                  {/* Last Event */}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground">
                      Last event: AI inference completed {formatTimeAgo(selectedCase.studyDateTime)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Select a case to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
