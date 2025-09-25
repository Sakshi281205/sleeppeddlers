"use client"

import { useState } from "react"
import { MedicalHeader } from "@/components/medical-header"
import { MedicalNavigation } from "@/components/medical-navigation"
import { TriageDashboard } from "@/components/triage-dashboard"
import { WorklistDashboard } from "@/components/worklist-dashboard"
import { ClinicalGuidance } from "@/components/clinical-guidance"
import { NotificationsCenter } from "@/components/notifications-center"
import { SemanticSearch } from "@/components/semantic-search"
import { PipelineHealth } from "@/components/pipeline-health"
import { AuditCompliance } from "@/components/audit-compliance"
import { MedicalDatasetViewer } from "@/components/medical-dataset-viewer"

export default function MedicalImagingApp() {
  const [activeTab, setActiveTab] = useState("triage")

  // Mock user data - in real app this would come from authentication
  const userData = {
    role: "Radiologist",
    facility: "General Hospital - Radiology Dept",
    name: "Dr. Sarah Johnson",
  }

  const renderContent = () => {
    switch (activeTab) {
      case "triage":
        return <TriageDashboard />
      case "worklist":
        return <WorklistDashboard />
      case "guidance":
        return <ClinicalGuidance />
      case "notifications":
        return <NotificationsCenter />
      case "search":
        return <SemanticSearch />
      case "integrations":
        return <PipelineHealth />
      case "audit":
        return <AuditCompliance />
      case "datasets":
        return <MedicalDatasetViewer />
      case "settings":
        return <div className="p-6">Settings - Coming Soon</div>
      default:
        return <TriageDashboard />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <MedicalHeader userRole={userData.role} facility={userData.facility} userName={userData.name} />
      <MedicalNavigation activeTab={activeTab} onTabChange={setActiveTab} userRole={userData.role} />
      <main className="flex-1">{renderContent()}</main>
    </div>
  )
}
