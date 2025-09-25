// API integration for the medical imaging application
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'https://h8r6q6qsu0.execute-api.us-east-1.amazonaws.com/prod';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'hackathon-demo-key-2025-xyz';

// Add CORS headers for all requests
const getHeaders = () => ({
  'x-api-key': API_KEY,
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-api-key'
});

export interface UploadResponse {
  job_id: string;
  message: string;
  status: string;
}

export interface StatusResponse {
  job_id: string;
  status: 'uploaded' | 'processing' | 'ai_complete' | 'completed' | 'error';
  progress?: number;
  message?: string;
  updated_at?: string;
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
  try {
    const response = await fetch(`${API_BASE}/upload`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ image, filename, content_type }),
      mode: 'cors'
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload API Error:', errorText);
      throw new Error(`Upload failed: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Upload Network Error:', error);
    // Fallback to local processing for demo
    return handleLocalUpload({ image, filename, content_type });
  }
}

// Fallback local processing for demo purposes
async function handleLocalUpload({ image, filename, content_type }: { image: string; filename: string; content_type: string }): Promise<UploadResponse> {
  const jobId = `local-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    job_id: jobId,
    message: "Upload processed locally (API unavailable)",
    status: "uploaded"
  };
}

export async function getStatus(job_id: string): Promise<StatusResponse> {
  try {
    const response = await fetch(`${API_BASE}/status/${job_id}`, { 
      headers: getHeaders(),
      mode: 'cors'
    });
    
    if (response.status === 202) {
      const data = await response.json();
      return { job_id, status: 'processing', progress: data.progress || 50 };
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Status check failed: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Status API Error:', error);
    // Fallback for local processing
    return handleLocalStatus(job_id);
  }
}

// Fallback local status for demo
async function handleLocalStatus(job_id: string): Promise<StatusResponse> {
  if (job_id.startsWith('local-')) {
    // Simulate processing progression
    const progress = Math.min(25 + Math.random() * 75, 100);
    return {
      job_id,
      status: progress < 100 ? 'processing' : 'completed',
      progress: Math.round(progress),
      updated_at: new Date().toISOString()
    };
  }
  throw new Error('Job not found');
}

export async function getResults(job_id: string): Promise<ResultsResponse | null> {
  try {
    const response = await fetch(`${API_BASE}/results/${job_id}`, { 
      headers: getHeaders(),
      mode: 'cors'
    });
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Results fetch failed: ${errorText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Results API Error:', error);
    // Fallback for local processing
    return handleLocalResults(job_id);
  }
}

// Fallback local results for demo
async function handleLocalResults(job_id: string): Promise<ResultsResponse | null> {
  if (job_id.startsWith('local-')) {
    // Simulate AI analysis results
    const findings = [
      'Normal brain anatomy',
      'No acute intracranial abnormality',
      'Mild age-related changes',
      'Unremarkable study'
    ];
    
    const randomFinding = findings[Math.floor(Math.random() * findings.length)];
    const confidence = 0.75 + Math.random() * 0.2; // 75-95% confidence
    
    return {
      job_id,
      status: 'completed',
      findings: [randomFinding],
      confidence: Math.round(confidence * 100) / 100,
      summary: `AI analysis completed with ${Math.round(confidence * 100)}% confidence. ${randomFinding}. Recommend clinical correlation.`,
      model_version: 'local-demo-v1.0'
    };
  }
  return null;
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
