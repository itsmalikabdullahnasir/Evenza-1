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
  Briefcase,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Database,
} from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"

// Mock data for interviews
const mockInterviews = [
  {
    id: "1",
    title: "Tech Industry Panel",
    company: "Various Tech Companies",
    description:
      "Meet representatives from leading tech companies and get a chance to interview for internship and full-time positions.",
    date: "April 20, 2025",
    location: "Main Campus Auditorium",
    positions: ["Software Engineer", "Product Manager", "UX Designer"],
    registrations: 15,
  },
  {
    id: "2",
    title: "Finance Career Fair",
    company: "Financial Services Group",
    description:
      "Connect with financial institutions and investment firms looking for fresh talent in various finance roles.",
    date: "May 12, 2025",
    location: "Business School Building",
    positions: ["Financial Analyst", "Investment Banking", "Risk Management"],
    registrations: 8,
  },
  {
    id: "3",
    title: "Healthcare Professionals Meet",
    company: "Regional Healthcare Network",
    description: "Healthcare organizations seeking graduates for various clinical and administrative positions.",
    date: "June 5, 2025",
    location: "Medical Sciences Hall",
    positions: ["Clinical Research", "Healthcare Administration", "Medical Technology"],
    registrations: 12,
  },
]

const interviewFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  company: z.string().min(2, {
    message: "Company name is required.",
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
  positions: z.string().min(1, {
    message: "At least one position is required.",
  }),
})

