"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { AlertTriangle, TrendingDown, CheckCircle2, Info, Settings, Trash2, Eye } from "lucide-react"

type Notification = {
  id: string
  type: "alert" | "info" | "success" | "warning"
  title: string
  message: string
  timestamp: string
  read: boolean
  category: "degradation" | "project" | "data" | "system"
}

export function NotificationsPanel() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "alert",
      title: "Critical Degradation Detected",
      message: "Northern Plains - Sector 12 showing rapid NDVI decline of 15% in the last 30 days",
      timestamp: "2 hours ago",
      read: false,
      category: "degradation",
    },
    {
      id: "2",
      type: "warning",
      title: "Soil Erosion Risk Increased",
      message: "Eastern Valley - Sector 8 erosion risk elevated from Medium to High",
      timestamp: "5 hours ago",
      read: false,
      category: "degradation",
    },
    {
      id: "3",
      type: "success",
      title: "Restoration Project Milestone",
      message: "Project Alpha Phase 2 completed successfully with 85% vegetation coverage",
      timestamp: "1 day ago",
      read: false,
      category: "project",
    },
    {
      id: "4",
      type: "info",
      title: "New Satellite Data Available",
      message: "Latest NDVI imagery for all monitored regions has been processed",
      timestamp: "1 day ago",
      read: true,
      category: "data",
    },
    {
      id: "5",
      type: "warning",
      title: "Water Stress Alert",
      message: "Southern Hills showing signs of severe water stress affecting 320 km²",
      timestamp: "2 days ago",
      read: true,
      category: "degradation",
    },
    {
      id: "6",
      type: "success",
      title: "Project Status Update",
      message: "Project Beta vegetation health improved by 12% this quarter",
      timestamp: "3 days ago",
      read: true,
      category: "project",
    },
    {
      id: "7",
      type: "info",
      title: "System Maintenance Complete",
      message: "Scheduled maintenance completed. All systems operational",
      timestamp: "4 days ago",
      read: true,
      category: "system",
    },
  ])

  const [notificationSettings, setNotificationSettings] = useState({
    degradationAlerts: true,
    projectUpdates: true,
    dataChanges: false,
    systemNotifications: true,
    emailNotifications: true,
    pushNotifications: false,
  })

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((n) => n.id !== id))
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "alert":
        return <AlertTriangle className="h-5 w-5 text-destructive" />
      case "warning":
        return <TrendingDown className="h-5 w-5 text-accent" />
      case "success":
        return <CheckCircle2 className="h-5 w-5 text-primary" />
      case "info":
        return <Info className="h-5 w-5 text-muted-foreground" />
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Notifications</h2>
          <p className="text-muted-foreground">Stay updated on degradation events and project status</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="text-sm">
            {unreadCount} unread
          </Badge>
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            Mark all as read
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">
            All
            <Badge variant="secondary" className="ml-2">
              {notifications.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="unread">
            Unread
            <Badge variant="secondary" className="ml-2">
              {unreadCount}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="degradation">Degradation</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4" />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-3 mt-4">
          {notifications.map((notification) => (
            <Card key={notification.id} className={notification.read ? "opacity-60" : "border-primary/50"}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm">{notification.title}</h4>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">{notification.timestamp}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                    <div className="flex items-center gap-2">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteNotification(notification.id)}
                        className="h-7 text-xs text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="unread" className="space-y-3 mt-4">
          {notifications
            .filter((n) => !n.read)
            .map((notification) => (
              <Card key={notification.id} className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-7 text-xs"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Mark as read
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          {notifications.filter((n) => !n.read).length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No unread notifications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="degradation" className="space-y-3 mt-4">
          {notifications
            .filter((n) => n.category === "degradation")
            .map((notification) => (
              <Card key={notification.id} className={notification.read ? "opacity-60" : "border-primary/50"}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="projects" className="space-y-3 mt-4">
          {notifications
            .filter((n) => n.category === "project")
            .map((notification) => (
              <Card key={notification.id} className={notification.read ? "opacity-60" : "border-primary/50"}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1">{getIcon(notification.type)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm">{notification.title}</h4>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {notification.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notification.message}</p>
                      <div className="flex items-center gap-2">
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="h-7 text-xs"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Mark as read
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNotification(notification.id)}
                          className="h-7 text-xs text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Manage how you receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="font-semibold mb-4">Notification Types</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="degradation-alerts" className="font-medium">
                        Degradation Alerts
                      </Label>
                      <p className="text-sm text-muted-foreground">Critical land degradation events</p>
                    </div>
                    <Switch
                      id="degradation-alerts"
                      checked={notificationSettings.degradationAlerts}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          degradationAlerts: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="project-updates" className="font-medium">
                        Project Updates
                      </Label>
                      <p className="text-sm text-muted-foreground">Restoration project status changes</p>
                    </div>
                    <Switch
                      id="project-updates"
                      checked={notificationSettings.projectUpdates}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          projectUpdates: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="data-changes" className="font-medium">
                        Data Changes
                      </Label>
                      <p className="text-sm text-muted-foreground">New satellite data and updates</p>
                    </div>
                    <Switch
                      id="data-changes"
                      checked={notificationSettings.dataChanges}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          dataChanges: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="system-notifications" className="font-medium">
                        System Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Maintenance and system updates</p>
                    </div>
                    <Switch
                      id="system-notifications"
                      checked={notificationSettings.systemNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          systemNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h4 className="font-semibold mb-4">Delivery Methods</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notifications" className="font-medium">
                        Email Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={notificationSettings.emailNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: checked,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notifications" className="font-medium">
                        Push Notifications
                      </Label>
                      <p className="text-sm text-muted-foreground">Browser push notifications</p>
                    </div>
                    <Switch
                      id="push-notifications"
                      checked={notificationSettings.pushNotifications}
                      onCheckedChange={(checked) =>
                        setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: checked,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full">Save Preferences</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
