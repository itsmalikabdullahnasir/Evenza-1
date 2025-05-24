"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import {
  Edit,
  Trash2,
  Plus,
  Eye,
  Calendar,
  MapPin,
  Users,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Database,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

// Mock data for events
const mockEvents = [
  {
    id: "1",
    title: "Tech Innovation Summit",
    description: "Join industry leaders to explore the latest technological innovations and future trends.",
    date: "2025-04-15",
    time: "9:00 AM - 5:00 PM",
    location: "Grand Conference Center",
    category: "Technology",
    price: 99,
    attendees: 120,
    maxAttendees: 200,
    isFeatured: true,
  },
  {
    id: "2",
    title: "Business Networking Mixer",
    description: "Connect with professionals from various industries in a relaxed setting.",
    date: "2025-04-22",
    time: "6:00 PM - 9:00 PM",
    location: "Urban Lounge",
    category: "Networking",
    price: 25,
    attendees: 45,
    maxAttendees: 100,
    isFeatured: false,
  },
  {
    id: "3",
    title: "Creative Arts Workshop",
    description: "Hands-on workshop exploring various art forms and creative expression techniques.",
    date: "2025-05-05",
    time: "10:00 AM - 3:00 PM",
    location: "Community Arts Center",
    category: "Arts",
    price: 50,
    attendees: 30,
    maxAttendees: 50,
    isFeatured: false,
  },
]

const eventFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required.",
  }),
  time: z.string().min(1, {
    message: "Time is required.",
  }),
  location: z.string().min(1, {
    message: "Location is required.",
  }),
  category: z.string().min(1, {
    message: "Category is required.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  maxAttendees: z.coerce.number().min(1, {
    message: "Maximum attendees must be at least 1.",
  }),
  isFeatured: z.boolean().default(false),
})

