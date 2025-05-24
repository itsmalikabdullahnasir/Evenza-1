"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, FileText, Home, Settings, Users } from "lucide-react"

// Define types for dashboard data
interface DashboardData {
  totalUsers: number
  totalEvents: number
  totalTrips: number
  totalInterviews: number
  totalPayments: number
  totalMessages: number
  recentActivity: any[]
  userGrowth: any[]
  revenueData: any[]
  activityByType: any[]
}

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getAuthToken } = useAuth()

  // Function to fetch dashboard data with token
  const fetchDashboardData = async (): Promise<DashboardData> => {
    const token = getAuthToken()
    console.log("Token retrieved from auth context:", token ? "Found" : "Not found")

    if (!token) {
      throw new Error("No authentication token found")
    }

    console.log("Authorization header value:", `Bearer ${token.substring(0, 10)}...`)

    const response = await fetch("/api/admin/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    console.log("API response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Failed to fetch dashboard data from API:", errorData)
      throw new Error(errorData.error || "Failed to fetch dashboard data")
    }

    return response.json()
  }

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const data = await fetchDashboardData()
        setDashboardData(data)
      } catch (error: any) {
        setError(error.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="font-bold text-lg">Evenza Admin</span>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "overview"} onClick={() => setActiveTab("overview")}>
                    <Home className="h-4 w-4" />
                    <span>Overview</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "events"} onClick={() => setActiveTab("events")}>
                    <Calendar className="h-4 w-4" />
                    <span>Events</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "trips"} onClick={() => setActiveTab("trips")}>
                    <FileText className="h-4 w-4" />
                    <span>Trips</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "interviews"} onClick={() => setActiveTab("interviews")}>
                    <Users className="h-4 w-4" />
                    <span>Interviews</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "users"} onClick={() => setActiveTab("users")}>
                    <Users className="h-4 w-4" />
                    <span>Users</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={activeTab === "settings"} onClick={() => setActiveTab("settings")}>
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="px-4 py-2 text-xs text-muted-foreground">Logged in as Admin</div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <div className="p-6">
          {isLoading ? (
            <div>Loading dashboard data...</div>
          ) : error ? (
            <div>Error: {error}</div>
          ) : (
            <>
              {activeTab === "overview" && <OverviewTab dashboardData={dashboardData} />}
              {activeTab === "events" && <EventsTab />}
              {activeTab === "trips" && <TripsTab />}
              {activeTab === "interviews" && <InterviewsTab />}
              {activeTab === "users" && <UsersTab />}
              {activeTab === "settings" && <SettingsTab />}
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

interface OverviewTabProps {
  dashboardData: DashboardData | null
}

function OverviewTab({ dashboardData }: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalUsers}</div>
            <p className="text-xs text-muted-foreground">+12% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalEvents}</div>
            <p className="text-xs text-muted-foreground">3 upcoming this week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Trip Enrollments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.totalTrips}</div>
            <p className="text-xs text-muted-foreground">+24% from last month</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest user actions and system events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData?.recentActivity?.map((activity, i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1">
                    <p>User registered for Mountain Retreat</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                </div>
              )) || <div className="text-sm text-muted-foreground">No recent activity</div>}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
            <CardDescription>Events scheduled in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 text-sm">
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center text-primary">
                    {i + 14}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Event Title {i}</p>
                    <p className="text-xs text-muted-foreground">March {i + 14}, 2025</p>
                  </div>
                  <div className="text-xs bg-muted px-2 py-1 rounded">{20 + i * 5} Attendees</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function EventsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Events Management</h2>
        <Button>Add New Event</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search events..." className="max-w-sm" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Attendees</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">Event Title {i}</TableCell>
                  <TableCell>March {10 + i}, 2025</TableCell>
                  <TableCell>Main Campus</TableCell>
                  <TableCell>{20 + i * 5}</TableCell>
                  <TableCell>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function TripsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Trips Management</h2>
        <Button>Add New Trip</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search trips..." className="max-w-sm" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Trip Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Enrollments</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">Trip Title {i}</TableCell>
                  <TableCell>April {5 + i * 3}, 2025</TableCell>
                  <TableCell>Destination {i}</TableCell>
                  <TableCell>{10 + i * 3}</TableCell>
                  <TableCell>{20 + i * 5}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function InterviewsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Interviews Management</h2>
        <Button>Add New Interview</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search interviews..." className="max-w-sm" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Interview Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Registrations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">Interview Event {i}</TableCell>
                  <TableCell>Company {i}</TableCell>
                  <TableCell>May {5 + i * 5}, 2025</TableCell>
                  <TableCell>{15 + i * 7}</TableCell>
                  <TableCell>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">Upcoming</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function UsersTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">User Management</h2>
        <Button>Add New User</Button>
      </div>

      <div className="flex items-center gap-2">
        <Input placeholder="Search users..." className="max-w-sm" />
        <Button variant="outline">Filter</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">User Name {i}</TableCell>
                  <TableCell>user{i}@example.com</TableCell>
                  <TableCell>Jan {1 + i}, 2025</TableCell>
                  <TableCell>{i}</TableCell>
                  <TableCell>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">Active</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

function SettingsTab() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Settings</h2>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
          <CardDescription>Manage your site settings and preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Site Name</label>
            <Input defaultValue="Evenza" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Email</label>
            <Input defaultValue="contact@evenza.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Default Language</label>
            <Input defaultValue="English" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Settings</CardTitle>
          <CardDescription>Configure email notifications and templates</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">SMTP Server</label>
            <Input defaultValue="smtp.example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">SMTP Port</label>
            <Input defaultValue="587" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Sender Email</label>
            <Input defaultValue="noreply@evenza.com" />
          </div>
          <Button>Save Changes</Button>
        </CardContent>
      </Card>
    </div>
  )
}