export default function AdminInterviewsPage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const [interviews, setInterviews] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedInterview, setSelectedInterview] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "testing" | "success" | "error">("idle")
  const [connectionDetails, setConnectionDetails] = useState<string | null>(null)
  const router = useRouter()
  const isAuthenticated = !!user && (user.role === "admin" || user.role === "super_admin")

  const form = useForm<z.infer<typeof interviewFormSchema>>({
    resolver: zodResolver(interviewFormSchema),
    defaultValues: {
      title: "",
      company: "",
      description: "",
      date: "",
      location: "",
      positions: "",
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

  // Fetch interviews from API
  const fetchInterviews = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching interviews from API...")
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
        setInterviews(mockInterviews)
        setIsLoading(false)
        return
      }

      // Get auth token
      const token = await getAuthToken()
      console.log("Got auth token:", token ? "Yes" : "No")

      if (!token) {
        console.log("No auth token available")
        setError("Authentication token not found. Please log in again.")
        setInterviews(mockInterviews)
        setIsLoading(false)
        return
      }

      // Try to fetch from API
      console.log("Sending API request to /api/admin/interviews")
      const response = await fetch("/api/admin/interviews", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Interviews fetched successfully:", data)
        setInterviews(data.interviews || [])
      } else {
        // Handle error response
        let errorData = { error: "Unknown error" }
        try {
          const textResponse = await response.text()
          console.log("Error response text:", textResponse)

          try {
            errorData = JSON.parse(textResponse)
          } catch (parseError) {
            console.error("Failed to parse error response as JSON:", parseError)
            errorData = { error: textResponse || response.statusText || "Unknown error" }
          }
        } catch (e) {
          console.error("Failed to read error response:", e)
          errorData = { error: response.statusText || "Unknown error" }
        }

        console.error("Failed to fetch interviews from API:", errorData)
        setError(`Failed to fetch interviews: ${errorData.error || response.statusText || "Unknown error"}`)

        // Fallback to mock data
        console.log("Using mock data as fallback")
        setInterviews(mockInterviews)
      }
    } catch (error) {
      console.error("Error fetching interviews:", error)
      setError(`Failed to fetch interviews: ${error.message || "Unknown error"}`)
      setInterviews(mockInterviews)
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, authLoading, getAuthToken, user])

  // Fetch interviews when component mounts or auth state changes
  useEffect(() => {
    if (!authLoading) {
      fetchInterviews()
    }
  }, [fetchInterviews, authLoading])

  // Filter interviews based on search query
  const filteredInterviews = interviews.filter(
    (interview) =>
      interview.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      interview.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle view interview
  const handleViewInterview = (interview: any) => {
    setSelectedInterview(interview)
    setIsViewDialogOpen(true)
  }

  // Handle edit interview
  const handleEditInterview = (interview: any) => {
    setSelectedInterview(interview)
    form.reset({
      title: interview.title,
      company: interview.company,
      description: interview.description,
      date: interview.date,
      location: interview.location,
      positions: Array.isArray(interview.positions) ? interview.positions.join(", ") : interview.positions,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete interview
  const handleDeleteInterview = (interview: any) => {
    setSelectedInterview(interview)
    setIsDeleteDialogOpen(true)
  }

  // Handle add interview
  const handleAddInterview = () => {
    form.reset({
      title: "",
      company: "",
      description: "",
      date: "",
      location: "",
      positions: "",
    })
    setIsAddDialogOpen(true)
  }

  // Submit add interview form
  const onSubmitAdd = async (values: z.infer<typeof interviewFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to create interview
      const response = await fetch("/api/admin/interviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          ...values,
          positions: values.positions.split(",").map((p) => p.trim()),
        }),
      })

      if (!response.ok) {
        let errorData = { message: "Unknown error" }
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorData.message || "Failed to create interview")
      }

      const data = await response.json()

      // Add the new interview to the state
      setInterviews([...interviews, data.interview])
      setIsAddDialogOpen(false)

      toast({
        title: "Interview added",
        description: "The interview opportunity has been added successfully.",
      })
    } catch (error) {
      console.error("Error creating interview:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create interview",
      })

      // Fallback for demo
      const newInterview = {
        id: (interviews.length + 1).toString(),
        ...values,
        positions: values.positions.split(",").map((p) => p.trim()),
        registrations: 0,
      }
      setInterviews([...interviews, newInterview])
      setIsAddDialogOpen(false)

      toast({
        title: "Interview added (mock)",
        description: "Using mock data as the API request failed.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit edit interview form
  const onSubmitEdit = async (values: z.infer<typeof interviewFormSchema>) => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to update interview
      const response = await fetch(`/api/admin/interviews/${selectedInterview.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({
          ...values,
          positions: values.positions.split(",").map((p) => p.trim()),
        }),
      })

      if (!response.ok) {
        let errorData = { message: "Unknown error" }
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorData.message || "Failed to update interview")
      }

      const data = await response.json()

      // Update the interview in the state
      const updatedInterviews = interviews.map((interview) =>
        interview.id === selectedInterview.id
          ? {
              ...interview,
              ...values,
              positions: values.positions.split(",").map((p) => p.trim()),
            }
          : interview,
      )
      setInterviews(updatedInterviews)
      setIsEditDialogOpen(false)

      toast({
        title: "Interview updated",
        description: "The interview opportunity has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating interview:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update interview",
      })

      // Fallback for demo
      const updatedInterviews = interviews.map((interview) =>
        interview.id === selectedInterview.id
          ? {
              ...interview,
              ...values,
              positions: values.positions.split(",").map((p) => p.trim()),
            }
          : interview,
      )
      setInterviews(updatedInterviews)
      setIsEditDialogOpen(false)

      toast({
        title: "Interview updated (mock)",
        description: "Using mock data as the API request failed.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete interview
  const confirmDeleteInterview = async () => {
    setIsSubmitting(true)

    try {
      // Get auth token
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to delete interview
      const response = await fetch(`/api/admin/interviews/${selectedInterview.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      if (!response.ok) {
        let errorData = { message: "Unknown error" }
        try {
          errorData = await response.json()
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorData.message || "Failed to delete interview")
      }

      // Remove the interview from the state
      const updatedInterviews = interviews.filter((interview) => interview.id !== selectedInterview.id)
      setInterviews(updatedInterviews)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Interview deleted",
        description: "The interview opportunity has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting interview:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete interview",
      })

      // Fallback for demo
      const updatedInterviews = interviews.filter((interview) => interview.id !== selectedInterview.id)
      setInterviews(updatedInterviews)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Interview deleted (mock)",
        description: "Using mock data as the API request failed.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle login redirect
  const handleLoginRedirect = () => {
    // Store the current URL to redirect back after login
    localStorage.setItem("loginRedirect", window.location.pathname)
    router.push("/login")
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
        <Button onClick={handleLoginRedirect}>Go to Login</Button>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading interviews...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Interviews Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testConnection} disabled={isTestingConnection}>
            <Database className="h-4 w-4 mr-2" />
            {isTestingConnection ? "Testing..." : "Test Connection"}
          </Button>
          <Button variant="outline" onClick={fetchInterviews} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={handleAddInterview}>
            <Plus className="h-4 w-4 mr-2" />
            Add New Interview
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
          placeholder="Search interviews..."
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
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInterviews.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No interviews found
                  </TableCell>
                </TableRow>
              ) : (
                filteredInterviews.map((interview) => (
                  <TableRow key={interview.id}>
                    <TableCell className="font-medium">{interview.title}</TableCell>
                    <TableCell>{interview.company}</TableCell>
                    <TableCell>{interview.date}</TableCell>
                    <TableCell>{interview.location}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{interview.registrations}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewInterview(interview)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditInterview(interview)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteInterview(interview)}>
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

      {/* Add Interview Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Interview</DialogTitle>
            <DialogDescription>Create a new interview opportunity for your users.</DialogDescription>
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
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
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
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. April 20, 2025" />
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
              <FormField
                control={form.control}
                name="positions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Positions</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Software Engineer, Product Manager, UX Designer" />
                    </FormControl>
                    <FormDescription>Enter positions separated by commas.</FormDescription>
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
                    "Add Interview"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Interview Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Interview</DialogTitle>
            <DialogDescription>Update the details of this interview opportunity.</DialogDescription>
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
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
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
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. April 20, 2025" />
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
              <FormField
                control={form.control}
                name="positions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Available Positions</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Software Engineer, Product Manager, UX Designer" />
                    </FormControl>
                    <FormDescription>Enter positions separated by commas.</FormDescription>
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
                    "Update Interview"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Interview Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedInterview?.title}</DialogTitle>
            <DialogDescription>Interview opportunity details</DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Company</h3>
                <p>{selectedInterview.company}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Description</h3>
                <p className="text-sm text-muted-foreground">{selectedInterview.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Date</h3>
                    <p className="text-sm text-muted-foreground">{selectedInterview.date}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Location</h3>
                    <p className="text-sm text-muted-foreground">{selectedInterview.location}</p>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center">
                  <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                  <h3 className="text-sm font-medium">Available Positions</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {Array.isArray(selectedInterview.positions) ? (
                    selectedInterview.positions.map((position: string) => (
                      <Badge key={position} variant="secondary">
                        {position}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No positions specified</p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Registrations</h3>
                <p>{selectedInterview.registrations} users have registered for this interview opportunity</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Interview Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Interview</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this interview opportunity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedInterview && (
            <div>
              <p className="font-medium">{selectedInterview.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedInterview.company}, {selectedInterview.date}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteInterview} disabled={isSubmitting}>
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
