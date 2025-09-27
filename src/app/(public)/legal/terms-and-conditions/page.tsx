import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Post } from '../../blog/data'

const post : Post = {
  slug: 'terms-and-conditions',
  title: 'Terms and Conditions',
  description: 'The complete Terms and Conditions for mainscracker.com, governing the use of our services, user accounts, credit system, and more.',
  category: 'Legal',
  imageUrl: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80',
  date: 'September 27, 2025',
  author: {
    name: 'mainscracker.com Legal Team',
    avatarUrl: 'https://i.pravatar.cc/150?u=legal-team',
  },
  tags: ['legal', 'terms', 'rules', 'account', 'payment', 'privacy'],
  content: `
    <p>Welcome to mainscracker.com! These Terms and Conditions ("Terms") govern your use of our website and the services we offer. By accessing or using our website, you agree to be bound by these Terms. If you do not agree to these terms, please do not use our services. Please read them carefully.</p>
    <p><strong>Last Updated:</strong> September 27, 2025</p>

    <h2>1. Definitions</h2>
    <ul>
      <li><strong>"Website," "We," "Us," "Our"</strong>: Refers to mainscracker.com and its operators.</li>
      <li><strong>"User," "You," "Your"</strong>: Refers to any person accessing the website, including Students and Faculty.</li>
      <li><strong>"Student"</strong>: A registered user who purchases Credits to submit answer sheets for evaluation or to book mentorship sessions.</li>
      <li><strong>"Faculty"</strong>: A registered user authorized by us to evaluate answer sheets and conduct mentorship sessions.</li>
      <li><strong>"Admin"</strong>: An authorized administrator of the website with overarching access to manage the platform's functions.</li>
      <li><strong>"Services"</strong>: Includes the evaluation of mock or previous UPSC papers and the provision of online mentorship sessions.</li>
      <li><strong>"Credits"</strong>: Digital tokens purchased by Students to access the Services. They are categorized as:
        <ul>
          <li><strong>GS Credits</strong>: Used exclusively for the evaluation of General Studies (GS) answer sheets.</li>
          <li><strong>Specialized Credits</strong>: Used exclusively for the evaluation of Optional/Specialized subject answer sheets.</li>
          <li><strong>Mentorship Credits</strong>: Used exclusively for booking one-on-one mentorship sessions with Faculty.</li>
        </ul>
      </li>
    </ul>

    <h2>2. User Accounts</h2>
    <h3>Account Registration</h3>
    <p>To use our Services, you must register for an account. You agree to provide accurate, current, and complete information during the registration process. You must be at least 18 years of age to create an account.</p>
    <h3>Account Security</h3>
    <p>You are responsible for safeguarding your password and for all activities that occur under your account. You agree to notify us immediately of any unauthorized use of your account.</p>
    <h3>Account Termination</h3>
    <p>We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms, is harmful to other users, or is otherwise in violation of applicable law.</p>

    <h2>3. Services and Credit System</h2>
    <h3>Description of Services</h3>
    <p>mainscracker.com is a platform that connects UPSC aspirants (Students) with experienced educators (Faculty). Students can purchase Credits to have their answer sheets evaluated or to receive personalized mentorship.</p>
    <h3>Credit Purchase and Usage</h3>
    <ul>
        <li><strong>One GS Credit</strong> can be redeemed for the evaluation of <strong>one General Studies answer sheet</strong>.</li>
        <li><strong>One Specialized Credit</strong> can be redeemed for the evaluation of <strong>one Specialized/Optional answer sheet</strong>.</li>
        <li><strong>One Mentorship Credit</strong> can be redeemed for <strong>one mentorship session</strong> of a predetermined duration.</li>
    </ul>
    <h3>Non-Refundable Policy</h3>
    <p>All purchases of Credits are <strong>final and non-refundable</strong>. Unused Credits will not be refunded under any circumstances, including account termination.</p>
    <h3>Non-Transferable</h3>
    <p>Credits are non-transferable and cannot be sold, exchanged, or shared between user accounts.</p>
    <h3>Credit Expiration</h3>
    <p>Purchased Credits are valid for <strong>365 days</strong> from the date of purchase. Any unused Credits will automatically expire and be forfeited after this period.</p>

    <h2>4. User Obligations and Code of Conduct</h2>
    <h3>For Students:</h3>
    <ul>
      <li>You agree to submit answer sheets and materials that are your own original work. <strong>Plagiarism is strictly prohibited</strong>.</li>
      <li>You shall communicate with Faculty in a respectful and professional manner.</li>
    </ul>
    <h3>For Faculty:</h3>
    <ul>
      <li>You agree to provide constructive, unbiased, and timely feedback on all assigned answer sheets.</li>
      <li>You shall maintain the confidentiality of all Student submissions and personal information.</li>
    </ul>
    <h3>Prohibited Activities:</h3>
    <p>All users are prohibited from using the Website for any unlawful purpose, uploading malicious code, harassing other users, or violating intellectual property rights.</p>

    <h2>5. Intellectual Property Rights</h2>
    <h3>Our Content</h3>
    <p>All content on the Website, including text, graphics, logos, and software, is the exclusive property of mainscracker.com or its licensors and is protected by copyright laws.</p>
    <h3>User Content</h3>
    <p>You (the Student) retain all intellectual property rights to the answer sheets you submit. However, by submitting your work, you grant mainscracker.com a worldwide, non-exclusive, royalty-free license to use your content <strong>solely for the purpose of providing the Services</strong> (i.e., allowing Faculty to evaluate it and for internal quality control).</p>

    <h2>6. Disclaimers and Limitation of Liability</h2>
    <h3>No Guarantee of Success</h3>
    <p>The Services provided by mainscracker.com are for educational and guidance purposes only. We do not guarantee any specific results, including but not limited to success in the UPSC examination.</p>
    <h3>"As Is" Service</h3>
    <p>The Website and Services are provided on an "as is" and "as available" basis without any warranties, express or implied. We do not warrant that the service will be uninterrupted, timely, secure, or error-free.</p>
    <h3>Limitation of Liability</h3>
    <p>To the fullest extent permitted by law, mainscracker.com shall not be liable for any indirect, incidental, special, or consequential damages. Our total liability to you for any claim shall not exceed the amount you have paid to us in the 12 months preceding the claim.</p>
    
    <h2>7. Privacy</h2>
    <p>Your privacy is important to us. Our collection and use of personal information in connection with your access to and use of the Website are described in our <strong>Privacy Policy</strong>.</p>
    
    <h2>8. Governing Law and Dispute Resolution</h2>
    <p>These Terms shall be governed by and construed in accordance with the laws of India. Any dispute, claim, or controversy arising out of or relating to these Terms shall be subject to the exclusive jurisdiction of the courts located in <strong>Nashik, Maharashtra, India</strong>.</p>

    <h2>9. Changes to Terms</h2>
    <p>We reserve the right to modify these Terms at any time. If we make changes, we will post the revised Terms on the Website and update the "Last Updated" date. Your continued use of the Website after such changes have been posted will constitute your acceptance of the new Terms.</p>

    <h2>10. Contact Us</h2>
    <p>If you have any questions about these Terms and Conditions, please contact us at: <strong>support@mainscracker.com</strong></p>
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