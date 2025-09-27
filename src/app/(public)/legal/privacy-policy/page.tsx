import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Post } from '../../blog/data'

const post : Post = {
  slug: 'privacy-policy',
  title: 'Privacy Policy',
  description: 'Our Privacy Policy explains how mainscracker.com collects, uses, and protects your personal information when you use our services.',
  category: 'Legal',
  imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
  date: 'September 27, 2025',
  author: {
    name: 'mainscracker.com Legal Team',
    avatarUrl: 'https://i.pravatar.cc/150?u=legal-team',
  },
  tags: ['privacy', 'legal', 'data', 'cookies', 'security'],
  content: `
    <p>Your privacy is of utmost importance to us at mainscracker.com ("we," "us," or "our"). This Privacy Policy outlines the types of personal information we collect, how we use it, and the measures we take to protect it.</p>
    <p><strong>Last Updated:</strong> September 27, 2025</p>

    <h2>1. Information We Collect</h2>
    <p>We collect information to provide and improve our services. The types of information we collect include:</p>
    <h3>A. Information You Provide to Us</h3>
    <ul>
      <li><strong>Account Information:</strong> When you register as a Student or Faculty, we collect personal details such as your name, email address, and a hashed password.</li>
      <li><strong>User Content:</strong> For Students, this includes the answer sheets you voluntarily upload for evaluation. For Faculty, this includes the feedback, grades, and comments you provide.</li>
      <li><strong>Communication:</strong> We may collect information when you contact us for support or provide feedback.</li>
    </ul>
    <h3>B. Information from Your Use of Our Services</h3>
    <ul>
        <li><strong>Transaction Information:</strong> When you purchase Credits, we collect information about the transaction, such as the date, time, and amount. Your full payment card details are processed by our third-party payment processors, and we do not store them on our servers.</li>
        <li><strong>Technical Information:</strong> We automatically collect certain information when you visit our website, such as your IP address, browser type, operating system, and device information.</li>
        <li><strong>Usage Data:</strong> We collect information about your interactions with our services, like the pages you visit, features you use, and the time spent on the site.</li>
    </ul>

    <h2>2. How We Use Your Information</h2>
    <p>We use the information we collect for the following purposes:</p>
    <ul>
      <li><strong>To Provide and Manage Services:</strong> To set up your account, process your answer sheet submissions, assign them to Faculty, and facilitate mentorship sessions.</li>
      <li><strong>To Process Payments:</strong> To process your purchase of GS, Specialized, and Mentorship Credits.</li>
      <li><strong>To Communicate With You:</strong> To send you service-related notifications, updates, security alerts, and respond to your support requests.</li>
      <li><strong>To Improve Our Platform:</strong> To analyze usage patterns, troubleshoot issues, and enhance the user experience.</li>
      <li><strong>For Security and Compliance:</strong> To prevent fraud, enforce our Terms and Conditions, and comply with legal obligations.</li>
    </ul>
    
    <h2>3. How We Share Your Information</h2>
    <p>We do not sell your personal data. We only share your information in the following circumstances:</p>
    <ul>
      <li><strong>With Faculty Members:</strong> To provide the evaluation service, we share a Student's name and submitted answer sheet with the assigned Faculty member. This information is shared under strict confidentiality obligations.</li>
      <li><strong>With Students:</strong> We may share a Faculty member's profile information (like name and qualifications) with Students.</li>
      <li><strong>With Service Providers:</strong> We use third-party vendors for services like payment processing, cloud hosting, and data analytics. These providers only have access to the information necessary to perform their functions and are contractually obligated to protect your data.</li>
      <li><strong>For Legal Reasons:</strong> We may disclose your information if required by law, subpoena, or other legal process, or if we believe in good faith that disclosure is necessary to protect our rights, your safety, or the safety of others.</li>
    </ul>

    <h2>4. Data Security</h2>
    <p>We implement a variety of security measures to maintain the safety of your personal information. These include technical and administrative measures like data encryption, access controls, and secure server infrastructure. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee its absolute security.</p>
    
    <h2>5. Data Retention</h2>
    <p>We retain your personal information for as long as your account is active or as needed to provide you with our services. We may also retain information to comply with our legal obligations, resolve disputes, and enforce our agreements.</p>

    <h2>6. Your Rights</h2>
    <p>You have certain rights regarding your personal information. Subject to local law, you may have the right to:</p>
    <ul>
      <li>Access the personal information we hold about you.</li>
      <li>Request that we correct any inaccurate information.</li>
      <li>Request that we delete your personal information.</li>
      <li>Object to or restrict the processing of your data.</li>
    </ul>
    <p>To exercise these rights, please contact us using the details below.</p>

    <h2>7. Children's Privacy</h2>
    <p>Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from children under 18. If we become aware that we have collected such information, we will take steps to delete it.</p>

    <h2>8. Changes to This Privacy Policy</h2>
    <p>We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "Last Updated" date. We encourage you to review this policy periodically.</p>
    
    <h2>9. Contact Us</h2>
    <p>If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at: <strong>privacy@mainscracker.com</strong></p>
  `,
};


export default async function SingleBlogPage() {

    return (
        <div className="py-24 sm:py-32">
            <div className="container mx-auto mb-12 max-w-3xl px-6">
                <Button asChild variant="ghost" className="mb-8">
                    <Link href="/blog">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Blog
                    </Link>
                </Button>
            </div>

            <article className="container mx-auto max-w-3xl px-6">
                {/* Post Header */}
                <header className="mb-12 text-center">
                    <Badge>{post.category}</Badge>
                    <h1 className="mt-6 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        {post.title}
                    </h1>
                    {/* Tags Display */}
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
                        {post.tags.map((tag) => (
                            <Badge key={tag} variant="secondary">
                                {tag}
                            </Badge>
                        ))}
                    </div>
                    <div className="mt-8 flex items-center justify-center gap-4">
                        <Avatar>
                            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
                            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-semibold">{post.author.name}</p>
                            <p className="text-sm text-muted-foreground">{post.date}</p>
                        </div>
                    </div>
                </header>

                {/* Cover Image */}
                <div className="relative mb-12 h-64 w-full rounded-2xl sm:h-96">
                    <Image
                        src={post.imageUrl}
                        alt={post.title}
                        fill
                        className="rounded-2xl object-cover"
                    />
                </div>

                {/* Post Content */}
                <div
                    className="prose prose-lg dark:prose-invert mx-auto max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </div>
    )
}