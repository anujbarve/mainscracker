'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Clock, ClipboardList, UserCheck, BarChart3 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { BorderBeam } from '@/components/magicui/border-beam'

export default function Features() {
    type ImageKey = 'item-1' | 'item-2' | 'item-3' | 'item-4'
    const [activeItem, setActiveItem] = useState<ImageKey>('item-1')

    const images = {
        'item-1': {
            image: '/images/features/evaluation.png',
            alt: 'Fast answer sheet evaluation',
        },
        'item-2': {
            image: '/images/features/student_dashboard.png',
            alt: 'Easy test submission dashboard',
        },
        'item-3': {
            image: '/images/features/faculty.png',
            alt: 'Faculty evaluation tools',
        },
        'item-4': {
            image: '/images/features/analytics.png',
            alt: 'Student feedback and progress analytics',
        },
    }

    return (
        <section id='features' className="py-12 md:py-20 lg:py-32">
            <div className="bg-linear-to-b absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl dark:block dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))]"></div>
            <div className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16 lg:space-y-20 dark:[--color-border:color-mix(in_oklab,var(--color-white)_10%,transparent)]">
                <div className="relative z-10 mx-auto max-w-2xl space-y-6 text-center">
                    <h2 className="text-balance text-4xl font-semibold lg:text-6xl">Effortless Evaluation. Instant Feedback.</h2>
                    <p>Your one-stop UPSC mock test platform for fast evaluations, personalized dashboards, and continuous progress tracking.</p>
                </div>

                <div className="grid gap-12 sm:px-12 md:grid-cols-2 lg:gap-20 lg:px-0">
                    <Accordion
                        type="single"
                        value={activeItem}
                        onValueChange={(value) => setActiveItem(value as ImageKey)}
                        className="w-full">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <Clock className="size-4" />
                                    Rapid Paper Evaluation
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Submitted answers are evaluated within 24–48 hours by faculty, enabling faster feedback and improvement cycles.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-2">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <ClipboardList className="size-4" />
                                    Student Dashboard
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                A clean, minimal dashboard where students can upload papers, track submissions, and access results anytime.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <UserCheck className="size-4" />
                                    Faculty Tools
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Faculty receive an intuitive interface to manage evaluations, mark papers, and deliver detailed feedback efficiently.
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                <div className="flex items-center gap-2 text-base">
                                    <BarChart3 className="size-4" />
                                    Performance Analytics
                                </div>
                            </AccordionTrigger>
                            <AccordionContent>
                                Visual reports help students identify strengths, weaknesses, and trends—guiding them toward UPSC success.
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <div className="bg-background relative flex overflow-hidden rounded-3xl border p-2">
                        <div className="w-15 absolute inset-0 right-0 ml-auto border-l bg-[repeating-linear-gradient(-45deg,var(--color-border),var(--color-border)_1px,transparent_1px,transparent_8px)]"></div>
                        <div className="aspect-76/59 bg-background relative w-[calc(3/4*100%+3rem)] rounded-2xl">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={`${activeItem}-id`}
                                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 6, scale: 0.98 }}
                                    transition={{ duration: 0.2 }}
                                    className="size-full overflow-hidden rounded-2xl border bg-zinc-900 shadow-md">
                                    <Image
                                        src={images[activeItem].image}
                                        className="size-full object-cover object-left-top dark:mix-blend-lighten"
                                        alt={images[activeItem].alt}
                                        width={1207}
                                        height={929}
                                    />
                                </motion.div>
                            </AnimatePresence>
                        </div>
                        <BorderBeam
                            duration={6}
                            size={200}
                            className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}

// new version but experimental 

// 'use client'

// import React from 'react'
// import { BentoGrid, BentoGridItem } from '@/components/ui/bento-grid'
// import { TextGenerateEffect } from '@/components/ui/text-generate-effect'
// import { Clock, ClipboardList, UserCheck, BarChart3 } from 'lucide-react'
// import Image from 'next/image'
// import { BorderBeam } from '@/components/magicui/border-beam'
// import { cn } from '@/lib/utils'

