"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, FileImage, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { uploadBase64, getStatus, getResults, apiResultsToCase } from "@/lib/api"

interface UploadState {
  file: File | null
  uploading: boolean
  jobId: string | null
  status: 'idle' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  error: string | null
  results: any | null
}

export function FileUpload() {
  const [uploadState, setUploadState] = useState<UploadState>({
    file: null,
    uploading: false,
    jobId: null,
    status: 'idle',
    progress: 0,
    error: null,
    results: null
  })

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadState(prev => ({
        ...prev,
        file,
        status: 'idle',
        error: null,
        results: null,
        jobId: null
      }))
    }
  }

  const convertToBase64 = (file: File): Promise<string> => {
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

  const handleUpload = async () => {
    if (!uploadState.file) return

    setUploadState(prev => ({ ...prev, uploading: true, status: 'uploading', progress: 0 }))

    try {
      // Convert file to base64
      const base64Data = await convertToBase64(uploadState.file)
      
      // Upload to API
      const uploadResponse = await uploadBase64({
        image: base64Data,
        filename: uploadState.file.name,
        content_type: uploadState.file.type
      })

      setUploadState(prev => ({
        ...prev,
        jobId: uploadResponse.job_id,
        status: 'processing',
        progress: 25
      }))

      // Poll for status and results
      await pollForResults(uploadResponse.job_id)

    } catch (error) {
      setUploadState(prev => ({
        ...prev,
        status: 'error',
        error: error instanceof Error ? error.message : 'Upload failed',
        uploading: false
      }))
    }
  }

  const pollForResults = async (jobId: string) => {
    const maxAttempts = 30 // 30 attempts with 2 second intervals = 1 minute max
    let attempts = 0

    const poll = async () => {
      try {
        const status = await getStatus(jobId)
        
        if (status.status === 'completed') {
          const results = await getResults(jobId)
          if (results) {
            const caseData = apiResultsToCase(jobId, results)
            setUploadState(prev => ({
              ...prev,
              status: 'completed',
              progress: 100,
              results: caseData,
              uploading: false
            }))
            return
          }
        }

        if (status.status === 'error') {
          setUploadState(prev => ({
            ...prev,
            status: 'error',
            error: 'Processing failed',
            uploading: false
          }))
          return
        }

        // Still processing
        attempts++
        if (attempts < maxAttempts) {
          setUploadState(prev => ({
            ...prev,
            progress: Math.min(25 + (attempts / maxAttempts) * 75, 95)
          }))
          setTimeout(poll, 2000)
        } else {
          setUploadState(prev => ({
            ...prev,
            status: 'error',
            error: 'Processing timeout',
            uploading: false
          }))
        }
      } catch (error) {
        setUploadState(prev => ({
          ...prev,
          status: 'error',
          error: error instanceof Error ? error.message : 'Status check failed',
          uploading: false
        }))
      }
    }

    setTimeout(poll, 2000)
  }

  const resetUpload = () => {
    setUploadState({
      file: null,
      uploading: false,
      jobId: null,
      status: 'idle',
      progress: 0,
      error: null,
      results: null
    })
  }

  const getStatusIcon = () => {
    switch (uploadState.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case 'processing':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <Upload className="h-5 w-5" />
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Upload Medical Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {uploadState.status === 'idle' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileImage className="h-12 w-12 text-gray-400" />
                <span className="text-sm text-gray-600">
                  Click to select an image file
                </span>
                <span className="text-xs text-gray-400">
                  Supports JPG, PNG, DICOM formats
                </span>
              </label>
            </div>
            
            {uploadState.file && (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{uploadState.file.name}</span>
                <span className="text-xs text-gray-500">
                  {(uploadState.file.size / 1024 / 1024).toFixed(2)} MB
                </span>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={!uploadState.file}
              className="w-full"
            >
              Upload & Analyze
            </Button>
          </div>
        )}

        {(uploadState.status === 'uploading' || uploadState.status === 'processing') && (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="font-medium">
                {uploadState.status === 'uploading' ? 'Uploading...' : 'Processing with AI...'}
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {uploadState.jobId && `Job ID: ${uploadState.jobId}`}
              </p>
            </div>
            <Progress value={uploadState.progress} className="w-full" />
            <p className="text-center text-sm text-gray-500">
              {uploadState.progress.toFixed(0)}% complete
            </p>
          </div>
        )}

        {uploadState.status === 'completed' && uploadState.results && (
          <div className="space-y-4">
            <div className="text-center">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
              <h3 className="font-medium text-green-700">Analysis Complete!</h3>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Confidence:</span>
                <Badge variant="outline" className="text-green-600">
                  {(uploadState.results.ai.confidenceTop * 100).toFixed(1)}%
                </Badge>
              </div>
              
              {uploadState.results.ai.findings.length > 0 && (
                <div>
                  <span className="text-sm font-medium">Findings:</span>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {uploadState.results.ai.findings.map((finding: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {finding}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Model Version:</span>
                <span className="text-xs text-gray-500">{uploadState.results.ai.modelVersion}</span>
              </div>
            </div>

            <Button onClick={resetUpload} variant="outline" className="w-full">
              Upload Another Image
            </Button>
          </div>
        )}

        {uploadState.status === 'error' && (
          <div className="space-y-4">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
              <h3 className="font-medium text-red-700">Upload Failed</h3>
              <p className="text-sm text-red-600 mt-1">{uploadState.error}</p>
            </div>
            
            <Button onClick={resetUpload} variant="outline" className="w-full">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
