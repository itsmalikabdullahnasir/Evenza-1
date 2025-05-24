"use client"

import { useState, useEffect } from "react"
import { EventCard } from "@/components/event-card"
import { EventsFilter } from "@/components/events-filter"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import SharedBackground from "@/components/shared-background"

export default function EventsPage() {
  const [events, setEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    upcoming: true,
  })

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Build query string from filters
        const queryParams = new URLSearchParams()
        if (filters.search) queryParams.append("search", filters.search)
        if (filters.category) queryParams.append("category", filters.category)
        if (filters.upcoming) queryParams.append("upcoming", "true")

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/events?${queryParams.toString()}`
        console.log("Fetching events from:", apiUrl)

        const response = await fetch(apiUrl, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch events")
        }

        const data = await response.json()
        console.log("Events data:", data)

        // Ensure we have an array of events
        if (Array.isArray(data.events)) {
          setEvents(data.events)
        } else if (Array.isArray(data)) {
          setEvents(data)
        } else {
          console.warn("Unexpected events data format:", data)
          setEvents([])
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        setError(error.message)

        // Fallback to mock data
        setEvents([
          {
            _id: "1",
            title: "Tech Conference 2025",
            description:
              "Join us for the biggest tech conference of the year with speakers from leading tech companies.",
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Convention Center",
            category: "Technology",
            image: "/placeholder.svg?height=300&width=500&text=Tech Conference",
            price: 99,
            maxAttendees: 500,
            attendees: 350,
          },
          {
            _id: "2",
            title: "Music Festival",
            description: "A weekend of amazing music performances from top artists across multiple genres.",
            date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            location: "City Park",
            category: "Entertainment",
            image: "/placeholder.svg?height=300&width=500&text=Music Festival",
            price: 149,
            maxAttendees: 2000,
            attendees: 1200,
          },
          {
            _id: "3",
            title: "Career Fair",
            description: "Connect with employers from various industries and explore job opportunities.",
            date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
            location: "University Campus",
            category: "Career",
            image: "/placeholder.svg?height=300&width=500&text=Career Fair",
            price: 0,
            maxAttendees: 1000,
            attendees: 500,
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [filters])

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <SharedBackground overlay="light">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">Upcoming Events</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Discover and register for exciting events happening around you.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 mb-8">
          <EventsFilter onFilterChange={handleFilterChange} />
        </div>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
            {events.map((event) => (
              <EventCard key={event._id || event.id} event={event} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">No events found</h3>
            <p className="text-white/80">Try adjusting your filters or check back later for new events.</p>
          </div>
        )}
      </div>
    </SharedBackground>
  )
}
