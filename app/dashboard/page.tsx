"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Clock, Bookmark, Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import SharedBackground from "@/components/shared-background"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"

export default function DashboardPage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const router = useRouter()
  const [userData, setUserData] = useState({
    user: { name: "", email: "" },
    stats: { events: 0, trips: 0, interviews: 0, queries: 0 },
    registeredEvents: [],
    registeredTrips: [],
    submittedInterviews: [],
    availableEvents: [],
    availableTrips: [],
    availableInterviews: [],
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const token = getAuthToken()
        if (!token) {
          throw new Error("No authentication token found")
        }

        console.log("Fetching dashboard data with token:", token.substring(0, 10) + "...")

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/user/dashboard`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch dashboard data")
        }

        const data = await response.json()
        console.log("Dashboard data fetched successfully:", data)
        setUserData(data)
      } catch (error) {
        console.error("Error fetching user data:", error)
        setError("Failed to load dashboard data. Please try again later.")
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to load dashboard data",
          variant: "destructive",
        })

        // Set mock data for better UX
        setUserData({
          user: { name: user?.name || "User", email: user?.email || "user@example.com" },
          stats: { events: 0, trips: 0, interviews: 0, queries: 0 },
          registeredEvents: [],
          registeredTrips: [],
          submittedInterviews: [],
          availableEvents: [],
          availableTrips: [],
          availableInterviews: [],
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchUserData()
    }

    // Also fetch available events, trips, and interviews
    const fetchAvailableData = async () => {
      try {
        const [eventsRes, tripsRes, interviewsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/events`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/trips`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/interviews`),
        ])

        const [eventsData, tripsData, interviewsData] = await Promise.all([
          eventsRes.ok ? eventsRes.json() : { events: [] },
          tripsRes.ok ? tripsRes.json() : { trips: [] },
          interviewsRes.ok ? interviewsRes.json() : { interviews: [] },
        ])

        setUserData((prev) => ({
          ...prev,
          availableEvents: Array.isArray(eventsData.events)
            ? eventsData.events
            : Array.isArray(eventsData)
              ? eventsData
              : [],
          availableTrips: Array.isArray(tripsData.trips) ? tripsData.trips : Array.isArray(tripsData) ? tripsData : [],
          availableInterviews: Array.isArray(interviewsData.interviews)
            ? interviewsData.interviews
            : Array.isArray(interviewsData)
              ? interviewsData
              : [],
        }))
      } catch (error) {
        console.error("Error fetching available data:", error)
      }
    }

    fetchAvailableData()
  }, [user, authLoading, router, getAuthToken])

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  // Use optional chaining to safely access properties
  const displayName = userData?.user?.name || user?.name || "User"

  return (
    <div className="relative min-h-screen">
      <SharedBackground overlay="dark">
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">Welcome, {displayName}</h1>
            <p className="text-white/70">Manage your events, trips, and interviews</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white/10 backdrop-blur-md border-none text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Registered Events</p>
                    <h3 className="text-3xl font-bold">{userData?.stats?.events || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-none text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Enrolled Trips</p>
                    <h3 className="text-3xl font-bold">{userData?.stats?.trips || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-none text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Interviews</p>
                    <h3 className="text-3xl font-bold">{userData?.stats?.interviews || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-md border-none text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-white/70">Queries</p>
                    <h3 className="text-3xl font-bold">{userData?.stats?.queries || 0}</h3>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="registered" className="w-full">
            <TabsList className="bg-white/10 backdrop-blur-md border-none mb-6">
              <TabsTrigger value="registered" className="text-white data-[state=active]:bg-white/20">
                My Registrations
              </TabsTrigger>
              <TabsTrigger value="available" className="text-white data-[state=active]:bg-white/20">
                Available
              </TabsTrigger>
            </TabsList>

            <TabsContent value="registered">
              <div className="grid grid-cols-1 gap-8">
                <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Registered Events
                    </CardTitle>
                    <CardDescription className="text-white/70">Events you have registered for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData?.registeredEvents && userData.registeredEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.registeredEvents.map((event) => (
                          <Card
                            key={event.id || event._id}
                            className="bg-white/5 border-none hover:bg-white/10 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-white">{event.title}</h3>
                                  <p className="text-sm text-white/70">{new Date(event.date).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                                  Registered
                                </Badge>
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="mt-4 w-full text-white border-white/20 hover:bg-white/10"
                              >
                                <Link href={`/events/${event.id || event._id}`}>View Details</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Bookmark className="mx-auto h-12 w-12 text-white/30 mb-2" />
                        <h3 className="text-xl font-medium text-white mb-2">No registered events</h3>
                        <p className="text-white/70 mb-4">You haven't registered for any events yet.</p>
                        <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10">
                          <Link href="/events">Browse Events</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Enrolled Trips
                    </CardTitle>
                    <CardDescription className="text-white/70">Trips you have enrolled in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData?.registeredTrips && userData.registeredTrips.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.registeredTrips.map((trip) => (
                          <Card
                            key={trip.id || trip._id}
                            className="bg-white/5 border-none hover:bg-white/10 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-white">{trip.title}</h3>
                                  <p className="text-sm text-white/70">{new Date(trip.date).toLocaleDateString()}</p>
                                </div>
                                <Badge variant="outline" className="bg-green-500/20 text-green-300 border-green-500/30">
                                  Enrolled
                                </Badge>
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="mt-4 w-full text-white border-white/20 hover:bg-white/10"
                              >
                                <Link href={`/trips/${trip.id || trip._id}`}>View Details</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="mx-auto h-12 w-12 text-white/30 mb-2" />
                        <h3 className="text-xl font-medium text-white mb-2">No enrolled trips</h3>
                        <p className="text-white/70 mb-4">You haven't enrolled in any trips yet.</p>
                        <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10">
                          <Link href="/trips">Explore Trips</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Interview Submissions
                    </CardTitle>
                    <CardDescription className="text-white/70">Interviews you have submitted</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData?.submittedInterviews && userData.submittedInterviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.submittedInterviews.map((interview) => (
                          <Card
                            key={interview.id || interview._id}
                            className="bg-white/5 border-none hover:bg-white/10 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="font-medium text-white">{interview.title}</h3>
                                  <p className="text-sm text-white/70">
                                    {new Date(interview.date).toLocaleDateString()}
                                  </p>
                                </div>
                                <Badge
                                  variant="outline"
                                  className="bg-purple-500/20 text-purple-300 border-purple-500/30"
                                >
                                  Submitted
                                </Badge>
                              </div>
                              <Button
                                asChild
                                variant="outline"
                                size="sm"
                                className="mt-4 w-full text-white border-white/20 hover:bg-white/10"
                              >
                                <Link href={`/interviews/${interview.id || interview._id}`}>View Details</Link>
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-white/30 mb-2" />
                        <h3 className="text-xl font-medium text-white mb-2">No interview submissions</h3>
                        <p className="text-white/70 mb-4">You haven't submitted any interviews yet.</p>
                        <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10">
                          <Link href="/interviews">View Opportunities</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="available">
              <div className="grid grid-cols-1 gap-8">
                <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Calendar className="mr-2 h-5 w-5" />
                      Available Events
                    </CardTitle>
                    <CardDescription className="text-white/70">Upcoming events you can register for</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData?.availableEvents && userData.availableEvents.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.availableEvents.map((event) => (
                          <Card
                            key={event._id || event.id}
                            className="bg-white/5 border-none hover:bg-white/10 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col">
                                <div className="h-32 bg-gray-800 rounded-md mb-3 relative overflow-hidden">
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url(${event.image || "/placeholder.svg?height=300&width=500"})`,
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <div className="absolute bottom-2 left-2">
                                    <Badge className="bg-blue-600">{event.category}</Badge>
                                  </div>
                                </div>
                                <h3 className="font-medium text-white">{event.title}</h3>
                                <p className="text-sm text-white/70 line-clamp-2 mt-1">{event.description}</p>
                                <div className="flex items-center mt-2 text-sm text-white/70">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{new Date(event.date).toLocaleDateString()}</span>
                                  <MapPin className="h-4 w-4 ml-3 mr-1" />
                                  <span>{event.location}</span>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  className="mt-3 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                                >
                                  <Link href={`/events/${event._id || event.id}/register`}>Register Now</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="mx-auto h-12 w-12 text-white/30 mb-2" />
                        <h3 className="text-xl font-medium text-white mb-2">No events available</h3>
                        <p className="text-white/70 mb-4">There are no upcoming events at the moment.</p>
                        <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10">
                          <Link href="/events">Check Later</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Available Trips
                    </CardTitle>
                    <CardDescription className="text-white/70">Upcoming trips you can enroll in</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData?.availableTrips && userData.availableTrips.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.availableTrips.map((trip) => (
                          <Card
                            key={trip._id || trip.id}
                            className="bg-white/5 border-none hover:bg-white/10 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col">
                                <div className="h-32 bg-gray-800 rounded-md mb-3 relative overflow-hidden">
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url(${trip.image || "/placeholder.svg?height=300&width=500"})`,
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <div className="absolute bottom-2 left-2">
                                    <Badge className="bg-green-600">{trip.destination || trip.location}</Badge>
                                  </div>
                                </div>
                                <h3 className="font-medium text-white">{trip.title}</h3>
                                <p className="text-sm text-white/70 line-clamp-2 mt-1">{trip.description}</p>
                                <div className="flex items-center mt-2 text-sm text-white/70">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{new Date(trip.date).toLocaleDateString()}</span>
                                  <Star className="h-4 w-4 ml-3 mr-1" />
                                  <span>{trip.duration || "3"} days</span>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  className="mt-3 w-full bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700"
                                >
                                  <Link href={`/trips/${trip._id || trip.id}/enroll`}>Enroll Now</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <MapPin className="mx-auto h-12 w-12 text-white/30 mb-2" />
                        <h3 className="text-xl font-medium text-white mb-2">No trips available</h3>
                        <p className="text-white/70 mb-4">There are no upcoming trips at the moment.</p>
                        <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10">
                          <Link href="/trips">Check Later</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-md border-none text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="mr-2 h-5 w-5" />
                      Available Interviews
                    </CardTitle>
                    <CardDescription className="text-white/70">Upcoming interview opportunities</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {userData?.availableInterviews && userData.availableInterviews.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {userData.availableInterviews.map((interview) => (
                          <Card
                            key={interview._id || interview.id}
                            className="bg-white/5 border-none hover:bg-white/10 transition-colors"
                          >
                            <CardContent className="p-4">
                              <div className="flex flex-col">
                                <div className="h-32 bg-gray-800 rounded-md mb-3 relative overflow-hidden">
                                  <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{
                                      backgroundImage: `url(${
                                        interview.image || "/placeholder.svg?height=300&width=500"
                                      })`,
                                    }}
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                  <div className="absolute bottom-2 left-2">
                                    <Badge className="bg-purple-600">{interview.company}</Badge>
                                  </div>
                                </div>
                                <h3 className="font-medium text-white">{interview.title}</h3>
                                <p className="text-sm text-white/70 line-clamp-2 mt-1">{interview.description}</p>
                                <div className="flex items-center mt-2 text-sm text-white/70">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  <span>{new Date(interview.date).toLocaleDateString()}</span>
                                  <Clock className="h-4 w-4 ml-3 mr-1" />
                                  <span>{interview.duration || "60"} min</span>
                                </div>
                                <Button
                                  asChild
                                  size="sm"
                                  className="mt-3 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                                >
                                  <Link href={`/interviews/${interview._id || interview.id}/register`}>Apply Now</Link>
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Users className="mx-auto h-12 w-12 text-white/30 mb-2" />
                        <h3 className="text-xl font-medium text-white mb-2">No interviews available</h3>
                        <p className="text-white/70 mb-4">
                          There are no upcoming interview opportunities at the moment.
                        </p>
                        <Button asChild variant="outline" className="text-white border-white/20 hover:bg-white/10">
                          <Link href="/interviews">Check Later</Link>
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </SharedBackground>
    </div>
  )
}
