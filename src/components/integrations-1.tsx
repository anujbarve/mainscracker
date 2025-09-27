'use client'

import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'
import { BorderBeam } from '@/components/magicui/border-beam'
import { useHomepageStore, type SamplePaper } from '@/stores/homepage'

export default function SamplesSection() {
    const { data: homepageData, fetchHomepageData } = useHomepageStore()
    const sampleData = homepageData?.samplePapers || []
    
    const [activeSample, setActiveSample] = useState<SamplePaper | null>(null)

    // Fetch data on mount
    useEffect(() => {
        fetchHomepageData()
    }, [fetchHomepageData])

    // Set the initial active sample once data is loaded
    useEffect(() => {
        if (sampleData.length > 0 && !activeSample) {
            setActiveSample(sampleData[0])
        }
    }, [sampleData, activeSample])

    // You can add a skeleton loader here if you prefer
    if (!sampleData.length && !homepageData) return null

    return (
        <section className="bg-zinc-50/50 py-24 dark:bg-zinc-900/50 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-balance text-3xl font-semibold md:text-4xl">
                        See How Evaluations Are Performed
                    </h2>
                    <p className="mt-4 text-muted-foreground">
                        Download sample evaluated answer sheets to understand the feedback, annotations, and scoring you’ll receive for your UPSC Mains answers.
                    </p>
                </div>

                <div className="mt-16 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
                    <div className="relative hidden h-[450px] w-full items-center justify-center rounded-2xl bg-white p-4 shadow-sm ring-1 ring-inset ring-zinc-900/10 dark:bg-zinc-900 dark:ring-white/10 lg:flex">
                        <AnimatePresence mode="wait">
                            {activeSample && (
                                <motion.div
                                    key={activeSample.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3, ease: 'easeOut' }}
                                    className="h-full w-full overflow-hidden rounded-lg"
                                >
                                    <Image
                                        src={activeSample.previewImage}
                                        alt={`Preview of ${activeSample.title}`}
                                        width={800} height={1000}
                                        className="size-full rounded-lg object-cover object-top"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                        <BorderBeam duration={8} size={200} />
                    </div>

                    <div className="flex flex-col gap-4">
                        {sampleData.map((sample) => (
                            <SampleCard
                                key={sample.id}
                                title={sample.title}
                                description={sample.description}
                                link={sample.link}
                                isActive={activeSample?.id === sample.id}
                                onClick={() => setActiveSample(sample)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

const SampleCard = ({
  title,
  description,
  link,
  isActive,
  onClick,
}: {
  title: string
  description: string
  link: string
  isActive: boolean
  onClick: () => void
}) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'group relative cursor-pointer overflow-hidden rounded-xl border p-6 transition-all duration-300',
                isActive
                    ? 'border-primary/50 bg-primary/5 dark:bg-primary/10'
                    : 'border-zinc-200 bg-white hover:border-primary/50 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-primary/50 dark:hover:bg-zinc-900'
            )}
        >
            <h3 className="text-base font-semibold">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            <div className="mt-4">
                <Button asChild variant="secondary" size="sm" className="shadow-none">
                    <Link href={link} target="_blank" rel="noopener noreferrer">
                        Download PDF
                        <ChevronRight className="ml-1 size-4 opacity-70" />
                    </Link>
                </Button>
            </div>
            {isActive && (
                <motion.div
                    layoutId="active-sample-border"
                    className="absolute inset-0 rounded-xl border-2 border-primary"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                />
            )}
        </div>
    )
}