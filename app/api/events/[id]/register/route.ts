import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Event from "@/models/Event"
import User from "@/models/User"
import Payment from "@/models/Payment"
import { verifyToken } from "@/lib/server-utils"
import { logActivity, ActivityType } from "@/lib/activity-logger"
import { isValidObjectId } from "mongoose"

interface Params {
  id: string
}

export async function POST(req: NextRequest, { params }: { params: Params }) {
  try {
    const eventId = params?.id

    if (!eventId) {
      console.error("Event ID is undefined in params")
      return NextResponse.json({ error: "Event ID is required" }, { status: 400 })
    }

    console.log(`POST /api/events/${eventId}/register - Starting`)

    // Verify authentication
    const tokenData = await verifyToken(req)
    if (!tokenData) {
      console.log(`POST /api/events/${eventId}/register - Unauthorized access attempt`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate ID format
    if (!isValidObjectId(eventId)) {
      console.error(`Invalid event ID format: ${eventId}`)
      return NextResponse.json({ error: "Invalid event ID format" }, { status: 400 })
    }

    const { tickets, name, email, phone, specialRequirements } = await req.json()

    await connectToDatabase()

    // Find event
    const event = await Event.findById(eventId)
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Find user
    const user = await User.findById(tokenData.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure attendees is an array
    if (!Array.isArray(event.attendees)) {
      console.log("Attendees is not an array, initializing it")
      // If it's not an array, create a new array
      event.attendees = []
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return NextResponse.json({ error: "Event is full" }, { status: 400 })
    }

    // Check if user is already registered
    const isAlreadyRegistered = event.attendees.some(
      (attendee) => attendee.userId && attendee.userId.toString() === user._id.toString(),
    )

    if (isAlreadyRegistered) {
      return NextResponse.json({ error: "You are already registered for this event" }, { status: 400 })
    }

    // Create registration
    const registration = {
      userId: user._id,
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone || "",
      tickets: Number(tickets) || 1,
      registeredAt: new Date(),
      paymentStatus: event.price > 0 ? "pending" : "not_required",
      specialRequirements: specialRequirements || "",
    }

    // Add registration to event
    event.attendees.push(registration)

    // Update attendee count
    event.attendeeCount = (event.attendeeCount || 0) + 1

    await event.save()

    // Initialize registeredEvents array if it doesn't exist
    if (!Array.isArray(user.registeredEvents)) {
      user.registeredEvents = []
    }

    // Add event to user's registered events
    user.registeredEvents.push({
      eventId: event._id,
      registeredAt: new Date(),
      tickets: Number(tickets) || 1,
      paymentStatus: event.price > 0 ? "pending" : "not_required",
    })

    await user.save()

    // Create payment record if payment is required
    if (event.price > 0) {
      const payment = new Payment({
        userId: user._id,
        type: "event",
        relatedId: event._id,
        amount: event.price * (Number(tickets) || 1),
        status: "pending",
        createdAt: new Date(),
      })

      await payment.save()
    }

    // Log activity
    try {
      await logActivity({
        userId: user._id,
        type: ActivityType.EVENT_REGISTERED,
        description: `User registered for event: ${event.title}`,
        metadata: {
          eventId: event._id.toString(),
          eventTitle: event.title,
          tickets: Number(tickets) || 1,
        },
      })
    } catch (logError) {
      console.error("Failed to log activity:", logError)
    }

    console.log(
      `POST /api/events/${eventId}/register - Successfully registered user ${user._id} for event ${event._id}`,
    )

    return NextResponse.json({
      success: true,
      message: "Successfully registered for event",
    })
  } catch (error) {
    console.error("Error registering for event:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to register for event" },
      { status: 500 },
    )
  }
}
