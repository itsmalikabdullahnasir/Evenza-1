"use client"

import { useEffect, useRef } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to match window
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    setCanvasSize()
    window.addEventListener("resize", setCanvasSize)

    // Event-themed icons and symbols
    const symbols = [
      "🎪",
      "🎭",
      "🎟️",
      "🎤",
      "🎵",
      "🎷",
      "🎸",
      "🏔️",
      "🌄",
      "🚌",
      "🧳",
      "🗺️",
      "🧭",
      "🏕️",
      "👥",
      "👨‍👩‍👧‍👦",
      "🤝",
      "🎓",
      "📚",
      "🎯",
      "🏆",
    ]

    // Particle class for the background effect
    class Particle {
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      symbol: string
      color: string
      rotation: number
      rotationSpeed: number
      opacity: number
      scale: number

      constructor() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 20 + 10
        this.speedX = Math.random() * 0.5 - 0.25
        this.speedY = Math.random() * 0.5 - 0.25
        this.symbol = symbols[Math.floor(Math.random() * symbols.length)]
        this.rotation = Math.random() * Math.PI * 2
        this.rotationSpeed = (Math.random() * 0.02 - 0.01) * 0.1
        this.opacity = Math.random() * 0.5 + 0.1
        this.scale = Math.random() * 0.5 + 0.5

        // Use theme colors with varying opacity
        const isViolet = Math.random() > 0.7
        if (isViolet) {
          // Russian Violet with light opacity
          this.color = `rgba(35, 22, 81, ${this.opacity * 0.7})`
        } else {
          // Mint Green with light opacity
          this.color = `rgba(214, 255, 246, ${this.opacity})`
        }
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed

        // Wrap around edges
        if (this.x > canvas.width + this.size) this.x = -this.size
        else if (this.x < -this.size) this.x = canvas.width + this.size
        if (this.y > canvas.height + this.size) this.y = -this.size
        else if (this.y < -this.size) this.y = canvas.height + this.size
      }

      draw() {
        if (!ctx) return

        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate(this.rotation)
        ctx.scale(this.scale, this.scale)

        // Draw symbol
        ctx.font = `${this.size}px Arial`
        ctx.fillStyle = this.color
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(this.symbol, 0, 0)

        ctx.restore()
      }
    }

    // Create floating elements
    const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 30000))
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle())
    }

    // Create connection lines
    class Connection {
      particleA: Particle
      particleB: Particle
      distance: number
      maxDistance: number

      constructor(particleA: Particle, particleB: Particle) {
        this.particleA = particleA
        this.particleB = particleB
        this.maxDistance = 150
        this.distance = 0
      }

      update() {
        const dx = this.particleA.x - this.particleB.x
        const dy = this.particleA.y - this.particleB.y
        this.distance = Math.sqrt(dx * dx + dy * dy)
      }

      draw() {
        if (!ctx || this.distance > this.maxDistance) return

        const opacity = (1 - this.distance / this.maxDistance) * 0.2

        // Use Russian Violet for connections
        ctx.beginPath()
        ctx.strokeStyle = `rgba(35, 22, 81, ${opacity})`
        ctx.lineWidth = 1
        ctx.moveTo(this.particleA.x, this.particleA.y)
        ctx.lineTo(this.particleB.x, this.particleB.y)
        ctx.stroke()
      }
    }

    // Create connections between particles
    const connections: Connection[] = []
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        connections.push(new Connection(particles[i], particles[j]))
      }
    }

    // Animation loop
    const animate = () => {
      // Create a gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, "rgba(214, 255, 246, 0.2)") // Light mint green
      gradient.addColorStop(1, "rgba(214, 255, 246, 0.5)") // Slightly darker mint green
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw connections
      connections.forEach((connection) => {
        connection.update()
        connection.draw()
      })

      // Update and draw particles
      particles.forEach((particle) => {
        particle.update()
        particle.draw()
      })

      requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener("resize", setCanvasSize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 h-full w-full"
      style={{ background: "linear-gradient(to bottom right, #D6FFF6, #c5f0e6)" }}
    />
  )
}
