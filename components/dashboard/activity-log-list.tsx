"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  Clock,
  LogIn,
  LogOut,
  UserPlus,
  User,
  Lock,
  ActivityIcon as EventIcon,
  Map,
  Briefcase,
  CreditCard,
  Settings,
} from "lucide-react"
import { ActivityType } from "@/models/ActivityLog"

interface ActivityLog {
  id: string
  type: ActivityType
  description: string
  createdAt: string
  metadata?: Record<string, any>
}

interface ActivityLogListProps {
  logs: ActivityLog[]
}

export function ActivityLogList({ logs }: ActivityLogListProps) {
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case ActivityType.LOGIN:
        return <LogIn className="h-4 w-4" />
      case ActivityType.LOGOUT:
        return <LogOut className="h-4 w-4" />
      case ActivityType.REGISTER:
        return <UserPlus className="h-4 w-4" />
      case ActivityType.PROFILE_UPDATE:
        return <User className="h-4 w-4" />
      case ActivityType.PASSWORD_CHANGE:
        return <Lock className="h-4 w-4" />
      case ActivityType.EVENT_REGISTRATION:
        return <EventIcon className="h-4 w-4" />
      case ActivityType.TRIP_ENROLLMENT:
        return <Map className="h-4 w-4" />
      case ActivityType.INTERVIEW_SUBMISSION:
        return <Briefcase className="h-4 w-4" />
      case ActivityType.PAYMENT:
        return <CreditCard className="h-4 w-4" />
      case ActivityType.ADMIN_ACTION:
        return <Settings className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getActivityBadge = (type: ActivityType) => {
    let color = ""

    switch (type) {
      case ActivityType.LOGIN:
      case ActivityType.LOGOUT:
        color = "bg-blue-100 text-blue-800"
        break
      case ActivityType.REGISTER:
      case ActivityType.PROFILE_UPDATE:
      case ActivityType.PASSWORD_CHANGE:
        color = "bg-purple-100 text-purple-800"
        break
      case ActivityType.EVENT_REGISTRATION:
      case ActivityType.TRIP_ENROLLMENT:
      case ActivityType.INTERVIEW_SUBMISSION:
        color = "bg-green-100 text-green-800"
        break
      case ActivityType.PAYMENT:
        color = "bg-yellow-100 text-yellow-800"
        break
      case ActivityType.ADMIN_ACTION:
        color = "bg-red-100 text-red-800"
        break
      default:
        color = "bg-gray-100 text-gray-800"
    }

    return (
      <Badge variant="outline" className={color}>
        {type.replace(/_/g, " ").toLowerCase()}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your last {logs.length} activities on the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No activity recorded yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  {getActivityIcon(log.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium leading-none">{log.description}</p>
                    {getActivityBadge(log.type)}
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="mr-1 h-3 w-3" />
                    <span>{formatDate(log.createdAt)}</span>
                  </div>
                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="mt-2 rounded-md bg-muted p-2 text-xs">
                      <pre className="whitespace-pre-wrap">{JSON.stringify(log.metadata, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
