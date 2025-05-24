"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string
  studentId: string
  department: string
  year: string
  bio: string
}

export default function ProfilePage() {
  const { user, isLoading: authLoading, getAuthToken } = useAuth()
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push("/login")
      return
    }

    // Fetch profile data
    const fetchProfileData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const token = getAuthToken()
        if (!token) {
          throw new Error("No authentication token found")
        }

        const response = await fetch("/api/user/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch profile data")
        }

        const data = await response.json()
        setProfileData(data)
      } catch (err) {
        console.error("Error fetching profile data:", err)
        setError(err instanceof Error ? err.message : "An error occurred")

        // Set mock data for better user experience
        if (user) {
          setProfileData({
            id: user.id,
            name: user.name,
            email: user.email,
            phone: "",
            studentId: "",
            department: "",
            year: "",
            bio: "",
          })
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchProfileData()
    }
  }, [user, authLoading, router, getAuthToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)
      setError(null)

      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profileData),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "An error occurred")

      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: keyof ProfileData, value: string) => {
    if (profileData) {
      setProfileData({
        ...profileData,
        [field]: value,
      })
    }
  }

  if (authLoading) {
    return <ProfileSkeleton />
  }

  if (isLoading) {
    return <ProfileSkeleton />
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Profile</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p>{error}</p>
          <p className="text-sm">Some information may not be up to date.</p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profileData?.name || ""}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileData?.email || ""} disabled />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={profileData?.phone || ""}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={profileData?.studentId || ""}
                  onChange={(e) => handleChange("studentId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={profileData?.department || ""}
                  onChange={(e) => handleChange("department", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={profileData?.year || ""} onValueChange={(value) => handleChange("year", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">First Year</SelectItem>
                    <SelectItem value="2">Second Year</SelectItem>
                    <SelectItem value="3">Third Year</SelectItem>
                    <SelectItem value="4">Fourth Year</SelectItem>
                    <SelectItem value="5">Fifth Year</SelectItem>
                    <SelectItem value="graduate">Graduate</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profileData?.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                rows={4}
              />
            </div>

            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="container mx-auto py-10">
      <Skeleton className="h-10 w-32 mb-6" />

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-32 w-full" />
          </div>

          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  )
}
