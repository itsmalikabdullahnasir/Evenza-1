import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Users } from "lucide-react"

interface EventProps {
  id: number
  title: string
  description: string
  date: string
  time: string
  location: string
  category: string
  image: string
  isFeatured: boolean
  price: number
  attendees: number
  maxAttendees: number
}

export function EventCard({ event }: { event: EventProps }) {
  const availability = (event.attendees / event.maxAttendees) * 100
  let availabilityColor = "bg-green-500"

  if (availability >= 90) {
    availabilityColor = "bg-red-500"
  } else if (availability >= 70) {
    availabilityColor = "bg-yellow-500"
  }

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        <img src={event.image || "/placeholder.svg"} alt={event.title} className="w-full h-full object-cover" />
        {event.isFeatured && (
          <div className="absolute top-3 left-3">
            <Badge className="bg-primary">Featured</Badge>
          </div>
        )}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-semibold">
            {event.price === 0 ? "Free" : `$${event.price}`}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge variant="outline" className="text-xs">
            {event.category}
          </Badge>
        </div>
        <CardTitle className="mt-2">{event.title}</CardTitle>
        <CardDescription>{event.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.date}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event.attendees} attending</span>
          </div>
          <div className="mt-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${availabilityColor}`}
                style={{ width: `${(event.attendees / event.maxAttendees) * 100}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{event.maxAttendees - event.attendees} spots left</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/events/${event.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
