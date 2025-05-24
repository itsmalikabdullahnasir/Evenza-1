import type { Metadata } from "next"
import { MediaUploadForm } from "@/components/media-upload-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Upload Media - Evenza",
  description: "Upload photos and videos to the Evenza gallery",
}

export default function MediaUploadPage() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center text-center mb-12">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">Upload Media</h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Share your photos and videos from Evenza events and trips with the community.
        </p>
      </div>

      <div className="max-w-3xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload to Gallery</CardTitle>
            <CardDescription>Upload images or videos to share with the Evenza community</CardDescription>
          </CardHeader>
          <CardContent>
            <MediaUploadForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
