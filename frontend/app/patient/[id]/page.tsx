"use client"

import { useParams } from "next/navigation"
import { PatientWindow } from "@/components/patient-window"

export default function PatientPage() {
  const params = useParams()
  const caseId = params.id as string

  return <PatientWindow caseId={caseId} />
}
