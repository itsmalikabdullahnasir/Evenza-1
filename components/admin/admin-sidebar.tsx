"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import {
  BarChart,
  Calendar,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
  Users,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isActive = (path: string) => {
    return pathname === path
  }

  const navItems = [
    {
      title: "Dashboard",
      href: "/admin/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      title: "Users",
      href: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Events",
      href: "/admin/events",
      icon: <Calendar className="h-5 w-5" />,
    },
    {
      title: "Trips",
      href: "/admin/trips",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Interviews",
      href: "/admin/interviews",
      icon: <BarChart className="h-5 w-5" />,
    },
    {
      title: "Payments",
      href: "/admin/payments",
      icon: <CreditCard className="h-5 w-5" />,
    },
    {
      title: "Messages",
      href: "/admin/messages",
      icon: <Inbox className="h-5 w-5" />,
    },
    {
      title: "Content",
      href: "/admin/content",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ]

  return (
    <div className="flex h-screen flex-col border-r border-[#D6FFF6]/20 bg-[#231651]/90 text-white">
      <div className="flex h-14 items-center border-b border-[#D6FFF6]/20 px-4">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-semibold">
          <span className="text-xl font-bold">Evenza Admin</span>
        </Link>
      </div>
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid items-start px-2 text-sm font-medium">
          {navItems.map((item, index) => (
            <Link
              key={index}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-[#D6FFF6] ${
                isActive(item.href) ? "bg-[#D6FFF6]/20 text-[#D6FFF6]" : "text-white/80 hover:bg-[#D6FFF6]/10"
              }`}
            >
              {item.icon}
              {item.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="mt-auto border-t border-[#D6FFF6]/20 p-4">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#D6FFF6] text-[#231651] overflow-hidden">
            {user?.name?.charAt(0) || <User className="h-5 w-5" />}
          </div>
          <div>
            <div className="font-medium">{user?.name || "Admin User"}</div>
            <div className="text-xs text-[#D6FFF6]/80">{user?.email || "admin@example.com"}</div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Link
            href="/dashboard/profile"
            className="flex items-center justify-center gap-1 rounded-lg border border-[#D6FFF6]/20 bg-transparent px-3 py-2 text-xs hover:bg-[#D6FFF6]/10 transition-colors"
          >
            <User className="h-3 w-3" />
            Profile
          </Link>
          <button
            onClick={logout}
            className="flex items-center justify-center gap-1 rounded-lg border border-[#D6FFF6]/20 bg-transparent px-3 py-2 text-xs hover:bg-[#D6FFF6]/10 transition-colors"
          >
            <LogOut className="h-3 w-3" />
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
