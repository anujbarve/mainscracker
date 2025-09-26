'use client'

import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Globe } from './ui/globe'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Send } from 'lucide-react'
import React from 'react'

const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Enter a valid email'),
    message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactSection() {
    const form = useForm<ContactFormValues>({
        resolver: zodResolver(contactSchema),
        defaultValues: {
            name: '',
            email: '',
            message: '',
        },
    })

    function onSubmit(values: ContactFormValues) {
        console.log('Form submitted:', values)
        // Add your API call or email logic here
        // Example: toast("Message sent successfully!")
    }

    return (
        <section className="relative w-full overflow-hidden bg-background py-24 sm:py-32">
            {/* Background Globe */}
            <div className="absolute inset-0 z-0 opacity-20 dark:opacity-30">
                <Globe className="top-0 h-full w-full" />
            </div>

            <div className="relative z-10 mx-auto max-w-6xl px-6">
                <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-20">
                    {/* Left Column - Info */}
                    <div className="flex flex-col justify-center space-y-6">
                        <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
                            Get in Touch
                        </h2>
                        <p className="text-muted-foreground text-balance text-lg">
                            Have questions about our platform, credits, or turnaround time? Reach out to us—we usually respond within 24 hours.
                        </p>

                        <div className="space-y-4 pt-4 text-base">
                            <InfoItem icon={<Mail />}>admin@mainscracker.com</InfoItem>
                            <InfoItem icon={<Phone />}>+91 12345 67890</InfoItem>
                            <InfoItem icon={<MapPin />}>Nashik, Maharashtra, India</InfoItem>
                        </div>
                    </div>

                    {/* Right Column - Form */}
                    <div className="rounded-2xl border bg-card/50 p-6 shadow-lg backdrop-blur-sm sm:p-8">
                        <Form {...form}>
                            <form
                                onSubmit={form.handleSubmit(onSubmit)}
                                className="space-y-5"
                            >
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="John Doe" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input
                                                    type="email"
                                                    placeholder="you@example.com"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="message"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Your Message</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="Write your message here..."
                                                    className="min-h-[120px]"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="flex flex-col items-center gap-6 pt-2 sm:flex-row">
                                    <Button type="submit" size="lg" className="w-full sm:w-auto">
                                        Send Message <Send className="ml-2 size-4" />
                                    </Button>
                                    <div className="flex gap-4">
                                        <SocialLink href="#">
                                            <Facebook className="size-5" />
                                        </SocialLink>
                                        <SocialLink href="#">
                                            <Twitter className="size-5" />
                                        </SocialLink>
                                        <SocialLink href="#">
                                            <Linkedin className="size-5" />
                                        </SocialLink>
                                    </div>
                                </div>
                            </form>
                        </Form>
                    </div>
                </div>
            </div>
        </section>
    )
}

// Reusable component for contact info items
const InfoItem = ({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center gap-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            {icon}
        </div>
        <span className="text-muted-foreground">{children}</span>
    </div>
)

// Reusable component for social media links
const SocialLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
    <a
        href={href}
        className="text-muted-foreground transition-colors hover:text-primary"
        target="_blank"
        rel="noopener noreferrer"
    >
        {children}
    </a>
)