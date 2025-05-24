"use client"

// Utility functions for safely handling client-side code
import { useEffect, useState } from "react"

// Hook to safely use window or other browser APIs
export function useClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return isClient
}

// Hook to safely format dates consistently between server and client
export function useSafeDate(date: Date | string | number) {
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    // Format date on client side to ensure consistency
    const dateObj = new Date(date)
    setFormattedDate(dateObj.toISOString().split("T")[0])
  }, [date])

  // Return ISO date format for server rendering
  if (!formattedDate) {
    const dateObj = new Date(date)
    return dateObj.toISOString().split("T")[0]
  }

  return formattedDate
}
