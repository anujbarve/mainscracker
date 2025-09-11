'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { useAuthStore } from '@/stores/auth'
import { useEffect } from 'react'

export default function HeroSection() {
    // 1. Get user and profile from the auth store
    const { user, profile, fetchUser } = useAuthStore()

    // Fetch user data when the component mounts to ensure state is up-to-date
    useEffect(() => {
        fetchUser()
    }, [fetchUser])

    // Helper function to determine the correct path for the button based on login status and role
    const getButtonPath = () => {
        // If the user isn't logged in (or profile is still loading), send them to the login page
        if (!user || !profile) {
            return '/login'
        }

        // Check the user's role to determine the destination
        switch (profile.role) {
            case 'student':
                // If the user is a student, link to the answer sheet submission page
                return '/student/answersheet'
            case 'admin':
                // If admin, link to their dashboard
                return '/admin/dashboard'
            case 'faculty':
                // If faculty, link to their dashboard
                return '/faculty/dashboard'
            default:
                // Fallback for any other case (e.g., an unknown role) is the login page
                return '/login'
        }
    }

    // Call the function to get the dynamic path
    const submitAnswerPath = getButtonPath()

    
    return (
        <main className="overflow-hidden">
            <section className="bg-linear-to-b to-muted from-background h-screen">
                <div className="relative py-36">
                    <div className="relative z-10 mx-auto w-full max-w-5xl px-6">
                        <div className="md:w-1/2">
                            <div>
                                <h1 className="max-w-md text-balance text-5xl font-semibold md:text-6xl">
                                    Preparing for UPSC Mains?
                                </h1>
                                <p className="text-muted-foreground my-8 max-w-2xl text-balance text-xl">
                                    Submit your answers, get expert evaluation in fixed time,
                                    and track progress using our simple credit system.
                                    Prepare smarter, not harder.
                                </p>

                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-3">
                                        <Button
                                            asChild
                                            size="lg"
                                            className="pr-4.5 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-primary dark:text-white"
                                        >
                                            {/* 4. Use the dynamic path for the Link's href */}
                                            <Link href={submitAnswerPath}>
                                                <span className="text-nowrap">Submit your answers</span>
                                                <ChevronRight className="opacity-70" />
                                            </Link>
                                        </Button>

                                        <Button
                                            asChild
                                            size="lg"
                                            variant="outline"
                                            className="pl-5 border-foreground/40 text-foreground hover:bg-foreground/10 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
                                        >
                                            <Link href="#watch-video">
                                                <span className="text-nowrap">See How It Works</span>
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="perspective-near mt-24 translate-x-12 md:absolute md:-right-6 md:bottom-16 md:left-1/2 md:top-40 md:mt-0 md:translate-x-0">
                        <div className="before:border-foreground/5 before:bg-foreground/5 relative h-full before:absolute before:-inset-x-4 before:bottom-7 before:top-0 before:skew-x-6 before:rounded-[calc(var(--radius)+1rem)] before:border">
                            <div className="bg-background rounded-(--radius) shadow-foreground/10 ring-foreground/5 relative h-full -translate-y-12 skew-x-6 overflow-hidden border border-transparent shadow-md ring-1">
                                <Image
                                    src="/images/hero.jpg"
                                    alt="Mock Evaluation Dashboard"
                                    width="2880"
                                    height="1842"
                                    className="object-top-left size-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    )
}