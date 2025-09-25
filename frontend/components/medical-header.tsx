"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Activity, Bell, Settings, Shield, Database } from "lucide-react"

interface MedicalHeaderProps {
  userRole: string
  facility: string
  userName: string
}

export function MedicalHeader({ userRole, facility, userName }: MedicalHeaderProps) {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Activity className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold">MedImaging Pro</h1>
              <p className="text-xs text-muted-foreground">{facility}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-medical-success" />
            <Badge variant="outline" className="text-xs">
              Data flow: Automatic ingest
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary" className="text-xs">
            <Shield className="mr-1 h-3 w-3" />
            {userRole}
          </Badge>

          <ThemeToggle />

          <Button variant="ghost" size="sm">
            <Bell className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{userName}</span>
          </div>
        </div>
      </div>
    </header>
  )
}
