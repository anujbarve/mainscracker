import Image from 'next/image'
import { notFound } from 'next/navigation'
import { posts } from '../data'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

// This function tells Next.js which slugs to pre-render at build time.
export async function generateStaticParams() {
    return posts.map((post) => ({
        slug: post.slug,
    }))
}

export default async function SingleBlogPage({params}: {params: Promise<{ slug: string }>}) {
    const { slug } = await params;

    const post = posts.find((p) => p.slug === slug)

    if (!post) {
        notFound() // If no post is found, show a 404 page
    }

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