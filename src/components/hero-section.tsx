'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { ChevronRight } from 'lucide-react'
import { useAuthStore } from '@/stores/auth'
import { motion, AnimatePresence } from 'framer-motion'

// Data for the dynamic hero slides
const heroContent = [
    {
        title: 'Preparing for UPSC Mains?',
        description:
            'Submit your answers, get expert evaluation in a fixed time, and track progress using our simple credit system. Prepare smarter, not harder.',
        imageSrc: '/images/hero.jpg',
        imageAlt: 'UPSC preparation dashboard',
        layout: 'imageRight',
    },
    {
        title: 'In-Depth Expert Evaluation',
        description:
            'Our experienced faculty provides detailed feedback on your answers, highlighting your strengths and crucial areas for improvement.',
        imageSrc: '/images/hero-bg2.jpg',
        imageAlt: 'Expert evaluating an answer sheet',
        layout: 'imageLeft',
    },
    {
        title: 'Track Your Progress Over Time',
        description:
            'Use our intuitive dashboard to monitor your performance. Identify patterns, focus your efforts, and watch your scores improve.',
        imageSrc: '/images/hero-bg3.jpg',
        imageAlt: 'Graph showing student progress',
        layout: 'imageRight',
    },
]

export default function HeroSection() {
    const { user, profile, fetchUser } = useAuthStore()
    const [currentIndex, setCurrentIndex] = useState(0)

    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    // Effect to cycle through the hero content
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % heroContent.length)
        }, 7000) // Change slide every 7 seconds

        return () => clearInterval(timer) // Cleanup on unmount
    }, [])

    const getButtonPath = () => {
        if (!user || !profile) return '/login'
        switch (profile.role) {
            case 'student':
                return '/student/answersheet'
            case 'admin':
                return '/admin/dashboard'
            case 'faculty':
                return '/faculty/dashboard'
            default:
                return '/login'
        }
    }

    const submitAnswerPath = getButtonPath()
    const currentSlide = heroContent[currentIndex]

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
            initial="initial"
            animate="animate"
            exit="exit"
            variants={textVariants}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
            className="max-w-xl"
        >
            <TextGenerateEffect
                words={currentSlide.title}
                className="text-5xl font-semibold md:text-6xl text-balance"
                key={currentIndex} // Re-trigger effect on change
            />
            <p className="text-muted-foreground my-8 text-balance text-lg">
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
            initial="initial"
            animate="animate"
            exit="exit"
            variants={imageVariants}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="hidden md:block"
        >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
                <Image
                    src={currentSlide.imageSrc}
                    alt={currentSlide.imageAlt}
                    width={1200}
                    height={821}
                    priority
                    className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent"></div>
            </div>
        </motion.div>
    )

    return (
        <section className="relative w-full h-screen overflow-hidden">
            {/* Grid Background */}
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