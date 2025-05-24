import type { Metadata } from "next"
import { MediaGallery } from "@/components/media-gallery"

export const metadata: Metadata = {
  title: "Media Gallery - Evenza",
  description: "Browse photos and videos from our past events and trips",
}

// This would typically come from a database
const galleryItems = [
  {
    id: 1,
    title: "Mountain Retreat 2024",
    description: "Highlights from our annual mountain retreat",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Mountain Retreat",
    category: "trips",
  },
  {
    id: 2,
    title: "Tech Conference",
    description: "Our members at the annual tech conference",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Tech Conference",
    category: "events",
  },
  {
    id: 3,
    title: "Beach Cleanup",
    description: "Volunteering for the annual beach cleanup",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Beach Cleanup",
    category: "community",
  },
  {
    id: 4,
    title: "Leadership Workshop",
    description: "Learning leadership skills at our workshop",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Leadership Workshop",
    category: "events",
  },
  {
    id: 5,
    title: "City Explorer Tour",
    description: "Exploring the hidden gems of the city",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=City Explorer",
    category: "trips",
  },
  {
    id: 6,
    title: "Networking Night",
    description: "Making connections at our networking event",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Networking Night",
    category: "events",
  },
  {
    id: 7,
    title: "Hiking Adventure",
    description: "Conquering trails on our hiking trip",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Hiking Adventure",
    category: "trips",
  },
  {
    id: 8,
    title: "Charity Fundraiser",
    description: "Raising funds for local charities",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Charity Fundraiser",
    category: "community",
  },
  {
    id: 9,
    title: "Cultural Festival",
    description: "Celebrating diversity at our cultural festival",
    type: "image",
    url: "/placeholder.svg?height=600&width=800&text=Cultural Festival",
    category: "events",
  },
]

export default function GalleryPage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Media Gallery</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse photos from our past events, trips, and community activities.
        </p>
      </div>

      <MediaGallery items={galleryItems} />
    </div>
  )
}
