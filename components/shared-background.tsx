"use client"

import type React from "react"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface SharedBackgroundProps {
  children?: React.ReactNode
  overlay?: "light" | "medium" | "dark" | "none"
  intensity?: number
  className?: string
}

export default function SharedBackground({
  children,
  overlay = "medium",
  intensity = 30,
  className = "",
}: SharedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const { clientX, clientY } = e
      const x = clientX / window.innerWidth
      const y = clientY / window.innerHeight

      containerRef.current.style.setProperty("--mouse-x", `${x}`)
      containerRef.current.style.setProperty("--mouse-y", `${y}`)
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Determine overlay opacity based on setting
  const overlayOpacity = overlay === "light" ? 0.3 : overlay === "medium" ? 0.5 : overlay === "dark" ? 0.7 : 0

  return (
    <div ref={containerRef} className={`relative min-h-screen ${className}`}>
      {/* Main background image with parallax effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: 0,
          y: 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        <Image src="/images/mountains.jpg" alt="Mountain landscape" fill priority className="object-cover" />
      </motion.div>

      {/* Overlay for better text contrast */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-[#231651]/30 to-[#231651]/70"
        style={{ opacity: overlayOpacity }}
      />

      {/* Floating particles with mint green color */}
      {[...Array(15)].map((_, i) => {
        const size = 5 + Math.random() * 10
        const initialX = Math.random() * 100
        const initialY = Math.random() * 100
        const depth = 0.2 + Math.random() * 0.5

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#D6FFF6]"
            style={{
              width: size,
              height: size,
              left: `${initialX}%`,
              top: `${initialY}%`,
              opacity: 0.4 + Math.random() * 0.4,
              filter: "blur(1px)",
            }}
            animate={{
              opacity: [0.3, 0.7, 0.3],
              scale: [1, 1.2, 1],
            }}
            transition={{
              opacity: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 3 + Math.random() * 2,
                ease: "easeInOut",
              },
              scale: {
                repeat: Number.POSITIVE_INFINITY,
                duration: 3 + Math.random() * 2,
                ease: "easeInOut",
              },
            }}
          />
        )
      })}

      {/* Highlight effect that follows mouse */}
      <motion.div
        className="pointer-events-none absolute h-[300px] w-[300px] rounded-full bg-[#D6FFF6] opacity-10 mix-blend-overlay filter blur-3xl"
        animate={{
          x: `calc(var(--mouse-x, 0.5) * 100% - 150px)`,
          y: `calc(var(--mouse-y, 0.5) * 100% - 150px)`,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      />

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  )
}
