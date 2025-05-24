"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"

interface TripProps {
  id: number
  title: string
  description: string
  date: string
  location: string
  price: number
  image: string
  spots: number
  spotsLeft: number
}

export function TripCard({ trip }: { trip: TripProps }) {
  const [isHovered, setIsHovered] = useState(false)

  const availability = (trip.spotsLeft / trip.spots) * 100
  let availabilityColor = "bg-green-500"

  if (availability <= 20) {
    availabilityColor = "bg-red-500"
  } else if (availability <= 50) {
    availabilityColor = "bg-yellow-500"
  }

  return (
    <Card className="overflow-hidden">
      <div
        className="relative h-48 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <img
          src={trip.image || "/placeholder.svg"}
          alt={trip.title}
          className={`w-full h-full object-cover transition-transform duration-500 ${isHovered ? "scale-110" : "scale-100"}`}
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="font-semibold">
            ${trip.price}
          </Badge>
        </div>
      </div>
      <CardHeader>
        <CardTitle>{trip.title}</CardTitle>
        <CardDescription>{trip.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{trip.date}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{trip.location}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>
              {trip.spotsLeft} spots left out of {trip.spots}
            </span>
          </div>
          <div className="mt-2">
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${availabilityColor}`}
                style={{ width: `${(trip.spotsLeft / trip.spots) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/trips/${trip.id}/enroll`}>Enroll Now</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
