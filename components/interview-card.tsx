import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Briefcase } from "lucide-react"

interface InterviewProps {
  id: number
  title: string
  company: string
  description: string
  date: string
  location: string
  positions: string[]
  image: string
}

export function InterviewCard({ interview }: { interview: InterviewProps }) {
  return (
    <Card className="overflow-hidden flex flex-col">
      <div className="relative h-48 overflow-hidden">
        <img src={interview.image || "/placeholder.svg"} alt={interview.title} className="w-full h-full object-cover" />
      </div>
      <CardHeader>
        <CardTitle>{interview.title}</CardTitle>
        <CardDescription>{interview.company}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground mb-4">{interview.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{interview.date}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{interview.location}</span>
          </div>
          <div className="flex items-center">
            <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>Available Positions</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {interview.positions.map((position) => (
              <Badge key={position} variant="secondary">
                {position}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={`/interviews/${interview.id}/register`}>Register</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
