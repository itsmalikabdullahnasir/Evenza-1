"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  position: z.string({
    required_error: "Please select a position.",
  }),
  resume: z.string().url({
    message: "Please enter a valid URL for your resume.",
  }),
  coverLetter: z.string().optional(),
  portfolioUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for your portfolio.",
    })
    .optional()
    .or(z.literal("")),
  linkedinUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for your LinkedIn profile.",
    })
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url({
      message: "Please enter a valid URL for your GitHub profile.",
    })
    .optional()
    .or(z.literal("")),
  availability: z.string().min(1, {
    message: "Please provide your availability.",
  }),
  additionalInfo: z.string().optional(),
})

export function InterviewRegistrationForm({
  interviewId,
  positions,
}: {
  interviewId: string
  positions: string[]
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      position: "",
      resume: "",
      coverLetter: "",
      portfolioUrl: "",
      linkedinUrl: "",
      githubUrl: "",
      availability: "",
      additionalInfo: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to apply for an interview.",
          variant: "destructive",
        })
        router.push(`/login?redirect=/interviews/${interviewId}/register`)
        return
      }

      const response = await fetch(`/api/interviews/${interviewId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to apply for interview")
      }

      toast({
        title: "Application Successful",
        description: "You have successfully applied for this interview.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error applying for interview:", error)
      toast({
        title: "Application Failed",
        description: error instanceof Error ? error.message : "Failed to apply for interview. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="position"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Position</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a position" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {positions.map((position) => (
                    <SelectItem key={position} value={position}>
                      {position}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="resume"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Resume URL</FormLabel>
              <FormControl>
                <Input placeholder="https://drive.google.com/your-resume" {...field} />
              </FormControl>
              <FormDescription>Link to your resume (Google Drive, Dropbox, etc.)</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="coverLetter"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Cover Letter (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Write your cover letter here or provide a URL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="portfolioUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Portfolio URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://yourportfolio.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="linkedinUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>LinkedIn URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://linkedin.com/in/yourprofile" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="githubUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>GitHub URL (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://github.com/yourusername" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Availability</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., Weekdays after 3 PM" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="additionalInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Information (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional information you'd like to share with the interviewer"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting Application...
            </>
          ) : (
            "Submit Application"
          )}
        </Button>
      </form>
    </Form>
  )
}
