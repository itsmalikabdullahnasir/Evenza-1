import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Event from "@/models/Event"
import { isValidObjectId } from "@/lib/utils"
import { logActivity } from "@/lib/activity-logger"

// GET /api/admin/events/[id] - Get an event by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get event by ID
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/admin/events/[id] - Update an event
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    // Get request body
    const body = await req.json()

    // Connect to database
    await connectToDatabase()

    // Get event by ID
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Update event fields
    if (body.title) event.title = body.title
    if (body.description) event.description = body.description
    if (body.date) event.date = body.date
    if (body.time) event.time = body.time
    if (body.location) event.location = body.location
    if (body.category) event.category = body.category
    if (body.price !== undefined) event.price = body.price
    if (body.maxAttendees) event.maxAttendees = body.maxAttendees
    if (body.isFeatured !== undefined) event.isFeatured = body.isFeatured

    await event.save()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "update",
      resourceType: "event",
      resourceId: event._id,
      details: `Updated event: ${event.title}`,
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/admin/events/[id] - Delete an event
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    // Check if user is authenticated and has admin role
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== "admin" && session.user.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = params

    // Validate ID
    if (!isValidObjectId(id)) {
      return NextResponse.json({ error: "Invalid event ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get event by ID
    const event = await Event.findById(id)

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Store event title for activity log
    const eventTitle = event.title

    await event.deleteOne()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "delete",
      resourceType: "event",
      resourceId: id,
      details: `Deleted event: ${eventTitle}`,
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
