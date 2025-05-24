import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Event from "@/models/Event"

export async function GET() {
  try {
    console.log("GET /api/events - Starting")
    await connectToDatabase()

    // Get all published events
    const events = await Event.find({ isPublished: true }).sort({ date: 1 }).lean()

    console.log(`GET /api/events - Found ${events.length} events`)
    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch events" },
      { status: 500 },
    )
  }
}

// POST /api/events - Create a new event (admin only)
export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    // TODO: Add authentication to ensure only admins can create events

    const data = await req.json()

    // Validate required fields
    const requiredFields = [
      "title",
      "description",
      "date",
      "time",
      "location",
      "category",
      "image",
      "maxAttendees",
      "organizer",
    ]
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    // Create new event
    const newEvent = new Event({
      ...data,
      attendees: [], // Start with empty attendees list
      isPublished: true, // Default to published
      createdAt: new Date(),
      updatedAt: new Date(),
    })

    await newEvent.save()

    return NextResponse.json(newEvent, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 })
  }
}
