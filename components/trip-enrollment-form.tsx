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
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const formSchema = z.object({
  emergencyContact: z.string().min(10, {
    message: "Please provide a valid emergency contact.",
  }),
  specialRequirements: z.string().optional(),
})

export function TripEnrollmentForm({ tripId, tripPrice }: { tripId: string; tripPrice: number }) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      emergencyContact: "",
      specialRequirements: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    try {
      const token = localStorage.getItem("authToken")
      if (!token) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to enroll in a trip.",
          variant: "destructive",
        })
        router.push(`/login?redirect=/trips/${tripId}/enroll`)
        return
      }

      const response = await fetch(`/api/trips/${tripId}/enroll`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...values,
          paymentProofUrl: null, // No payment proof required
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll in trip")
      }

      toast({
        title: "Enrollment Successful",
        description: "You have successfully enrolled in this trip.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error enrolling in trip:", error)
      toast({
        title: "Enrollment Failed",
        description: error instanceof Error ? error.message : "Failed to enroll in trip. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold mb-2">Trip Details</h3>
          <p className="text-sm text-muted-foreground mb-2">
            Please review the trip details before enrolling. The trip costs ${tripPrice}.
          </p>
          <p className="text-sm text-muted-foreground">
            By enrolling, you agree to the terms and conditions of the trip.
          </p>
        </div>

        <FormField
          control={form.control}
          name="emergencyContact"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emergency Contact</FormLabel>
              <FormControl>
                <Input placeholder="Name and phone number of emergency contact" {...field} />
              </FormControl>
              <FormDescription>This information will only be used in case of emergency.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="specialRequirements"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Special Requirements (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any dietary restrictions, medical conditions, or other special requirements"
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enrolling...
            </>
          ) : (
            "Complete Enrollment"
          )}
        </Button>
      </form>
    </Form>
  )
}
