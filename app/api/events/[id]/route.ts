import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Event from "@/models/Event"
import mongoose from "mongoose"

// GET /api/events/[id] - Get event by ID
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const { id } = params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    const event = await Event.findById(id).lean()

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Add attendee count instead of full list for security
    const eventWithCount = {
      ...event,
      attendeeCount: event.attendees ? event.attendees.length : 0,
      spotsLeft: event.maxAttendees - (event.attendees ? event.attendees.length : 0),
    }

    return NextResponse.json(eventWithCount)
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Failed to fetch event" }, { status: 500 })
  }
}

// PUT /api/events/[id] - Update event (admin only)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // TODO: Add authentication to ensure only admins can update events

    const { id } = params
    const data = await req.json()

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    // Don't allow direct modification of attendees through this endpoint
    const { attendees, ...updateData } = data

    const updatedEvent = await Event.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true },
    ).lean()

    if (!updatedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Failed to update event" }, { status: 500 })
  }
}

// DELETE /api/events/[id] - Delete event (admin only)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    // TODO: Add authentication to ensure only admins can delete events

    const { id } = params

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    const deletedEvent = await Event.findByIdAndDelete(id)

    if (!deletedEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 })
  }
}
