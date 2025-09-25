"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { mockCases, formatTimeAgo, getSeverityColor, type Case } from "@/components/mock-services"
import { FileUpload } from "@/components/file-upload"
import { Clock, AlertTriangle, CheckCircle, Brain, Upload, Eye, Filter, Search } from "lucide-react"

export function TriageDashboard() {
  const [searchQuery, setSearchQuery] = useState("")

  // Debounced search
  const debouncedSearchQuery = useMemo(() => {
    const timer = setTimeout(() => searchQuery, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  const filteredCases = useMemo(() => {
    if (!searchQuery.trim()) return mockCases
    
    const query = searchQuery.toLowerCase()
    return mockCases.filter((case_) => 
      case_.patient.display.toLowerCase().includes(query) ||
      case_.patient.mrnMasked.toLowerCase().includes(query) ||
      case_.priority.toLowerCase().includes(query) ||
      case_.modality.toLowerCase().includes(query) ||
      case_.bodyPart.toLowerCase().includes(query)
    )
  }, [searchQuery])

  const statCases = filteredCases.filter((c) => c.priority === "STAT").slice(0, 3)
  const urgentCases = filteredCases.filter((c) => c.priority === "URGENT").slice(0, 3)
  const routineCases = filteredCases.filter((c) => c.priority === "ROUTINE")
  const qaCases = filteredCases.filter((c) => c.priority === "QA")

  const getStatusIcon = (status: Case["status"]) => {
    switch (status) {
      case "AI_COMPLETE":
        return <CheckCircle className="h-4 w-4 text-medical-success" />
      case "PENDING_AI":
        return <Clock className="h-4 w-4 text-medical-urgent" />
      case "ERROR":
        return <AlertTriangle className="h-4 w-4 text-medical-stat" />
      default:
        return <Brain className="h-4 w-4 text-primary" />
    }
  }

  const openPatientFile = (case_: Case) => {
    // Open patient file in new tab/window
    const patientUrl = `/patient/${case_.caseId}`
    window.open(patientUrl, '_blank')
  }

  const renderCaseCard = (case_: Case) => (
    <Card key={case_.caseId} className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={() => openPatientFile(case_)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getStatusIcon(case_.status)}
            <Badge variant="outline" className={getSeverityColor(case_.priority)}>
              {case_.priority}
            </Badge>
            {case_.anonymized && (
              <Badge variant="secondary" className="text-xs">
                Anonymized
              </Badge>
            )}
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <div>SLA: {case_.slaMinutesRemaining}m</div>
            <div>{formatTimeAgo(case_.studyDateTime)}</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="font-medium">
              {case_.modality} - {case_.bodyPart}
            </span>
            <span className="text-sm text-muted-foreground">{case_.patient.display}</span>
          </div>

          {case_.ai.findings.length > 0 && (
            <div className="flex items-center gap-2">
              <Brain className="h-3 w-3 text-primary" />
              <span className="text-sm">
                {case_.ai.findings.join(", ")}
                <span className="text-muted-foreground ml-1">({(case_.ai.confidenceTop * 100).toFixed(0)}%)</span>
              </span>
            </div>
          )}

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Assigned: {case_.assignedTo}</span>
            <span>Evidence: {case_.evidence.openSearchHits} hits</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header with search */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Triage Dashboard</h1>
          <p className="text-muted-foreground">Upload and analyze medical images with AI</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search cases by name, MRN, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* File Upload Section */}
      <div className="flex justify-center">
        <FileUpload />
      </div>

      {/* Priority Queue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-medical-stat">STAT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statCases.length}</div>
            <p className="text-xs text-muted-foreground">Target: 30 min</p>
            <Progress value={75} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-medical-urgent">URGENT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{urgentCases.length}</div>
            <p className="text-xs text-muted-foreground">Target: 2 hours</p>
            <Progress value={60} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-medical-routine">ROUTINE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{routineCases.length}</div>
            <p className="text-xs text-muted-foreground">Target: 24 hours</p>
            <Progress value={40} className="mt-2 h-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">QA</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{qaCases.length}</div>
            <p className="text-xs text-muted-foreground">Quality Assurance</p>
            <Progress value={90} className="mt-2 h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Case Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* STAT Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-medical-stat">STAT Cases</h2>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/patients?filter=STAT'}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {statCases.map(renderCaseCard)}
            {statCases.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">No STAT cases at this time</CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* URGENT Cases */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-medical-urgent">URGENT Cases</h2>
            <Button variant="outline" size="sm" onClick={() => window.location.href = '/patients?filter=URGENT'}>
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          <div className="space-y-3">
            {urgentCases.map(renderCaseCard)}
            {urgentCases.length === 0 && (
              <Card>
                <CardContent className="p-6 text-center text-muted-foreground">
                  No urgent cases at this time
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockCases.slice(0, 3).map((case_) => (
              <div
                key={case_.caseId}
                className="flex items-center justify-between py-2 border-b border-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(case_.status)}
                  <div>
                    <div className="font-medium">
                      {case_.modality} - {case_.bodyPart}
                    </div>
                    <div className="text-sm text-muted-foreground">{case_.patient.display}</div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={getSeverityColor(case_.priority)}>
                    {case_.priority}
                  </Badge>
                  <div className="text-xs text-muted-foreground mt-1">{formatTimeAgo(case_.studyDateTime)}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
