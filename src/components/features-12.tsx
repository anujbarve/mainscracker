'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, ClipboardList, UserCheck, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
import { BorderBeam } from '@/components/magicui/border-beam'

// Define the structure for a single feature
type Feature = {
    id: string
    title: string
    description: string
    icon: React.ReactNode
    image: string
    alt: string
}

// Array of feature data for easy management
const features: Feature[] = [
    {
        id: 'evaluation',
        title: 'Rapid Paper Evaluation',
        description:
            'Get answers evaluated by faculty within 24-48 hours, not weeks, enabling faster feedback and improvement cycles.',
        icon: <Clock className="size-6" />,
        image: '/images/features/evaluation.png',
        alt: 'A dashboard showing a paper evaluated in under 48 hours.',
    },
    {
        id: 'dashboard',
        title: 'Minimalist Student Dashboard',
        description:
            'A clean, focused interface where students can upload papers, track submissions, and access their evaluated results anytime.',
        icon: <ClipboardList className="size-6" />,
        image: '/images/features/student_dashboard.png',
        alt: 'A clean student dashboard for test submissions.',
    },
    {
        id: 'faculty',
        title: 'Efficient Faculty Tools',
        description:
            'Faculty receive an intuitive workspace to manage evaluations, mark papers digitally, and deliver detailed feedback efficiently.',
        icon: <UserCheck className="size-6" />,
        image: '/images/features/faculty.png',
        alt: 'An interface showing faculty evaluation tools.',
    },
    {
        id: 'analytics',
        title: 'Performance Analytics',
        description:
            'Visual reports and insightful data help students identify strengths, weaknesses, and trends to guide their UPSC preparation.',
        icon: <BarChart3 className="size-6" />,
        image: '/images/features/analytics.png',
        alt: 'A chart displaying student performance analytics.',
    },
]

// The main component for the features section
export default function Features() {
    const [activeFeature, setActiveFeature] = useState<Feature>(features[0])
    const [userInteracted, setUserInteracted] = useState(false)

    // Auto-cycle through features until the user interacts
    useEffect(() => {
        if (userInteracted) return

        const interval = setInterval(() => {
            const currentIndex = features.findIndex((f) => f.id === activeFeature.id)
            const nextIndex = (currentIndex + 1) % features.length
            setActiveFeature(features[nextIndex])
        }, 5000) // Change feature every 5 seconds

        return () => clearInterval(interval)
    }, [activeFeature, userInteracted])

    const handleFeatureClick = (feature: Feature) => {
        setUserInteracted(true)
        setActiveFeature(feature)
    }

    return (
        <section id="features" className="relative py-20 md:py-28 lg:py-32">
            {/* Background Gradient */}
            <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(217,217,217,0.05),rgba(255,255,255,0))]"></div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                {/* Section Header */}
                <div className="mx-auto max-w-3xl text-center">
                    <TextGenerateEffect
                        words="A smarter way to prepare for the UPSC."
                        className="text-balance text-4xl font-semibold lg:text-5xl"
                    />
                    <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground">
                        Our platform is built with powerful, intuitive features designed to accelerate your learning and evaluation cycle.
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="mt-16 grid items-center gap-12 md:mt-20 md:grid-cols-2 lg:gap-20">
                    {/* Left Column: Feature Triggers */}
                    <div className="flex flex-col gap-4">
                        {features.map((feature) => (
                            <FeatureCard
                                key={feature.id}
                                feature={feature}
                                isActive={activeFeature.id === feature.id}
                                onClick={() => handleFeatureClick(feature)}
                            />
                        ))}
                    </div>

                    {/* Right Column: Image Viewer */}
                    <div className="relative flex h-[500px] w-full items-center justify-center rounded-2xl bg-zinc-900/5 p-4 ring-1 ring-inset ring-zinc-900/10 dark:bg-zinc-900 dark:ring-white/10">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeFeature.id}
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                transition={{ duration: 0.4, ease: 'easeOut' }}
                                className="h-full w-full overflow-hidden rounded-lg"
                            >
                                <Image
                                    src={activeFeature.image}
                                    alt={activeFeature.alt}
                                    width={1207}
                                    height={929}
                                    className="size-full rounded-lg object-cover object-left-top shadow-md"
                                />
                            </motion.div>
                        </AnimatePresence>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-600 to-transparent dark:via-white/80"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

// A reusable card component for selecting features
function FeatureCard({
    feature,
    isActive,
    onClick,
}: {
    feature: Feature
    isActive: boolean
    onClick: () => void
}) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative cursor-pointer rounded-xl border border-transparent p-6 transition-all duration-300',
                isActive
                    ? 'bg-zinc-100/80 dark:bg-zinc-900' // Active state style
                    : 'hover:bg-zinc-100/50 dark:hover:bg-zinc-900/50' // Hover state style
            )}
        >
            <div className="flex items-start gap-5">
                <div
                    className={cn(
                        'mt-1 flex size-8 shrink-0 items-center justify-center rounded-full transition-colors',
                        isActive
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                    )}
                >
                    {feature.icon}
                </div>
                <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <p className="mt-1 text-muted-foreground">{feature.description}</p>
                </div>
            </div>
            {isActive && (
                <motion.div
                    layoutId="active-feature-border"
                    className="absolute inset-0 rounded-xl border-2 border-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
            )}
        </div>
    )
}