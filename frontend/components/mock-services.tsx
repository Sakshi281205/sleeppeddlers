"use client"

// Mock data and services for development
export interface Case {
  caseId: string
  patient: {
    display: string
    mrnMasked: string
  }
  modality: string
  bodyPart: string
  studyDateTime: string
  status: "PENDING_AI" | "AI_COMPLETE" | "HUMAN_VERIFIED" | "ERROR"
  slaMinutesRemaining: number
  priority: "STAT" | "URGENT" | "ROUTINE" | "QA"
  ai: {
    modelVersion: string
    confidenceTop: number
    findings: string[]
  }
  evidence: {
    openSearchHits: number
  }
  summary: {
    graniteStatus: "READY" | "PENDING" | "ERROR"
  }
  assignedTo: string
  anonymized: boolean
}

export interface Notification {
  id: string
  severity: "STAT" | "URGENT" | "ROUTINE"
  type: "AI_ALERT" | "ASSIGNMENT" | "PIPELINE_ISSUE" | "REPORT_FINALIZED"
  caseId: string
  message: string
  timestamp: string
  ack: {
    state: "READ" | "UNREAD"
  }
}

export const mockCases: Case[] = [
  {
    caseId: "ACC-2025-09-25-12345",
    patient: { display: "M, 64y (anonymized)", mrnMasked: "••••1234" },
    modality: "CT",
    bodyPart: "Head",
    studyDateTime: "2025-09-25T10:14:31Z",
    status: "AI_COMPLETE",
    priority: "STAT",
    slaMinutesRemaining: 18,
    ai: { modelVersion: "ct-brain-3.2.1", confidenceTop: 0.91, findings: ["ICH_suspected"] },
    evidence: { openSearchHits: 7 },
    summary: { graniteStatus: "READY" },
    assignedTo: "dr.r.kapoor",
    anonymized: true,
  },
  {
    caseId: "ACC-2025-09-25-12346",
    patient: { display: "F, 45y (anonymized)", mrnMasked: "••••5678" },
    modality: "MRI",
    bodyPart: "Brain",
    studyDateTime: "2025-09-25T09:30:15Z",
    status: "HUMAN_VERIFIED",
    priority: "URGENT",
    slaMinutesRemaining: 45,
    ai: { modelVersion: "mri-brain-2.1.0", confidenceTop: 0.87, findings: ["MS_lesions"] },
    evidence: { openSearchHits: 12 },
    summary: { graniteStatus: "READY" },
    assignedTo: "dr.s.chen",
    anonymized: true,
  },
  {
    caseId: "ACC-2025-09-25-12347",
    patient: { display: "M, 32y (anonymized)", mrnMasked: "••••9012" },
    modality: "CT",
    bodyPart: "Chest",
    studyDateTime: "2025-09-25T08:45:22Z",
    status: "PENDING_AI",
    priority: "ROUTINE",
    slaMinutesRemaining: 120,
    ai: { modelVersion: "ct-chest-1.8.3", confidenceTop: 0.0, findings: [] },
    evidence: { openSearchHits: 0 },
    summary: { graniteStatus: "PENDING" },
    assignedTo: "dr.m.patel",
    anonymized: true,
  },
  {
    caseId: "ACC-2025-09-25-12348",
    patient: { display: "F, 28y (anonymized)", mrnMasked: "••••3456" },
    modality: "MRI",
    bodyPart: "Knee",
    studyDateTime: "2025-09-25T07:20:15Z",
    status: "AI_COMPLETE",
    priority: "ROUTINE",
    slaMinutesRemaining: 180,
    ai: { modelVersion: "mri-knee-1.5.2", confidenceTop: 0.78, findings: ["Meniscal_tear"] },
    evidence: { openSearchHits: 5 },
    summary: { graniteStatus: "READY" },
    assignedTo: "dr.l.martinez",
    anonymized: true,
  },
  {
    caseId: "ACC-2025-09-25-12349",
    patient: { display: "M, 55y (anonymized)", mrnMasked: "••••7890" },
    modality: "CT",
    bodyPart: "Chest",
    studyDateTime: "2025-09-25T06:15:42Z",
    status: "ERROR",
    priority: "URGENT",
    slaMinutesRemaining: -15,
    ai: { modelVersion: "ct-chest-1.8.3", confidenceTop: 0.0, findings: [] },
    evidence: { openSearchHits: 0 },
    summary: { graniteStatus: "ERROR" },
    assignedTo: "dr.a.wilson",
    anonymized: true,
  },
]

export const mockNotifications: Notification[] = [
  {
    id: "NTF-001",
    severity: "STAT",
    type: "AI_ALERT",
    caseId: "ACC-2025-09-25-12345",
    message: "ICH suspected with high confidence (0.91)",
    timestamp: "2025-09-25T10:15:00Z",
    ack: { state: "UNREAD" },
  },
  {
    id: "NTF-002",
    severity: "URGENT",
    type: "ASSIGNMENT",
    caseId: "ACC-2025-09-25-12346",
    message: "New case assigned for review",
    timestamp: "2025-09-25T09:31:00Z",
    ack: { state: "READ" },
  },
  {
    id: "NTF-003",
    severity: "ROUTINE",
    type: "PIPELINE_ISSUE",
    caseId: "",
    message: "SageMaker inference queue depth: 15 cases",
    timestamp: "2025-09-25T08:00:00Z",
    ack: { state: "UNREAD" },
  },
]

export function formatTimeAgo(timestamp: string): string {
  const now = new Date()
  const time = new Date(timestamp)
  const diffMs = now.getTime() - time.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`
  return `${Math.floor(diffMins / 1440)}d ago`
}

export function getSeverityColor(priority: string): string {
  switch (priority) {
    case "STAT":
      return "text-red-500 border-red-500"
    case "URGENT":
      return "text-orange-500 border-orange-500"
    case "ROUTINE":
      return "text-blue-500 border-blue-500"
    case "QA":
      return "text-purple-500 border-purple-500"
    default:
      return "text-muted-foreground"
  }
}
