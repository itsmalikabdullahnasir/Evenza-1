import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Query, { QueryStatus } from "@/models/Query"
import Message from "@/models/Message"
import { verifyToken } from "@/lib/server-utils"

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/queries - Starting")

    // Get request body
    const data = await req.json()
    console.log("Query data received:", data)

    // Verify authentication
    const tokenData = await verifyToken(req)
    if (!tokenData) {
      console.log("POST /api/queries - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate required fields
    if (!data.name || !data.email || !data.message) {
      console.error("Missing required fields:", {
        name: !!data.name,
        email: !!data.email,
        message: !!data.message,
      })
      return NextResponse.json(
        {
          error: "Name, email, and message are required",
        },
        { status: 400 },
      )
    }

    // Connect to database
    await connectToDatabase()

    // Create query
    const query = new Query({
      user: tokenData.id, // Use user instead of userId
      name: data.name,
      email: data.email,
      subject: data.subject || "General Query",
      message: data.message,
      status: QueryStatus.NEW, // Use the enum value
      createdAt: new Date(),
    })

    await query.save()

    // Also create a message entry so it shows up in admin messages
    const message = new Message({
      name: data.name,
      email: data.email,
      subject: data.subject || "General Query",
      message: data.message,
      userId: tokenData.id,
      status: "new",
      notes: "Created from contact form",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await message.save()

    console.log(`POST /api/queries - Query created successfully with ID: ${query._id}`)

    return NextResponse.json({
      success: true,
      message: "Query submitted successfully",
      queryId: query._id,
    })
  } catch (error) {
    console.error("Error creating query:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to submit query",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/queries - Starting")

    // Verify authentication
    const tokenData = await verifyToken(req)
    if (!tokenData) {
      console.log("GET /api/queries - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")

    // Get queries for the user
    const total = await Query.countDocuments({ user: tokenData.id })
    const queries = await Query.find({ user: tokenData.id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Format queries for response
    const formattedQueries = queries.map((query) => ({
      id: query._id.toString(),
      subject: query.subject,
      message: query.message,
      status: query.status,
      createdAt: query.createdAt,
      response: query.response,
      respondedAt: query.respondedAt,
    }))

    console.log(`GET /api/queries - Found ${formattedQueries.length} queries for user ${tokenData.id}`)

    return NextResponse.json({
      queries: formattedQueries,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching queries:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
