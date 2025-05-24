import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Interview from "@/models/Interview"
import User from "@/models/User"
import InterviewSubmission from "@/models/InterviewSubmission"
import { verifyToken } from "@/lib/server-utils"
import { logActivity, ActivityType } from "@/lib/activity-logger"
import { isValidObjectId } from "mongoose"

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log(`POST /api/interviews/${params.id}/submit - Starting`)

    // Verify authentication
    const tokenData = await verifyToken(req)
    if (!tokenData) {
      console.log(`POST /api/interviews/${params.id}/submit - Unauthorized access attempt`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Validate ID format
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid interview ID format" }, { status: 400 })
    }

    const { position, resume, coverLetter, portfolioUrl, linkedinUrl, githubUrl, availability, additionalInfo } =
      await req.json()

    await connectToDatabase()

    // Find interview
    const interview = await Interview.findById(id)
    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Check if interview is closed
    if (interview.status === "closed") {
      return NextResponse.json({ error: "This interview is no longer accepting applications" }, { status: 400 })
    }

    // Find user
    const user = await User.findById(tokenData.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure applicants is an array
    if (!Array.isArray(interview.applicants)) {
      console.log("Applicants is not an array, initializing it")
      interview.applicants = []
    }

    // Check if user has already applied
    const isAlreadyApplied = interview.applicants.some(
      (applicant) => applicant.userId && applicant.userId.toString() === user._id.toString(),
    )

    if (isAlreadyApplied) {
      return NextResponse.json({ error: "You have already applied for this interview" }, { status: 400 })
    }

    // Create submission
    const submission = new InterviewSubmission({
      userId: user._id,
      interviewId: interview._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      position: position || "",
      resume: resume || "",
      coverLetter: coverLetter || "",
      portfolioUrl: portfolioUrl || "",
      linkedinUrl: linkedinUrl || "",
      githubUrl: githubUrl || "",
      availability: availability || "",
      additionalInfo: additionalInfo || "",
      status: "pending",
      submittedAt: new Date(),
    })

    await submission.save()

    // Add applicant to interview
    interview.applicants.push({
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      position: position || "",
      appliedAt: new Date(),
      status: "pending",
    })

    // Update registration count
    interview.registrations = (interview.registrations || 0) + 1

    await interview.save()

    // Initialize interviewSubmissions array if it doesn't exist
    if (!Array.isArray(user.interviewSubmissions)) {
      user.interviewSubmissions = []
    }

    // Add submission to user's interview submissions
    user.interviewSubmissions.push({
      interviewId: interview._id,
      submissionId: submission._id,
      submittedAt: new Date(),
      status: "pending",
    })

    await user.save()

    // Log activity
    await logActivity({
      userId: user._id,
      type: ActivityType.INTERVIEW_APPLIED,
      description: `User applied for interview: ${interview.title}`,
      metadata: {
        interviewId: interview._id.toString(),
        interviewTitle: interview.title,
        submissionId: submission._id.toString(),
      },
    }).catch((err) => console.error("Failed to log activity:", err))

    console.log(
      `POST /api/interviews/${params.id}/submit - Successfully submitted application for user ${user._id} to interview ${interview._id}`,
    )

    return NextResponse.json({
      success: true,
      message: "Successfully applied for interview",
      submissionId: submission._id,
    })
  } catch (error) {
    console.error("Error applying for interview:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to apply for interview" },
      { status: 500 },
    )
  }
}
