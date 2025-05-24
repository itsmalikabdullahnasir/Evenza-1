"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

export default function AdminSetupPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [adminExists, setAdminExists] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function checkAdminExists() {
      try {
        const response = await fetch("/api/admin/setup")
        const data = await response.json()

        setAdminExists(data.adminExists)

        if (data.adminExists) {
          toast({
            title: "Admin already exists",
            description: "An admin user has already been set up. Please log in.",
          })
        }
      } catch (error) {
        console.error("Error checking admin status:", error)
      } finally {
        setIsChecking(false)
      }
    }

    checkAdminExists()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Admin created successfully",
          description: "You can now log in with your admin credentials.",
        })
        router.push("/login")
      } else {
        throw new Error(data.error || "Failed to create admin user")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isChecking) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (adminExists) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle>Admin Already Exists</CardTitle>
            <CardDescription>An admin user has already been set up.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center">Please log in with your admin credentials.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/login")}>
              Go to Login
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Admin Setup</CardTitle>
          <CardDescription>Create your admin account to get started.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
