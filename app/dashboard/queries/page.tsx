import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Plus, RefreshCw } from "lucide-react"
import { connectToDatabase } from "@/lib/db"
import Query from "@/models/Query"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: "My Queries - Evenza",
  description: "View and manage your queries",
}

// Get queries from database
const getQueries = async () => {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("No user session found")
      return []
    }

    await connectToDatabase()
    const userId = session.user.id

    const queries = await Query.find({ userId }).sort({ createdAt: -1 }).limit(10).lean()

    return queries.map((query) => ({
      id: query._id.toString(),
      subject: query.subject,
      message: query.message,
      status: query.status,
      createdAt: query.createdAt.toISOString(),
      response: query.response,
      respondedAt: query.respondedAt ? query.respondedAt.toISOString() : null,
    }))
  } catch (error) {
    console.error("Error fetching queries:", error)
    return []
  }
}

export default async function QueriesPage() {
  const queries = await getQueries()

  return (
    <div className="container py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Queries</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/queries">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Link>
          </Button>
          <Button asChild>
            <Link href="/contact">
              <Plus className="h-4 w-4 mr-2" />
              New Query
            </Link>
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {queries.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-2">No queries yet</p>
              <p className="text-muted-foreground mb-6">You haven't submitted any queries yet.</p>
              <Button asChild>
                <Link href="/contact">Submit a Query</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          queries.map((query) => (
            <Card key={query.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{query.subject}</CardTitle>
                    <CardDescription>Submitted on {new Date(query.createdAt).toLocaleDateString()}</CardDescription>
                  </div>
                  <Badge
                    className={
                      query.status === "answered"
                        ? "bg-green-500"
                        : query.status === "open" || query.status === "new"
                          ? "bg-blue-500"
                          : "bg-gray-500"
                    }
                  >
                    {query.status.charAt(0).toUpperCase() + query.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Your Message:</h3>
                    <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">{query.message}</p>
                  </div>

                  {query.response && (
                    <div>
                      <h3 className="text-sm font-medium mb-2">Response:</h3>
                      <p className="text-sm text-muted-foreground bg-primary/10 p-3 rounded-md">{query.response}</p>
                      {query.respondedAt && (
                        <p className="text-xs text-muted-foreground mt-2">
                          Responded on {new Date(query.respondedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}

                  {(query.status === "open" || query.status === "new") && (
                    <p className="text-sm text-muted-foreground italic">
                      We'll respond to your query as soon as possible.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
