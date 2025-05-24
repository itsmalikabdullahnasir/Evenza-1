"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"

interface RealisticBackgroundProps {
  variant?: "mountains" | "waterfall"
}

export default function RealisticBackground({ variant = "mountains" }: RealisticBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 })

  // Set up mouse tracking and resize handling
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        })
      }
    }

    // Initial dimensions
    updateDimensions()

    // Track mouse position for parallax effect
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    window.addEventListener("resize", updateDimensions)
    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("resize", updateDimensions)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  // Calculate parallax offsets based on mouse position
  const getOffset = (depth: number) => {
    if (dimensions.width === 0) return { x: 0, y: 0 }

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const offsetX = ((mousePosition.x - centerX) / centerX) * 30 * depth
    const offsetY = (((mousePosition.y - centerY) / centerY) * 30 * depth) / 2

    return { x: offsetX, y: offsetY }
  }

  // Image sources based on variant
  const imageSrc = variant === "mountains" ? "/images/mountains.jpg" : "/images/waterfall.jpg"

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden">
      {/* Main background image with parallax effect */}
      <motion.div
        className="absolute inset-0"
        animate={{
          x: getOffset(0.1).x,
          y: getOffset(0.1).y,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={variant === "mountains" ? "Mountain landscape" : "Waterfall landscape"}
          fill
          priority
          className="object-cover"
        />
      </motion.div>

      {/* Overlay for better text contrast */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#231651]/40" />

      {/* Floating particles with mint green color */}
      {[...Array(20)].map((_, i) => {
        const size = 5 + Math.random() * 10
        const initialX = Math.random() * dimensions.width
        const initialY = Math.random() * dimensions.height
        const depth = 0.2 + Math.random() * 0.5

        return (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#D6FFF6]"
            style={{
              width: size,
              height: size,
              opacity: 0.4 + Math.random() * 0.4,
              filter: "blur(1px)",
            }}
            initial={{ x: initialX, y: initialY }}
            animate={{
              x: initialX + getOffset(depth).x,
              y: initialY + getOffset(depth).y,
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
          x: mousePosition.x - 150,
          y: mousePosition.y - 150,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      />
    </div>
  )
}
