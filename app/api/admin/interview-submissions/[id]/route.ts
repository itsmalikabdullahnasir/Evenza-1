import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import InterviewSubmission, { InterviewStatus } from "@/models/InterviewSubmission"
import User from "@/models/User"
import mongoose from "mongoose"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { sendEmail } from "@/lib/email"
import { UserRole } from "@/models/User"

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Connect to the database
    await connectToDatabase()

    // Find the admin user
    const adminUser = await User.findOne({ email: session.user.email })
    if (!adminUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Check if user is an admin
    if (adminUser.role !== UserRole.ADMIN && adminUser.role !== UserRole.SUPER_ADMIN) {
      return NextResponse.json({ error: "Unauthorized. Admin privileges required" }, { status: 403 })
    }

    const { id } = params
    const { status, adminNotes } = await req.json()

    // Validate required fields
    if (!status || !Object.values(InterviewStatus).includes(status as InterviewStatus)) {
      return NextResponse.json({ error: "Invalid status value" }, { status: 400 })
    }

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid submission ID format" }, { status: 400 })
    }

    // Find the submission
    const submission = await InterviewSubmission.findById(id)
      .populate("user", "name email")
      .populate("interview", "title")

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    // Update the submission
    submission.status = status as InterviewStatus
    if (adminNotes) submission.adminNotes = adminNotes
    submission.reviewedBy = adminUser._id
    submission.reviewedAt = new Date()

    await submission.save()

    // Send notification email to the user
    try {
      const user = submission.user as any // Type assertion for populated field
      const interview = submission.interview as any // Type assertion for populated field

      let statusText = ""
      let actionText = ""

      switch (status) {
        case InterviewStatus.APPROVED:
          statusText = "approved"
          actionText =
            "We're excited to inform you that your application has been approved. Please check your dashboard for further instructions."
          break
        case InterviewStatus.REJECTED:
          statusText = "not approved"
          actionText =
            "We regret to inform you that your application was not approved at this time. We encourage you to apply for future opportunities."
          break
        case InterviewStatus.COMPLETED:
          statusText = "marked as completed"
          actionText = "Thank you for participating in the interview process. We've marked your interview as completed."
          break
        default:
          statusText = "updated"
          actionText = "Please check your dashboard for the latest status."
      }

      await sendEmail({
        to: user.email,
        subject: `Interview Application Status Update: ${interview.title}`,
        text: `Dear ${user.name},\n\nYour application for the ${interview.title} interview has been ${statusText}. ${actionText}\n\nBest regards,\nEvenza Team`,
        html: `
          <h1>Interview Application Status Update</h1>
          <p>Dear ${user.name},</p>
          <p>Your application for the <strong>${interview.title}</strong> interview has been <strong>${statusText}</strong>.</p>
          <p>${actionText}</p>
          <p>Best regards,<br>Evenza Team</p>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError)
      // Continue execution even if email fails
    }

    return NextResponse.json({
      message: "Interview submission status updated successfully",
      submission: {
        id: submission._id,
        status: submission.status,
        reviewedAt: submission.reviewedAt,
      },
    })
  } catch (error) {
    console.error("Error updating interview submission:", error)
    return NextResponse.json({ error: "Failed to update interview submission" }, { status: 500 })
  }
}
