"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { Users, Calendar, CreditCard, Activity, TrendingUp, Briefcase } from "lucide-react"
import SharedBackground from "@/components/shared-background"

// Define the stats interface
interface DashboardStats {
  totalUsers: number
  totalEvents: number
  totalTrips: number
  totalInterviews: number
  totalPayments: number
  totalMessages: number
  recentActivity: Array<{
    id: string
    type: string
    user: string
    timestamp: string
  }>
  userGrowth: Array<{
    month: string
    users: number
  }>
  revenueData: Array<{
    month: string
    revenue: number
  }>
  activityByType: Array<{
    type: string
    count: number
  }>
}

// Default empty stats
const defaultStats: DashboardStats = {
  totalUsers: 0,
  totalEvents: 0,
  totalTrips: 0,
  totalInterviews: 0,
  totalPayments: 0,
  totalMessages: 0,
  recentActivity: [],
  userGrowth: [],
  revenueData: [{ month: "Current", revenue: 0 }],
  activityByType: [],
}

export default function AdminDashboardPage() {
  const { getAuthToken } = useAuth()
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setIsLoading(true)
        const token = getAuthToken()

        if (!token) {
          throw new Error("Authentication token not found")
        }

        const response = await fetch("/api/admin/dashboard", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        })

        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard data: ${response.status}`)
        }

        const data = await response.json()
        setStats(data)
      } catch (err: any) {
        console.error("Error fetching dashboard stats:", err)
        setError(err.message || "Failed to load dashboard data")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardStats()
  }, [])

  // Colors for the pie chart
  const COLORS = ["#231651", "#D6FFF6", "#372a6a", "#4b3e7e", "#c5f0e6", "#82ca9d"]

  // Get the latest revenue or default to 0
  const latestRevenue =
    stats.revenueData && stats.revenueData.length > 0 ? stats.revenueData[stats.revenueData.length - 1].revenue : 0

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <SharedBackground overlay="dark">
      <div className="relative z-10 p-8">
        <h1 className="text-3xl font-bold mb-6 text-white drop-shadow-lg">Admin Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Users</CardTitle>
              <Users className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalUsers}</div>
              <div className="text-xs text-white/70 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-white/70" />
                <span className="text-white/70 font-medium">12%</span>
                <span className="ml-1 text-white/50">from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Events</CardTitle>
              <Calendar className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalEvents}</div>
              <div className="text-xs text-white/70 mt-1">3 upcoming this week</div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Total Revenue</CardTitle>
              <CreditCard className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">${latestRevenue}</div>
              <div className="text-xs text-white/70 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-white/70" />
                <span className="text-white/70 font-medium">25%</span>
                <span className="ml-1 text-white/50">from last month</span>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-white">Active Trips</CardTitle>
              <Briefcase className="h-4 w-4 text-white/70" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stats.totalTrips}</div>
              <div className="text-xs text-white/70 flex items-center mt-1">
                <TrendingUp className="h-3 w-3 mr-1 text-white/70" />
                <span className="text-white/70 font-medium">18%</span>
                <span className="ml-1 text-white/50">from last month</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="mb-6">
          <TabsList className="bg-white/10 backdrop-blur-sm border-white/20">
            <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
              Analytics
            </TabsTrigger>
            <TabsTrigger value="activity" className="text-white data-[state=active]:bg-white/20">
              Activity
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] text-white">
                    {stats.userGrowth && stats.userGrowth.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={stats.userGrowth}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                          <YAxis stroke="rgba(255,255,255,0.5)" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", borderColor: "rgba(255,255,255,0.2)" }}
                            labelStyle={{ color: "white" }}
                          />
                          <Line
                            type="monotone"
                            dataKey="users"
                            stroke="#D6FFF6"
                            activeDot={{ r: 8, fill: "#D6FFF6" }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        No user growth data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Revenue Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {stats.revenueData && stats.revenueData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.revenueData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                          <YAxis stroke="rgba(255,255,255,0.5)" />
                          <Tooltip
                            contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", borderColor: "rgba(255,255,255,0.2)" }}
                            labelStyle={{ color: "white" }}
                          />
                          <Bar dataKey="revenue" fill="#D6FFF6" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        No revenue data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Activity by Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    {stats.activityByType && stats.activityByType.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.activityByType}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="count"
                            nameKey="type"
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          >
                            {stats.activityByType.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", borderColor: "rgba(255,255,255,0.2)" }}
                            labelStyle={{ color: "white" }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-full text-white/50">
                        No activity data available
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.recentActivity && stats.recentActivity.length > 0 ? (
                      stats.recentActivity.map((activity, i) => (
                        <div key={i} className="flex items-center gap-4 text-sm">
                          <div className="w-2 h-2 rounded-full bg-white/70" />
                          <div className="flex-1">
                            <p className="text-white">
                              {activity.type} by {activity.user}
                            </p>
                            <p className="text-xs text-white/50">{new Date(activity.timestamp).toLocaleString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-white/50">No recent activity</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="analytics">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.userGrowth || []}
                      margin={{
                        top: 5,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="month" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{ backgroundColor: "rgba(0,0,0,0.8)", borderColor: "rgba(255,255,255,0.2)" }}
                        labelStyle={{ color: "white" }}
                      />
                      <Line type="monotone" dataKey="users" stroke="#D6FFF6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="activity">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20">
              <CardHeader>
                <CardTitle className="text-white">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentActivity && stats.recentActivity.length > 0 ? (
                    stats.recentActivity.map((activity, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-4 text-sm border-b border-white/10 pb-4 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                          <Activity className="h-5 w-5 text-white/70" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-white">{activity.type}</p>
                          <p className="text-xs text-white/50">
                            By {activity.user} • {new Date(activity.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-white/50">No recent activity</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SharedBackground>
  )
}
