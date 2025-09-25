"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { Activity, FileText, Eye, BookOpen, Bell, Search, Settings, Shield, BarChart3, Menu, X } from "lucide-react"

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  adminOnly?: boolean
}

const navigationItems: NavigationItem[] = [
  { id: "triage", label: "Triage", icon: Activity, badge: "12" },
  { id: "search", label: "Search", icon: Search },
  { id: "integrations", label: "Pipeline Health", icon: BarChart3, adminOnly: true },
  { id: "audit", label: "Audit & Compliance", icon: Shield, adminOnly: true },
]

const hamburgerItems: NavigationItem[] = [
  { id: "worklist", label: "Patients", icon: FileText },
  { id: "guidance", label: "Clinical Guidance", icon: BookOpen },
  { id: "notifications", label: "Notifications", icon: Bell, badge: "3" },
  { id: "settings", label: "Settings", icon: Settings },
]

interface MedicalNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  userRole: string
}

export function MedicalNavigation({ activeTab, onTabChange, userRole }: MedicalNavigationProps) {
  const isAdmin = userRole === "Imaging Admin" || userRole === "Compliance Officer"
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false)

  const renderNavItem = (item: NavigationItem) => {
    const Icon = item.icon
    const isActive = activeTab === item.id

    return (
      <Button
        key={item.id}
        variant={isActive ? "secondary" : "ghost"}
        size="sm"
        onClick={() => onTabChange(item.id)}
        className={cn(
          "flex items-center gap-2 whitespace-nowrap",
          isActive && "bg-secondary text-secondary-foreground",
        )}
      >
        <Icon className="h-4 w-4" />
        {item.label}
        {item.badge && (
          <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
            {item.badge}
          </Badge>
        )}
      </Button>
    )
  }

  return (
    <>
      <nav className="border-b border-border bg-card/30">
        <div className="flex items-center gap-1 px-6 py-2 overflow-x-auto">
          {navigationItems.map((item) => {
            if (item.adminOnly && !isAdmin) return null
            return renderNavItem(item)
          })}
          
          {/* Hamburger Menu Button */}
          <div className="relative ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsHamburgerOpen(!isHamburgerOpen)}
              className="flex items-center gap-2"
            >
              {isHamburgerOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
            
            {/* Hamburger Dropdown */}
            {isHamburgerOpen && (
              <div className="absolute right-0 top-full mt-1 w-64 bg-background border border-border rounded-md shadow-lg z-50">
                <div className="p-2 space-y-1">
                  {hamburgerItems.map((item) => renderNavItem(item))}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
      
      {/* Click outside to close hamburger */}
      {isHamburgerOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsHamburgerOpen(false)}
        />
      )}
    </>
  )
}
