"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface NatureBackgroundProps {
  interactive?: boolean
  intensity?: number
  variant?: "light" | "dark"
}

export default function NatureBackground({
  interactive = true,
  intensity = 20,
  variant = "light",
}: NatureBackgroundProps) {
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
      if (!interactive || !containerRef.current) return

      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })
    }

    window.addEventListener("resize", updateDimensions)
    if (interactive) {
      window.addEventListener("mousemove", handleMouseMove)
    }

    return () => {
      window.removeEventListener("resize", updateDimensions)
      if (interactive) {
        window.removeEventListener("mousemove", handleMouseMove)
      }
    }
  }, [interactive])

  // Calculate parallax offsets based on mouse position
  const getOffset = (depth: number) => {
    if (!interactive || dimensions.width === 0) return { x: 0, y: 0 }

    const centerX = dimensions.width / 2
    const centerY = dimensions.height / 2
    const offsetX = ((mousePosition.x - centerX) / centerX) * intensity * depth
    const offsetY = (((mousePosition.y - centerY) / centerY) * intensity * depth) / 2

    return { x: offsetX, y: offsetY }
  }

  // Color scheme based on variant
  const colors = {
    light: {
      sky: "#D6FFF6", // Mint green
      mountains: {
        far: "#231651", // Russian violet
        mid: "#372a6a", // Lighter Russian violet
        near: "#4b3e7e", // Even lighter Russian violet
      },
      clouds: "#ffffff",
      sun: "#ffeb99",
    },
    dark: {
      sky: "#1a1040", // Dark Russian violet
      mountains: {
        far: "#0a0520", // Very dark Russian violet
        mid: "#151030", // Dark Russian violet
        near: "#231651", // Russian violet
      },
      clouds: "#D6FFF6", // Mint green
      sun: "#D6FFF6", // Mint green
    },
  }

  const currentColors = colors[variant]

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, ${currentColors.sky} 0%, ${
          variant === "light" ? "#ffffff" : "#0a0520"
        } 100%)`,
      }}
    >
      {/* Sun/Moon */}
      <motion.div
        className="absolute rounded-full"
        style={{
          width: "100px",
          height: "100px",
          background: `radial-gradient(circle, ${currentColors.sun} 0%, ${currentColors.sun}00 70%)`,
          filter: "blur(5px)",
          opacity: 0.8,
        }}
        animate={{
          x: dimensions.width * 0.7 + (interactive ? getOffset(0.2).x : 0),
          y: dimensions.height * 0.2 + (interactive ? getOffset(0.2).y : 0),
        }}
        transition={{ type: "spring", stiffness: 50, damping: 30 }}
      />

      {/* Far mountains */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full"
        height="30%"
        preserveAspectRatio="none"
        viewBox="0 0 1000 300"
        animate={{
          x: interactive ? getOffset(0.1).x : 0,
          y: interactive ? getOffset(0.1).y : 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        <path
          d="M0,300 L0,180 Q100,100 200,150 Q300,200 400,120 Q500,50 600,100 Q700,150 800,100 Q900,50 1000,120 L1000,300 Z"
          fill={currentColors.mountains.far}
          opacity={0.8}
        />
      </motion.svg>

      {/* Mid mountains */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full"
        height="25%"
        preserveAspectRatio="none"
        viewBox="0 0 1000 250"
        animate={{
          x: interactive ? getOffset(0.2).x : 0,
          y: interactive ? getOffset(0.2).y : 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        <path
          d="M0,250 L0,150 Q150,50 300,120 Q450,190 600,100 Q750,10 900,80 L1000,150 L1000,250 Z"
          fill={currentColors.mountains.mid}
          opacity={0.9}
        />
      </motion.svg>

      {/* Near mountains */}
      <motion.svg
        className="absolute bottom-0 left-0 w-full"
        height="20%"
        preserveAspectRatio="none"
        viewBox="0 0 1000 200"
        animate={{
          x: interactive ? getOffset(0.3).x : 0,
          y: interactive ? getOffset(0.3).y : 0,
        }}
        transition={{ type: "spring", stiffness: 100, damping: 30 }}
      >
        <path
          d="M0,200 L0,100 Q200,20 400,80 Q600,140 800,60 L1000,100 L1000,200 Z"
          fill={currentColors.mountains.near}
        />
      </motion.svg>

      {/* Clouds */}
      {[...Array(5)].map((_, i) => {
        const size = 80 + Math.random() * 120
        const initialX = Math.random() * dimensions.width
        const initialY = 50 + Math.random() * 150
        const depth = 0.1 + Math.random() * 0.3

        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: size,
              height: size / 2,
              background: `radial-gradient(ellipse at center, ${currentColors.clouds} 0%, ${currentColors.clouds}00 70%)`,
              filter: "blur(5px)",
              opacity: 0.7,
            }}
            initial={{ x: initialX, y: initialY }}
            animate={{
              x: initialX + (interactive ? getOffset(depth).x : 0),
              y: initialY + (interactive ? getOffset(depth).y : 0),
            }}
            transition={{ type: "spring", stiffness: 50, damping: 30 }}
          />
        )
      })}

      {/* Overlay gradient for better text contrast */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to bottom, ${
            variant === "light" ? "rgba(214, 255, 246, 0)" : "rgba(10, 5, 32, 0)"
          } 70%, ${variant === "light" ? "rgba(214, 255, 246, 0.5)" : "rgba(10, 5, 32, 0.5)"} 100%)`,
        }}
      />
    </div>
  )
}
