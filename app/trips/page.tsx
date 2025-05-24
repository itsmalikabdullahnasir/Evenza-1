"use client"

import { useState, useEffect } from "react"
import { TripCard } from "@/components/trip-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import SharedBackground from "@/components/shared-background"

export default function TripsPage() {
  const [trips, setTrips] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchTrips = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/trips?upcoming=true`
        console.log("Fetching trips from:", apiUrl)

        const response = await fetch(apiUrl, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch trips")
        }

        const data = await response.json()
        console.log("Trips data:", data)

        // Ensure we have an array of trips
        if (Array.isArray(data.trips)) {
          setTrips(data.trips)
        } else if (Array.isArray(data)) {
          setTrips(data)
        } else {
          console.warn("Unexpected trips data format:", data)
          setTrips([])
        }
      } catch (error) {
        console.error("Error fetching trips:", error)
        setError(error.message)

        // Fallback to mock data
        setTrips([
          {
            _id: "1",
            title: "Mountain Retreat",
            description: "A 3-day retreat in the mountains with hiking, meditation, and team-building activities.",
            date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Blue Ridge Mountains",
            price: 299,
            image: "/placeholder.svg?height=300&width=500&text=Mountain Retreat",
            maxParticipants: 20,
            participants: 12,
          },
          {
            _id: "2",
            title: "Beach Getaway",
            description: "Enjoy a weekend at the beach with surfing lessons, beach volleyball, and bonfire nights.",
            date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Coastal Shores",
            price: 249,
            image: "/placeholder.svg?height=300&width=500&text=Beach Getaway",
            maxParticipants: 30,
            participants: 15,
          },
          {
            _id: "3",
            title: "City Explorer",
            description: "Discover the hidden gems of the city with guided tours, museum visits, and local cuisine.",
            date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Metropolitan City",
            price: 199,
            image: "/placeholder.svg?height=300&width=500&text=City Explorer",
            maxParticipants: 25,
            participants: 15,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrips()
  }, [])

  return (
    <SharedBackground overlay="light">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">Upcoming Trips</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Explore exciting destinations and create unforgettable memories with our carefully curated trips.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        ) : trips && trips.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip) => (
              <TripCard key={trip._id || trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">No trips found</h3>
            <p className="text-white/80">Check back later for upcoming trips.</p>
          </div>
        )}
      </div>
    </SharedBackground>
  )
}
