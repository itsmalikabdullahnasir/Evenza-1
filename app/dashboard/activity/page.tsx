import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import ActivityLog from "@/models/ActivityLog"
import { ActivityLogList } from "@/components/dashboard/activity-log-list"

export const metadata: Metadata = {
  title: "Activity Log - Evenza",
  description: "View your activity history",
}

async function getUserActivityLogs(userId: string) {
  await connectToDatabase()

  const logs = await ActivityLog.find({ user: userId }).sort({ createdAt: -1 }).limit(50).lean()

  return logs.map((log) => ({
    id: log._id.toString(),
    type: log.type,
    description: log.description,
    createdAt: log.createdAt,
    metadata: log.metadata,
  }))
}

export default async function ActivityPage() {
  // Check if user is authenticated
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/activity")
  }

  // Find the user
  const user = await User.findOne({ email: session.user?.email })

  if (!user) {
    redirect("/login")
  }

  const activityLogs = await getUserActivityLogs(user._id.toString())

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Activity Log</h1>
      <p className="text-muted-foreground mb-8">View your recent activity and interactions with the platform</p>

      <ActivityLogList logs={activityLogs} />
    </div>
  )
}
