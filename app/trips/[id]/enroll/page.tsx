import type { Metadata } from "next"
import { TripEnrollmentForm } from "@/components/trip-enrollment-form"
import { connectToDatabase } from "@/lib/db"
import Trip from "@/models/Trip"
import { isValidObjectId } from "mongoose"

export const metadata: Metadata = {
  title: "Trip Enrollment - Evenza",
  description: "Enroll in an exciting trip",
}

// Get trip details from database
async function getTripDetails(id: string) {
  try {
    if (!id) {
      console.error("Trip ID is undefined")
      return null
    }

    await connectToDatabase()

    // Validate ID format
    if (!isValidObjectId(id)) {
      console.error("Invalid trip ID format:", id)
      return null
    }

    const trip = await Trip.findById(id).lean()

    if (!trip) {
      console.error("Trip not found:", id)
      return null
    }

    // Format trip for frontend
    return {
      id: trip._id.toString(),
      title: trip.title,
      description: trip.description,
      date: trip.date,
      location: trip.location,
      price: trip.price || 0,
      image: trip.image || "/placeholder.svg?height=300&width=500&text=Trip",
      spots: trip.spots,
      spotsLeft: trip.spots - (trip.enrollments || 0),
    }
  } catch (error) {
    console.error("Error fetching trip details:", error)
    return null
  }
}

// Fallback trip data
const fallbackTrip = {
  id: "1",
  title: "Mountain Retreat",
  description: "A 3-day retreat in the mountains with hiking, meditation, and team-building activities.",
  date: "April 15-18, 2025",
  location: "Blue Ridge Mountains",
  price: 299,
  image: "/placeholder.svg?height=300&width=500&text=Mountain Retreat",
  spots: 20,
  spotsLeft: 8,
}

export default async function TripEnrollmentPage({ params }: { params: { id: string } }) {
  const tripId = params?.id

  if (!tripId) {
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Trip Not Found</h1>
          <p className="mb-6">The trip you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/trips">Back to Trips</Link>
          </Button>
        </div>
      </div>
    )
  }

  const tripData = await getTripDetails(tripId)
  const trip = tripData || fallbackTrip

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/2">
            <img
              src={trip.image || "/placeholder.svg"}
              alt={trip.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-4">{trip.title}</h1>
            <p className="text-muted-foreground mb-4">{trip.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <span className="font-semibold mr-2">Date:</span>
                <span>{trip.date}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Location:</span>
                <span>{trip.location}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Price:</span>
                <span>${trip.price}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Availability:</span>
                <span>
                  {trip.spotsLeft} spots left out of {trip.spots}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Enrollment Form</h2>
          <TripEnrollmentForm tripId={trip.id} tripPrice={trip.price} />
        </div>
      </div>
    </div>
  )
}

// Helper components
import { Button } from "@/components/ui/button"
import Link from "next/link"
