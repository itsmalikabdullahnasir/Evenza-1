import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Interview from "@/models/Interview"
import { isValidObjectId } from "@/lib/utils"
import { logActivity } from "@/lib/activity-logger"

// GET /api/admin/interviews/[id] - Get an interview by ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid interview ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get interview by ID
    const interview = await Interview.findById(id)

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    return NextResponse.json({ interview })
  } catch (error) {
    console.error("Error fetching interview:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/admin/interviews/[id] - Update an interview
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid interview ID" }, { status: 400 })
    }

    // Get request body
    const body = await request.json()

    // Connect to database
    await connectToDatabase()

    // Get interview by ID
    const interview = await Interview.findById(id)

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Update interview fields
    if (body.title) interview.title = body.title
    if (body.company) interview.company = body.company
    if (body.description) interview.description = body.description
    if (body.date) interview.date = body.date
    if (body.location) interview.location = body.location
    if (body.positions) {
      interview.positions = body.positions.split(",").map((p: string) => p.trim())
    }

    await interview.save()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "update",
      resourceType: "interview",
      resourceId: interview._id,
      details: `Updated interview: ${interview.title}`,
    })

    return NextResponse.json({ interview })
  } catch (error) {
    console.error("Error updating interview:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/admin/interviews/[id] - Delete an interview
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user || (session.user.role !== "admin" && session.user.role !== "super_admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid interview ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get interview by ID
    const interview = await Interview.findById(id)

    if (!interview) {
      return NextResponse.json({ error: "Interview not found" }, { status: 404 })
    }

    // Store interview title for activity log
    const interviewTitle = interview.title

    await interview.deleteOne()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "delete",
      resourceType: "interview",
      resourceId: id,
      details: `Deleted interview: ${interviewTitle}`,
    })

    return NextResponse.json({ message: "Interview deleted successfully" })
  } catch (error) {
    console.error("Error deleting interview:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
