import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Interview from "@/models/Interview"
import { verifyToken } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/interviews - Starting request")

    // Get token from request
    const tokenData = await verifyToken(request)
    console.log("Auth token present:", !!tokenData)

    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log("Unauthorized: Invalid token or insufficient permissions")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get all interviews
    const interviews = await Interview.find({}).sort({ createdAt: -1 }).lean()

    // Format interviews for response
    const formattedInterviews = interviews.map((interview) => ({
      id: interview._id.toString(),
      title: interview.title,
      description: interview.description,
      requirements: interview.requirements,
      date: interview.date,
      location: interview.location,
      slots: interview.slots,
      status: interview.status,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    }))

    console.log(`GET /api/admin/interviews - Found ${formattedInterviews.length} interviews`)

    return NextResponse.json({ interviews: formattedInterviews })
  } catch (error) {
    console.error("Error fetching interviews:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/interviews - Starting request")

    // Get token from request
    const tokenData = await verifyToken(request)
    console.log("Auth token present:", !!tokenData)

    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log("Unauthorized: Invalid token or insufficient permissions")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.description || !data.date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Create new interview
    const interview = new Interview({
      title: data.title,
      description: data.description,
      requirements: data.requirements || [],
      date: data.date,
      location: data.location,
      slots: data.slots || 10,
      status: data.status || "active",
      createdBy: tokenData.id,
    })

    // Save interview
    await interview.save()

    console.log("POST /api/admin/interviews - Interview created successfully")

    // Format interview for response
    const formattedInterview = {
      id: interview._id.toString(),
      title: interview.title,
      description: interview.description,
      requirements: interview.requirements,
      date: interview.date,
      location: interview.location,
      slots: interview.slots,
      status: interview.status,
      createdAt: interview.createdAt,
      updatedAt: interview.updatedAt,
    }

    return NextResponse.json({ interview: formattedInterview }, { status: 201 })
  } catch (error) {
    console.error("Error creating interview:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
