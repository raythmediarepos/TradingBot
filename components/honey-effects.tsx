'use client'

import * as React from 'react'
import { motion } from 'framer-motion'

const HoneyEffects = () => {
  // Generate MORE bees (20 instead of 8)
  const bees = React.useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      duration: 10 + Math.random() * 15,
      delay: Math.random() * 5,
      path: Math.random() > 0.5 ? 'path1' : Math.random() > 0.5 ? 'path2' : 'path3',
      size: 0.7 + Math.random() * 0.6, // Varied sizes
    }))
  }, [])

  // Generate MORE honey drops (30 instead of 12)
  const honeyDrops = React.useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 3,
      size: 0.4 + Math.random() * 0.8,
    }))
  }, [])

  // Floating Honeycombs (NEW!)
  const floatingCombs = React.useMemo(() => {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i,
      startX: Math.random() * 100,
      startY: Math.random() * 100,
      duration: 20 + Math.random() * 10,
      delay: Math.random() * 5,
      size: 0.5 + Math.random() * 0.5,
    }))
  }, [])

  // Honey Splashes (NEW!)
  const honeySplashes = React.useMemo(() => {
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
    }))
  }, [])

  // Sparkles (NEW!)
  const sparkles = React.useMemo(() => {
    return Array.from({ length: 25 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 3,
      duration: 1.5 + Math.random() * 1.5,
    }))
  }, [])

  const beePathVariants = {
    path1: {
      x: ['0%', '120%', '-30%', '0%'],
      y: ['0%', '-40%', '90%', '0%'],
      rotate: [0, 90, -90, 0],
      scale: [1, 1.2, 0.8, 1],
    },
    path2: {
      x: ['0%', '-60%', '160%', '0%'],
      y: ['0%', '70%', '-30%', '0%'],
      rotate: [0, -90, 90, 0],
      scale: [1, 0.8, 1.2, 1],
    },
    path3: {
      x: ['0%', '80%', '80%', '-20%', '0%'],
      y: ['0%', '30%', '-30%', '60%', '0%'],
      rotate: [0, 45, -45, 135, 0],
      scale: [1, 1.3, 0.9, 1.1, 1],
    },
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-10">
      {/* Floating Bees - MORE AND CRAZIER! */}
      {bees.map((bee) => (
        <motion.div
          key={`bee-${bee.id}`}
          initial={{ 
            x: `${bee.startX}%`, 
            y: `${bee.startY}%`,
            opacity: 0,
            scale: bee.size,
          }}
          animate={{ 
            opacity: [0, 0.9, 0.9, 0],
          }}
          transition={{
            opacity: {
              duration: bee.duration,
              repeat: Infinity,
              delay: bee.delay,
            },
          }}
          className="absolute"
          style={{
            left: `${bee.startX}%`,
            top: `${bee.startY}%`,
          }}
        >
          <motion.div
            animate={
              bee.path === 'path1' 
                ? beePathVariants.path1 
                : bee.path === 'path2' 
                ? beePathVariants.path2 
                : beePathVariants.path3
            }
            transition={{
              duration: bee.duration,
              repeat: Infinity,
              delay: bee.delay,
              ease: 'linear',
            }}
          >
            {/* Enhanced Bee SVG with shadow trail */}
            <div className="relative">
              {/* Shadow trail */}
              <motion.div
                className="absolute inset-0"
                animate={{
                  opacity: [0.3, 0, 0.3],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <ellipse cx="12" cy="12" rx="4" ry="6" fill="#F5C518" opacity="0.3" />
                </svg>
              </motion.div>
              
              {/* Main bee */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="drop-shadow-lg relative">
                <ellipse cx="12" cy="12" rx="4" ry="6" fill="#F5C518" />
                <rect x="10" y="8" width="4" height="2" fill="#0A0A0A" rx="1" />
                <rect x="10" y="12" width="4" height="2" fill="#0A0A0A" rx="1" />
                <rect x="10" y="16" width="4" height="2" fill="#0A0A0A" rx="1" />
                <motion.ellipse
                  cx="8" cy="10" rx="3" ry="4"
                  fill="#ffffff" fillOpacity="0.7"
                  animate={{ ry: [4, 5.5, 4], rx: [3, 3.8, 3] }}
                  transition={{ duration: 0.2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.ellipse
                  cx="16" cy="10" rx="3" ry="4"
                  fill="#ffffff" fillOpacity="0.7"
                  animate={{ ry: [4, 5.5, 4], rx: [3, 3.8, 3] }}
                  transition={{ duration: 0.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
                />
                <circle cx="12" cy="6" r="2" fill="#F5C518" />
                <line x1="11" y1="5" x2="10" y2="3" stroke="#0A0A0A" strokeWidth="0.5" />
                <line x1="13" y1="5" x2="14" y2="3" stroke="#0A0A0A" strokeWidth="0.5" />
                <circle cx="10" cy="3" r="0.5" fill="#0A0A0A" />
                <circle cx="14" cy="3" r="0.5" fill="#0A0A0A" />
              </svg>
            </div>
          </motion.div>
        </motion.div>
      ))}

      {/* Honey Drops - WAY MORE! */}
      {honeyDrops.map((drop) => (
        <motion.div
          key={`drop-${drop.id}`}
          initial={{ y: -100, opacity: 0 }}
          animate={{
            y: '120vh',
            opacity: [0, 1, 1, 0],
            rotate: [0, 10, -10, 0],
          }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            delay: drop.delay,
            ease: 'easeIn',
            opacity: { times: [0, 0.1, 0.9, 1] },
          }}
          className="absolute"
          style={{
            left: `${drop.x}%`,
            transform: `scale(${drop.size})`,
          }}
        >
          <svg width="16" height="24" viewBox="0 0 16 24" fill="none" className="drop-shadow-xl">
            <defs>
              <linearGradient id={`honeyGradient-${drop.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#F5C518" stopOpacity="1" />
                <stop offset="50%" stopColor="#F5C518" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#D4A90E" stopOpacity="1" />
              </linearGradient>
              <filter id={`glow-${drop.id}`}>
                <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <path
              d="M8 0 C8 0, 4 8, 4 14 C4 18.4 5.8 22 8 22 C10.2 22 12 18.4 12 14 C12 8, 8 0, 8 0 Z"
              fill={`url(#honeyGradient-${drop.id})`}
              filter={`url(#glow-${drop.id})`}
            />
            <ellipse cx="6" cy="12" rx="1.5" ry="3" fill="#ffffff" fillOpacity="0.5" />
            <motion.circle
              cx="8"
              cy="8"
              r="1.5"
              fill="#ffffff"
              fillOpacity="0.3"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </svg>
        </motion.div>
      ))}

      {/* Floating Honeycombs - NEW! */}
      {floatingCombs.map((comb) => (
        <motion.div
          key={`comb-${comb.id}`}
          initial={{ 
            x: `${comb.startX}%`, 
            y: `${comb.startY}%`,
            opacity: 0,
            scale: comb.size,
          }}
          animate={{
            x: [`${comb.startX}%`, `${(comb.startX + 30) % 100}%`, `${comb.startX}%`],
            y: [`${comb.startY}%`, `${(comb.startY - 20 + 100) % 100}%`, `${comb.startY}%`],
            opacity: [0, 0.4, 0.4, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: comb.duration,
            repeat: Infinity,
            delay: comb.delay,
            ease: 'easeInOut',
          }}
          className="absolute"
          style={{
            left: `${comb.startX}%`,
            top: `${comb.startY}%`,
          }}
        >
          <svg width="40" height="40" viewBox="0 0 40 40">
            <polygon
              points="20,5 30,11 30,23 20,29 10,23 10,11"
              fill="none"
              stroke="#F5C518"
              strokeWidth="2"
              opacity="0.6"
            />
            <polygon
              points="20,8 28,13 28,22 20,27 12,22 12,13"
              fill="#F5C518"
              fillOpacity="0.1"
            />
          </svg>
        </motion.div>
      ))}

      {/* Honey Splashes - NEW! */}
      {honeySplashes.map((splash) => (
        <motion.div
          key={`splash-${splash.id}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1.5, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: splash.duration,
            repeat: Infinity,
            delay: splash.delay,
            ease: 'easeOut',
          }}
          className="absolute"
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
          }}
        >
          <svg width="60" height="60" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="25" fill="#F5C518" fillOpacity="0.3" />
            <circle cx="30" cy="30" r="15" fill="#F5C518" fillOpacity="0.5" />
            <circle cx="25" cy="25" r="8" fill="#F5C518" fillOpacity="0.4" />
            <circle cx="35" cy="28" r="6" fill="#F5C518" fillOpacity="0.4" />
            <circle cx="28" cy="35" r="7" fill="#F5C518" fillOpacity="0.4" />
          </svg>
        </motion.div>
      ))}

      {/* Sparkles - NEW! */}
      {sparkles.map((sparkle) => (
        <motion.div
          key={`sparkle-${sparkle.id}`}
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            opacity: [0, 1, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: sparkle.duration,
            repeat: Infinity,
            delay: sparkle.delay,
            ease: 'easeInOut',
          }}
          className="absolute"
          style={{
            left: `${sparkle.x}%`,
            top: `${sparkle.y}%`,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z"
              fill="#F5C518"
              opacity="0.8"
            />
          </svg>
        </motion.div>
      ))}

      {/* Enhanced Honey Comb Pattern in all corners */}
      <div className="absolute top-0 right-0 opacity-20">
        <HoneyComb />
      </div>
      <div className="absolute bottom-0 left-0 opacity-20 rotate-180">
        <HoneyComb />
      </div>
      <div className="absolute top-0 left-0 opacity-15 rotate-90">
        <HoneyComb />
      </div>
      <div className="absolute bottom-0 right-0 opacity-15 -rotate-90">
        <HoneyComb />
      </div>

      {/* CRAZY Honey Drip at top - Multiple waves */}
      <div className="absolute top-0 left-0 right-0">
        <svg
          width="100%"
          height="80"
          viewBox="0 0 1200 80"
          preserveAspectRatio="none"
          className="w-full"
        >
          <defs>
            <linearGradient id="honeyDripGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5C518" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#D4A90E" stopOpacity="0.2" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,0 L1200,0 L1200,25 Q1150,45 1100,25 Q1050,5 1000,25 Q950,45 900,25 Q850,5 800,25 Q750,45 700,25 Q650,5 600,25 Q550,45 500,25 Q450,5 400,25 Q350,45 300,25 Q250,5 200,25 Q150,45 100,25 Q50,5 0,25 Z"
            fill="url(#honeyDripGradient)"
            animate={{
              d: [
                "M0,0 L1200,0 L1200,25 Q1150,45 1100,25 Q1050,5 1000,25 Q950,45 900,25 Q850,5 800,25 Q750,45 700,25 Q650,5 600,25 Q550,45 500,25 Q450,5 400,25 Q350,45 300,25 Q250,5 200,25 Q150,45 100,25 Q50,5 0,25 Z",
                "M0,0 L1200,0 L1200,25 Q1150,35 1100,25 Q1050,15 1000,25 Q950,35 900,25 Q850,15 800,25 Q750,35 700,25 Q650,15 600,25 Q550,35 500,25 Q450,15 400,25 Q350,35 300,25 Q250,15 200,25 Q150,35 100,25 Q50,15 0,25 Z",
                "M0,0 L1200,0 L1200,25 Q1150,45 1100,25 Q1050,5 1000,25 Q950,45 900,25 Q850,5 800,25 Q750,45 700,25 Q650,5 600,25 Q550,45 500,25 Q450,5 400,25 Q350,45 300,25 Q250,5 200,25 Q150,45 100,25 Q50,5 0,25 Z",
              ],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          {/* More drip points */}
          {[150, 300, 450, 600, 750, 900, 1050].map((x, i) => (
            <motion.circle
              key={`drip-${i}`}
              cx={x}
              cy="30"
              r="4"
              fill="#F5C518"
              fillOpacity="0.7"
              animate={{
                cy: [30, 45, 30],
                r: [4, 3, 4],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.3,
              }}
            />
          ))}
        </svg>
      </div>

      {/* CRAZY Honey Puddles at bottom */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          width="100%"
          height="60"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          className="w-full"
        >
          <defs>
            <linearGradient id="puddleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F5C518" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#D4A90E" stopOpacity="0.5" />
            </linearGradient>
          </defs>
          <motion.path
            d="M0,60 L0,35 Q50,15 100,35 Q150,55 200,35 Q250,15 300,35 Q350,55 400,35 Q450,15 500,35 Q550,55 600,35 Q650,15 700,35 Q750,55 800,35 Q850,15 900,35 Q950,55 1000,35 Q1050,15 1100,35 Q1150,55 1200,35 L1200,60 Z"
            fill="url(#puddleGradient)"
            animate={{
              d: [
                "M0,60 L0,35 Q50,15 100,35 Q150,55 200,35 Q250,15 300,35 Q350,55 400,35 Q450,15 500,35 Q550,55 600,35 Q650,15 700,35 Q750,55 800,35 Q850,15 900,35 Q950,55 1000,35 Q1050,15 1100,35 Q1150,55 1200,35 L1200,60 Z",
                "M0,60 L0,35 Q50,25 100,35 Q150,45 200,35 Q250,25 300,35 Q350,45 400,35 Q450,25 500,35 Q550,45 600,35 Q650,25 700,35 Q750,45 800,35 Q850,25 900,35 Q950,45 1000,35 Q1050,25 1100,35 Q1150,45 1200,35 L1200,60 Z",
                "M0,60 L0,35 Q50,15 100,35 Q150,55 200,35 Q250,15 300,35 Q350,55 400,35 Q450,15 500,35 Q550,55 600,35 Q650,15 700,35 Q750,55 800,35 Q850,15 900,35 Q950,55 1000,35 Q1050,15 1100,35 Q1150,55 1200,35 L1200,60 Z",
              ],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </svg>
      </div>

      {/* Floating Honey Blobs - NEW! */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={`blob-${i}`}
          initial={{
            x: `${20 + i * 15}%`,
            y: `${30 + i * 10}%`,
          }}
          animate={{
            y: [`${30 + i * 10}%`, `${20 + i * 10}%`, `${30 + i * 10}%`],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
            delay: i * 0.5,
            ease: 'easeInOut',
          }}
          className="absolute"
        >
          <svg width="80" height="80" viewBox="0 0 80 80">
            <defs>
              <radialGradient id={`blobGradient-${i}`}>
                <stop offset="0%" stopColor="#F5C518" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#D4A90E" stopOpacity="0.1" />
              </radialGradient>
            </defs>
            <circle cx="40" cy="40" r="35" fill={`url(#blobGradient-${i})`} />
            <circle cx="40" cy="40" r="25" fill="#F5C518" fillOpacity="0.2" />
          </svg>
        </motion.div>
      ))}
    </div>
  )
}

// Enhanced Honeycomb Pattern Component
const HoneyComb = () => {
  return (
    <motion.svg
      width="300"
      height="300"
      viewBox="0 0 300 300"
      animate={{
        opacity: [0.5, 0.8, 0.5],
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <defs>
        <pattern id="honeycomb" x="0" y="0" width="50" height="43.4" patternUnits="userSpaceOnUse">
          <polygon
            points="25,0 50,14.43 50,43.3 25,57.73 0,43.3 0,14.43"
            fill="none"
            stroke="#F5C518"
            strokeWidth="2"
          />
          <polygon
            points="25,3 47,16 47,41 25,54 3,41 3,16"
            fill="#F5C518"
            fillOpacity="0.1"
          />
        </pattern>
      </defs>
      <rect width="300" height="300" fill="url(#honeycomb)" />
    </motion.svg>
  )
}

export default HoneyEffects
