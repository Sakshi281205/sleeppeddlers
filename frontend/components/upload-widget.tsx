"use client"

import { useEffect, useState } from "react"
import { uploadBase64, getStatus, getResults } from "@/src/api"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

function toBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export function UploadWidget() {
  const [jobId, setJobId] = useState<string | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [result, setResult] = useState<any>(null)
  const [busy, setBusy] = useState(false)

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    setBusy(true)
    try {
      const b64 = await toBase64(f)
      const { job_id } = await uploadBase64({ image: b64.split(",")[1], filename: f.name, content_type: f.type })
      setJobId(job_id)
      setStatus("uploaded")
    } catch (err) {
      console.error(err)
      setStatus("error")
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!jobId) return
    const id = setInterval(async () => {
      const s = await getStatus(jobId)
      setStatus(s.status)
      if (s.status === "done") {
        const res = await getResults(jobId)
        if (res) {
          setResult(res)
          clearInterval(id)
        }
      }
    }, 2500)
    return () => clearInterval(id)
  }, [jobId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <input type="file" accept=".jpg,.jpeg,.png,.dcm" onChange={onFile} disabled={busy} />
          {status && <div>Status: {status}</div>}
          {result && (
            <div className="space-y-3">
              <h3 className="font-medium">AI Findings</h3>
              <div>
                <div>
                  Findings: <b>{result.ai_analysis.findings}</b> ({Math.round(result.ai_analysis.confidence * 100)}%)
                </div>
                <div>Model: {result.ai_analysis.model_version}</div>
                <div>Processing: {result.ai_analysis.processing_time}</div>
              </div>
              <h3 className="font-medium">Clinical Summary</h3>
              <pre style={{ whiteSpace: "pre-wrap" }}>{result.clinical_summary.clinical_summary}</pre>
              <small>
                {result.clinical_summary.model_used} • {result.clinical_summary.generated_at}
              </small>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


