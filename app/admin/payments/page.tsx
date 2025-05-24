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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Eye, Check, X, Search, Download, Loader2, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react"
import { formatCurrency, formatDate } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Mock data for payments
const mockPayments = [
  {
    id: "1",
    userId: "user1",
    userName: "John Doe",
    userEmail: "john.doe@example.com",
    type: "event",
    relatedTitle: "Tech Innovation Summit",
    relatedId: "event1",
    amount: 99,
    status: "pending",
    proofUrl: "/placeholder.svg?height=300&width=400&text=Payment+Proof",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-15T10:30:00Z",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Jane Smith",
    userEmail: "jane.smith@example.com",
    type: "trip",
    relatedTitle: "Mountain Retreat",
    relatedId: "trip1",
    amount: 250,
    status: "completed",
    proofUrl: "/placeholder.svg?height=300&width=400&text=Payment+Proof",
    createdAt: "2023-05-14T09:15:00Z",
    updatedAt: "2023-05-14T14:30:00Z",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mike Johnson",
    userEmail: "mike.johnson@example.com",
    type: "event",
    relatedTitle: "Business Networking Mixer",
    relatedId: "event2",
    amount: 25,
    status: "rejected",
    proofUrl: "/placeholder.svg?height=300&width=400&text=Payment+Proof",
    createdAt: "2023-05-13T16:20:00Z",
    updatedAt: "2023-05-13T18:45:00Z",
  },
]

