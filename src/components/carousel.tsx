'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type CarouselItem = {
  id: number
  image: string
  title?: string
  subtitle?: string
}

const items: CarouselItem[] = [
  {
    id: 1,
    image: 'hero-bg.jpg',
    title: 'Personalized Consulting',
    subtitle: 'Book expert sessions with ease',
  },
  {
    id: 2,
    image: 'hero-bg.jpg',
    title: 'Mock Paper Evaluations',
    subtitle: 'Get detailed feedback instantly',
  },
  {
    id: 3,
    image: 'hero-bg.jpg',
    title: 'Credit-Based System',
    subtitle: 'Only pay for what you use',
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
              <p className="text-lg md:text-xl opacity-90">{item.subtitle}</p>
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
