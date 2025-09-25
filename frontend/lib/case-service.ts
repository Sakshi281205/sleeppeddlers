// Case management service that integrates with the real API
import { uploadBase64, getStatus, getResults, apiResultsToCase, type UploadResponse, type StatusResponse, type ResultsResponse } from './api'
import { medicalDatasetService, type MedicalDataset } from './medical-dataset-service'

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
  jobId?: string
  isProcessing?: boolean
}

export class CaseService {
  private cases: Map<string, Case> = new Map()
  private processingJobs: Set<string> = new Set()

  constructor() {
    // Load any existing cases from localStorage
    this.loadFromStorage()
  }

  async uploadImage(file: File): Promise<Case> {
    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file)
      
      // Upload to API
      const uploadResponse = await uploadBase64({
        image: base64Data,
        filename: file.name,
        content_type: file.type
      })

      // Create case object
      const caseData: Case = {
        caseId: uploadResponse.job_id,
        patient: { 
          display: "Anonymous Patient", 
          mrnMasked: "••••" + uploadResponse.job_id.slice(-4) 
        },
        modality: this.inferModality(file.name),
        bodyPart: "Unknown",
        studyDateTime: new Date().toISOString(),
        status: "PENDING_AI",
        priority: "ROUTINE",
        slaMinutesRemaining: 120,
        ai: {
          modelVersion: "unknown",
          confidenceTop: 0.0,
          findings: []
        },
        evidence: { openSearchHits: 0 },
        summary: { graniteStatus: "PENDING" },
        assignedTo: "system",
        anonymized: true,
        jobId: uploadResponse.job_id,
        isProcessing: true
      }

      // Add to cases and start polling
      this.cases.set(uploadResponse.job_id, caseData)
      this.processingJobs.add(uploadResponse.job_id)
      this.saveToStorage()
      this.startPolling(uploadResponse.job_id)

      return caseData
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  }

  async getCase(caseId: string): Promise<Case | null> {
    return this.cases.get(caseId) || null
  }

  getAllCases(): Case[] {
    return Array.from(this.cases.values()).sort((a, b) => 
      new Date(b.studyDateTime).getTime() - new Date(a.studyDateTime).getTime()
    )
  }

  getCasesByPriority(priority: string): Case[] {
    return this.getAllCases().filter(case_ => case_.priority === priority)
  }

  getCasesByStatus(status: string): Case[] {
    return this.getAllCases().filter(case_ => case_.status === status)
  }

  private async startPolling(jobId: string) {
    const maxAttempts = 30 // 30 attempts with 2 second intervals = 1 minute max
    let attempts = 0

    const poll = async () => {
      try {
        const status = await getStatus(jobId)
        const case_ = this.cases.get(jobId)
        
        if (!case_) return

        // Update case status
        case_.status = this.mapApiStatusToCaseStatus(status.status)
        case_.isProcessing = status.status !== 'completed' && status.status !== 'error'

        if (status.status === 'completed') {
          const results = await getResults(jobId)
          if (results) {
            const updatedCase = apiResultsToCase(jobId, results)
            Object.assign(case_, updatedCase)
            case_.isProcessing = false
            this.processingJobs.delete(jobId)
          }
        }

        if (status.status === 'error') {
          case_.status = 'ERROR'
          case_.isProcessing = false
          this.processingJobs.delete(jobId)
        }

        this.cases.set(jobId, case_)
        this.saveToStorage()

        // Continue polling if still processing
        if (case_.isProcessing && attempts < maxAttempts) {
          attempts++
          setTimeout(poll, 2000)
        } else if (case_.isProcessing) {
          // Timeout
          case_.status = 'ERROR'
          case_.isProcessing = false
          this.processingJobs.delete(jobId)
          this.cases.set(jobId, case_)
          this.saveToStorage()
        }
      } catch (error) {
        console.error('Polling error:', error)
        const case_ = this.cases.get(jobId)
        if (case_) {
          case_.status = 'ERROR'
          case_.isProcessing = false
          this.processingJobs.delete(jobId)
          this.cases.set(jobId, case_)
          this.saveToStorage()
        }
      }
    }

    setTimeout(poll, 2000)
  }

  private mapApiStatusToCaseStatus(apiStatus: string): Case['status'] {
    switch (apiStatus) {
      case 'uploaded':
      case 'processing':
      case 'ai_complete':
        return 'PENDING_AI'
      case 'completed':
        return 'AI_COMPLETE'
      case 'error':
        return 'ERROR'
      default:
        return 'PENDING_AI'
    }
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        const base64 = reader.result as string
        // Remove data:image/...;base64, prefix
        const base64Data = base64.split(',')[1]
        resolve(base64Data)
      }
      reader.onerror = error => reject(error)
    })
  }

  private inferModality(filename: string): string {
    const lower = filename.toLowerCase()
    if (lower.includes('ct') || lower.includes('computed')) return 'CT'
    if (lower.includes('mri') || lower.includes('magnetic')) return 'MRI'
    if (lower.includes('xray') || lower.includes('x-ray')) return 'X-Ray'
    if (lower.includes('ultrasound') || lower.includes('us')) return 'Ultrasound'
    return 'Unknown'
  }

  private saveToStorage() {
    const casesArray = Array.from(this.cases.entries())
    localStorage.setItem('medical_cases', JSON.stringify(casesArray))
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('medical_cases')
      if (stored) {
        const casesArray = JSON.parse(stored)
        this.cases = new Map(casesArray)
        
        // Resume polling for any processing jobs
        for (const [jobId, case_] of this.cases.entries()) {
          if (case_.isProcessing) {
            this.processingJobs.add(jobId)
            this.startPolling(jobId)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load cases from storage:', error)
    }
  }

  // Add real medical dataset cases
  addRealMedicalCases() {
    // Only add cases if none exist
    if (this.cases.size > 0) return
    
    // Get real medical datasets and convert to cases
    const datasets = medicalDatasetService.getRecentDatasets(5)
    const realCases = datasets.map(dataset => medicalDatasetService.datasetToCase(dataset))
    
    realCases.forEach(case_ => {
      this.cases.set(case_.caseId, case_)
    })
    
    this.saveToStorage()
  }

  // Add mock cases for development (fallback)
  addMockCases() {
    // Only add mock cases if none exist
    if (this.cases.size > 0) return
    
    const mockCases: Case[] = [
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
      }
    ]

    mockCases.forEach(case_ => {
      this.cases.set(case_.caseId, case_)
    })
    this.saveToStorage()
  }

  // Get cases from real medical datasets
  getRealMedicalCases(): Case[] {
    const datasets = medicalDatasetService.getRecentDatasets(10)
    return datasets.map(dataset => medicalDatasetService.datasetToCase(dataset))
  }

  // Get cases by medical dataset type
  getCasesByDatasetType(type: string): Case[] {
    const datasets = medicalDatasetService.getDatasetsByType(type)
    return datasets.map(dataset => medicalDatasetService.datasetToCase(dataset))
  }

  // Get cases by body part
  getCasesByBodyPart(bodyPart: string): Case[] {
    const datasets = medicalDatasetService.getDatasetsByBodyPart(bodyPart)
    return datasets.map(dataset => medicalDatasetService.datasetToCase(dataset))
  }

  // Get high confidence cases
  getHighConfidenceCases(): Case[] {
    const datasets = medicalDatasetService.getHighConfidenceDatasets(0.9)
    return datasets.map(dataset => medicalDatasetService.datasetToCase(dataset))
  }
}

// Export singleton instance
export const caseService = new CaseService()