export default function AdminPaymentsPage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const router = useRouter()
  const [payments, setPayments] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isUpdateStatusDialogOpen, setIsUpdateStatusDialogOpen] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [newStatus, setNewStatus] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch payments from API
  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      console.log("Fetching payments from API...")
      console.log("Auth user:", user)

      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        setError("Authentication required. Please log in as an admin.")
        setIsLoading(false)
        setPayments(mockPayments) // Fallback to mock data
        return
      }

      const token = await getAuthToken()
      console.log("Auth token:", token ? "Token exists" : "No token")

      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setIsLoading(false)
        setPayments(mockPayments) // Fallback to mock data
        return
      }

      // Try to fetch from API
      const response = await fetch("/api/admin/payments", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
      })

      console.log("API response status:", response.status)

      if (response.ok) {
        const data = await response.json()
        console.log("Payments fetched successfully:", data)
        setPayments(data.payments || [])
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

        console.error("Failed to fetch payments from API:", errorData)
        setError(`Failed to fetch payments: ${errorMessage}`)

        // Fallback to mock data
        console.log("Using mock data as fallback")
        setPayments(mockPayments)
      }
    } catch (error) {
      console.error("Error fetching payments:", error)
      setError(`Failed to fetch payments: ${error instanceof Error ? error.message : "Unknown error"}`)
      setPayments(mockPayments)
    } finally {
      setIsLoading(false)
    }
  }, [user, getAuthToken])

  useEffect(() => {
    // Only fetch payments when auth is loaded
    if (!authLoading) {
      fetchPayments()
    }
  }, [authLoading, fetchPayments])

  // Filter payments based on search query and filters
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.relatedTitle?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter
    const matchesType = typeFilter === "all" || payment.type === typeFilter

    return matchesSearch && matchesStatus && matchesType
  })

  // Handle view payment
  const handleViewPayment = (payment: any) => {
    setSelectedPayment(payment)
    setIsViewDialogOpen(true)
  }

  // Handle update status
  const handleUpdateStatus = (payment: any) => {
    setSelectedPayment(payment)
    setNewStatus(payment.status)
    setIsUpdateStatusDialogOpen(true)
  }

  // Submit update status
  const confirmUpdateStatus = async () => {
    if (!selectedPayment || !newStatus) return

    setIsSubmitting(true)

    try {
      const token = await getAuthToken()

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      // API call to update payment status
      const response = await fetch(`/api/admin/payments/${selectedPayment.id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        let errorData = {}
        let errorMessage = response.statusText || "Failed to update payment status"

        try {
          errorData = await response.json()
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Failed to parse error response:", e)
        }

        throw new Error(errorMessage)
      }

      // Update the payment in the state
      const updatedPayments = payments.map((payment) =>
        payment.id === selectedPayment.id
          ? { ...payment, status: newStatus, updatedAt: new Date().toISOString() }
          : payment,
      )
      setPayments(updatedPayments)
      setIsUpdateStatusDialogOpen(false)

      toast({
        title: "Payment status updated",
        description: `Payment status has been updated to ${newStatus}.`,
      })
    } catch (error) {
      console.error("Error updating payment status:", error)

      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update payment status",
      })

      // Fallback for demo
      const updatedPayments = payments.map((payment) =>
        payment.id === selectedPayment.id
          ? { ...payment, status: newStatus, updatedAt: new Date().toISOString() }
          : payment,
      )
      setPayments(updatedPayments)
      setIsUpdateStatusDialogOpen(false)

      toast({
        title: "Payment status updated (Demo Mode)",
        description: `Payment status has been updated to ${newStatus} in the local state.`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Completed
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Rejected
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Refunded
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  // Get type badge
  const getTypeBadge = (type: string) => {
    switch (type) {
      case "event":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Event
          </Badge>
        )
      case "trip":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Trip
          </Badge>
        )
      case "interview":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Interview
          </Badge>
        )
      default:
        return <Badge variant="outline">{type}</Badge>
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
        <span className="ml-2">Loading payments...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Payments Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPayments}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

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

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="trip">Trip</SelectItem>
              <SelectItem value="interview">Interview</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setStatusFilter("all")
              setTypeFilter("all")
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
                <TableHead>User</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Related To</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No payments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredPayments.map((payment, index) => (
                  <TableRow key={payment.id || `payment-${index}`}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{payment.userName}</p>
                        <p className="text-sm text-muted-foreground">{payment.userEmail}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(payment.type)}</TableCell>
                    <TableCell>
                      <div className="max-w-[200px] truncate" title={payment.relatedTitle}>
                        {payment.relatedTitle}
                      </div>
                    </TableCell>
                    <TableCell>{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>{getStatusBadge(payment.status)}</TableCell>
                    <TableCell>{formatDate(payment.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleViewPayment(payment)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status === "pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setNewStatus("completed")
                              confirmUpdateStatus()
                            }}
                          >
                            <Check className="h-4 w-4 text-green-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setSelectedPayment(payment)
                              setNewStatus("rejected")
                              confirmUpdateStatus()
                            }}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </>
                      )}
                      {payment.status !== "pending" && (
                        <Button variant="ghost" size="icon" onClick={() => handleUpdateStatus(payment)}>
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Payment Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Payment Details</DialogTitle>
            <DialogDescription>View detailed information about this payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">User</h3>
                  <p>{selectedPayment.userName}</p>
                  <p className="text-sm text-muted-foreground">{selectedPayment.userEmail}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Payment Status</h3>
                  <div>{getStatusBadge(selectedPayment.status)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Payment Type</h3>
                  <div>{getTypeBadge(selectedPayment.type)}</div>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Amount</h3>
                  <p className="text-lg font-bold">{formatCurrency(selectedPayment.amount)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Related To</h3>
                <p>{selectedPayment.relatedTitle}</p>
                <p className="text-sm text-muted-foreground">ID: {selectedPayment.relatedId}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Created At</h3>
                  <p>{formatDate(selectedPayment.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Last Updated</h3>
                  <p>{formatDate(selectedPayment.updatedAt)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Payment Proof</h3>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <img
                    src={selectedPayment.proofUrl || "/placeholder.svg"}
                    alt="Payment Proof"
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              </div>

              {selectedPayment.status === "pending" && (
                <div className="flex gap-2">
                  <Button
                    className="flex-1"
                    onClick={() => {
                      setNewStatus("completed")
                      setIsViewDialogOpen(false)
                      setIsUpdateStatusDialogOpen(true)
                    }}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Approve Payment
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    onClick={() => {
                      setNewStatus("rejected")
                      setIsViewDialogOpen(false)
                      setIsUpdateStatusDialogOpen(true)
                    }}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject Payment
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={isUpdateStatusDialogOpen} onOpenChange={setIsUpdateStatusDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Payment Status</DialogTitle>
            <DialogDescription>Change the status of this payment</DialogDescription>
          </DialogHeader>
          {selectedPayment && (
            <div className="space-y-4">
              <div>
                <p className="font-medium">{selectedPayment.userName}</p>
                <p className="text-sm text-muted-foreground">
                  {formatCurrency(selectedPayment.amount)} for {selectedPayment.relatedTitle}
                </p>
              </div>

              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select new status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUpdateStatusDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmUpdateStatus} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Status"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
