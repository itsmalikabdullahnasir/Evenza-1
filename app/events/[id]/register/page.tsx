import type { Metadata } from "next"
import Link from "next/link"
import { EventRegistrationForm } from "@/components/event-registration-form"
import { ChevronLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Event Registration - Evenza",
  description: "Register for an event",
}

// This would typically come from a database
// TODO: Replace with actual database query
const getEventDetails = async (id: string) => {
  // In a real implementation, you would fetch this from your MongoDB database
  // Example:
  // await connectToDatabase();
  // const event = await Event.findById(id);

  const events = [
    {
      id: "1",
      title: "Tech Innovation Summit",
      description: "Join industry leaders to explore the latest technological innovations and future trends.",
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
    },
    {
      id: "2",
      title: "Business Networking Mixer",
      description: "Connect with professionals from various industries in a relaxed setting.",
      date: "April 22, 2025",
      time: "6:00 PM - 9:00 PM",
      location: "Urban Lounge",
      address: "456 Business Avenue, Financial District, City",
      category: "Networking",
      image: "/placeholder.svg?height=600&width=1200&text=Networking",
      isFeatured: false,
      price: 25,
      attendees: 45,
      maxAttendees: 100,
      organizer: "Evenza Business Network",
    },
  ]

  return events.find((event) => event.id === id) || events[0]
}

interface EventRegistrationPageProps {
  params: {
    id: string
  }
}

export default async function EventRegistrationPage({ params }: EventRegistrationPageProps) {
  const eventId = params?.id || ""
  const event = await getEventDetails(eventId)

  return (
    <div className="container py-12">
      <div className="mb-6">
        <Link
          href={`/events/${eventId}`}
          className="flex items-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          <span>Back to Event Details</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/2">
            <img
              src={event.image || "/placeholder.svg"}
              alt={event.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
            <p className="text-muted-foreground mb-4">{event.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <span className="font-semibold mr-2">Date:</span>
                <span>{event.date}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Time:</span>
                <span>{event.time}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Location:</span>
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Price:</span>
                <span>${event.price}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Registration Form</h2>
          <EventRegistrationForm eventId={eventId} eventPrice={event.price} requiresPayment={event.price > 0} />
        </div>
      </div>
    </div>
  )
}
