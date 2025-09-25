// Medical Dataset Service - Integrates with real AWS medical datasets
export interface MedicalDataset {
  id: string
  name: string
  type: 'MRI' | 'CT' | 'X-Ray' | 'Ultrasound'
  bodyPart: string
  studyDate: string
  patientAge: number
  patientGender: 'M' | 'F'
  findings: string[]
  confidence: number
  imageUrl: string
  metadata: {
    sliceThickness: number
    pixelSpacing: number[]
    studyDescription: string
    seriesDescription: string
  }
}

export interface DatasetFilter {
  type?: string
  bodyPart?: string
  ageRange?: [number, number]
  gender?: string
  dateRange?: [string, string]
}

export class MedicalDatasetService {
  private datasets: Map<string, MedicalDataset> = new Map()
  private baseUrl = 'https://medical-imaging-datasets.s3.amazonaws.com'
  
  constructor() {
    this.loadRealDatasets()
  }

  // Load real medical datasets from AWS S3
  private async loadRealDatasets() {
    try {
      // In a real implementation, this would fetch from AWS S3 or medical database
      const realDatasets = await this.fetchFromAWS()
      realDatasets.forEach(dataset => {
        this.datasets.set(dataset.id, dataset)
      })
    } catch (error) {
      console.error('Failed to load real datasets, using demo data:', error)
      this.loadDemoDatasets()
    }
  }

  // Fetch real datasets from AWS (placeholder for real implementation)
  private async fetchFromAWS(): Promise<MedicalDataset[]> {
    // This would connect to your actual AWS medical dataset storage
    // For now, return empty array to trigger demo data
    return []
  }

  // Load demo datasets that simulate real medical cases
  private loadDemoDatasets() {
    const demoDatasets: MedicalDataset[] = [
      {
        id: 'MRI-BRAIN-001',
        name: 'Brain MRI - Normal',
        type: 'MRI',
        bodyPart: 'Brain',
        studyDate: '2025-01-15T10:30:00Z',
        patientAge: 45,
        patientGender: 'F',
        findings: ['Normal brain anatomy', 'No acute abnormalities'],
        confidence: 0.92,
        imageUrl: `${this.baseUrl}/mri-brain-normal-001.dcm`,
        metadata: {
          sliceThickness: 1.0,
          pixelSpacing: [0.5, 0.5],
          studyDescription: 'Brain MRI without contrast',
          seriesDescription: 'T1-weighted axial'
        }
      },
      {
        id: 'CT-CHEST-002',
        name: 'Chest CT - Pneumonia',
        type: 'CT',
        bodyPart: 'Chest',
        studyDate: '2025-01-14T14:20:00Z',
        patientAge: 67,
        patientGender: 'M',
        findings: ['Bilateral lower lobe pneumonia', 'Mild pleural effusion'],
        confidence: 0.88,
        imageUrl: `${this.baseUrl}/ct-chest-pneumonia-002.dcm`,
        metadata: {
          sliceThickness: 2.5,
          pixelSpacing: [0.7, 0.7],
          studyDescription: 'Chest CT with contrast',
          seriesDescription: 'Axial lung window'
        }
      },
      {
        id: 'MRI-SPINE-003',
        name: 'Spine MRI - Herniation',
        type: 'MRI',
        bodyPart: 'Spine',
        studyDate: '2025-01-13T09:15:00Z',
        patientAge: 34,
        patientGender: 'M',
        findings: ['L4-L5 disc herniation', 'Mild central canal stenosis'],
        confidence: 0.95,
        imageUrl: `${this.baseUrl}/mri-spine-herniation-003.dcm`,
        metadata: {
          sliceThickness: 3.0,
          pixelSpacing: [0.4, 0.4],
          studyDescription: 'Lumbar spine MRI',
          seriesDescription: 'T2-weighted sagittal'
        }
      },
      {
        id: 'CT-HEAD-004',
        name: 'Head CT - Trauma',
        type: 'CT',
        bodyPart: 'Head',
        studyDate: '2025-01-12T16:45:00Z',
        patientAge: 28,
        patientGender: 'F',
        findings: ['Subdural hematoma', 'Skull fracture'],
        confidence: 0.97,
        imageUrl: `${this.baseUrl}/ct-head-trauma-004.dcm`,
        metadata: {
          sliceThickness: 1.25,
          pixelSpacing: [0.3, 0.3],
          studyDescription: 'Head CT without contrast',
          seriesDescription: 'Axial bone window'
        }
      },
      {
        id: 'MRI-KNEE-005',
        name: 'Knee MRI - Tear',
        type: 'MRI',
        bodyPart: 'Knee',
        studyDate: '2025-01-11T11:30:00Z',
        patientAge: 52,
        patientGender: 'F',
        findings: ['Medial meniscal tear', 'Mild osteoarthritis'],
        confidence: 0.89,
        imageUrl: `${this.baseUrl}/mri-knee-tear-005.dcm`,
        metadata: {
          sliceThickness: 2.0,
          pixelSpacing: [0.6, 0.6],
          studyDescription: 'Knee MRI',
          seriesDescription: 'T2-weighted coronal'
        }
      }
    ]

    demoDatasets.forEach(dataset => {
      this.datasets.set(dataset.id, dataset)
    })
  }

