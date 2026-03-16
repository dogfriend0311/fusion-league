'use client'
import { useEffect, useRef } from 'react'

export default function AnimatedBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId
    let footballs = []
    let stars = []

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Create stars
    for (let i = 0; i < 200; i++) {
      stars.push({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random(),
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleDir: Math.random() > 0.5 ? 1 : -1
      })
    }

    // Football spawner
    const spawnFootball = () => {
      footballs.push({
        x: -80,
        y: Math.random() * (window.innerHeight * 0.7) + 50,
        speed: Math.random() * 3 + 2,
        rotation: 0,
        rotationSpeed: Math.random() * 0.1 + 0.05,
        scale: Math.random() * 0.5 + 0.7
      })
      const next = (Math.random() * 5000) + 5000
      setTimeout(spawnFootball, next)
    }
    spawnFootball()

    // Draw football shape
    const drawFootball = (ctx, x, y, rotation, scale) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.scale(scale, scale)

      // Body
      ctx.beginPath()
      ctx.ellipse(0, 0, 30, 18, 0, 0, Math.PI * 2)
      ctx.fillStyle = '#8B4513'
      ctx.fill()
      ctx.strokeStyle = '#5a2d0c'
      ctx.lineWidth = 2
      ctx.stroke()

      // Laces
      ctx.strokeStyle = 'white'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(-8, -6)
      ctx.lineTo(-8, 6)
      ctx.moveTo(-3, -8)
      ctx.lineTo(-3, 8)
      ctx.moveTo(2, -8)
      ctx.lineTo(2, 8)
      ctx.moveTo(7, -6)
      ctx.lineTo(7, 6)
      ctx.moveTo(-8, 0)
      ctx.lineTo(7, 0)
      ctx.stroke()

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Background gradient
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, '#0a0a1a')
      gradient.addColorStop(1, '#0d1b2a')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and twinkle stars
      stars.forEach(star => {
        star.opacity += star.twinkleSpeed * star.twinkleDir
        if (star.opacity >= 1 || star.opacity <= 0.1) star.twinkleDir *= -1

        ctx.beginPath()
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
        ctx.fill()
      })

      // Draw footballs
      footballs = footballs.filter(f => f.x < canvas.width + 100)
      footballs.forEach(f => {
        f.x += f.speed
        f.rotation += f.rotationSpeed
        drawFootball(ctx, f.x, f.y, f.rotation, f.scale)
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        pointerEvents: 'none'
      }}
    />
  )
}