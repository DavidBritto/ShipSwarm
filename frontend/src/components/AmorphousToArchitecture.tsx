import React, { useEffect, useRef, useState } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  targetX: number
  targetY: number
  radius: number
  color: string
  label?: string
}

export const AmorphousToArchitecture: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [phase, setPhase] = useState<'crystallized' | 'amorphous'>('crystallized')
  const [hovered, setHovered] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    let width = (canvas.width = canvas.parentElement?.clientWidth || 1000)
    let height = (canvas.height = 420)

    const handleResize = () => {
      if (!canvas.parentElement) return
      width = canvas.width = canvas.parentElement.clientWidth
      height = canvas.height = 420
    }
    window.addEventListener('resize', handleResize)

    // Structural Target Nodes (The Well-Architected Topology)
    const centerX = width / 2
    const centerY = height / 2 - 10

    const topologyLayout = [
      // Core AWS Architecture Nodes
      { x: centerX - 240, y: centerY, label: 'Client / Ingest', color: '#06b6d4', radius: 6 },
      { x: centerX - 120, y: centerY - 45, label: 'API Gateway', color: '#10b981', radius: 7 },
      { x: centerX, y: centerY - 70, label: 'Bedrock Synthesizer', color: '#6366f1', radius: 9 },
      { x: centerX, y: centerY + 40, label: 'Lambda Function', color: '#f59e0b', radius: 7 },
      { x: centerX + 130, y: centerY + 40, label: 'DynamoDB Table', color: '#10b981', radius: 7 },
      { x: centerX + 240, y: centerY - 15, label: 'Sentinel Swarm', color: '#f43f5e', radius: 8 },
      // Satellite Cloud Conduits
      { x: centerX - 60, y: centerY + 85, label: 'IAM Policy', color: '#10b981', radius: 5 },
      { x: centerX + 70, y: centerY - 80, label: 'CloudWatch Logs', color: '#06b6d4', radius: 5 },
      { x: centerX + 180, y: centerY - 65, label: 'Security Group', color: '#f43f5e', radius: 5 },
    ]

    // Create 75 particles (some mapped to topology, rest are amorphous ambient nebulae)
    const particleCount = 75
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const isTopology = i < topologyLayout.length
      const layoutNode = isTopology ? topologyLayout[i] : null

      const angle = Math.random() * Math.PI * 2
      const dist = 60 + Math.random() * 180

      particles.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        targetX: layoutNode ? layoutNode.x : centerX + Math.cos(angle) * dist,
        targetY: layoutNode ? layoutNode.y : centerY + Math.sin(angle) * dist,
        radius: layoutNode ? layoutNode.radius : 1.5 + Math.random() * 2.5,
        color: layoutNode ? layoutNode.color : Math.random() > 0.4 ? '#10b981' : Math.random() > 0.5 ? '#06b6d4' : '#6366f1',
        label: layoutNode ? layoutNode.label : undefined,
      })
    }

    let progress = 1 // 0 = fully chaotic amorphous blob, 1 = crystallized architecture
    let direction = 1
    let time = 0

    const render = () => {
      time += 0.02
      ctx.clearRect(0, 0, width, height)

      // Auto-morphing cycle: slowly breathe between amorphous chaos and crystalline structure
      if (!hovered) {
        progress += 0.005 * direction
        if (progress >= 1) {
          progress = 1
          if (Math.random() < 0.008) direction = -1 // hold crystallized longer
        } else if (progress <= 0.15) {
          progress = 0.15
          direction = 1
        }
      } else {
        // When hovered, firmly hold the crystalline architecture
        progress += (1 - progress) * 0.08
      }

      const isCrystallized = progress > 0.65
      setPhase(isCrystallized ? 'crystallized' : 'amorphous')

      // Draw Amorphous Nebula Glow
      const fluidX = centerX + Math.sin(time * 0.8) * 40 * (1 - progress)
      const fluidY = centerY + Math.cos(time * 0.6) * 30 * (1 - progress)
      const radialGradient = ctx.createRadialGradient(
        fluidX, fluidY, 10,
        centerX, centerY, 220 + (1 - progress) * 80
      )
      radialGradient.addColorStop(0, 'rgba(16, 185, 129, 0.22)')
      radialGradient.addColorStop(0.35, 'rgba(6, 182, 212, 0.14)')
      radialGradient.addColorStop(0.7, 'rgba(99, 102, 241, 0.06)')
      radialGradient.addColorStop(1, 'transparent')

      ctx.fillStyle = radialGradient
      ctx.beginPath()
      ctx.arc(centerX, centerY, 280, 0, Math.PI * 2)
      ctx.fill()

      // Update & Draw Particles
      particles.forEach((p, idx) => {
        // Chaos / Amorphous drift motion
        const chaosAngle = time + idx * 0.25
        const chaosDist = 70 + Math.sin(time * 0.5 + idx) * 80
        const chaosX = centerX + Math.cos(chaosAngle) * chaosDist
        const chaosY = centerY + Math.sin(chaosAngle * 1.2) * chaosDist * 0.6

        // Interpolate between Chaos and Structured Architecture target
        const currentTargetX = chaosX * (1 - progress) + p.targetX * progress
        const currentTargetY = chaosY * (1 - progress) + p.targetY * progress

        p.x += (currentTargetX - p.x) * 0.06
        p.y += (currentTargetY - p.y) * 0.06

        // Draw particle
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.shadowColor = p.color
        ctx.shadowBlur = p.label ? 16 : 8
        ctx.fill()
        ctx.shadowBlur = 0

        // If it's a primary node, draw label & ring when crystallized
        if (p.label && progress > 0.4) {
          const alpha = (progress - 0.4) / 0.6

          // Outer pulsing ring
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.radius + 4 + Math.sin(time * 2 + idx) * 2, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.35})`
          ctx.lineWidth = 1
          ctx.stroke()

          // Node Text Badge
          ctx.fillStyle = `rgba(244, 244, 245, ${alpha * 0.95})`
          ctx.font = '10px "JetBrains Mono", monospace'
          ctx.textAlign = 'center'
          ctx.fillText(p.label, p.x, p.y + p.radius + 14)
        }
      })

      // Draw Architecture Conduits / Crystalline Circuit Lines
      if (progress > 0.2) {
        const lineAlpha = (progress - 0.2) / 0.8

        const connections = [
          [0, 1], // Ingest -> API GW
          [1, 2], // API GW -> Bedrock
          [1, 3], // API GW -> Lambda
          [2, 3], // Bedrock -> Lambda
          [3, 4], // Lambda -> DynamoDB
          [3, 5], // Lambda -> Sentinel
          [4, 5], // DynamoDB -> Sentinel
          [3, 6], // Lambda -> IAM
          [2, 7], // Bedrock -> CloudWatch
          [4, 8], // DynamoDB -> Sec Group
        ]

        connections.forEach(([fromIdx, toIdx]) => {
          const from = particles[fromIdx]
          const to = particles[toIdx]
          if (!from || !to) return

          ctx.beginPath()
          ctx.moveTo(from.x, from.y)
          ctx.lineTo(to.x, to.y)

          const grad = ctx.createLinearGradient(from.x, from.y, to.x, to.y)
          grad.addColorStop(0, from.color)
          grad.addColorStop(1, to.color)

          ctx.strokeStyle = grad
          ctx.globalAlpha = lineAlpha * 0.6
          ctx.lineWidth = 1.5
          ctx.stroke()
          ctx.globalAlpha = 1.0

          // Little moving energy pulses along the architectural conduit
          const pulseT = (time * 0.8 + fromIdx) % 1
          const pulseX = from.x + (to.x - from.x) * pulseT
          const pulseY = from.y + (to.y - from.y) * pulseT

          ctx.beginPath()
          ctx.arc(pulseX, pulseY, 2, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.shadowColor = '#ffffff'
          ctx.shadowBlur = 8
          ctx.fill()
          ctx.shadowBlur = 0
        })
      }

      animationFrameId = requestAnimationFrame(render)
    }

    render()

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrameId)
    }
  }, [hovered])

  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-[380px] my-2 select-none"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Background Canvas for Organic Fluid to Crystalline Topology */}
      <canvas 
        ref={canvasRef} 
        className="w-full h-full block cursor-crosshair"
      />

      {/* State Indicator Pill (Dynamic status overlay) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center space-x-3 px-4 py-1.5 rounded-full bg-black/60 border border-white/[0.08] backdrop-blur-md text-[11px] font-mono text-zinc-400 shadow-2xl">
        <span className="flex h-2 w-2 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${phase === 'crystallized' ? 'bg-emerald-400' : 'bg-cyan-400'}`} />
          <span className={`relative inline-flex rounded-full h-2 w-2 ${phase === 'crystallized' ? 'bg-emerald-500' : 'bg-cyan-500'}`} />
        </span>
        <span>
          {phase === 'crystallized' 
            ? 'State: Crystallized Well-Architected Topology' 
            : 'State: Raw Amorphous Intent (Synthesizing...)'}
        </span>
        <span className="text-zinc-600 hidden sm:inline">•</span>
        <span className="text-zinc-500 text-[10px] hidden sm:inline">Hover to Lock Architecture</span>
      </div>
    </div>
  )
}
