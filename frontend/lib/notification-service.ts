// Notification service for real-time updates
export interface Notification {
  id: string
  severity: "STAT" | "URGENT" | "ROUTINE"
  type: "AI_ALERT" | "ASSIGNMENT" | "PIPELINE_ISSUE" | "REPORT_FINALIZED"
  caseId: string
  message: string
  timestamp: string
  ack: {
    state: "READ" | "UNREAD"
  }
}

export class NotificationService {
  private notifications: Map<string, Notification> = new Map()
  private listeners: Set<(notifications: Notification[]) => void> = new Set()

  constructor() {
    this.loadFromStorage()
    this.startPolling()
  }

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private notifyListeners() {
    const notifications = Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    
    this.listeners.forEach(listener => listener(notifications))
  }

  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'ack'>) {
    const id = `NTF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification: Notification = {
      ...notification,
      id,
      timestamp: new Date().toISOString(),
      ack: { state: "UNREAD" }
    }

    this.notifications.set(id, newNotification)
    this.saveToStorage()
    this.notifyListeners()

    // Show browser notification if permission granted
    if (Notification.permission === 'granted') {
      new Notification('Medical Imaging Alert', {
        body: newNotification.message,
        icon: '/favicon.ico',
        tag: newNotification.id
      })
    }
  }

  markAsRead(notificationId: string) {
    const notification = this.notifications.get(notificationId)
    if (notification) {
      notification.ack.state = "READ"
      this.notifications.set(notificationId, notification)
      this.saveToStorage()
      this.notifyListeners()
    }
  }

  markAllAsRead() {
    this.notifications.forEach(notification => {
      notification.ack.state = "READ"
    })
    this.saveToStorage()
    this.notifyListeners()
  }

  getUnreadCount(): number {
    return Array.from(this.notifications.values())
      .filter(n => n.ack.state === "UNREAD").length
  }

  getAllNotifications(): Notification[] {
    return Array.from(this.notifications.values())
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  getNotificationsBySeverity(severity: string): Notification[] {
    return this.getAllNotifications().filter(n => n.severity === severity)
  }

  // Request notification permission
  async requestPermission(): Promise<boolean> {
    if (Notification.permission === 'granted') return true
    if (Notification.permission === 'denied') return false
    
    const permission = await Notification.requestPermission()
    return permission === 'granted'
  }

  // Generate notifications based on case status changes
  generateCaseNotification(case_: any, oldStatus?: string) {
    if (case_.status === 'AI_COMPLETE' && oldStatus !== 'AI_COMPLETE') {
      this.addNotification({
        severity: case_.priority === 'STAT' ? 'STAT' : case_.priority === 'URGENT' ? 'URGENT' : 'ROUTINE',
        type: 'AI_ALERT',
        caseId: case_.caseId,
        message: `AI analysis complete for ${case_.modality} - ${case_.bodyPart}. Confidence: ${(case_.ai.confidenceTop * 100).toFixed(1)}%`
      })
    }

    if (case_.status === 'ERROR' && oldStatus !== 'ERROR') {
      this.addNotification({
        severity: 'URGENT',
        type: 'PIPELINE_ISSUE',
        caseId: case_.caseId,
        message: `Processing error for case ${case_.caseId}. Manual review required.`
      })
    }
  }

  private startPolling() {
    // Poll for new notifications every 5 seconds
    setInterval(() => {
      // In a real implementation, this would fetch from an API
      // For now, we'll just check for any updates
      this.notifyListeners()
    }, 5000)
  }

  private saveToStorage() {
    const notificationsArray = Array.from(this.notifications.entries())
    localStorage.setItem('medical_notifications', JSON.stringify(notificationsArray))
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem('medical_notifications')
      if (stored) {
        const notificationsArray = JSON.parse(stored)
        this.notifications = new Map(notificationsArray)
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error)
    }
  }

  // Add some mock notifications for development
  addMockNotifications() {
    const mockNotifications: Omit<Notification, 'id' | 'timestamp' | 'ack'>[] = [
      {
        severity: "STAT",
        type: "AI_ALERT",
        caseId: "ACC-2025-09-25-12345",
        message: "ICH suspected with high confidence (91%)"
      },
      {
        severity: "URGENT",
        type: "ASSIGNMENT",
        caseId: "ACC-2025-09-25-12346",
        message: "New case assigned for review"
      },
      {
        severity: "ROUTINE",
        type: "PIPELINE_ISSUE",
        caseId: "",
        message: "SageMaker inference queue depth: 15 cases"
      }
    ]

    mockNotifications.forEach(notification => {
      this.addNotification(notification)
    })
  }
}

// Export singleton instance
export const notificationService = new NotificationService()
