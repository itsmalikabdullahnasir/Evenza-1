"use client"

import { useState, useEffect } from "react"
import { InterviewCard } from "@/components/interview-card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import SharedBackground from "@/components/shared-background"

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchInterviews = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || ""}/api/interviews?upcoming=true`
        console.log("Fetching interviews from:", apiUrl)

        const response = await fetch(apiUrl, {
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch interviews")
        }

        const data = await response.json()
        console.log("Interviews data:", data)

        // Ensure we have an array of interviews
        if (Array.isArray(data.interviews)) {
          setInterviews(data.interviews)
        } else if (Array.isArray(data)) {
          setInterviews(data)
        } else {
          console.warn("Unexpected interviews data format:", data)
          setInterviews([])
        }
      } catch (error) {
        console.error("Error fetching interviews:", error)
        setError(error.message)

        // Fallback to mock data
        setInterviews([
          {
            _id: "1",
            title: "Tech Industry Panel",
            company: "Various Tech Companies",
            description:
              "Meet representatives from leading tech companies and get a chance to interview for internship and full-time positions.",
            date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Main Campus Auditorium",
            positions: ["Software Engineer", "Product Manager", "UX Designer"],
            image: "/placeholder.svg?height=300&width=500&text=Tech Panel",
          },
          {
            _id: "2",
            title: "Finance Career Fair",
            company: "Financial Services Group",
            description:
              "Connect with financial institutions and investment firms looking for fresh talent in various finance roles.",
            date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Business School Building",
            positions: ["Financial Analyst", "Investment Banking", "Risk Management"],
            image: "/placeholder.svg?height=300&width=500&text=Finance Fair",
          },
          {
            _id: "3",
            title: "Healthcare Professionals Meet",
            company: "Regional Healthcare Network",
            description:
              "Healthcare organizations seeking graduates for various clinical and administrative positions.",
            date: new Date(Date.now() + 50 * 24 * 60 * 60 * 1000).toISOString(),
            location: "Medical Sciences Hall",
            positions: ["Clinical Research", "Healthcare Administration", "Medical Technology"],
            image: "/placeholder.svg?height=300&width=500&text=Healthcare",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInterviews()
  }, [])

  return (
    <SharedBackground overlay="light">
      <div className="container py-12">
        <div className="flex flex-col items-center text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">Career Interviews</h1>
          <p className="text-lg text-white/80 max-w-2xl">
            Register for upcoming interview opportunities with top companies and organizations.
          </p>
        </div>

        {error && (
          <Alert variant="destructive" className="my-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-[400px] rounded-lg" />
            ))}
          </div>
        ) : interviews && interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {interviews.map((interview) => (
              <InterviewCard key={interview._id || interview.id} interview={interview} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-md rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-white">No interviews found</h3>
            <p className="text-white/80">Check back later for upcoming interview opportunities.</p>
          </div>
        )}
      </div>
    </SharedBackground>
  )
}
