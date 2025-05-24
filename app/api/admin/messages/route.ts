import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Message from "@/models/Message"
import Query from "@/models/Query"
import { verifyToken } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/messages - Starting")

    // Verify authentication
    const tokenData = await verifyToken(request)
    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log("GET /api/admin/messages - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") || ""

    // Build query for messages
    const messageQuery: any = {}

    if (search) {
      messageQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      messageQuery.status = status
    }

    // Build query for queries
    const queryQuery: any = {}

    if (search) {
      queryQuery.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ]
    }

    if (status && status !== "all") {
      queryQuery.status = status
    }

    // Count total messages and queries
    const [messageCount, queryCount] = await Promise.all([
      Message.countDocuments(messageQuery),
      Query.countDocuments(queryQuery),
    ])

    const total = messageCount + queryCount
    const skip = (page - 1) * limit

    // Get messages and queries with pagination
    let messages = []
    let queries = []

    if (skip < messageCount) {
      // If skip is less than messageCount, we need to fetch messages
      const messagesToFetch = Math.min(limit, messageCount - skip)
      messages = await Message.find(messageQuery).sort({ createdAt: -1 }).skip(skip).limit(messagesToFetch).lean()
    }

    if (messages.length < limit) {
      // If we fetched fewer messages than the limit, we need to fetch queries
      const queriesToFetch = limit - messages.length
      const querySkip = Math.max(0, skip - messageCount)
      queries = await Query.find(queryQuery).sort({ createdAt: -1 }).skip(querySkip).limit(queriesToFetch).lean()
    }

    // Format messages for response
    const formattedMessages = [
      ...messages.map((message) => ({
        _id: message._id.toString(),
        name: message.name,
        email: message.email,
        subject: message.subject,
        message: message.message,
        status: message.status,
        notes: message.notes,
        createdAt: message.createdAt,
        updatedAt: message.updatedAt,
        type: "message",
      })),
      ...queries.map((query) => ({
        _id: query._id.toString(),
        name: query.name,
        email: query.email,
        subject: query.subject || "Query",
        message: query.message,
        status: query.status || "new",
        notes: query.notes || "",
        createdAt: query.createdAt,
        updatedAt: query.updatedAt || query.createdAt,
        type: "query",
      })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    console.log(`GET /api/admin/messages - Found ${formattedMessages.length} messages/queries`)

    return NextResponse.json({
      messages: formattedMessages,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/messages - Starting")

    // Verify authentication
    const tokenData = await verifyToken(request)
    if (!tokenData || (tokenData.role !== "admin" && tokenData.role !== "super_admin")) {
      console.log("POST /api/admin/messages - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Validate required fields
    if (!data.name || !data.email || !data.subject || !data.message) {
      return NextResponse.json(
        {
          error: "Name, email, subject, and message are required",
        },
        { status: 400 },
      )
    }

    await connectToDatabase()

    // Create message
    const newMessage = new Message({
      ...data,
      status: data.status || "new",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    try {
      await newMessage.save()
    } catch (dbError) {
      console.error("Error saving new message:", dbError)
      return NextResponse.json({ error: "Failed to save new message to database" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Message created successfully",
      messageId: newMessage._id.toString(),
    })
  } catch (error) {
    console.error("Error creating message:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
