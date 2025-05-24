"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"
import { User, LogOut, Settings, Home } from "lucide-react"

export function SiteHeader() {
  const { user, logout } = useAuth()
  const pathname = usePathname()

  // Don't show header on admin pages
  if (pathname?.startsWith("/admin")) {
    return null
  }

  const navItems = [
    { name: "Home", href: "/" },
    { name: "Events", href: "/events" },
    { name: "Trips", href: "/trips" },
    { name: "Interviews", href: "/interviews" },
    { name: "Gallery", href: "/gallery" },
    { name: "Contact", href: "/contact" },
  ]

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path !== "/" && pathname?.startsWith(path)) return true
    return false
  }

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D6FFF6]/20 bg-[#231651]/80 backdrop-blur supports-[backdrop-filter]:bg-[#231651]/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl text-white">Evenza</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`transition-colors hover:text-[#D6FFF6] ${
                  isActive(item.href) ? "text-[#D6FFF6] font-semibold" : "text-white/80"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
          <div className="flex items-center space-x-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full overflow-hidden p-0">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#D6FFF6] text-[#231651]">
                      {user.name?.charAt(0) || <User className="h-4 w-4" />}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#231651] border-[#D6FFF6]/20">
                  <DropdownMenuLabel className="text-white">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-[#D6FFF6]/80">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#D6FFF6]/20" />
                  <DropdownMenuItem asChild className="text-white hover:bg-[#D6FFF6]/20 cursor-pointer">
                    <Link href="/dashboard">
                      <Home className="mr-2 h-4 w-4 text-[#D6FFF6]" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="text-white hover:bg-[#D6FFF6]/20 cursor-pointer">
                    <Link href="/dashboard/profile">
                      <User className="mr-2 h-4 w-4 text-[#D6FFF6]" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  {(user.role === "admin" || user.role === "super_admin") && (
                    <DropdownMenuItem asChild className="text-white hover:bg-[#D6FFF6]/20 cursor-pointer">
                      <Link href="/admin/dashboard">
                        <Settings className="mr-2 h-4 w-4 text-[#D6FFF6]" />
                        <span>Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-[#D6FFF6]/20" />
                  <DropdownMenuItem onClick={logout} className="text-white hover:bg-[#D6FFF6]/20 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4 text-[#D6FFF6]" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  asChild
                  className="text-white hover:text-[#D6FFF6] hover:bg-[#D6FFF6]/10"
                >
                  <Link href="/login">Login</Link>
                </Button>
                <Button size="sm" asChild className="bg-[#D6FFF6] text-[#231651] hover:bg-[#D6FFF6]/90">
                  <Link href="/register">Register</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
