"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, DollarSign } from "lucide-react"
import SharedBackground from "@/components/shared-background"

export default function HomePage() {
  const [featuredEvents, setFeaturedEvents] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/events?featured=true&limit=3`)

        if (response.ok) {
          const data = await response.json()
          if (Array.isArray(data.events)) {
            setFeaturedEvents(data.events)
          } else if (Array.isArray(data)) {
            setFeaturedEvents(data)
          } else {
            setFeaturedEvents([])
          }
        } else {
          setFeaturedEvents([])
        }
      } catch (error) {
        console.error("Error fetching featured events:", error)
        setFeaturedEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedEvents()
  }, [])

  return (
    <div className="relative min-h-screen">
      <SharedBackground overlay="dark">
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 animate-fade-in">
              Discover Amazing Events & Opportunities
            </h1>
            <p className="text-xl text-white/80 mb-8 animate-fade-in-delay">
              Join our community and explore exciting events, trips, and career opportunities.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-fade-in-delay-2">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                <Link href="/events">Explore Events</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
                <Link href="/register">Join Now</Link>
              </Button>
            </div>
          </div>

          {!isLoading && featuredEvents.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-8">Featured Events</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredEvents.map((event) => (
                  <Card
                    key={event._id || event.id}
                    className="bg-white/10 backdrop-blur-md border-none overflow-hidden hover:shadow-lg transition-all duration-300 group"
                  >
                    <div className="h-48 bg-gray-200 relative overflow-hidden">
                      <div
                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                        style={{ backgroundImage: `url(${event.image || "/placeholder.svg?height=300&width=500"})` }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-4 left-4">
                        <Badge className="bg-blue-600">{event.category}</Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                        {event.title}
                      </h3>
                      <p className="text-white/70 text-sm mb-4 line-clamp-2">{event.description}</p>
                      <div className="grid grid-cols-2 gap-2 mb-4">
                        <div className="flex items-center text-white/70 text-sm">
                          <Calendar className="h-4 w-4 mr-2 text-blue-400" />
                          <span>{new Date(event.date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <MapPin className="h-4 w-4 mr-2 text-blue-400" />
                          <span>{event.location}</span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <Users className="h-4 w-4 mr-2 text-blue-400" />
                          <span>
                            {event.attendees}/{event.maxAttendees}
                          </span>
                        </div>
                        <div className="flex items-center text-white/70 text-sm">
                          <DollarSign className="h-4 w-4 mr-2 text-blue-400" />
                          <span>${event.price}</span>
                        </div>
                      </div>
                      <Button
                        asChild
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                      >
                        <Link href={`/events/${event._id || event.id}`}>View Details</Link>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="text-center mt-8">
                <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
                  <Link href="/events">View All Events</Link>
                </Button>
              </div>
            </div>
          )}

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Calendar className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Events</h3>
              <p className="text-white/70 mb-4">Discover and participate in exciting events happening around you.</p>
              <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
                <Link href="/events">Browse Events</Link>
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Trips</h3>
              <p className="text-white/70 mb-4">Explore exciting destinations and create unforgettable memories.</p>
              <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
                <Link href="/trips">Explore Trips</Link>
              </Button>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-6 rounded-lg text-center hover:bg-white/20 transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Interviews</h3>
              <p className="text-white/70 mb-4">Register for career interviews with top companies and organizations.</p>
              <Button asChild variant="outline" className="text-white border-white hover:bg-white/10">
                <Link href="/interviews">View Opportunities</Link>
              </Button>
            </div>
          </div>
        </div>
      </SharedBackground>
    </div>
  )
}
