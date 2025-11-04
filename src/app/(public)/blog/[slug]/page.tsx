import Image from 'next/image'
import { notFound } from 'next/navigation'
import { BlogPost } from '@/lib/blog-types'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createPublicClient } from '@/utils/public-client'

// This function tells Next.js which slugs to pre-render at build time.
// For now, we'll return empty array to use dynamic rendering
// You can fetch all slugs from the database here if you want static generation
export async function generateStaticParams() {
    // Fetch all active blog post slugs from database
    try {
        const supabase = createPublicClient();
        const { data } = await supabase
            .from("help_content")
            .select("slug")
            .eq("is_active", true)
            .not("published_at", "is", null);
        
        return data?.map((post) => ({ slug: post.slug })) || [];
    } catch (error) {
        console.error("Error fetching blog post slugs:", error);
        return [];
    }
}

export default async function SingleBlogPage({params}: {params: Promise<{ slug: string }>}) {
    const { slug } = await params;

    // Fetch post directly from database
    let post: BlogPost | null = null;
    try {
        const supabase = createPublicClient();
        const { data, error } = await supabase
            .from("help_content")
            .select(`
                *,
                author_profile:profiles!help_content_created_by_fkey(
                    id,
                    full_name
                )
            `)
            .eq("slug", slug)
            .eq("is_active", true)
            .not("published_at", "is", null)
            .lte("published_at", new Date().toISOString()) // Only show posts published in the past or now
            .single();

        if (!error && data) {
            // Transform using adapter
            const { adaptHelpContentToBlogPost } = await import('@/lib/blog-adapter');
            post = adaptHelpContentToBlogPost(data);
        }
    } catch (error) {
        console.error('Error fetching blog post:', error);
    }

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