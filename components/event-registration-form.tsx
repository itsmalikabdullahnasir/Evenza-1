"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phone: z.string().optional(),
  tickets: z.string().min(1, {
    message: "Please select the number of tickets.",
  }),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the terms and conditions" }),
  }),
})

interface EventRegistrationFormProps {
  eventId: string
  eventPrice: number
  requiresPayment: boolean
}

export function EventRegistrationForm({ eventId, eventPrice, requiresPayment }: EventRegistrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { user, getAuthToken } = useAuth()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      tickets: "1",
      agreeTerms: false,
    },
  })

  const watchTickets = form.watch("tickets")
  const ticketCount = Number.parseInt(watchTickets || "1")
  const totalPrice = eventPrice * ticketCount

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      // Get auth token
      const token = getAuthToken()
      if (!token) {
        toast({
          title: "Authentication required",
          description: "Please log in to register for this event.",
          variant: "destructive",
        })
        router.push(`/login?redirect=/events/${eventId}/register`)
        return
      }

      // API call to register for the event
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tickets: ticketCount,
          name: values.name,
          email: values.email,
          phone: values.phone,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to register for event")
      }

      toast({
        title: "Registration successful!",
        description: "You've successfully registered for this event.",
      })

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("Error registering for event:", error)

      toast({
        title: "Something went wrong.",
        description:
          error instanceof Error ? error.message : "Your registration could not be processed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="+1 (555) 123-4567" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tickets"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of Tickets</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select number of tickets" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        {num} {num === 1 ? "ticket" : "tickets"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {eventPrice > 0 && (
            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between mb-2">
                <span>Ticket Price</span>
                <span>${eventPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Quantity</span>
                <span>{ticketCount}</span>
              </div>
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
          )}

          <FormField
            control={form.control}
            name="agreeTerms"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>I agree to the terms and conditions</FormLabel>
                  <FormDescription>
                    By checking this box, you agree to our{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                    .
                  </FormDescription>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : eventPrice > 0 ? (
              "Complete Registration"
            ) : (
              "Register Now"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}

// Helper link component
function Link({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  )
}
