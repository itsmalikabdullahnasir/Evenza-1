import type { Metadata } from "next"
import { InterviewRegistrationForm } from "@/components/interview-registration-form"

export const metadata: Metadata = {
  title: "Interview Registration - Evenza",
  description: "Register for a career interview opportunity",
}

// This would typically come from a database
const getInterviewDetails = async (id: string) => {
  const interviews = [
    {
      id: "1",
      title: "Tech Industry Panel",
      company: "Various Tech Companies",
      description:
        "Meet representatives from leading tech companies and get a chance to interview for internship and full-time positions.",
      date: "April 20, 2025",
      location: "Main Campus Auditorium",
      positions: ["Software Engineer", "Product Manager", "UX Designer"],
      image: "/placeholder.svg?height=300&width=500&text=Tech Panel",
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
      image: "/placeholder.svg?height=300&width=500&text=Finance Fair",
    },
  ]

  return interviews.find((interview) => interview.id === id) || interviews[0]
}

export default async function InterviewRegistrationPage({ params }: { params: { id: string } }) {
  // Make this function async and await the result
  const interview = await getInterviewDetails(params.id)

  return (
    <div className="container py-12">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/2">
            <img
              src={interview.image || "/placeholder.svg"}
              alt={interview.title}
              className="w-full h-64 object-cover rounded-lg"
            />
          </div>
          <div className="md:w-1/2">
            <h1 className="text-3xl font-bold mb-2">{interview.title}</h1>
            <p className="text-lg text-muted-foreground mb-2">{interview.company}</p>
            <p className="text-muted-foreground mb-4">{interview.description}</p>
            <div className="space-y-2 mb-4">
              <div className="flex items-center">
                <span className="font-semibold mr-2">Date:</span>
                <span>{interview.date}</span>
              </div>
              <div className="flex items-center">
                <span className="font-semibold mr-2">Location:</span>
                <span>{interview.location}</span>
              </div>
              <div>
                <span className="font-semibold block mb-2">Available Positions:</span>
                <div className="flex flex-wrap gap-2">
                  {interview.positions.map((position) => (
                    <span key={position} className="bg-muted px-2 py-1 rounded-md text-sm">
                      {position}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t pt-8">
          <h2 className="text-2xl font-bold mb-6">Registration Form</h2>
          <InterviewRegistrationForm interviewId={params.id} positions={interview.positions} />
        </div>
      </div>
    </div>
  )
}
