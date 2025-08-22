'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type CarouselButton = {
  label: string
  type?: "primary" | "secondary" | "outline"
  link: string
}

type CarouselItem = {
  id: number
  image: string
  title?: string
  subtitle?: string
  buttons?: CarouselButton[]
}

const items: CarouselItem[] = [
  {
    id: 1,
    image: 'hero-bg.jpg',
    title: 'Personalized Consulting',
    subtitle: 'Book expert sessions with ease',
    buttons: [
      { label: 'Book Now', type: 'primary', link: '/login' },
      { label: 'Learn More', type: 'outline', link: '#features' },
    ]
  },
  {
    id: 2,
    image: 'hero-bg2.jpg',
    title: 'Mock Paper Evaluations',
    subtitle: 'Get detailed feedback instantly',
    buttons: [
      { label: 'Upload Paper', type: 'secondary', link: '#upload' },
    ]
  },
  {
    id: 3,
    image: 'hero-bg3.jpg',
    title: 'Credit-Based System',
    subtitle: 'Only pay for what you use',
    buttons: [
      { label: 'Get Credits', type: 'primary', link: '/credits' },
      { label: 'Pricing', type: 'outline', link: '#pricing' },
      { label: 'Contact Us', type: 'secondary', link: '/contact' },
    ]
  },
]

export function Carousel() {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [isPaused])

  return (
    <div
      className="relative w-full h-[90vh] overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          animate={{ x: `${(index - current) * 100}%` }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute top-0 left-0 w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${item.image})` }}
        >
          {/* Tint overlay */}
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center text-center text-white p-4">
            {item.title && (
              <h2 className="text-3xl md:text-5xl font-bold mb-2">{item.title}</h2>
            )}
            {item.subtitle && (
              <p className="text-lg md:text-xl opacity-90 mb-6">{item.subtitle}</p>
            )}

            {/* Buttons as Links */}
            {item.buttons && (
              <div className="flex flex-wrap gap-4 justify-center">
                {item.buttons.map((btn, i) => (
                  <a
                    key={i}
                    href={btn.link}
                    className={cn(
                      "px-6 py-3 rounded-full font-semibold transition min-w-[140px] text-center",
                      btn.type === "primary" && "bg-white text-black hover:bg-gray-200",
                      btn.type === "secondary" && "bg-gray-700 text-white hover:bg-gray-600",
                      btn.type === "outline" && "border border-white text-white hover:bg-white hover:text-black"
                    )}
                  >
                    {btn.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      ))}

      {/* Indicators */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {items.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={cn(
              'w-3 h-3 rounded-full transition-all',
              index === current ? 'bg-white' : 'bg-white/40'
            )}
          />
        ))}
      </div>
    </div>
  )
}
