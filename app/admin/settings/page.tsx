"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import SharedBackground from "@/components/shared-background"

const generalSettingsSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  siteDescription: z.string().min(10, {
    message: "Site description must be at least 10 characters.",
  }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  contactPhone: z.string().optional(),
  enableRegistration: z.boolean().default(true),
  maintenanceMode: z.boolean().default(false),
})

const emailSettingsSchema = z.object({
  smtpServer: z.string().min(1, {
    message: "SMTP server is required.",
  }),
  smtpPort: z.coerce.number().int().positive({
    message: "SMTP port must be a positive integer.",
  }),
  smtpUsername: z.string().min(1, {
    message: "SMTP username is required.",
  }),
  smtpPassword: z.string().min(1, {
    message: "SMTP password is required.",
  }),
  senderEmail: z.string().email({
    message: "Please enter a valid sender email address.",
  }),
  senderName: z.string().min(1, {
    message: "Sender name is required.",
  }),
  enableEmailNotifications: z.boolean().default(true),
})

const paymentSettingsSchema = z.object({
  currency: z.string().min(1, {
    message: "Currency is required.",
  }),
  bankName: z.string().min(1, {
    message: "Bank name is required.",
  }),
  accountName: z.string().min(1, {
    message: "Account name is required.",
  }),
  accountNumber: z.string().min(1, {
    message: "Account number is required.",
  }),
  branchCode: z.string().min(1, {
    message: "Branch code is required.",
  }),
  enablePaymentVerification: z.boolean().default(true),
})

// Default values for each settings category
const defaultGeneralSettings = {
  siteName: "Evenza",
  siteDescription: "Your premier platform for events and experiences",
  contactEmail: "contact@evenza.com",
  contactPhone: "+1 (555) 123-4567",
  enableRegistration: true,
  maintenanceMode: false,
}

const defaultEmailSettings = {
  smtpServer: "smtp.example.com",
  smtpPort: 587,
  smtpUsername: "noreply@evenza.com",
  smtpPassword: "password123",
  senderEmail: "noreply@evenza.com",
  senderName: "Evenza Team",
  enableEmailNotifications: true,
}

const defaultPaymentSettings = {
  currency: "USD",
  bankName: "Example Bank",
  accountName: "Evenza Society",
  accountNumber: "1234567890",
  branchCode: "012345",
  enablePaymentVerification: true,
}

