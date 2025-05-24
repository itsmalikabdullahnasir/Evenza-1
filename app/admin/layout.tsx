"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import SharedBackground from "@/components/shared-background"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    // Check if user is authenticated and has admin privileges
    const checkAuth = async () => {
      try {
        setIsLoading(true)

        // Skip auth check for setup page
        if (pathname === "/admin/setup") {
          setIsLoading(false)
          setIsAuthenticated(true)
          return
        }

        // Get the token from localStorage or sessionStorage
        const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken")

        if (!token) {
          router.push("/login?callbackUrl=/admin/dashboard")
          return
        }

        const response = await fetch("/api/auth/check-admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (response.ok) {
          setIsAuthenticated(true)
        } else {
          // If not authenticated or not admin, redirect to login
          toast({
            title: "Authentication failed",
            description: "You must be logged in as an admin to access this page.",
            variant: "destructive",
          })
          router.push("/login?callbackUrl=/admin/dashboard")
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        toast({
          title: "Authentication error",
          description: "An error occurred while checking your authentication.",
          variant: "destructive",
        })
        router.push("/login?callbackUrl=/admin/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname, toast])

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <SharedBackground overlay="medium" />
        <div className="relative z-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (!isAuthenticated && pathname !== "/admin/setup") {
    return null // Will redirect in the useEffect
  }

  return (
    <div className="flex min-h-screen">
      <SharedBackground overlay="medium" />
      <div className="relative z-10 flex min-h-screen w-full">
        <AdminSidebar />
        <div className="flex-1 p-8 pt-6">{children}</div>
      </div>
    </div>
  )
}
