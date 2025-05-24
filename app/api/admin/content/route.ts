import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Content from "@/models/Content"
import { verifyAdminToken } from "@/lib/server-utils"

export async function GET(request: NextRequest) {
  try {
    console.log("GET /api/admin/content - Starting")

    // Verify admin authentication
    const tokenData = await verifyAdminToken(request)
    if (!tokenData) {
      console.log("GET /api/admin/content - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const type = searchParams.get("type") || ""

    // Build query
    const query: any = {}

    if (search) {
      query.$or = [{ title: { $regex: search, $options: "i" } }, { content: { $regex: search, $options: "i" } }]
    }

    if (type) {
      query.type = type
    }

    // Count total content
    const total = await Content.countDocuments(query)

    // Get content with pagination
    const content = await Content.find(query)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    // Format content for response
    const formattedContent = content.map((item) => ({
      _id: item._id.toString(),
      title: item.title,
      slug: item.slug,
      content: item.content,
      type: item.type,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }))

    console.log(`GET /api/admin/content - Found ${formattedContent.length} content items`)

    return NextResponse.json({
      content: formattedContent,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/admin/content - Starting")

    // Verify admin authentication
    const tokenData = await verifyAdminToken(request)
    if (!tokenData) {
      console.log("POST /api/admin/content - Unauthorized access attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Connect to database
    await connectToDatabase()

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.content || !data.type) {
      return NextResponse.json(
        {
          error: "Title, content, and type are required",
        },
        { status: 400 },
      )
    }

    // Create slug if not provided
    if (!data.slug) {
      data.slug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
    }

    // Check if slug already exists
    const existingContent = await Content.findOne({ slug: data.slug })
    if (existingContent) {
      return NextResponse.json(
        {
          error: "Content with this slug already exists",
        },
        { status: 400 },
      )
    }

    // Create content
    const newContent = new Content({
      ...data,
      status: data.status || "draft",
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newContent.save()

    console.log(`POST /api/admin/content - Created new content with ID ${newContent._id}`)

    return NextResponse.json({
      success: true,
      message: "Content created successfully",
      contentId: newContent._id.toString(),
    })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json({ error: "Failed to create content" }, { status: 500 })
  }
}