export default function AdminSettingsPage() {
  const { user, getAuthToken } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("general")
  const [isGeneralSubmitting, setIsGeneralSubmitting] = useState(false)
  const [isEmailSubmitting, setIsEmailSubmitting] = useState(false)
  const [isPaymentSubmitting, setIsPaymentSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const generalForm = useForm<z.infer<typeof generalSettingsSchema>>({
    resolver: zodResolver(generalSettingsSchema),
    defaultValues: defaultGeneralSettings,
  })

  const emailForm = useForm<z.infer<typeof emailSettingsSchema>>({
    resolver: zodResolver(emailSettingsSchema),
    defaultValues: defaultEmailSettings,
  })

  const paymentForm = useForm<z.infer<typeof paymentSettingsSchema>>({
    resolver: zodResolver(paymentSettingsSchema),
    defaultValues: defaultPaymentSettings,
  })

  // Fetch settings from API
  const fetchSettings = async (category?: string) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!user) {
        setError("Authentication required. Please log in.")
        setIsLoading(false)
        return
      }

      const token = await getAuthToken()
      if (!token) {
        setError("Authentication token not found. Please log in again.")
        setIsLoading(false)
        return
      }

      // Construct URL with optional category parameter
      let url = "/api/admin/settings"
      if (category) {
        url += `?category=${category}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const settings = data.settings || {}

        // Update form values based on the category
        if (!category || category === "general") {
          generalForm.reset({
            ...defaultGeneralSettings,
            ...settings,
          })
        }

        if (!category || category === "email") {
          emailForm.reset({
            ...defaultEmailSettings,
            ...settings,
          })
        }

        if (!category || category === "payment") {
          paymentForm.reset({
            ...defaultPaymentSettings,
            ...settings,
          })
        }

        console.log("Settings loaded successfully:", settings)
      } else {
        const errorMessage = data.error || response.statusText || "Unknown error"
        console.error(`Failed to fetch settings: ${errorMessage}`)
        setError(`Failed to fetch settings: ${errorMessage}`)

        // Keep using the default values if there's an error
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
      setError(`Failed to fetch settings: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch settings when component mounts
  useEffect(() => {
    fetchSettings()
  }, [user])

  // Refresh settings
  const refreshSettings = async () => {
    setIsRefreshing(true)
    await fetchSettings()
    setIsRefreshing(false)
  }

  const onSubmitGeneral = async (values: z.infer<typeof generalSettingsSchema>) => {
    setIsGeneralSubmitting(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          category: "general",
          settings: values,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save general settings")
      }

      console.log("General settings saved:", values)

      toast({
        title: "Settings saved",
        description: "General settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving general settings:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save general settings.",
        variant: "destructive",
      })
    } finally {
      setIsGeneralSubmitting(false)
    }
  }

  const onSubmitEmail = async (values: z.infer<typeof emailSettingsSchema>) => {
    setIsEmailSubmitting(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          category: "email",
          settings: values,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save email settings")
      }

      console.log("Email settings saved:", values)

      toast({
        title: "Settings saved",
        description: "Email settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving email settings:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save email settings.",
        variant: "destructive",
      })
    } finally {
      setIsEmailSubmitting(false)
    }
  }

  const onSubmitPayment = async (values: z.infer<typeof paymentSettingsSchema>) => {
    setIsPaymentSubmitting(true)

    try {
      const token = await getAuthToken()
      if (!token) {
        throw new Error("Authentication token not found. Please log in again.")
      }

      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        credentials: "include",
        body: JSON.stringify({
          category: "payment",
          settings: values,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to save payment settings")
      }

      console.log("Payment settings saved:", values)

      toast({
        title: "Settings saved",
        description: "Payment settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving payment settings:", error)

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save payment settings.",
        variant: "destructive",
      })
    } finally {
      setIsPaymentSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Authentication Required</AlertTitle>
          <AlertDescription>You need to be logged in as an admin to access this page.</AlertDescription>
        </Alert>
        <Button onClick={() => router.push("/login")}>Go to Login</Button>
      </div>
    )
  }

  return (
    <SharedBackground>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">System Settings</h1>
            <p className="text-muted-foreground">Manage your platform settings and configurations</p>
          </div>
          <Button variant="outline" onClick={refreshSettings} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
            Refresh Settings
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-96">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading settings...</span>
          </div>
        ) : (
          <Tabs defaultValue="general" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="email">Email</TabsTrigger>
              <TabsTrigger value="payment">Payment</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Manage basic site settings and configurations</CardDescription>
                </CardHeader>
                <Form {...generalForm}>
                  <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)}>
                    <CardContent className="space-y-6">
                      <FormField
                        control={generalForm.control}
                        name="siteName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The name of your site that appears in the header and browser title.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="siteDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Site Description</FormLabel>
                            <FormControl>
                              <Textarea {...field} />
                            </FormControl>
                            <FormDescription>A brief description of your site for SEO and meta tags.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={generalForm.control}
                          name="contactEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="contactPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Contact Phone (Optional)</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={generalForm.control}
                          name="enableRegistration"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Enable User Registration</FormLabel>
                                <FormDescription>Allow new users to register on the platform.</FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={generalForm.control}
                          name="maintenanceMode"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                              <div className="space-y-0.5">
                                <FormLabel className="text-base">Maintenance Mode</FormLabel>
                                <FormDescription>
                                  Put the site in maintenance mode. Only admins can access.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isGeneralSubmitting}>
                        {isGeneralSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save General Settings"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="email" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Email Settings</CardTitle>
                  <CardDescription>Configure email server and notification settings</CardDescription>
                </CardHeader>
                <Form {...emailForm}>
                  <form onSubmit={emailForm.handleSubmit(onSubmitEmail)}>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="smtpServer"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Server</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailForm.control}
                          name="smtpPort"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Port</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="smtpUsername"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Username</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailForm.control}
                          name="smtpPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>SMTP Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={emailForm.control}
                          name="senderEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sender Email</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={emailForm.control}
                          name="senderName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Sender Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={emailForm.control}
                        name="enableEmailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Email Notifications</FormLabel>
                              <FormDescription>
                                Send email notifications for registrations, payments, and other events.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isEmailSubmitting}>
                        {isEmailSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Email Settings"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>Configure payment methods and bank details</CardDescription>
                </CardHeader>
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onSubmitPayment)}>
                    <CardContent className="space-y-6">
                      <FormField
                        control={paymentForm.control}
                        name="currency"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Currency</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormDescription>
                              The currency used for all transactions (e.g., USD, EUR, GBP).
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={paymentForm.control}
                          name="bankName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Bank Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="accountName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Name</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={paymentForm.control}
                          name="accountNumber"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Account Number</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={paymentForm.control}
                          name="branchCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Branch Code</FormLabel>
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={paymentForm.control}
                        name="enablePaymentVerification"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Enable Payment Verification</FormLabel>
                              <FormDescription>
                                Require manual verification of payment proofs before confirming registrations.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch checked={field.value} onCheckedChange={field.onChange} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                    <CardFooter>
                      <Button type="submit" disabled={isPaymentSubmitting}>
                        {isPaymentSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          "Save Payment Settings"
                        )}
                      </Button>
                    </CardFooter>
                  </form>
                </Form>
              </Card>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </SharedBackground>
  )
}
