import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Content from "@/models/Content"
import { isValidObjectId } from "@/lib/utils"
import { logActivity } from "@/lib/activity-logger"

// GET /api/admin/content/[id] - Get content by ID
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
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get content by ID
    const content = await Content.findById(id)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/admin/content/[id] - Update content
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
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 })
    }

    // Get request body
    const body = await request.json()

    // Connect to database
    await connectToDatabase()

    // Get content by ID
    const content = await Content.findById(id)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Check if slug already exists (if slug is being changed)
    if (body.slug && body.slug !== content.slug) {
      const existingContent = await Content.findOne({ slug: body.slug, _id: { $ne: id } })

      if (existingContent) {
        return NextResponse.json({ error: "Content with this slug already exists" }, { status: 400 })
      }
    }

    // Update content fields
    if (body.title) content.title = body.title
    if (body.slug) content.slug = body.slug
    if (body.type) content.type = body.type
    if (body.content) content.content = body.content
    if (body.status) content.status = body.status
    if (body.isHomepage !== undefined) content.isHomepage = body.isHomepage

    content.updatedAt = new Date()

    await content.save()

    // If this content is set as homepage, unset any other homepage content
    if (body.isHomepage) {
      await Content.updateMany({ _id: { $ne: content._id }, isHomepage: true }, { $set: { isHomepage: false } })
    }

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "update",
      resourceType: "content",
      resourceId: content._id,
      details: `Updated ${content.type} content: ${content.title}`,
    })

    return NextResponse.json({ content })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/admin/content/[id] - Delete content
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
      return NextResponse.json({ error: "Invalid content ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get content by ID
    const content = await Content.findById(id)

    if (!content) {
      return NextResponse.json({ error: "Content not found" }, { status: 404 })
    }

    // Store content info for activity log
    const contentTitle = content.title
    const contentType = content.type

    await content.deleteOne()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "delete",
      resourceType: "content",
      resourceId: id,
      details: `Deleted ${contentType} content: ${contentTitle}`,
    })

    return NextResponse.json({ message: "Content deleted successfully" })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
