"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2, Upload, Check, AlertCircle } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().optional(),
  type: z.enum(["image", "video"], {
    required_error: "Please select a media type.",
  }),
  category: z.string({
    required_error: "Please select a category.",
  }),
  relatedEvent: z.string().optional(),
  relatedTrip: z.string().optional(),
})

export function MediaUploadForm() {
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "image",
      category: "",
    },
  })

  const mediaType = form.watch("type")

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null
    setFile(selectedFile)
    setFileError(null)
    setUploadedUrl(null)
  }

  const validateFile = (file: File, type: string): boolean => {
    // Check file type
    const allowedTypes = {
      image: ["image/jpeg", "image/png", "image/gif"],
      video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
    }

    if (!allowedTypes[type as keyof typeof allowedTypes].includes(file.type)) {
      setFileError(`Please upload a valid ${type} file`)
      return false
    }

    // Check file size (max 5MB for images, 50MB for videos)
    const maxSize = type === "image" ? 5 * 1024 * 1024 : 50 * 1024 * 1024
    if (file.size > maxSize) {
      setFileError(`File size must be less than ${type === "image" ? "5MB" : "50MB"}`)
      return false
    }

    return true
  }

  const handleUpload = async () => {
    if (!file) {
      setFileError("Please select a file to upload")
      return
    }

    const type = form.getValues("type")
    if (!validateFile(file, type)) {
      return
    }

    setIsUploading(true)
    setFileError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("type", type)
      formData.append("folder", "media-gallery")

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upload file")
      }

      const data = await response.json()
      setUploadedUrl(data.url)

      toast({
        title: "Upload successful",
        description: "Your media file has been uploaded successfully.",
      })
    } catch (error) {
      console.error("Error uploading file:", error)
      setFileError(error instanceof Error ? error.message : "Failed to upload file")

      toast({
        title: "Upload failed",
        description: "There was an error uploading your media file.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!uploadedUrl) {
      setFileError("Please upload a file first")
      return
    }

    setIsSubmitting(true)

    try {
      // TODO: Replace with actual user ID from authentication
      const uploadedById = "placeholder-user-id"

      const response = await fetch("/api/media", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          url: uploadedUrl,
          uploadedBy: uploadedById,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save media")
      }

      toast({
        title: "Media saved successfully",
        description: "Your media has been added to the gallery.",
      })

      router.push("/gallery")
    } catch (error) {
      console.error("Error saving media:", error)

      toast({
        title: "Failed to save media",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Upload Media File</h3>

        <div className="space-y-2">
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Media Type</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value)
                    // Reset file when type changes
                    setFile(null)
                    setUploadedUrl(null)
                    setFileError(null)
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select media type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>Select the type of media you want to upload</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Label htmlFor="media-file">Upload {mediaType === "image" ? "Image" : "Video"} File</Label>
            <Input
              id="media-file"
              type="file"
              accept={mediaType === "image" ? "image/*" : "video/*"}
              onChange={handleFileChange}
              disabled={isUploading}
            />
            {fileError && (
              <div className="flex items-center text-destructive text-sm mt-1">
                <AlertCircle className="h-4 w-4 mr-1" />
                <span>{fileError}</span>
              </div>
            )}
          </div>

          <Button
            onClick={handleUpload}
            disabled={!file || isUploading || !!uploadedUrl}
            variant="outline"
            className="w-full"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : uploadedUrl ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Uploaded
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </>
            )}
          </Button>

          {uploadedUrl && mediaType === "image" && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <img
                src={uploadedUrl || "/placeholder.svg"}
                alt="Uploaded media"
                className="w-full h-auto max-h-48 object-contain"
              />
            </div>
          )}

          {uploadedUrl && mediaType === "video" && (
            <div className="mt-4 border rounded-md overflow-hidden">
              <video src={uploadedUrl} controls className="w-full h-auto max-h-48" />
            </div>
          )}
        </div>
      </div>

      {uploadedUrl && (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter a title for your media" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter a description..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="events">Events</SelectItem>
                      <SelectItem value="trips">Trips</SelectItem>
                      <SelectItem value="community">Community</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save to Gallery"
              )}
            </Button>
          </form>
        </Form>
      )}
    </div>
  )
}

// Helper component for Label
function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
    >
      {children}
    </label>
  )
}