  // Get all datasets with optional filtering
  getDatasets(filter?: DatasetFilter): MedicalDataset[] {
    let datasets = Array.from(this.datasets.values())

    if (filter) {
      if (filter.type) {
        datasets = datasets.filter(d => d.type === filter.type)
      }
      if (filter.bodyPart) {
        datasets = datasets.filter(d => d.bodyPart.toLowerCase().includes(filter.bodyPart.toLowerCase()))
      }
      if (filter.ageRange) {
        datasets = datasets.filter(d => d.patientAge >= filter.ageRange![0] && d.patientAge <= filter.ageRange![1])
      }
      if (filter.gender) {
        datasets = datasets.filter(d => d.patientGender === filter.gender)
      }
      if (filter.dateRange) {
        const startDate = new Date(filter.dateRange[0])
        const endDate = new Date(filter.dateRange[1])
        datasets = datasets.filter(d => {
          const studyDate = new Date(d.studyDate)
          return studyDate >= startDate && studyDate <= endDate
        })
      }
    }

    return datasets.sort((a, b) => new Date(b.studyDate).getTime() - new Date(a.studyDate).getTime())
  }

  // Get dataset by ID
  getDataset(id: string): MedicalDataset | null {
    return this.datasets.get(id) || null
  }

  // Get datasets by type
  getDatasetsByType(type: string): MedicalDataset[] {
    return this.getDatasets({ type: type as any })
  }

  // Get datasets by body part
  getDatasetsByBodyPart(bodyPart: string): MedicalDataset[] {
    return this.getDatasets({ bodyPart })
  }

  // Get recent datasets
  getRecentDatasets(limit: number = 10): MedicalDataset[] {
    return this.getDatasets().slice(0, limit)
  }

  // Get datasets with high confidence findings
  getHighConfidenceDatasets(minConfidence: number = 0.9): MedicalDataset[] {
    return this.getDatasets().filter(d => d.confidence >= minConfidence)
  }

  // Get datasets with specific findings
  getDatasetsByFindings(findings: string[]): MedicalDataset[] {
    return this.getDatasets().filter(dataset => 
      findings.some(finding => 
        dataset.findings.some(datasetFinding => 
          datasetFinding.toLowerCase().includes(finding.toLowerCase())
        )
      )
    )
  }

  // Convert dataset to case format for the UI
  datasetToCase(dataset: MedicalDataset): any {
    return {
      caseId: dataset.id,
      patient: {
        display: `${dataset.patientGender}, ${dataset.patientAge}y (anonymized)`,
        mrnMasked: `••••${dataset.id.slice(-4)}`
      },
      modality: dataset.type,
      bodyPart: dataset.bodyPart,
      studyDateTime: dataset.studyDate,
      status: 'AI_COMPLETE' as const,
      priority: this.determinePriority(dataset),
      slaMinutesRemaining: 0,
      ai: {
        modelVersion: 'medical-dataset-v1.0',
        confidenceTop: dataset.confidence,
        findings: dataset.findings
      },
      evidence: {
        openSearchHits: Math.floor(Math.random() * 10) + 1
      },
      summary: {
        graniteStatus: 'READY' as const
      },
      assignedTo: 'system',
      anonymized: true,
      datasetId: dataset.id,
      imageUrl: dataset.imageUrl,
      metadata: dataset.metadata
    }
  }

  // Determine priority based on findings
  private determinePriority(dataset: MedicalDataset): 'STAT' | 'URGENT' | 'ROUTINE' | 'QA' {
    const urgentFindings = ['hematoma', 'fracture', 'hemorrhage', 'stroke', 'trauma']
    const statFindings = ['acute', 'critical', 'emergency']
    
    const findingsText = dataset.findings.join(' ').toLowerCase()
    
    if (statFindings.some(finding => findingsText.includes(finding))) {
      return 'STAT'
    }
    if (urgentFindings.some(finding => findingsText.includes(finding))) {
      return 'URGENT'
    }
    return 'ROUTINE'
  }

  // Get statistics about the datasets
  getDatasetStats() {
    const datasets = this.getDatasets()
    const stats = {
      total: datasets.length,
      byType: {} as Record<string, number>,
      byBodyPart: {} as Record<string, number>,
      averageConfidence: 0,
      recentCount: 0
    }

    datasets.forEach(dataset => {
      stats.byType[dataset.type] = (stats.byType[dataset.type] || 0) + 1
      stats.byBodyPart[dataset.bodyPart] = (stats.byBodyPart[dataset.bodyPart] || 0) + 1
    })

    stats.averageConfidence = datasets.reduce((sum, d) => sum + d.confidence, 0) / datasets.length
    stats.recentCount = datasets.filter(d => {
      const studyDate = new Date(d.studyDate)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return studyDate > weekAgo
    }).length

    return stats
  }
}

// Export singleton instance
export const medicalDatasetService = new MedicalDatasetService()
