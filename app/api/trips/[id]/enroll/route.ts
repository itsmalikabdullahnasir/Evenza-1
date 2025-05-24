import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/db"
import Trip from "@/models/Trip"
import User from "@/models/User"
import Payment from "@/models/Payment"
import { verifyToken } from "@/lib/server-utils"
import { logActivity, ActivityType } from "@/lib/activity-logger"
import { isValidObjectId } from "mongoose"

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
  NOT_REQUIRED = "not_required",
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params?.id

    if (!tripId) {
      console.error("Trip ID is undefined in params")
      return NextResponse.json({ error: "Trip ID is required" }, { status: 400 })
    }

    console.log(`POST /api/trips/${tripId}/enroll - Starting`)

    // Verify authentication
    const tokenData = await verifyToken(req)
    if (!tokenData) {
      console.log(`POST /api/trips/${tripId}/enroll - Unauthorized access attempt`)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Validate ID format
    if (!isValidObjectId(tripId)) {
      console.error(`Invalid trip ID format: ${tripId}`)
      return NextResponse.json({ error: "Invalid trip ID format" }, { status: 400 })
    }

    const { emergencyContact, specialRequirements } = await req.json()

    await connectToDatabase()

    // Find trip
    const trip = await Trip.findById(tripId)
    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 })
    }

    // Find user
    const user = await User.findById(tokenData.id)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // Ensure participants is an array
    if (!Array.isArray(trip.participants)) {
      console.log("Participants is not an array, initializing it")
      trip.participants = []
    }

    // Check if trip is full
    if (trip.spots && trip.participants.length >= trip.spots) {
      return NextResponse.json({ error: "Trip is full" }, { status: 400 })
    }

    // Check if user is already enrolled
    const isAlreadyEnrolled = trip.participants.some(
      (participant) => participant.userId && participant.userId.toString() === user._id.toString(),
    )

    if (isAlreadyEnrolled) {
      return NextResponse.json({ error: "You are already enrolled in this trip" }, { status: 400 })
    }

    // Create enrollment
    const enrollment = {
      userId: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone || "",
      enrolledAt: new Date(),
      paymentStatus: trip.price > 0 ? PaymentStatus.PENDING : PaymentStatus.NOT_REQUIRED,
      emergencyContact: emergencyContact || "",
      specialRequirements: specialRequirements || "",
    }

    // Add enrollment to trip
    trip.participants.push(enrollment)

    // Update enrollment count
    trip.enrollments = (trip.enrollments || 0) + 1

    await trip.save()

    // Initialize registeredTrips array if it doesn't exist
    if (!Array.isArray(user.registeredTrips)) {
      user.registeredTrips = []
    }

    // Add trip to user's registered trips
    user.registeredTrips.push({
      tripId: trip._id,
      enrolledAt: new Date(),
      paymentStatus: trip.price > 0 ? PaymentStatus.PENDING : PaymentStatus.NOT_REQUIRED,
    })

    await user.save()

    // Create payment record if payment is required
    if (trip.price > 0) {
      const payment = new Payment({
        userId: user._id,
        type: "trip",
        relatedId: trip._id,
        amount: trip.price,
        status: PaymentStatus.PENDING,
        createdAt: new Date(),
      })

      await payment.save()
    }

    // Log activity
    await logActivity({
      userId: user._id,
      type: ActivityType.TRIP_ENROLLED,
      description: `User enrolled in trip: ${trip.title}`,
      metadata: {
        tripId: trip._id.toString(),
        tripTitle: trip.title,
      },
    }).catch((err) => console.error("Failed to log activity:", err))

    console.log(`POST /api/trips/${tripId}/enroll - Successfully enrolled user ${user._id} in trip ${trip._id}`)

    return NextResponse.json({
      success: true,
      message: "Successfully enrolled in trip",
    })
  } catch (error) {
    console.error("Error enrolling in trip:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to enroll in trip" },
      { status: 500 },
    )
  }
}