// // Reusable Image Card component with the FIX
// const ImageCard = ({
//     src,
//     alt,
//     className,
//     beam = false,
// }: {
//     src: string
//     alt: string
//     className?: string
//     beam?: boolean
// }) => (
//     <div
//         className={cn(
//             // FIX #1: Added aspect-video to enforce a 16:9 aspect ratio
//             'relative flex size-full min-h-[6rem] items-center justify-center overflow-hidden rounded-xl aspect-video',
//             className
//         )}
//     >
//         <Image
//             src={src}
//             width={1207}
//             height={929}
//             // FIX #2: Changed object-left-top to object-center for better cropping behavior
//             className="size-full rounded-xl object-cover object-center transition duration-200 group-hover/bento:scale-105"
//             alt={alt}
//         />
//         {beam && (
//             <BorderBeam
//                 duration={8}
//                 size={250}
//                 delay={2}
//                 className="from-transparent via-yellow-700 to-transparent dark:via-white/50"
//             />
//         )}
//     </div>
// )

// export default function Features() {
//     return (
//         <section id="features" className="relative py-12 md:py-20 lg:py-20">
//             <div className="bg-linear-to-b dark:to-[color-mix(in_oklab,var(--color-zinc-900)_75%,var(--color-background))] absolute inset-0 -z-10 sm:inset-6 sm:rounded-b-3xl" />
//             <div className="mx-auto max-w-3xl space-y-4 px-6 text-center">
//                 <TextGenerateEffect
//                     words="A smarter way to prepare for the UPSC."
//                     className="text-balance text-4xl font-semibold lg:text-6xl"
//                 />
//                 <p className="text-zinc-600 dark:text-zinc-400">
//                     Our platform is built from the ground up with powerful, intuitive features designed to accelerate your learning and evaluation cycle.
//                 </p>
//             </div>
//             <div className="mt-16">
//                 <BentoGrid className="mx-auto max-w-4xl">
//                     {items.map((item, i) => (
//                         <BentoGridItem
//                             key={i}
//                             title={item.title}
//                             description={item.description}
//                             header={item.header}
//                             icon={item.icon}
//                             className={item.className}
//                         />
//                     ))}
//                 </BentoGrid>
//             </div>
//         </section>
//     )
// }

// const items = [
//     {
//         title: 'Rapid Paper Evaluation',
//         description: 'Get your answers evaluated by faculty within 24-48 hours, not weeks.',
//         header: <ImageCard src="/images/features/evaluation.png" alt="Fast answer sheet evaluation" />,
//         icon: <Clock className="h-4 w-4 text-neutral-500" />,
//         className: 'md:col-span-1',
//     },
//     {
//         title: 'Minimalist Student Dashboard',
//         description: 'Upload papers, track submissions, and view results in a clean, focused interface.',
//         header: <ImageCard src="/images/features/student_dashboard.png" alt="Easy test submission dashboard" />,
//         icon: <ClipboardList className="h-4 w-4 text-neutral-500" />,
//         className: 'md:col-span-1',
//     },
//     {
//         title: 'Efficient Faculty Tools',
//         description: 'An intuitive interface for faculty to manage evaluations and provide detailed feedback.',
//         header: <ImageCard src="/images/features/faculty.png" alt="Faculty evaluation tools" />,
//         icon: <UserCheck className="h-4 w-4 text-neutral-500" />,
//         className: 'md:col-span-1',
//     },
//     {
//         title: 'In-Depth Performance Analytics',
//         description: 'Visual reports to identify strengths, weaknesses, and track progress over time.',
//         header: <ImageCard src="/images/features/analytics.png" alt="Student feedback and progress analytics" beam />,
//         icon: <BarChart3 className="h-4 w-4 text-neutral-500" />,
//         className: 'md:col-span-3',
//     },
// ]
