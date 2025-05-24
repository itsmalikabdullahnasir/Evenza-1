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
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const formSchema = z.object({
  subject: z.string().min(5, {
    message: "Subject must be at least 5 characters.",
  }),
  message: z.string().min(20, {
    message: "Message must be at least 20 characters.",
  }),
})

export function QueryForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, getAuthToken } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      message: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !user.id) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a query",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const token = getAuthToken()

      const response = await fetch("/api/queries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          user: user.id, // Changed from userId to user
          name: user.name,
          email: user.email,
          subject: values.subject,
          message: values.message,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to submit query")
      }

      toast({
        title: "Query submitted successfully",
        description: "We'll get back to you as soon as possible.",
      })

      form.reset()
      router.push("/dashboard/queries")
    } catch (error) {
      console.error("Error submitting query:", error)

      toast({
        title: "Failed to submit query",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subject</FormLabel>
              <FormControl>
                <Input placeholder="Enter the subject of your query" {...field} />
              </FormControl>
              <FormDescription>Provide a brief subject that describes your query</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Message</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your query in detail..." className="min-h-[150px]" {...field} />
              </FormControl>
              <FormDescription>Please provide as much detail as possible to help us assist you better</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Submit Query"
          )}
        </Button>
      </form>
    </Form>
  )
}
