import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, MapPin, Users, Share2, Heart, ChevronLeft } from "lucide-react"
import { EventRegistrationForm } from "@/components/event-registration-form"
import { connectToDatabase } from "@/lib/db"
import Event from "@/models/Event"
import { isValidObjectId } from "mongoose"

export const metadata: Metadata = {
  title: "Event Details - Evenza",
  description: "View event details and register",
}

// Get event details from database
async function getEventDetails(id: string) {
  try {
    if (!id) {
      console.error("Event ID is undefined")
      return null
    }

    await connectToDatabase()

    // Validate ID format
    if (!isValidObjectId(id)) {
      console.error("Invalid event ID format:", id)
      return null
    }

    const event = await Event.findById(id).lean()

    if (!event) {
      console.error("Event not found:", id)
      return null
    }

    // Format event for frontend
    return {
      id: event._id.toString(),
      title: event.title,
      description: event.description,
      longDescription: event.longDescription || `<p>${event.description}</p>`,
      date: event.date,
      time: event.time,
      location: event.location,
      address: event.address || event.location,
      category: event.category,
      image: event.image || "/placeholder.svg?height=600&width=1200&text=Event",
      isFeatured: event.isFeatured || false,
      price: event.price || 0,
      attendees: event.attendees?.length || 0,
      maxAttendees: event.maxAttendees,
      organizer: event.organizer || "Evenza",
      contactEmail: event.contactEmail || "contact@evenza.com",
      contactPhone: event.contactPhone || "+1 (555) 123-4567",
    }
  } catch (error) {
    console.error("Error fetching event details:", error)
    return null
  }
}

// Fallback event data
const fallbackEvent = {
  id: "1",
  title: "Tech Innovation Summit",
  description:
    "Join industry leaders to explore the latest technological innovations and future trends. This full-day summit features keynote speakers, panel discussions, and networking opportunities with professionals from various tech sectors.",
  longDescription: `
    <p>The Tech Innovation Summit brings together thought leaders, innovators, and tech enthusiasts for a day of learning, networking, and inspiration.</p>
    
    <h3>What to Expect:</h3>
    <ul>
      <li>Keynote presentations from industry pioneers</li>
      <li>Panel discussions on emerging technologies</li>
      <li>Hands-on demonstrations of cutting-edge products</li>
      <li>Networking sessions with like-minded professionals</li>
      <li>Exhibition area featuring innovative startups</li>
    </ul>
    
    <h3>Featured Speakers:</h3>
    <ul>
      <li>Jane Smith - CTO of TechGiant Inc.</li>
      <li>John Doe - AI Research Lead at Future Labs</li>
      <li>Sarah Johnson - Founder of InnovateTech</li>
      <li>Michael Brown - Blockchain Specialist</li>
    </ul>
    
    <h3>Schedule:</h3>
    <p>9:00 AM - Registration and Welcome Coffee</p>
    <p>10:00 AM - Opening Keynote</p>
    <p>11:30 AM - Panel Discussion: The Future of AI</p>
    <p>1:00 PM - Lunch Break</p>
    <p>2:00 PM - Breakout Sessions</p>
    <p>3:30 PM - Networking Hour</p>
    <p>4:30 PM - Closing Keynote</p>
    <p>5:00 PM - Wrap-up and Farewell</p>
  `,
  date: "April 15, 2025",
  time: "9:00 AM - 5:00 PM",
  location: "Grand Conference Center",
  address: "123 Main Street, Downtown, City",
  category: "Technology",
  image: "/placeholder.svg?height=600&width=1200&text=Tech Summit",
  isFeatured: true,
  price: 99,
  attendees: 120,
  maxAttendees: 200,
  organizer: "Evenza Tech Division",
  contactEmail: "tech@evenza.com",
  contactPhone: "+1 (555) 123-4567",
}

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  // Get event details from database or use fallback
  const eventId = params?.id

  if (!eventId) {
    console.error("Event ID is undefined in params")
    return (
      <div className="container py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="mb-6">The event you're looking for could not be found.</p>
          <Button asChild>
            <Link href="/events">Back to Events</Link>
          </Button>
        </div>
      </div>
    )
  }

  const eventData = await getEventDetails(eventId)
  const event = eventData || fallbackEvent

  return (
    <div className="container py-12">
      <div className="mb-6">
        <Link
          href="/events"
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Events</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="relative">
              <img
                src={event.image || "/placeholder.svg"}
                alt={event.title}
                className="w-full h-[400px] object-cover rounded-lg"
              />
              <div className="absolute top-4 left-4 flex space-x-2">
                <Badge className="bg-primary">{event.category}</Badge>
                {event.isFeatured && <Badge variant="secondary">Featured</Badge>}
              </div>
            </div>

            <div>
              <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
              <p className="text-lg text-muted-foreground mb-4">{event.description}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-muted-foreground">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-muted-foreground">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{event.location}</p>
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-muted-foreground">
                      {event.attendees} attending ({event.maxAttendees - event.attendees} spots left)
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mb-8">
                <Button variant="outline" size="sm" className="flex items-center">
                  <Heart className="h-4 w-4 mr-1" />
                  <span>Save</span>
                </Button>
                <Button variant="outline" size="sm" className="flex items-center">
                  <Share2 className="h-4 w-4 mr-1" />
                  <span>Share</span>
                </Button>
              </div>
            </div>

            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="organizer">Organizer</TabsTrigger>
                <TabsTrigger value="location">Location</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-6">
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: event.longDescription }} />
              </TabsContent>
              <TabsContent value="organizer" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">About the Organizer</h3>
                  <p>{event.organizer}</p>

                  <h4 className="text-lg font-medium">Contact Information</h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Email:</span> {event.contactEmail}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span> {event.contactPhone}
                    </p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="location" className="mt-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">Event Location</h3>
                  <p>{event.location}</p>
                  <p>{event.address}</p>

                  <div className="aspect-video bg-muted rounded-md overflow-hidden">
                    <img
                      src="/placeholder.svg?height=400&width=800&text=Map"
                      alt="Event location map"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div>
                    <h4 className="text-lg font-medium mb-2">Directions</h4>
                    <p>Detailed directions and transportation options will be sent to registered attendees.</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div>
          <div className="sticky top-24">
            <div className="bg-card border rounded-lg overflow-hidden shadow-sm">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Register for this Event</h2>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium">Price</span>
                    <span className="text-xl font-bold">{event.price === 0 ? "Free" : `$${event.price}`}</span>
                  </div>

                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden mb-2">
                    <div
                      className={`h-full ${event.attendees / event.maxAttendees > 0.8 ? "bg-red-500" : "bg-green-500"}`}
                      style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {event.maxAttendees - event.attendees} spots left out of {event.maxAttendees}
                  </p>
                </div>

                <EventRegistrationForm eventId={event.id} eventPrice={event.price} requiresPayment={event.price > 0} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
