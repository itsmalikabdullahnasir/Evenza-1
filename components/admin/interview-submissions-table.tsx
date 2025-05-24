"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { InterviewStatus } from "@/models/InterviewSubmission"
import { Eye, FileText } from "lucide-react"

interface Submission {
  _id: string
  user: {
    _id: string
    name: string
    email: string
  }
  interview: {
    _id: string
    title: string
    company: string
  }
  position: string
  status: InterviewStatus
  adminNotes?: string
  reviewedBy?: {
    _id: string
    name: string
  }
  reviewedAt?: string
  createdAt: string
}

interface AdminInterviewSubmissionsTableProps {
  submissions: Submission[]
}

export function AdminInterviewSubmissionsTable({
  submissions: initialSubmissions,
}: AdminInterviewSubmissionsTableProps) {
  const [submissions, setSubmissions] = useState<Submission[]>(initialSubmissions)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [viewDetailsOpen, setViewDetailsOpen] = useState(false)
  const [updateStatusOpen, setUpdateStatusOpen] = useState(false)
  const [newStatus, setNewStatus] = useState<InterviewStatus | "">("")
  const [adminNotes, setAdminNotes] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  const router = useRouter()

  const handleViewDetails = (submission: Submission) => {
    setSelectedSubmission(submission)
    setViewDetailsOpen(true)
  }

  const handleUpdateStatus = (submission: Submission) => {
    setSelectedSubmission(submission)
    setNewStatus(submission.status)
    setAdminNotes(submission.adminNotes || "")
    setUpdateStatusOpen(true)
  }

  const submitStatusUpdate = async () => {
    if (!selectedSubmission || !newStatus) return

    setIsUpdating(true)

    try {
      const response = await fetch(`/api/admin/interview-submissions/${selectedSubmission._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to update status")
      }

      // Update the submission in the local state
      setSubmissions(
        submissions.map((sub) =>
          sub._id === selectedSubmission._id
            ? {
                ...sub,
                status: newStatus as InterviewStatus,
                adminNotes,
                reviewedAt: new Date().toISOString(),
              }
            : sub,
        ),
      )

      toast({
        title: "Status updated",
        description: "The submission status has been updated successfully.",
      })

      setUpdateStatusOpen(false)
      router.refresh() // Refresh the page to get updated data
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const getStatusBadge = (status: InterviewStatus) => {
    switch (status) {
      case InterviewStatus.PENDING:
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
            Pending
          </Badge>
        )
      case InterviewStatus.APPROVED:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            Approved
          </Badge>
        )
      case InterviewStatus.REJECTED:
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            Rejected
          </Badge>
        )
      case InterviewStatus.COMPLETED:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            Completed
          </Badge>
        )
      case InterviewStatus.CANCELLED:
        return (
          <Badge variant="outline" className="bg-gray-100 text-gray-800">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Applicant</TableHead>
            <TableHead>Interview</TableHead>
            <TableHead>Position</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {submissions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No submissions found
              </TableCell>
            </TableRow>
          ) : (
            submissions.map((submission) => (
              <TableRow key={submission._id}>
                <TableCell>
                  <div className="font-medium">{submission.user.name}</div>
                  <div className="text-sm text-muted-foreground">{submission.user.email}</div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{submission.interview.title}</div>
                  <div className="text-sm text-muted-foreground">{submission.interview.company}</div>
                </TableCell>
                <TableCell>{submission.position}</TableCell>
                <TableCell>{getStatusBadge(submission.status)}</TableCell>
                <TableCell>{formatDate(submission.createdAt)}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(submission)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(submission)}>
                      <FileText className="h-4 w-4 mr-1" />
                      Update
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {/* View Details Dialog */}
      <Dialog open={viewDetailsOpen} onOpenChange={setViewDetailsOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Application Details</DialogTitle>
            <DialogDescription>
              Submitted on {selectedSubmission && formatDate(selectedSubmission.createdAt)}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium mb-1">Applicant</h3>
                  <p>{selectedSubmission.user.name}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.user.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Interview</h3>
                  <p>{selectedSubmission.interview.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedSubmission.interview.company}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Position</h3>
                  <p>{selectedSubmission.position}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium mb-1">Status</h3>
                  <div>{getStatusBadge(selectedSubmission.status)}</div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Education</h3>
                <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedSubmission.education}</div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Experience</h3>
                <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedSubmission.experience}</div>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-1">Cover Letter</h3>
                <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedSubmission.coverLetter}</div>
              </div>

              {selectedSubmission.adminNotes && (
                <div>
                  <h3 className="text-sm font-medium mb-1">Admin Notes</h3>
                  <div className="bg-muted p-3 rounded-md whitespace-pre-wrap">{selectedSubmission.adminNotes}</div>
                </div>
              )}

              {selectedSubmission.reviewedBy && (
                <div className="text-sm text-muted-foreground">
                  Last updated by {selectedSubmission.reviewedBy.name} on{" "}
                  {formatDate(selectedSubmission.reviewedAt || "")}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog open={updateStatusOpen} onOpenChange={setUpdateStatusOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Application Status</DialogTitle>
            <DialogDescription>Change the status of this application and add notes.</DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as InterviewStatus)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={InterviewStatus.PENDING}>Pending</SelectItem>
                    <SelectItem value={InterviewStatus.APPROVED}>Approved</SelectItem>
                    <SelectItem value={InterviewStatus.REJECTED}>Rejected</SelectItem>
                    <SelectItem value={InterviewStatus.COMPLETED}>Completed</SelectItem>
                    <SelectItem value={InterviewStatus.CANCELLED}>Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium">Admin Notes</label>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add notes about this application"
                  className="min-h-[100px]"
                />
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setUpdateStatusOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitStatusUpdate} disabled={isUpdating}>
                  {isUpdating ? "Updating..." : "Update Status"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
