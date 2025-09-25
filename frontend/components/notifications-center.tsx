"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatTimeAgo } from "@/components/mock-services"
import { notificationService, type Notification } from "@/lib/notification-service"
import {
  Bell,
  AlertTriangle,
  CheckCircle,
  Eye,
  Settings,
  Smartphone,
  Mail,
  MessageSquare,
  Clock,
  User,
  Activity,
  FileText,
  Zap,
} from "lucide-react"

export function NotificationsCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [filter, setFilter] = useState("all")

  // Load notifications on mount
  useEffect(() => {
    const loadNotifications = () => {
      setNotifications(notificationService.getAllNotifications())
    }
    
    loadNotifications()
    
    // Subscribe to notification updates
    const unsubscribe = notificationService.subscribe(loadNotifications)
    
    // Add mock notifications if none exist
    if (notificationService.getAllNotifications().length === 0) {
      notificationService.addMockNotifications()
      loadNotifications()
    }
    
    return unsubscribe
  }, [])

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true
    if (filter === "unread") return notif.ack.state === "UNREAD"
    if (filter === "stat") return notif.severity === "STAT"
    return notif.type === filter
  })

  const markAsRead = (notificationId: string) => {
    notificationService.markAsRead(notificationId)
  }

  const markAllAsRead = () => {
    notificationService.markAllAsRead()
  }

  const getSeverityIcon = (severity: Notification["severity"]) => {
    switch (severity) {
      case "STAT":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "URGENT":
        return <Zap className="h-4 w-4 text-orange-500" />
      case "ROUTINE":
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: Notification["type"]) => {
    switch (type) {
      case "AI_ALERT":
        return <Activity className="h-4 w-4" />
      case "ASSIGNMENT":
        return <User className="h-4 w-4" />
      case "PIPELINE_ISSUE":
        return <Settings className="h-4 w-4" />
      case "REPORT_FINALIZED":
        return <FileText className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "STAT":
        return "text-red-500 border-red-500 bg-red-50 dark:bg-red-950"
      case "URGENT":
        return "text-orange-500 border-orange-500 bg-orange-50 dark:bg-orange-950"
      case "ROUTINE":
        return "text-blue-500 border-blue-500 bg-blue-50 dark:bg-blue-950"
      default:
        return "text-muted-foreground"
    }
  }

  const unreadCount = notifications.filter((n) => n.ack.state === "UNREAD").length
  const statCount = notifications.filter((n) => n.severity === "STAT").length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Notifications Center</h1>
          <p className="text-muted-foreground">
            {unreadCount} unread notifications • {statCount} STAT alerts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Preferences
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Notifications List */}
            <div className="lg:col-span-2 space-y-4">
              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <Select value={filter} onValueChange={setFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter notifications" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Notifications</SelectItem>
                        <SelectItem value="unread">Unread Only</SelectItem>
                        <SelectItem value="stat">STAT Alerts</SelectItem>
                        <SelectItem value="AI_ALERT">AI Alerts</SelectItem>
                        <SelectItem value="ASSIGNMENT">Assignments</SelectItem>
                        <SelectItem value="PIPELINE_ISSUE">Pipeline Issues</SelectItem>
                        <SelectItem value="REPORT_FINALIZED">Reports</SelectItem>
                      </SelectContent>
                    </Select>
                    <Badge variant="outline">{filteredNotifications.length} notifications</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <div className="space-y-3">
                {filteredNotifications.map((notification) => (
                  <Card
                    key={notification.id}
                    className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                      selectedNotification?.id === notification.id ? "bg-accent" : ""
                    } ${notification.ack.state === "UNREAD" ? "border-l-4 border-l-primary" : ""}`}
                    onClick={() => setSelectedNotification(notification)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(notification.severity)}
                          {getTypeIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className={getSeverityColor(notification.severity)}>
                                {notification.severity}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {notification.type.replace("_", " ")}
                              </Badge>
                              {notification.ack.state === "UNREAD" && (
                                <div className="w-2 h-2 bg-primary rounded-full" />
                              )}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimeAgo(notification.timestamp)}
                            </span>
                          </div>

                          <p className="text-sm font-medium mb-1">{notification.message}</p>

                          {notification.caseId && (
                            <p className="text-xs text-muted-foreground">Case: {notification.caseId}</p>
                          )}

                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (notification.caseId) {
                                  // Navigate to viewer
                                  console.log("Open viewer for", notification.caseId)
                                }
                              }}
                              disabled={!notification.caseId}
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              {notification.caseId ? "Open Case" : "View Details"}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                            >
                              {notification.ack.state === "UNREAD" ? "Mark Read" : "Read"}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {filteredNotifications.length === 0 && (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-muted-foreground">No notifications match your filter</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            {/* Notification Detail */}
            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Notification Details</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedNotification ? (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {getSeverityIcon(selectedNotification.severity)}
                          <Badge variant="outline" className={getSeverityColor(selectedNotification.severity)}>
                            {selectedNotification.severity}
                          </Badge>
                        </div>
                        <h3 className="font-semibold">{selectedNotification.message}</h3>
                        <p className="text-sm text-muted-foreground">
                          {selectedNotification.type.replace("_", " ")} •{" "}
                          {formatTimeAgo(selectedNotification.timestamp)}
                        </p>
                      </div>

                      {selectedNotification.caseId && (
                        <div className="space-y-2">
                          <h4 className="font-medium">Related Case</h4>
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm font-mono">{selectedNotification.caseId}</p>
                            <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                              <Eye className="h-4 w-4 mr-2" />
                              Open in Viewer
                            </Button>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="font-medium">Actions</h4>
                        <div className="space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full bg-transparent"
                            onClick={() => markAsRead(selectedNotification.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            {selectedNotification.ack.state === "UNREAD" ? "Mark as Read" : "Mark as Unread"}
                          </Button>
                          {selectedNotification.severity === "STAT" && (
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              <AlertTriangle className="h-4 w-4 mr-2" />
                              Escalate
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border">
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>ID: {selectedNotification.id}</div>
                          <div>Status: {selectedNotification.ack.state}</div>
                          <div>Timestamp: {new Date(selectedNotification.timestamp).toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Select a notification to view details</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Notification Channels */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Channels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    <span>In-App Notifications</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    <span>Mobile Push</span>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>SMS</span>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>EHR Inbox</span>
                  </div>
                  <Switch />
                </div>
              </CardContent>
            </Card>

            {/* Notification Types */}
            <Card>
              <CardHeader>
                <CardTitle>Notification Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">STAT Alerts</div>
                      <div className="text-xs text-muted-foreground">
                        Critical findings requiring immediate attention
                      </div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Case Assignments</div>
                      <div className="text-xs text-muted-foreground">New cases assigned to you</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Pipeline Issues</div>
                      <div className="text-xs text-muted-foreground">System and processing alerts</div>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">Report Finalized</div>
                      <div className="text-xs text-muted-foreground">When reports are completed</div>
                    </div>
                    <Switch />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quiet Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Quiet Hours</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Enable Quiet Hours</span>
                  <Switch />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Time</label>
                  <Select defaultValue="22:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20:00">8:00 PM</SelectItem>
                      <SelectItem value="21:00">9:00 PM</SelectItem>
                      <SelectItem value="22:00">10:00 PM</SelectItem>
                      <SelectItem value="23:00">11:00 PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Time</label>
                  <Select defaultValue="06:00">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="05:00">5:00 AM</SelectItem>
                      <SelectItem value="06:00">6:00 AM</SelectItem>
                      <SelectItem value="07:00">7:00 AM</SelectItem>
                      <SelectItem value="08:00">8:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-xs text-muted-foreground">
                  STAT alerts will still be delivered during quiet hours
                </div>
              </CardContent>
            </Card>

            {/* Escalation */}
            <Card>
              <CardHeader>
                <CardTitle>Escalation Ladder</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                      1
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Primary Contact</div>
                      <div className="text-xs text-muted-foreground">Dr. Sarah Johnson (You)</div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">0 min</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                      2
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Backup Radiologist</div>
                      <div className="text-xs text-muted-foreground">Dr. Michael Chen</div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">15 min</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary text-secondary-foreground text-xs flex items-center justify-center">
                      3
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">Department Head</div>
                      <div className="text-xs text-muted-foreground">Dr. Lisa Rodriguez</div>
                    </div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">30 min</span>
                  </div>
                </div>

                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Escalation
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
