import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import InterviewSubmission from "@/models/InterviewSubmission"
import { InterviewSubmissionsList } from "@/components/dashboard/interview-submissions"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { PlusCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "My Interview Applications - Evenza",
  description: "View and manage your interview applications",
}

async function getInterviewSubmissions(userId: string) {
  try {
    await connectToDatabase()

    // Find user and populate interview submissions
    const user = await User.findById(userId).lean()

    if (!user || !user.interviewSubmissions || user.interviewSubmissions.length === 0) {
      return []
    }

    // Get all submission IDs
    const submissionIds = user.interviewSubmissions.map((sub) => sub.submissionId)

    // Get full submission details
    const submissions = await InterviewSubmission.find({
      _id: { $in: submissionIds },
    })
      .populate("interviewId")
      .lean()

    // Format submissions for frontend
    return submissions.map((sub) => ({
      id: sub._id.toString(),
      interviewId: sub.interviewId._id.toString(),
      interviewTitle: sub.interviewId.title,
      company: sub.interviewId.company,
      position: sub.interviewId.position,
      status: sub.status,
      submittedAt: sub.submittedAt,
      feedback: sub.feedback || null,
      interviewDate: sub.interviewDate || null,
    }))
  } catch (error) {
    console.error("Error fetching interview submissions:", error)
    return []
  }
}

export default async function DashboardInterviewsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login?callbackUrl=/dashboard/interviews")
  }

  const submissions = await getInterviewSubmissions(session.user.id)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Interview Applications</h1>
          <p className="text-muted-foreground">View and manage your interview applications</p>
        </div>
        <Button asChild>
          <Link href="/interviews">
            <PlusCircle className="h-4 w-4 mr-2" />
            Find Interviews
          </Link>
        </Button>
      </div>

      <InterviewSubmissionsList submissions={submissions} />
    </div>
  )
}
