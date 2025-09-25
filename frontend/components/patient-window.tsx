"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { mockCases, formatTimeAgo, getSeverityColor, type Case } from "@/components/mock-services"
import { Eye, FileText, Clock, User, Calendar, Weight, Ruler } from "lucide-react"

interface PatientWindowProps {
  caseId: string
}

export function PatientWindow({ caseId }: PatientWindowProps) {
  const [patientCase, setPatientCase] = useState<Case | null>(null)

  useEffect(() => {
    const foundCase = mockCases.find(c => c.caseId === caseId)
    setPatientCase(foundCase || null)
  }, [caseId])

  if (!patientCase) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Patient case not found</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Patient File</h1>
          <p className="text-muted-foreground">{patientCase.caseId}</p>
        </div>
        <Badge variant="outline" className={getSeverityColor(patientCase.priority)}>
          {patientCase.priority}
        </Badge>
      </div>

      {/* Basic Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Name</label>
              <p className="text-sm">{patientCase.patient.display}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Age</label>
              <p className="text-sm">{patientCase.patient.display.match(/(\d+)y/)?.[1] || 'N/A'} years</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Gender</label>
              <p className="text-sm">{patientCase.patient.display.match(/([MF]),/)?.[1] || 'N/A'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">MRN</label>
              <p className="text-sm">{patientCase.patient.mrnMasked}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Height</label>
              <p className="text-sm flex items-center gap-1">
                <Ruler className="h-3 w-3" />
                N/A
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Weight</label>
              <p className="text-sm flex items-center gap-1">
                <Weight className="h-3 w-3" />
                N/A
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Study Date</label>
              <p className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(patientCase.studyDateTime).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Modality</label>
              <p className="text-sm">{patientCase.modality}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preliminary Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Preliminary Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Confidence Score:</span>
            <Badge variant="outline" className="text-green-600">
              {(patientCase.ai.confidenceTop * 100).toFixed(1)}%
            </Badge>
          </div>
          
          <div>
            <label className="text-sm font-medium text-muted-foreground">Findings:</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {patientCase.ai.findings.map((finding, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {finding}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Sources:</label>
            <div className="mt-2 space-y-2">
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                • Clinical Guidelines - Medical Imaging Standards v3.2
              </Button>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                • Radiology Reports Database - Case #{patientCase.caseId.slice(-4)}
              </Button>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                • AI Model Documentation - {patientCase.ai.modelVersion}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CT Scans */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            CT Scans
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock scan data */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <p className="font-medium">{patientCase.modality} - {patientCase.bodyPart}</p>
                <p className="text-sm text-muted-foreground">
                  {formatTimeAgo(patientCase.studyDateTime)} • {patientCase.ai.modelVersion}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Open Viewer
                </Button>
              </div>
            </div>
            
            {/* Inline DICOM Viewer placeholder */}
            <div className="bg-muted rounded-lg p-8 text-center">
              <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">DICOM Viewer</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click "Open Viewer" to view the scan in full-screen mode
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Patient History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Previous {patientCase.modality} Study</p>
                <p className="text-sm text-muted-foreground">
                  {patientCase.bodyPart} • 3 months ago
                </p>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Initial Consultation</p>
                <p className="text-sm text-muted-foreground">
                  General Medicine • 6 months ago
                </p>
              </div>
              <Badge variant="outline">Completed</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
