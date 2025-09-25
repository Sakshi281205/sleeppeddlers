// API integration for the medical imaging application
const API_BASE = process.env.VITE_API_BASE || 'https://h8r6q6qsu0.execute-api.us-east-1.amazonaws.com/prod';
const API_KEY = process.env.VITE_API_KEY || 'hackathon-demo-key-2025-xyz';

export interface UploadResponse {
  job_id: string;
  message: string;
  status: string;
}

export interface StatusResponse {
  job_id: string;
  status: 'processing' | 'completed' | 'error';
  progress?: number;
  message?: string;
}

export interface ResultsResponse {
  job_id: string;
  status: 'completed';
  findings: string[];
  confidence: number;
  summary: string;
  model_version: string;
}

export async function uploadBase64({ 
  image, 
  filename, 
  content_type 
}: { 
  image: string; 
  filename: string; 
  content_type: string; 
}): Promise<UploadResponse> {
  const response = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: { 
      'x-api-key': API_KEY, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({ image, filename, content_type })
  });
  
  if (!response.ok) {
    throw new Error(`Upload failed: ${await response.text()}`);
  }
  
  return response.json();
}

export async function getStatus(job_id: string): Promise<StatusResponse> {
  const response = await fetch(`${API_BASE}/status/${job_id}`, { 
    headers: { 'x-api-key': API_KEY }
  });
  
  if (response.status === 202) {
    return { job_id, status: 'processing' };
  }
  
  if (!response.ok) {
    throw new Error(`Status check failed: ${await response.text()}`);
  }
  
  return response.json();
}

export async function getResults(job_id: string): Promise<ResultsResponse | null> {
  const response = await fetch(`${API_BASE}/results/${job_id}`, { 
    headers: { 'x-api-key': API_KEY }
  });
  
  if (response.status === 404) {
    return null;
  }
  
  if (!response.ok) {
    throw new Error(`Results fetch failed: ${await response.text()}`);
  }
  
  return response.json();
}

// Utility function to convert API results to Case format
export function apiResultsToCase(job_id: string, results: ResultsResponse): any {
  return {
    caseId: job_id,
    patient: { display: "Anonymous Patient", mrnMasked: "••••" + job_id.slice(-4) },
    modality: "CT", // Default - could be inferred from filename
    bodyPart: "Unknown", // Could be inferred from AI analysis
    studyDateTime: new Date().toISOString(),
    status: "AI_COMPLETE" as const,
    priority: "ROUTINE" as const,
    slaMinutesRemaining: 120,
    ai: {
      modelVersion: results.model_version,
      confidenceTop: results.confidence,
      findings: results.findings
    },
    evidence: { openSearchHits: 0 },
    summary: { graniteStatus: "READY" as const },
    assignedTo: "system",
    anonymized: true,
  };
}
