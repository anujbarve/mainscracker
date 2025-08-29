'use client'

import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
} from "@/components/ui/form"
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin } from "lucide-react"

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  message: z.string().min(10, "Message must be at least 10 characters"),
})

type ContactFormValues = z.infer<typeof contactSchema>

export default function ContactSection() {
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
    },
  })

  function onSubmit(values: ContactFormValues) {
    console.log("Form submitted:", values)
    // API call or email logic goes here
  }

  return (
    <section>
      <div className="bg-muted py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 px-6 md:grid-cols-2">
          
          {/* Left Column - Info */}
          <div className="space-y-6">
            <h2 className="text-foreground text-3xl font-semibold lg:text-4xl">
              Get in Touch
            </h2>
            <p className="text-muted-foreground text-lg">
              Have questions about Mainscracker, credits, or turnaround time?  
              Reach out to us — we usually respond within 24 hours.
            </p>

            <div className="space-y-4 text-base">
              <p className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary" /> admin@mainscracker.com
              </p>
              <p className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary" /> +91 1234567890
              </p>
              <p className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary" /> Nashik, Maharastra
              </p>
            </div>

            <div className="flex gap-5 pt-4">
              <a href="#" className="hover:text-primary">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-primary">
                <Twitter className="h-6 w-6" />
              </a>
              <a href="#" className="hover:text-primary">
                <Linkedin className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Right Column - Form */}
          <div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-5 rounded-2xl bg-background p-6 shadow-sm"
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
                        <Input type="email" placeholder="you@example.com" {...field} />
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

                <Button type="submit" size="lg" className="w-full">
                  Send Message
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </section>
  )
}
