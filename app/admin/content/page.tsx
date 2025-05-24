"use client"

import { useState, useEffect, useCallback } from "react"
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
import { Edit, Trash2, Plus, Eye, FileText, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { formatDate } from "@/lib/utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Mock data for content
const mockContent = [
  {
    id: "1",
    title: "About Us",
    slug: "about-us",
    type: "page",
    content:
      "<h1>About Evenza</h1><p>Evenza is a student society dedicated to organizing events, trips, and career opportunities for students.</p>",
    status: "published",
    createdAt: "2023-01-15T10:30:00Z",
    updatedAt: "2023-03-10T14:45:00Z",
    author: "Admin User",
  },
  {
    id: "2",
    title: "Terms of Service",
    slug: "terms",
    type: "legal",
    content:
      "<h1>Terms of Service</h1><p>These terms and conditions outline the rules and regulations for the use of Evenza's Website.</p>",
    status: "published",
    createdAt: "2023-01-20T09:15:00Z",
    updatedAt: "2023-03-12T11:30:00Z",
    author: "Admin User",
  },
  {
    id: "3",
    title: "Privacy Policy",
    slug: "privacy",
    type: "legal",
    content:
      "<h1>Privacy Policy</h1><p>This Privacy Policy describes how your personal information is collected, used, and shared when you visit our website.</p>",
    status: "published",
    createdAt: "2023-01-25T08:00:00Z",
    updatedAt: "2023-03-15T16:20:00Z",
    author: "Admin User",
  },
  {
    id: "4",
    title: "Summer Events Announcement",
    slug: "summer-events-2023",
    type: "post",
    content: "<h1>Summer Events 2023</h1><p>We're excited to announce our lineup of summer events for 2023!</p>",
    status: "draft",
    createdAt: "2023-04-05T11:20:00Z",
    updatedAt: "2023-04-05T11:20:00Z",
    author: "Jane Smith",
  },
]

const contentFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }),
  slug: z
    .string()
    .min(2, {
      message: "Slug must be at least 2 characters.",
    })
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
  type: z.enum(["page", "post", "legal", "faq"], {
    required_error: "Please select a content type.",
  }),
  content: z.string().min(10, {
    message: "Content must be at least 10 characters.",
  }),
  status: z.enum(["draft", "published", "archived"], {
    required_error: "Please select a status.",
  }),
  isHomepage: z.boolean().default(false),
})

