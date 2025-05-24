"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { toast } from "@/hooks/use-toast"
import { Loader2, Search, Mail, Eye, ArchiveIcon, Trash2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { useAuth } from "@/contexts/auth-context"
import SharedBackground from "@/components/shared-background"

interface Message {
  _id: string
  name: string
  email: string
  subject: string
  message: string
  status: string
  notes: string
  createdAt: string
  updatedAt: string
}

export default function MessagesPage() {
  const router = useRouter()
  const { getAuthToken } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 1,
  })
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Fetch messages
  const fetchMessages = async () => {
    setLoading(true)
    try {
      const queryParams = new URLSearchParams()
      queryParams.append("page", pagination.page.toString())
      queryParams.append("limit", pagination.limit.toString())

      if (searchQuery) {
        queryParams.append("search", searchQuery)
      }

      if (statusFilter) {
        queryParams.append("status", statusFilter)
      }

      const token = getAuthToken()
      if (!token) {
        setAuthError("Authentication token not found. Please log in again.")
        setLoading(false)
        return
      }

      const response = await fetch(`/api/admin/messages?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setAuthError("You are not authorized to access this page. Please log in with an admin account.")
          return
        }

        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch messages")
      }

      const data = await response.json()
      setMessages(data.messages)
      setPagination(data.pagination)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to fetch messages. Please try again.",
        variant: "destructive",
      })

      // Set some mock data if needed
      setMessages([])
      setPagination({
        total: 0,
        page: 1,
        limit: 10,
        pages: 1,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()
  }, [pagination.page, statusFilter])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    pagination.page = 1
    fetchMessages()
  }

  // Handle status change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setPagination({ ...pagination, page: 1 })
  }

  // Handle view message
  const handleViewMessage = async (message: Message) => {
    setSelectedMessage(message)
    setNotes(message.notes || "")
    setIsViewDialogOpen(true)

    // If message is new, mark as read
    if (message.status === "new") {
      try {
        const token = getAuthToken()
        if (!token) {
          toast({
            title: "Authentication Error",
            description: "Authentication token not found. Please log in again.",
            variant: "destructive",
          })
          return
        }

        const response = await fetch(`/api/admin/messages/${message._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: "read" }),
        })

        if (response.ok) {
          // Update local state
          setMessages(messages.map((m) => (m._id === message._id ? { ...m, status: "read" } : m)))
        }
      } catch (error) {
        console.error("Error updating message status:", error)
      }
    }
  }

  // Handle reply
  const handleReply = (message: Message) => {
    setSelectedMessage(message)
    setReplyText("")
    setIsReplyDialogOpen(true)
  }

  // Send reply
  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return

    setIsSubmitting(true)
    try {
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      // In a real app, you would send an email here
      // For now, we'll just update the status
      const response = await fetch(`/api/admin/messages/${selectedMessage._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          status: "replied",
          notes: `${selectedMessage.notes ? selectedMessage.notes + "\n\n" : ""}Reply sent (${new Date().toLocaleString()}):\n${replyText}`,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update message")
      }

      toast({
        title: "Reply sent",
        description: "Your reply has been sent successfully.",
      })

      setIsReplyDialogOpen(false)
      fetchMessages()
    } catch (error) {
      console.error("Error sending reply:", error)
      toast({
        title: "Error",
        description: "Failed to send reply. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Update notes
  const updateNotes = async () => {
    if (!selectedMessage) return

    setIsSubmitting(true)
    try {
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/admin/messages/${selectedMessage._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notes }),
      })

      if (!response.ok) {
        throw new Error("Failed to update notes")
      }

      toast({
        title: "Notes updated",
        description: "Message notes have been updated successfully.",
      })

      // Update local state
      setMessages(messages.map((m) => (m._id === selectedMessage._id ? { ...m, notes } : m)))

      setIsViewDialogOpen(false)
    } catch (error) {
      console.error("Error updating notes:", error)
      toast({
        title: "Error",
        description: "Failed to update notes. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Archive message
  const archiveMessage = async (id: string) => {
    try {
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "archived" }),
      })

      if (!response.ok) {
        throw new Error("Failed to archive message")
      }

      toast({
        title: "Message archived",
        description: "The message has been archived successfully.",
      })

      fetchMessages()
    } catch (error) {
      console.error("Error archiving message:", error)
      toast({
        title: "Error",
        description: "Failed to archive message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Delete message
  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message? This action cannot be undone.")) {
      return
    }

    try {
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "Authentication token not found. Please log in again.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`/api/admin/messages/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete message")
      }

      toast({
        title: "Message deleted",
        description: "The message has been deleted successfully.",
      })

      fetchMessages()
    } catch (error) {
      console.error("Error deleting message:", error)
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">New</span>
      case "read":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">Read</span>
      case "replied":
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Replied</span>
      case "archived":
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">Archived</span>
        )
      default:
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">{status}</span>
    }
  }

  if (authError) {
    return (
      <SharedBackground overlay="dark">
        <div className="container mx-auto px-4 py-12">
          <Card className="bg-white/10 backdrop-blur-md border-none text-white">
            <CardHeader>
              <CardTitle>Authentication Error</CardTitle>
              <CardDescription className="text-white/70">{authError}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/login")} className="mr-4">
                Go to Login
              </Button>
              <Button variant="outline" onClick={() => router.push("/")} className="text-white border-white/20">
                Go to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </SharedBackground>
    )
  }

  return (
    <SharedBackground overlay="dark">
      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">Messages</h1>
        </div>

        <Card className="bg-white/10 backdrop-blur-md border-none text-white">
          <CardHeader>
            <CardTitle>Manage Messages</CardTitle>
            <CardDescription className="text-white/70">View and respond to messages from users.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <form onSubmit={handleSearch} className="flex-1 flex gap-2">
                <Input
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/50"
                />
                <Button type="submit" variant="secondary" className="bg-white/20 text-white hover:bg-white/30">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
              <div className="w-full md:w-48">
                <Select value={statusFilter} onValueChange={handleStatusChange}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="replied">Replied</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-white/50" />
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-8 text-white/50">No messages found.</div>
            ) : (
              <>
                <div className="rounded-md border border-white/20 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-white/5">
                      <TableRow className="hover:bg-white/10 border-white/20">
                        <TableHead className="text-white/70">From</TableHead>
                        <TableHead className="text-white/70">Subject</TableHead>
                        <TableHead className="text-white/70">Status</TableHead>
                        <TableHead className="text-white/70">Date</TableHead>
                        <TableHead className="text-right text-white/70">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((message) => (
                        <TableRow
                          key={message._id}
                          className={`hover:bg-white/10 border-white/20 ${
                            message.status === "new" ? "bg-blue-500/10" : ""
                          }`}
                        >
                          <TableCell className="text-white">
                            <div className="font-medium">{message.name}</div>
                            <div className="text-sm text-white/70">{message.email}</div>
                          </TableCell>
                          <TableCell className="text-white">{message.subject}</TableCell>
                          <TableCell>{getStatusBadge(message.status)}</TableCell>
                          <TableCell className="text-white/70">
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleViewMessage(message)}
                                title="View"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleReply(message)}
                                title="Reply"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => archiveMessage(message._id)}
                                title="Archive"
                                className="text-white/70 hover:text-white hover:bg-white/10"
                              >
                                <ArchiveIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => deleteMessage(message._id)}
                                title="Delete"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-white/70">
                    Showing {messages.length} of {pagination.total} messages
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                      disabled={pagination.page <= 1}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= pagination.pages}
                      className="text-white border-white/20 hover:bg-white/10"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* View Message Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle>{selectedMessage?.subject}</DialogTitle>
              <DialogDescription className="text-white/70">
                From: {selectedMessage?.name} ({selectedMessage?.email})
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div className="p-4 bg-gray-800 rounded-md whitespace-pre-wrap">{selectedMessage?.message}</div>

              <div>
                <Label htmlFor="notes" className="text-white">
                  Admin Notes
                </Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  rows={4}
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={updateNotes} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Notes"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Reply Dialog */}
        <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
          <DialogContent className="max-w-2xl bg-gray-900 text-white border-gray-800">
            <DialogHeader>
              <DialogTitle>Reply to {selectedMessage?.name}</DialogTitle>
              <DialogDescription className="text-white/70">
                Your reply will be sent to {selectedMessage?.email}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              <div>
                <Label htmlFor="reply" className="text-white">
                  Your Reply
                </Label>
                <Textarea
                  id="reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="mt-1 bg-gray-800 border-gray-700 text-white"
                  rows={6}
                  placeholder="Type your reply here..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsReplyDialogOpen(false)}
                className="text-white border-white/20 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button onClick={sendReply} disabled={isSubmitting || !replyText.trim()}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reply"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </SharedBackground>
  )
}
