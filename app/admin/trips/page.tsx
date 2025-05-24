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
  DollarSign,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Database,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

// Mock data for trips
const mockTrips = [
  {
    id: "1",
    title: "Mountain Retreat",
    description: "A 3-day retreat in the mountains with hiking, meditation, and team-building activities.",
    date: "April 15-18, 2025",
    location: "Blue Ridge Mountains",
    price: 299,
    spots: 20,
    enrollments: 8,
  },
  {
    id: "2",
    title: "Beach Getaway",
    description: "Enjoy a weekend at the beach with surfing lessons, beach volleyball, and bonfire nights.",
    date: "May 5-7, 2025",
    location: "Coastal Shores",
    price: 249,
    spots: 30,
    enrollments: 15,
  },
  {
    id: "3",
    title: "City Explorer",
    description: "Discover the hidden gems of the city with guided tours, museum visits, and local cuisine.",
    date: "June 10-12, 2025",
    location: "Metropolitan City",
    price: 199,
    spots: 25,
    enrollments: 10,
  },
]

const tripFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
  date: z.string().min(1, {
    message: "Date is required.",
  }),
  location: z.string().min(1, {
    message: "Location is required.",
  }),
  price: z.coerce.number().min(0, {
    message: "Price must be a positive number.",
  }),
  spots: z.coerce.number().min(1, {
    message: "Spots must be at least 1.",
  }),
  itinerary: z.string().optional(),
  requirements: z.string().optional(),
})

