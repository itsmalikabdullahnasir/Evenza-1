import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/db"
import Trip from "@/models/Trip"
import { isValidObjectId } from "@/lib/utils"
import { logActivity } from "@/lib/activity-logger"

// GET /api/admin/trips/[id] - Get a trip by ID
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
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get trip by ID
    const trip = await Trip.findById(id)

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    return NextResponse.json({ trip })
  } catch (error) {
    console.error("Error fetching trip:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// PUT /api/admin/trips/[id] - Update a trip
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
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 })
    }

    // Get request body
    const body = await req.json()

    // Connect to database
    await connectToDatabase()

    // Get trip by ID
    const trip = await Trip.findById(id)

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Update trip fields
    if (body.title) trip.title = body.title
    if (body.description) trip.description = body.description
    if (body.date) trip.date = body.date
    if (body.location) trip.location = body.location
    if (body.price !== undefined) trip.price = body.price
    if (body.spots) trip.spots = body.spots
    if (body.itinerary !== undefined) trip.itinerary = body.itinerary
    if (body.requirements !== undefined) trip.requirements = body.requirements

    await trip.save()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "update",
      resourceType: "trip",
      resourceId: trip._id,
      details: `Updated trip: ${trip.title}`,
    })

    return NextResponse.json({ trip })
  } catch (error) {
    console.error("Error updating trip:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}

// DELETE /api/admin/trips/[id] - Delete a trip
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
      return NextResponse.json({ error: "Invalid trip ID" }, { status: 400 })
    }

    // Connect to database
    await connectToDatabase()

    // Get trip by ID
    const trip = await Trip.findById(id)

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Store trip title for activity log
    const tripTitle = trip.title

    await trip.deleteOne()

    // Log activity
    await logActivity({
      userId: session.user.id,
      action: "delete",
      resourceType: "trip",
      resourceId: id,
      details: `Deleted trip: ${tripTitle}`,
    })

    return NextResponse.json({ message: "Trip deleted successfully" })
  } catch (error) {
    console.error("Error deleting trip:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