export default function AdminContentPage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const router = useRouter()
  const [content, setContent] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedContent, setSelectedContent] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const form = useForm<z.infer<typeof contentFormSchema>>({
    resolver: zodResolver(contentFormSchema),
    defaultValues: {
      title: "",
      slug: "",
      type: "page",
      content: "",
      status: "draft",
      isHomepage: false,
    },
  })

  // Fetch content from API
  const fetchContent = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching content from API...")
      console.log("Auth user:", user)

      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        setError("Authentication required. Please log in as an admin.")
        setIsLoading(false)
        setContent(mockContent) // Fallback to mock data
        return
      }

      const token = await getAuthToken()
      console.log("Auth token:", token ? "Token exists" : "No token")

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setIsLoading(false)
        setContent(mockContent) // Fallback to mock data
        return
      }

      // Try to fetch from API
      const response = await fetch("/api/admin/content", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Content fetched successfully:", data)
        setContent(data.content || [])
      } else {
        // Handle error response
        let errorData = {}
        let errorMessage = response.statusText || "Unknown error"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        console.error("Failed to fetch content from API:", errorData)
        setError(`Failed to fetch content: ${errorMessage}`)

        // Fallback to mock data
        console.log("Using mock data as fallback")
        setContent(mockContent)
      }
    } catch (error) {
      console.error("Error fetching content:", error)
      setError(`Failed to fetch content: ${error instanceof Error ? error.message : "Unknown error"}`)
      setContent(mockContent)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [user, getAuthToken])

  // Refresh content
  const refreshContent = () => {
    setIsRefreshing(true)
    fetchContent()
  }

  useEffect(() => {
    // Only fetch content when auth is loaded
    if (!authLoading) {
      fetchContent()
    }
  }, [authLoading, fetchContent])

  // Filter content based on search query and filters
  const filteredContent = content.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesType = typeFilter === "all" || item.type === typeFilter
    const matchesStatus = statusFilter === "all" || item.status === statusFilter

    return matchesSearch && matchesType && matchesStatus
  })

  // Handle view content
  const handleViewContent = (item: any) => {
    setSelectedContent(item)
    setIsViewDialogOpen(true)
  }

  // Handle edit content
  const handleEditContent = (item: any) => {
    setSelectedContent(item)
    form.reset({
      title: item.title,
      slug: item.slug,
      type: item.type,
      content: item.content,
      status: item.status,
      isHomepage: item.isHomepage || false,
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete content
  const handleDeleteContent = (item: any) => {
    setSelectedContent(item)
    setIsDeleteDialogOpen(true)
  }

  // Handle add content
  const handleAddContent = () => {
    form.reset({
      title: "",
      slug: "",
      type: "page",
      content: "",
      status: "draft",
      isHomepage: false,
    })
    setIsAddDialogOpen(true)
  }

  // Submit add content form
  const onSubmitAdd = async (values: z.infer<typeof contentFormSchema>) => {
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to create content
      const response = await fetch("/api/admin/content", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        let errorData = {}
        let errorMessage = response.statusText || "Failed to create content"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Add the new content to the state
      setContent([...content, data.content])
      setIsAddDialogOpen(false)

      toast({
        title: "Content added",
        description: "The content has been added successfully.",
      })
    } catch (error) {
      console.error("Error creating content:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content",
      })

      // Fallback for demo
      const newContent = {
        id: (content.length + 1).toString(),
        ...values,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        author: "Current User",
      }
      setContent([...content, newContent])
      setIsAddDialogOpen(false)

      toast({
        title: "Content added (Demo Mode)",
        description:
          "The content has been added to the local state. In production, this would be saved to the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit edit content form
  const onSubmitEdit = async (values: z.infer<typeof contentFormSchema>) => {
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to update content
      const response = await fetch(`/api/admin/content/${selectedContent.id || selectedContent._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        let errorData = {}
        let errorMessage = response.statusText || "Failed to update content"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Update the content in the state
      const updatedContent = content.map((item) =>
        item.id === selectedContent.id || item._id === selectedContent._id
          ? {
              ...item,
              ...values,
              updatedAt: new Date().toISOString(),
            }
          : item,
      )
      setContent(updatedContent)
      setIsEditDialogOpen(false)

      toast({
        title: "Content updated",
        description: "The content has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating content:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update content",
      })

      // Fallback for demo
      const updatedContent = content.map((item) =>
        item.id === selectedContent.id || item._id === selectedContent._id
          ? {
              ...item,
              ...values,
              updatedAt: new Date().toISOString(),
            }
          : item,
      )
      setContent(updatedContent)
      setIsEditDialogOpen(false)

      toast({
        title: "Content updated (Demo Mode)",
        description:
          "The content has been updated in the local state. In production, this would be saved to the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete content
  const confirmDeleteContent = async () => {
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to delete content
      const response = await fetch(`/api/admin/content/${selectedContent.id || selectedContent._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      if (!response.ok) {
        let errorData = {}
        let errorMessage = response.statusText || "Failed to delete content"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Remove the content from the state
      const updatedContent = content.filter(
        (item) => item.id !== selectedContent.id && item._id !== selectedContent._id,
      )
      setContent(updatedContent)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Content deleted",
        description: "The content has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting content:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete content",
      })

      // Fallback for demo
      const updatedContent = content.filter(
        (item) => item.id !== selectedContent.id && item._id !== selectedContent._id,
      )
      setContent(updatedContent)
      setIsDeleteDialogOpen(false)

      toast({
        title: "Content deleted (Demo Mode)",
        description:
          "The content has been deleted from the local state. In production, this would be removed from the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Published
          </Badge>
        )
      case "draft":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Draft
          </Badge>
        )
      case "archived":
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-100">
            Archived
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "page":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Page
          </Badge>
        )
      case "post":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Post
          </Badge>
        )
      case "legal":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Legal
          </Badge>
        )
      case "faq":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            FAQ
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Content Management</h1>
          <div>
            <Button variant="outline" disabled={isRefreshing} onClick={refreshContent}>
              {isRefreshing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh
            </Button>
            <Button onClick={handleAddContent} className="ml-2">
              <Plus className="h-4 w-4 mr-2" />
              Add New Content
            </Button>
          </div>
        </div>
        {/* Rest of the component with mock data */}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Content Management</h1>
        <div>
          <Button variant="outline" disabled={isRefreshing} onClick={refreshContent}>
            {isRefreshing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Refresh
          </Button>
          <Button onClick={handleAddContent} className="ml-2">
            <Plus className="h-4 w-4 mr-2" />
            Add New Content
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search content..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="page">Pages</SelectItem>
              <SelectItem value="post">Posts</SelectItem>
              <SelectItem value="legal">Legal</SelectItem>
              <SelectItem value="faq">FAQs</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setTypeFilter("all")
              setStatusFilter("all")
            }}
          >
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContent.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No content found
                  </TableCell>
                </TableRow>
              ) : (
                filteredContent.map((item) => (
                  <TableRow key={item.id || item._id}>
                    <TableCell className="font-medium">{item.title}</TableCell>
                    <TableCell>{item.slug}</TableCell>
                    <TableCell>{getTypeBadge(item.type)}</TableCell>
                    <TableCell>{getStatusBadge(item.status)}</TableCell>
                    <TableCell>{formatDate(item.updatedAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewContent(item)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditContent(item)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteContent(item)}>
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

      {/* Add Content Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Content</DialogTitle>
            <DialogDescription>Create a new page, post, or other content type.</DialogDescription>
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>URL-friendly version of the title (e.g., "about-us")</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="faq">FAQ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={10} />
                    </FormControl>
                    <FormDescription>HTML content is supported</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isHomepage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as Homepage</FormLabel>
                      <FormDescription>If checked, this content will be displayed on the homepage</FormDescription>
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
                    "Add Content"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit Content Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>Update content details and information</DialogDescription>
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
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Slug</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>URL-friendly version of the title (e.g., "about-us")</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Content Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a content type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="page">Page</SelectItem>
                          <SelectItem value="post">Post</SelectItem>
                          <SelectItem value="legal">Legal</SelectItem>
                          <SelectItem value="faq">FAQ</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="archived">Archived</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea {...field} rows={10} />
                    </FormControl>
                    <FormDescription>HTML content is supported</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isHomepage"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Set as Homepage</FormLabel>
                      <FormDescription>If checked, this content will be displayed on the homepage</FormDescription>
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
                    "Update Content"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View Content Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContent?.title}</DialogTitle>
            <DialogDescription>
              {getTypeBadge(selectedContent?.type || "")} • {getStatusBadge(selectedContent?.status || "")}
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Slug</h3>
                <p className="text-sm text-muted-foreground">/{selectedContent.slug}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Content</h3>
                <div className="border rounded-md p-4 max-h-[400px] overflow-y-auto">
                  <div dangerouslySetInnerHTML={{ __html: selectedContent.content }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Created</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(selectedContent.createdAt)} by {selectedContent.author}
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                  <p className="text-sm text-muted-foreground">{formatDate(selectedContent.updatedAt)}</p>
                </div>
              </div>

              {selectedContent.isHomepage && (
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">This content is set as homepage content.</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setIsViewDialogOpen(false)
                handleEditContent(selectedContent)
              }}
            >
              <FileText className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Content Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Content</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this content? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedContent && (
            <div>
              <p className="font-medium">{selectedContent.title}</p>
              <p className="text-sm text-muted-foreground">
                {selectedContent.type} • {formatDate(selectedContent.updatedAt)}
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteContent} disabled={isSubmitting}>
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
