"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Building2, FileText, ExternalLink } from "lucide-react"
import Link from "next/link"
import { formatDate } from "@/lib/utils"

interface InterviewSubmission {
  id: string
  interviewId: string
  interviewTitle: string
  company: string
  position: string
  status: string
  submittedAt: string
  feedback: string | null
  interviewDate: string | null
}

interface InterviewSubmissionsListProps {
  submissions: InterviewSubmission[]
}

export function InterviewSubmissionsList({ submissions }: InterviewSubmissionsListProps) {
  const [expandedSubmission, setExpandedSubmission] = useState<string | null>(null)

  const toggleExpand = (id: string) => {
    setExpandedSubmission(expandedSubmission === id ? null : id)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Pending Review
          </Badge>
        )
      case "approved":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
            Approved
          </Badge>
        )
      case "scheduled":
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Interview Scheduled
          </Badge>
        )
      case "rejected":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">
            Not Selected
          </Badge>
        )
      case "completed":
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
            Completed
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (submissions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No interview applications</CardTitle>
          <CardDescription>
            You haven't applied for any interviews yet. Browse our upcoming interview opportunities and apply for the
            ones that match your career goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/interviews">Find Interviews</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {submissions.map((submission) => (
        <Card key={submission.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>{submission.interviewTitle}</CardTitle>
                <CardDescription className="flex items-center mt-1">
                  <Building2 className="h-4 w-4 mr-1" />
                  {submission.company} • {submission.position}
                </CardDescription>
              </div>
              {getStatusBadge(submission.status)}
            </div>
          </CardHeader>
          <CardContent className="pb-3">
            <div className="flex flex-wrap gap-4 text-sm mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                <span>Submitted: {formatDate(submission.submittedAt)}</span>
              </div>
              {submission.interviewDate && (
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span>Interview: {formatDate(submission.interviewDate)}</span>
                </div>
              )}
            </div>

            {expandedSubmission === submission.id && (
              <div className="mt-4 pt-4 border-t">
                {submission.feedback && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Feedback</h4>
                    <p className="text-sm text-muted-foreground">{submission.feedback}</p>
                  </div>
                )}

                {submission.status === "scheduled" && (
                  <div className="mb-4">
                    <h4 className="text-sm font-medium mb-1">Interview Details</h4>
                    <p className="text-sm text-muted-foreground">
                      Your interview has been scheduled for {formatDate(submission.interviewDate || "")}. Please check
                      your email for more details.
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/interviews/${submission.interviewId}`}>
                      <FileText className="h-4 w-4 mr-1" />
                      View Interview
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/interviews/${submission.id}`}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Application
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            <Button variant="ghost" size="sm" onClick={() => toggleExpand(submission.id)} className="mt-2">
              {expandedSubmission === submission.id ? "Show Less" : "Show More"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
