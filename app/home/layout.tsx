import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Evenza - Your Premier Platform for Events",
  description: "Discover and participate in exciting events and experiences with Evenza",
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
