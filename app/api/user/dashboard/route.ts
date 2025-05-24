import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import User from "@/models/User"
import Event from "@/models/Event"
import Trip from "@/models/Trip"
import Interview from "@/models/Interview"
import Query from "@/models/Query"
import { verifyToken } from "@/lib/server-utils"

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/user/dashboard - Starting")

    // Verify authentication
    const tokenData = await verifyToken(req)
    if (!tokenData) {
      console.log("GET /api/user/dashboard - No auth token provided")
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log(`GET /api/user/dashboard - User ID: ${tokenData.id}`)

    // Connect to database
    await connectToDatabase()

    // Get user data
    const user = await User.findById(tokenData.id).lean()

    if (!user) {
      console.log("GET /api/user/dashboard - User not found")
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    console.log(`GET /api/user/dashboard - Found user: ${user.name}`)

    // Get registered events
    let registeredEvents = []
    if (user.registeredEvents && user.registeredEvents.length > 0) {
      const eventIds = user.registeredEvents.map((reg) => reg.eventId).filter(Boolean)
      if (eventIds.length > 0) {
        const events = await Event.find({ _id: { $in: eventIds } }).lean()
        registeredEvents = events.map((event) => ({
          id: event._id.toString(),
          title: event.title,
          date: event.date,
          location: event.location,
          image: event.image,
        }))
      }
    }

    // Get registered trips
    let registeredTrips = []
    if (user.registeredTrips && user.registeredTrips.length > 0) {
      const tripIds = user.registeredTrips.map((reg) => reg.tripId).filter(Boolean)
      if (tripIds.length > 0) {
        const trips = await Trip.find({ _id: { $in: tripIds } }).lean()
        registeredTrips = trips.map((trip) => ({
          id: trip._id.toString(),
          title: trip.title,
          date: trip.date,
          location: trip.location || trip.destination,
          image: trip.image,
        }))
      }
    }

    // Get interview submissions
    let submittedInterviews = []
    if (user.interviewSubmissions && user.interviewSubmissions.length > 0) {
      const interviewIds = user.interviewSubmissions.map((sub) => sub.interviewId).filter(Boolean)
      if (interviewIds.length > 0) {
        const interviews = await Interview.find({ _id: { $in: interviewIds } }).lean()
        submittedInterviews = interviews.map((interview) => ({
          id: interview._id.toString(),
          title: interview.title,
          date: interview.date,
          company: interview.company,
          location: interview.location,
          image: interview.image,
        }))
      }
    }

    // Get query count
    const queryCount = await Query.countDocuments({ userId: user._id })

    // Get available events, trips, and interviews
    const [availableEvents, availableTrips, availableInterviews] = await Promise.all([
      Event.find({ isPublished: true }).sort({ date: 1 }).limit(6).lean(),
      Trip.find({ isPublished: true }).sort({ date: 1 }).limit(6).lean(),
      Interview.find({ isPublished: true }).sort({ date: 1 }).limit(6).lean(),
    ])

    console.log(`GET /api/user/dashboard - Successfully fetched data for user ${user._id}`)
    console.log(
      `Available events: ${availableEvents.length}, trips: ${availableTrips.length}, interviews: ${availableInterviews.length}`,
    )

    return NextResponse.json({
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
      stats: {
        events: registeredEvents.length,
        trips: registeredTrips.length,
        interviews: submittedInterviews.length,
        queries: queryCount,
      },
      registeredEvents,
      registeredTrips,
      submittedInterviews,
      availableEvents,
      availableTrips,
      availableInterviews,
    })
  } catch (error) {
    console.error("Error fetching user dashboard data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch dashboard data" },
      { status: 500 },
    )
  }
}