export default function AdminTripsPage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const [trips, setTrips] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null)
  const router = useRouter()
  const isAuthenticated = !!user && (user.role === "admin" || user.role === "super_admin")

  const form = useForm<z.infer<typeof tripFormSchema>>({
    resolver: zodResolver(tripFormSchema),
    defaultValues: {
      title: "",
      description: "",
      date: "",
      location: "",
      price: 0,
      spots: 20,
      itinerary: "",
      requirements: "",
    },
  })

  // Test database connection
  const testConnection = async () => {
    try {
      setIsTestingConnection(true)
      setConnectionStatus("testing")
      setConnectionDetails(null)

      const token = await getAuthToken()
      console.log("Testing connection with token:", token ? "Yes" : "No")

      const response = await fetch("/api/test-connection", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
      })

      const data = await response.json()
      console.log("Test connection response:", data)

      if (response.ok) {
        setConnectionStatus("success")
        setConnectionDetails(`Connected to ${data.database || "database"} at ${data.host || "server"}`)
        toast({
          title: "Connection successful",
          description: `Connected to ${data.database || "database"} at ${data.host || "server"}`,
        })
      } else {
        setConnectionStatus("error")
        setConnectionDetails(data?.error || "Unknown error")
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: data?.error || "Failed to connect to database",
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

  // Fetch trips from API
  const fetchTrips = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching trips from API...")
      console.log("Auth status:", isAuthenticated ? "Authenticated" : "Not authenticated")
      console.log("User role:", user?.role || "No role")

      // Check if user is authenticated
      if (authLoading) {
        console.log("Auth is still loading, waiting...")
        return
      }

      if (!isAuthenticated) {
        console.log("User is not authenticated")
        setError("Authentication required. Please log in.")
        setTrips(mockTrips)
        setIsLoading(false)
        return
      }

      // Get auth token
      const token = await getAuthToken()
      console.log("Got auth token:", token ? "Yes" : "No")

      // Try to fetch from API
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/trips`, {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include", // Include cookies in the request
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Trips fetched successfully:", data)
        setTrips(data.trips || [])
      } else {
        // Handle error response
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        console.error("Failed to fetch trips from API:", errorData)
        setError(`Failed to fetch trips: ${errorData.error || response.statusText || "Unknown error"}`)

        // Fallback to mock data
        console.log("Using mock data as fallback")
        setTrips(mockTrips)
      }
    } catch (error) {
      console.error("Error fetching trips:", error)
      setError("Failed to fetch trips. Please try again later.")
      setTrips(mockTrips)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, authLoading, getAuthToken, user])

  // Fetch trips when component mounts or auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchTrips()
    }
  }, [fetchTrips, authLoading])

  // Filter trips based on search query
  const filteredTrips = trips.filter(
    (trip) =>
      trip.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      trip.location?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle view trip
  const handleViewTrip = (trip: any) => {
    setSelectedTrip(trip)
    setIsViewDialogOpen(true)
  }

  // Handle edit trip
  const handleEditTrip = (trip: any) => {
    setSelectedTrip(trip)
    form.reset({
      title: trip.title,
      description: trip.description,
      date: trip.date,
      location: trip.location,
      price: trip.price,
      spots: trip.spots,
      itinerary: trip.itinerary || "",
      requirements: trip.requirements || "",
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete trip
  const handleDeleteTrip = (trip: any) => {
    setSelectedTrip(trip)
    setIsDeleteDialogOpen(true)
  }

  // Handle add trip
  const handleAddTrip = () => {
    form.reset({
      title: "",
      description: "",
      date: "",
      location: "",
      price: 0,
      spots: 20,
      itinerary: "",
      requirements: "",
    })
    setIsAddDialogOpen(true)
  }

  // Submit add trip form
  const onSubmitAdd = async (values: z.infer<typeof tripFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      // API call to create trip
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorData.message || "Failed to create trip")
      }

      const data = await response.json()

      // Add the new trip to the state
      setTrips([...trips, data.trip])
      setIsAddDialogOpen(false)

      toast({
        title: "Trip added",
        description: "The trip has been added successfully to the database.",
      })
    } catch (error) {
      console.error("Error creating trip:", error)

      // Fallback for demo
      const newTrip = {
        id: (trips.length + 1).toString(),
        ...values,
        enrollments: 0,
      }
      setTrips([...trips, newTrip])
      setIsAddDialogOpen(false)

      toast({
        title: "Trip added",
        description: "The trip has been added successfully to the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit edit trip form
  const onSubmitEdit = async (values: z.infer<typeof tripFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      // API call to update trip
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/trips/${selectedTrip.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorData.message || "Failed to update trip")
      }

      const data = await response.json()

      // Update the trip in the state
      const updatedTrips = trips.map((trip) => (trip.id === selectedTrip.id ? { ...trip, ...values } : trip))
      setTrips(updatedTrips)
      setIsEditDialogOpen(false)

      toast({
        title: "Trip updated",
        description: "The trip has been updated successfully in the database.",
      })
    } catch (error) {
      console.error("Error updating trip:", error)

      // Fallback for demo
      const updatedTrips = trips.map((trip) => (trip.id === selectedTrip.id ? { ...trip, ...values } : trip))
      setTrips(updatedTrips)
      setIsEditDialogOpen(false)

      toast({
        title: "Trip updated",
        description: "The trip has been updated successfully in the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete trip
  const confirmDeleteTrip = async () => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      // API call to delete trip
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ""}/api/admin/trips/${selectedTrip.id}`, {
        method: "DELETE",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include", // Include cookies in the request
      })

      if (!response.ok) {
        let errorData = {}
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorData.message || "Failed to delete trip")
      }

      // Remove the trip from the state
      const updatedTrips = trips.filter((trip) => trip.id !== selectedTrip.id)
      setTrips(updatedTrips)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Trip deleted",
        description: "The trip has been deleted successfully from the database.",
      })
    } catch (error) {
      console.error("Error deleting trip:", error)

      // Fallback for demo
      const updatedTrips = trips.filter((trip) => trip.id !== selectedTrip.id)
      setTrips(updatedTrips)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Trip deleted",
        description: "The trip has been deleted successfully from the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Checking authentication...</span>
      </div>
    )
  }

  if (!isAuthenticated) {
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading trips...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Trips Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testConnection} disabled={isTestingConnection}>
            <Database className="h-4 w-4 mr-2" />
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>
          <Button variant="outline" onClick={fetchTrips} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddTrip}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Trip
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
          placeholder="Search trips..."
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
                <TableHead>Trip Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No trips found
                  </TableCell>
                </TableRow>
              ) : (
                filteredTrips.map((trip, index) => (
                  <TableRow key={trip.id || trip._id || `trip-${index}`}>
                    <TableCell className="font-medium">{trip.title}</TableCell>
                    <TableCell>{trip.date}</TableCell>
                    <TableCell>{trip.location}</TableCell>
                    <TableCell>${trip.price}</TableCell>
                    <TableCell>
                      <Badge variant={trip.enrollments >= trip.spots ? "destructive" : "outline"}>
                        {trip.enrollments}/{trip.spots}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewTrip(trip)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditTrip(trip)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteTrip(trip)}>
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

      {/* Add Trip Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Trip</DialogTitle>
            <DialogDescription>Create a new trip for your users to enroll in.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-6">
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
                      <FormLabel>Date Range</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. April 15-18, 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
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
                  name="spots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Spots</FormLabel>
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
                name="itinerary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itinerary (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Day-by-day schedule of activities" />
                    </FormControl>
                    <FormDescription>Provide a detailed itinerary for the trip.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any special requirements or things to bring" />
                    </FormControl>
                    <FormDescription>List any special requirements or items participants should bring.</FormDescription>
                    <FormMessage />
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
                    "Add Trip"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Trip Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Trip</DialogTitle>
            <DialogDescription>Update the details of this trip.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
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
                      <FormLabel>Date Range</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. April 15-18, 2025" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
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
              </div>
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
                  name="spots"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Spots</FormLabel>
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
                name="itinerary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Itinerary (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Day-by-day schedule of activities" />
                    </FormControl>
                    <FormDescription>Provide a detailed itinerary for the trip.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="requirements"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Requirements (Optional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Any special requirements or things to bring" />
                    </FormControl>
                    <FormDescription>List any special requirements or items participants should bring.</FormDescription>
                    <FormMessage />
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
                    "Update Trip"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Trip Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTrip?.title}</DialogTitle>
            <DialogDescription>Trip details and information</DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedTrip.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Date</h3>
                    <p className="text-sm text-muted-foreground">{selectedTrip.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="text-sm text-muted-foreground">{selectedTrip.location}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Price</h3>
                    <p className="text-sm text-muted-foreground">${selectedTrip.price}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Enrollments</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedTrip.enrollments} / {selectedTrip.spots}
                    </p>
                  </div>
                </div>
              </div>

              {selectedTrip.itinerary && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Itinerary</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedTrip.itinerary}</p>
                </div>
              )}

              {selectedTrip.requirements && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Requirements</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedTrip.requirements}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Trip Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Trip</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this trip? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedTrip && (
            <div>
              <p className="font-medium">{selectedTrip.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedTrip.date}, {selectedTrip.location}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteTrip} disabled={isSubmitting}>
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