export default function AdminEventsPage() {
  const { user, getAuthToken } = useAuth()
  const [events, setEvents] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<z.infer<typeof eventFormSchema>>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      price: 0,
      maxAttendees: 100,
      isFeatured: false,
    },
  })

  // Test database connection
  const testConnection = async () => {
    try {
      setIsTestingConnection(true)
      setConnectionStatus("testing")
      setConnectionDetails(null)

      const token = await getAuthToken()
      console.log("Test connection with token:", token ? "Yes" : "No")

      const response = await fetch("/api/test-connection", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })

      const data = await response.json()
      console.log("Test connection response:", data)

      if (response.ok && data.success) {
        setConnectionStatus("success")
        // Safely access data properties with optional chaining and fallbacks
        const dbInfo = data.message || "Connected successfully"
        setConnectionDetails(dbInfo)
        toast({
          title: "Connection successful",
          description: dbInfo,
        })
      } else {
        setConnectionStatus("error")
        // Safely access error message with fallbacks
        const errorMessage = data?.error || "Unknown error occurred"
        setConnectionDetails(errorMessage)
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: errorMessage,
        })
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      setConnectionStatus("error")
      setConnectionDetails("Failed to test connection")
      toast({
        variant: "destructive",
        title: "Connection test failed",
        description: "An error occurred while testing the connection",
      })
    } finally {
      setIsTestingConnection(false)
    }
  }

  // Fetch events from API
  const fetchEvents = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching events from API...")

      // Check if user is authenticated
      if (!user) {
        console.log("User is not authenticated")
        setError("Authentication required. Please log in.")
        setEvents(mockEvents)
        setIsLoading(false)
        return
      }

      // Get auth token
      const token = await getAuthToken()
      console.log("Got auth token:", token ? "Yes" : "No")

      if (!token) {
        console.log("No auth token available")
        setError("Authentication token not found. Please log in again.")
        setEvents(mockEvents)
        setIsLoading(false)
        return
      }

      // Try to fetch from API
      const response = await fetch("/api/admin/events", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      const data = await response.json()
      console.log("API response:", data)

      if (response.ok && data.success) {
        console.log("Events fetched successfully:", data.events)
        setEvents(data.events || [])
      } else {
        // Handle error response
        const errorMessage = data.error || response.statusText || "Unknown error"
        const errorDetails = data.details ? `: ${data.details}` : ""

        console.error(`Failed to fetch events from API: ${errorMessage}${errorDetails}`)
        setError(`Failed to fetch events: ${errorMessage}${errorDetails}`)

        // Use mock data or fallback data from the response
        const fallbackData = data.events || mockEvents
        console.log("Using fallback data:", fallbackData)
        setEvents(fallbackData)
      }
    } catch (error) {
      console.error("Error fetching events:", error)
      setError(`Failed to fetch events: ${error instanceof Error ? error.message : "Unknown error"}`)
      setEvents(mockEvents)
    } finally {
      setIsLoading(false)
    }
  }, [user, getAuthToken])

  // Fetch events when component mounts or auth state changes
  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  // Filter events based on search query
  const filteredEvents = events.filter(
    (event) =>
      event.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.category?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle view event
  const handleViewEvent = (event: any) => {
    setSelectedEvent(event)
    setIsViewDialogOpen(true)
  }

  // Handle edit event
  const handleEditEvent = (event: any) => {
    setSelectedEvent(event)
    form.reset({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      category: event.category,
      price: event.price,
      maxAttendees: event.maxAttendees,
      isFeatured: event.isFeatured,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete event
  const handleDeleteEvent = (event: any) => {
    setSelectedEvent(event)
    setIsDeleteDialogOpen(true)
  }

  // Handle add event
  const handleAddEvent = () => {
    form.reset({
      title: "",
      description: "",
      date: "",
      time: "",
      location: "",
      category: "",
      price: 0,
      maxAttendees: 100,
      isFeatured: false,
    })
    setIsAddDialogOpen(true)
  }

  // Submit add event form
  const onSubmitAdd = async (values: z.infer<typeof eventFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to create event
      const response = await fetch("/api/admin/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create event")
      }

      // Add the new event to the state
      setEvents([...events, data.event])
      setIsAddDialogOpen(false)

      toast({
        title: "Event added",
        description: "The event has been added successfully to the database.",
      })
    } catch (error) {
      console.error("Error creating event:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
      })

      // Fallback for demo
      const newEvent = {
        id: (events.length + 1).toString(),
        ...values,
        attendees: 0,
      }
      setEvents([...events, newEvent])
      setIsAddDialogOpen(false)

      toast({
        title: "Event added (mock)",
        description: "The event has been added to the mock database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit edit event form
  const onSubmitEdit = async (values: z.infer<typeof eventFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to update event
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update event")
      }

      // Update the event in the state
      const updatedEvents = events.map((event) => (event.id === selectedEvent.id ? { ...event, ...values } : event))
      setEvents(updatedEvents)
      setIsEditDialogOpen(false)

      toast({
        title: "Event updated",
        description: "The event has been updated successfully in the database.",
      })
    } catch (error) {
      console.error("Error updating event:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
      })

      // Fallback for demo
      const updatedEvents = events.map((event) => (event.id === selectedEvent.id ? { ...event, ...values } : event))
      setEvents(updatedEvents)
      setIsEditDialogOpen(false)

      toast({
        title: "Event updated (mock)",
        description: "The event has been updated in the mock database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete event
  const confirmDeleteEvent = async () => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to delete event
      const response = await fetch(`/api/admin/events/${selectedEvent.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete event")
      }

      // Remove the event from the state
      const updatedEvents = events.filter((event) => event.id !== selectedEvent.id)
      setEvents(updatedEvents)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Event deleted",
        description: "The event has been deleted successfully from the database.",
      })
    } catch (error) {
      console.error("Error deleting event:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
      })

      // Fallback for demo
      const updatedEvents = events.filter((event) => event.id !== selectedEvent.id)
      setEvents(updatedEvents)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Event deleted (mock)",
        description: "The event has been deleted from the mock database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading events...</span>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>You need to be logged in as an admin to access this page.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Events Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testConnection} disabled={isTestingConnection}>
            <Database className="h-4 w-4 mr-2" />
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>
          <Button variant="outline" onClick={fetchEvents} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddEvent}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Event
          </Button>
        </div>
      </div>

      {connectionStatus === "success" && (
        <Alert>
          <AlertTitle>Database Connected</AlertTitle>
          <AlertDescription>{connectionDetails}</AlertDescription>
        </Alert>
      )}

      {connectionStatus === "error" && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>{connectionDetails}</AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error}
            <div className="mt-2">
              <span className="text-sm text-muted-foreground">Using mock data as fallback.</span>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex items-center gap-2">
        <Input
          placeholder="Search events..."
          className="max-w-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button variant="outline" onClick={() => setSearchQuery("")}>
          Clear
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Featured</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event, index) => (
                  <TableRow key={event.id || `event-${index}`}>
                    <TableCell className="font-medium">{event.title}</TableCell>
                    <TableCell>{event.date}</TableCell>
                    <TableCell>{event.category}</TableCell>
                    <TableCell>${event.price}</TableCell>
                    <TableCell>
                      {event.attendees}/{event.maxAttendees}
                    </TableCell>
                    <TableCell>
                      {event.isFeatured ? (
                        <Badge className="bg-primary">Featured</Badge>
                      ) : (
                        <Badge variant="outline">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewEvent(event)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditEvent(event)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteEvent(event)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Event Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>Create a new event for your users to register for.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 9:00 AM - 5:00 PM" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Event</FormLabel>
                      <FormDescription>Featured events are displayed prominently on the homepage.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Event"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Event Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>Update the details of this event.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                          <SelectItem value="Technology">Technology</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Arts">Arts</SelectItem>
                          <SelectItem value="Health">Health</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 9:00 AM - 5:00 PM" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price ($)</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Maximum Attendees</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="isFeatured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Featured Event</FormLabel>
                      <FormDescription>Featured events are displayed prominently on the homepage.</FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Event"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Event Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
            <DialogDescription>Event details and information</DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Category</h3>
                  <p>{selectedEvent.category}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Featured</h3>
                  <p>{selectedEvent.isFeatured ? "Yes" : "No"}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Date & Time</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.date}, {selectedEvent.time}
                    </p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="text-sm text-muted-foreground">{selectedEvent.location}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Price</h3>
                  <p>${selectedEvent.price}</p>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Attendees</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedEvent.attendees} / {selectedEvent.maxAttendees}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Event Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Event</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this event? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div>
              <p className="font-medium">{selectedEvent.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedEvent.date}, {selectedEvent.location}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteEvent} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
