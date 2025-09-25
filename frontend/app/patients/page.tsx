"use client"

import { useSearchParams } from "next/navigation"
import { WorklistDashboard } from "@/components/worklist-dashboard"

export default function PatientsPage() {
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter') || undefined

  return <WorklistDashboard initialFilter={filter} />
}
