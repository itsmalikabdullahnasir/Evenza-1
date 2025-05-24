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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "@/hooks/use-toast"
import { Edit, Trash2, Plus, Eye, Phone, Calendar, Shield, Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"

// Mock data for users
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    registeredEvents: 3,
    registeredTrips: 1,
    interviewSubmissions: 2,
    createdAt: "2025-01-15T10:30:00Z",
    lastLogin: "2025-03-10T14:45:00Z",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
    registeredEvents: 5,
    registeredTrips: 2,
    interviewSubmissions: 1,
    createdAt: "2025-01-20T09:15:00Z",
    lastLogin: "2025-03-12T11:30:00Z",
  },
  {
    id: "3",
    name: "Admin User",
    email: "admin@example.com",
    role: "admin",
    registeredEvents: 0,
    registeredTrips: 0,
    interviewSubmissions: 0,
    createdAt: "2024-12-01T08:00:00Z",
    lastLogin: "2025-03-15T16:20:00Z",
  },
]

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.enum(["user", "admin", "super_admin"], {
    required_error: "Please select a role.",
  }),
  phone: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  password: z
    .string()
    .min(6, {
      message: "Password must be at least 6 characters.",
    })
    .optional(),
})

export default function AdminUsersPage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null)

  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "user",
      phone: "",
      department: "",
      year: "",
      password: "",
    },
  })

  // Test database connection
  const testConnection = async () => {
    try {
      setConnectionStatus("Testing connection...")
      const token = await getAuthToken()

      const response = await fetch("/api/test-connection", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      const data = await response.json()

      if (data.success) {
        setConnectionStatus(`Connection successful: ${data.message}`)
        toast({
          title: "Connection successful",
          description: data.message,
        })
      } else {
        setConnectionStatus(`Connection failed: ${data.error || "Unknown error"}`)
        toast({
          variant: "destructive",
          title: "Connection failed",
          description: data.error || "Unknown error",
        })
      }
    } catch (error) {
      console.error("Error testing connection:", error)
      setConnectionStatus("Connection test failed")
      toast({
        variant: "destructive",
        title: "Connection test failed",
        description: "Could not test database connection",
      })
    }
  }

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching users from API...")
      console.log("Auth user:", user)

      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        setError("Authentication required. Please log in as an admin.")
        setIsLoading(false)
        setUsers(mockUsers) // Fallback to mock data
        return
      }

      const token = await getAuthToken()
      console.log("Auth token:", token ? "Token exists" : "No token")

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setIsLoading(false)
        setUsers(mockUsers) // Fallback to mock data
        return
      }

      // Try to fetch from API
      const response = await fetch("/api/admin/users", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Users fetched successfully:", data)
        setUsers(data.users || [])
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

        console.error("Failed to fetch users from API:", errorData)
        setError(`Failed to fetch users: ${errorMessage}`)

        // Fallback to mock data
        console.log("Using mock data as fallback")
        setUsers(mockUsers)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
      setError(`Failed to fetch users: ${error instanceof Error ? error.message : "Unknown error"}`)
      setUsers(mockUsers)
    } finally {
      setIsLoading(false)
    }
  }, [user, getAuthToken])

  useEffect(() => {
    // Only fetch users when auth is loaded
    if (!authLoading) {
      fetchUsers()
    }
  }, [authLoading, fetchUsers])

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // Handle view user
  const handleViewUser = (user: any) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  // Handle edit user
  const handleEditUser = (user: any) => {
    setSelectedUser(user)
    form.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone || "",
      department: user.department || "",
      year: user.year || "",
    })
    setIsEditDialogOpen(true)
  }

  // Handle delete user
  const handleDeleteUser = (user: any) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  // Handle add user
  const handleAddUser = () => {
    form.reset({
      name: "",
      email: "",
      role: "user",
      phone: "",
      department: "",
      year: "",
      password: "",
    })
    setIsAddDialogOpen(true)
  }

  // Submit add user form
  const onSubmitAdd = async (values: z.infer<typeof userFormSchema>) => {
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to create user
      const response = await fetch("/api/admin/users", {
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
        let errorMessage = response.statusText || "Failed to create user"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      // Add the new user to the state
      setUsers([...users, data.user])
      setIsAddDialogOpen(false)

      toast({
        title: "User added",
        description: "The user has been added successfully.",
      })
    } catch (error) {
      console.error("Error creating user:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create user",
      })

      // Fallback for demo
      const newUser = {
        id: (users.length + 1).toString(),
        ...values,
        registeredEvents: 0,
        registeredTrips: 0,
        interviewSubmissions: 0,
        createdAt: new Date().toISOString(),
        lastLogin: null,
      }
      setUsers([...users, newUser])
      setIsAddDialogOpen(false)

      toast({
        title: "User added (Demo Mode)",
        description: "The user has been added to the local state. In production, this would be saved to the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Submit edit user form
  const onSubmitEdit = async (values: z.infer<typeof userFormSchema>) => {
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to update user
      const response = await fetch(`/api/admin/users/${selectedUser.id || selectedUser._id}`, {
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
        let errorMessage = response.statusText || "Failed to update user"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Update the user in the state
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id || user._id === selectedUser._id ? { ...user, ...values } : user,
      )
      setUsers(updatedUsers)
      setIsEditDialogOpen(false)

      toast({
        title: "User updated",
        description: "The user has been updated successfully in the database.",
      })
    } catch (error) {
      console.error("Error updating user:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update user",
      })

      // Fallback for demo
      const updatedUsers = users.map((user) =>
        user.id === selectedUser.id || user._id === selectedUser._id ? { ...user, ...values } : user,
      )
      setUsers(updatedUsers)
      setIsEditDialogOpen(false)

      toast({
        title: "User updated (Demo Mode)",
        description:
          "The user has been updated in the local state. In production, this would be saved to the database.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Confirm delete user
  const confirmDeleteUser = async () => {
    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const userId = selectedUser.id || selectedUser._id
      console.log(`Deleting user with ID: ${userId}`)

      // API call to delete user
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      const responseData = await response.json().catch(() => ({}))

      if (!response.ok) {
        const errorMessage = responseData.error || response.statusText || "Failed to delete user"
        console.error(`Error response (${response.status}):`, responseData)
        throw new Error(errorMessage)
      }

      // Remove the user from the state
      const updatedUsers = users.filter((user) => user.id !== userId && user._id !== userId)
      setUsers(updatedUsers)
      setIsDeleteDialogOpen(false)

      toast({
        title: "User deleted",
        description: "The user has been deleted successfully from the database.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete user",
      })

      // Only close the dialog, don't update the state if there was an error
      setIsDeleteDialogOpen(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading authentication...</span>
      </div>
    )
  }

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
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
        <span className="ml-2">Loading users...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={testConnection}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Test Connection
          </Button>
          <Button variant="outline" onClick={fetchUsers}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleAddUser}>
            <Plus className="h-4 w-4 mr-2" />
            Add New User
          </Button>
        </div>
      </div>

      {connectionStatus && (
        <Alert variant={connectionStatus.includes("successful") ? "default" : "destructive"}>
          <AlertTitle>Connection Status</AlertTitle>
          <AlertDescription>{connectionStatus}</AlertDescription>
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
          placeholder="Search users..."
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
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user, index) => (
                  <TableRow key={user.id || user._id || `user-${index}`}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === "admin" || user.role === "super_admin" ? "default" : "outline"}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}</TableCell>
                    <TableCell>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : "Never"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewUser(user)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEditUser(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteUser(user)}
                        disabled={user.role === "super_admin"}
                      >
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

      {/* Add User Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>Create a new user account.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitAdd)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>User roles determine access levels and permissions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
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
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    "Add User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>Update user information and role.</DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">User</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="super_admin">Super Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>User roles determine access levels and permissions.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone (Optional)</FormLabel>
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
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Year (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
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
                    "Update User"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>View detailed information about this user.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                  <span className="text-xl font-semibold">
                    {selectedUser.name
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .join("")}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-lg">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Role</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.role}</p>
                  </div>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Registered</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-medium">Phone</h3>
                    <p className="text-sm text-muted-foreground">{selectedUser.phone}</p>
                  </div>
                </div>
              )}

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Activity Summary</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-muted p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Events</p>
                    <p className="text-lg font-medium">{selectedUser.registeredEvents || 0}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Trips</p>
                    <p className="text-lg font-medium">{selectedUser.registeredTrips || 0}</p>
                  </div>
                  <div className="bg-muted p-3 rounded-md text-center">
                    <p className="text-sm text-muted-foreground">Interviews</p>
                    <p className="text-lg font-medium">{selectedUser.interviewSubmissions || 0}</p>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Last Login</h3>
                <p className="text-sm text-muted-foreground">
                  {selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleString() : "Never logged in"}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div>
              <p className="font-medium">{selectedUser.name}</p>
              <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDeleteUser} disabled={isSubmitting}>
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
