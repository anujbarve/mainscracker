'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { ChevronRight, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { useHomepageStore } from '@/stores/homepage'
import { motion, AnimatePresence } from 'framer-motion'

// A simple skeleton loader for the Hero section
const HeroSkeleton = () => (
    <div className="relative z-10 flex h-full items-center">
        <div className="mx-auto w-full max-w-6xl px-6">
            <div className="grid animate-pulse items-center gap-12 md:grid-cols-2">
                <div className="max-w-xl">
                    <div className="mb-4 h-12 w-3/4 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="h-8 w-1/2 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                    <div className="my-8 space-y-3">
                        <div className="h-4 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                        <div className="h-4 w-5/6 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-48 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                        <div className="h-12 w-40 rounded-lg bg-zinc-200 dark:bg-zinc-800"></div>
                    </div>
                </div>
                <div className="hidden h-[450px] rounded-2xl bg-zinc-200 dark:bg-zinc-800 md:block"></div>
            </div>
        </div>
    </div>
)

export default function HeroSection() {
    // Auth store for dynamic button links
    const { user, profile, fetchUser } = useAuthStore()
    // Homepage store for dynamic content
    const { data: homepageData, loading, fetchHomepageData } = useHomepageStore()

    const [currentIndex, setCurrentIndex] = useState(0)

    // Fetch user and homepage data on component mount
    useEffect(() => {
        fetchUser()
        fetchHomepageData()
    }, [fetchUser, fetchHomepageData])

    const heroSlides = homepageData?.heroSlides || []

    // Effect to cycle through the hero content once data is available
    useEffect(() => {
        if (heroSlides.length > 1) {
            const timer = setInterval(() => {
                setCurrentIndex((prevIndex) => (prevIndex + 1) % heroSlides.length)
            }, 7000) // Change slide every 7 seconds
            return () => clearInterval(timer)
        }
    }, [heroSlides.length])

    const getButtonPath = () => {
        if (!user || !profile) return '/login'
        switch (profile.role) {
            case 'student': return '/student/answersheet'
            case 'admin': return '/admin/dashboard'
            case 'faculty': return '/faculty/dashboard'
            default: return '/login'
        }
    }

    const submitAnswerPath = getButtonPath()

    if (loading && !homepageData) {
        return (
            <section className="relative h-screen w-full overflow-hidden">
                <div className="absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
                <HeroSkeleton />
            </section>
        )
    }

    if (!heroSlides.length) return null // Don't render if there's no data

    const currentSlide = heroSlides[currentIndex]

    const textVariants = {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
    }

    const imageVariants = {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
    }

    const TextContent = (
        <motion.div
            key={`${currentIndex}-text`}
            initial="initial" animate="animate" exit="exit"
            variants={textVariants}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="max-w-xl"
        >
            <TextGenerateEffect
                words={currentSlide.title}
                className="text-balance text-5xl font-semibold md:text-6xl"
                key={currentIndex}
            />
            <p className="my-8 text-balance text-lg text-muted-foreground">
                {currentSlide.description}
            </p>
            <div className="flex items-center gap-4">
                <Button asChild size="lg" className="group">
                    <Link href={submitAnswerPath}>
                        Submit your answers
                        <ChevronRight className="ml-1 size-5 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                    <Link href="#features">See How It Works</Link>
                </Button>
            </div>
        </motion.div>
    )

    const ImageContent = (
        <motion.div
            key={`${currentIndex}-image`}
            initial="initial" animate="animate" exit="exit"
            variants={imageVariants}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden md:block"
        >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-primary/10">
                <Image
                    src={currentSlide.imageSrc}
                    alt={currentSlide.imageAlt}
                    width={1200} height={821} priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
            </div>
        </motion.div>
    )

    return (
        <section className="relative h-screen w-full overflow-hidden">
            <div className="absolute inset-0 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px]"></div>
            <div className="relative z-10 flex h-full items-center">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="grid items-center gap-12 md:grid-cols-2">
                        <AnimatePresence mode="wait">
                            {currentSlide.layout === 'imageRight'
                                ? [TextContent, ImageContent]
                                : [ImageContent, TextContent]}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    )
}