'use client'

import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { posts, Post } from './data' // Assuming this is your data source
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, X, BookOpenText, ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils' // Import for conditional classes

// Debounce hook (unchanged from original)
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])
  return debouncedValue
}

// ++ REDESIGNED: Featured Post Card for a more immersive look
const FeaturedPostCard = ({ post }: { post: Post }) => (
  <Link href={`/blog/${post.slug}`} className="group block">
    <Card className="relative grid min-h-[450px] w-full overflow-hidden rounded-2xl border-none shadow-2xl transition-all duration-500 ease-out group-hover:scale-[1.02]">
      {/* Background Image */}
      <Image
        src={post.imageUrl}
        alt={post.title}
        fill
        className="z-0 object-cover transition-transform duration-500 ease-out group-hover:scale-110"
      />
      {/* Gradient Overlay for Text Readability */}
      <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* Content */}
      <div className="relative z-20 flex flex-col justify-end p-8 text-white md:p-10">
        <Badge className="mb-4 w-fit border-white/50 bg-white/20 backdrop-blur-sm">
          {post.category}
        </Badge>
        <CardTitle className="text-3xl font-bold leading-tight drop-shadow-lg md:text-4xl">
          {post.title}
        </CardTitle>
        <CardDescription className="mt-3 max-w-lg text-base text-neutral-300 drop-shadow-md">
          {post.description}
        </CardDescription>
        <div className="mt-6 flex items-center gap-4">
          <Avatar className="h-12 w-12 border-2 border-white/50">
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-sm text-neutral-300">{post.date}</p>
          </div>
        </div>
      </div>
    </Card>
  </Link>
)

// ++ REDESIGNED: Standard Post Card for a cleaner, modern feel
// ++ REDESIGNED v3: Minimalist Horizontal Post "Card"
const PostCard = ({ post }: { post: Post }) => (
  <Link
    href={`/blog/${post.slug}`}
    className="group grid items-start gap-6 rounded-lg p-4 transition-colors hover:bg-accent sm:grid-cols-3"
  >
    {/* Image Section */}
    <div className="relative col-span-1 h-40 w-full overflow-hidden rounded-md">
      <Image
        src={post.imageUrl}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
      />
    </div>

    {/* Content Section */}
    <div className="col-span-2 flex h-full flex-col">
      <div className="flex flex-1 flex-col justify-center">
        <div className="mb-3 flex items-center gap-3">
          <Badge variant="secondary">{post.category}</Badge>
          <p className="text-sm text-muted-foreground">{post.date}</p>
        </div>
        <h3 className="text-xl font-bold leading-tight tracking-tight text-foreground group-hover:text-primary">
          {post.title}
        </h3>
      </div>

      {/* Author Footer */}
      <div className="mt-4 flex items-center gap-3 pt-4">
        <Avatar className="h-9 w-9">
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-semibold">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">Author</p>
        </div>
        <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-1 group-hover:opacity-100" />
      </div>
    </div>
  </Link>
);

// ++ REDESIGNED: No Results state with an icon
const NoResults = ({ clearFilters }: { clearFilters: () => void }) => (
  <div className="mt-24 flex flex-col items-center justify-center text-center">
    <BookOpenText className="h-16 w-16 text-muted-foreground/50" />
    <h2 className="mt-6 text-2xl font-semibold">No Posts Found</h2>
    <p className="mt-2 max-w-md text-muted-foreground">
      We couldn't find any articles matching your search or filter. Try a
      different query or clear the filters to see all posts.
    </p>
    <Button onClick={clearFilters} variant="outline" className="mt-6">
      Clear All Filters
    </Button>
  </div>
)

// ++ REDESIGNED: Skeletons to match the new UI
const BlogSkeletons = () => (
  <>
    {/* Featured Post Skeleton */}
    <div className="mt-12">
      <Card className="relative grid min-h-[450px] w-full overflow-hidden rounded-2xl bg-muted">
        <div className="flex flex-col justify-end p-8 md:p-10">
          <Skeleton className="mb-4 h-6 w-24 rounded-full" />
          <Skeleton className="h-10 w-full rounded-md md:h-12" />
          <Skeleton className="mt-2 h-8 w-3/4 rounded-md" />
          <Skeleton className="mt-4 h-5 w-full rounded-md" />
          <Skeleton className="mt-2 h-5 w-5/6 rounded-md" />
          <div className="mt-6 flex items-center gap-4">
            <Skeleton className="h-12 w-12 rounded-full" />
            <div className="w-40 space-y-2">
              <Skeleton className="h-4 w-full rounded-md" />
              <Skeleton className="h-4 w-2/3 rounded-md" />
            </div>
          </div>
        </div>
      </Card>
    </div>

    {/* Grid Skeletons */}
    <div className="mt-16 border-t pt-16">
      <Skeleton className="mb-8 h-9 w-48 rounded-md" />
      <div className="grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="grid items-start gap-6 rounded-lg p-4 sm:grid-cols-3">
            {/* Image Skeleton */}
            <Skeleton className="col-span-1 h-40 w-full rounded-md" />

            {/* Content Skeleton */}
            <div className="col-span-2 flex h-full flex-col">
              <div className="flex flex-1 flex-col justify-center">
                <div className="mb-3 flex items-center gap-3">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-6 w-5/6" />
                </div>
              </div>
              {/* Author Footer Skeleton */}
              <div className="mt-4 flex items-center gap-3 pt-4">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="w-24 space-y-1">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
)

export default function BlogListPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Memoize unique categories to prevent re-computation
  const categories = useMemo(
    () => ['All', ...Array.from(new Set(posts.map((p) => p.category)))],
    [],
  )

  const filteredPosts = useMemo(() => {
    const lowercasedQuery = debouncedSearchQuery.toLowerCase().trim()

    return posts.filter((post) => {
      // Category filter
      const categoryMatch =
        !selectedCategory ||
        selectedCategory === 'All' ||
        post.category === selectedCategory

      // Search query filter
      if (!lowercasedQuery) return categoryMatch

      const titleMatch = post.title.toLowerCase().includes(lowercasedQuery)
      const descriptionMatch = post.description.toLowerCase().includes(lowercasedQuery)
      const tagsMatch = post.tags.some((tag) => tag.toLowerCase().includes(lowercasedQuery))
      const authorMatch = post.author.name.toLowerCase().includes(lowercasedQuery)

      return categoryMatch && (titleMatch || descriptionMatch || tagsMatch || authorMatch)
    })
  }, [debouncedSearchQuery, selectedCategory])

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 750)
    return () => clearTimeout(timer)
  }, [])

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedCategory('All')
  }

  const featuredPost = filteredPosts[0]
  const otherPosts = filteredPosts.slice(1)

  return (
    <div className="bg-background text-foreground">
      <div className="container mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
        {/* Page Header */}
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">
              From the Blog
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
              Insights, tutorials, and updates from our team. Explore by topic
              or search for what you need.
            </p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="w-full rounded-full bg-muted pl-11 pr-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="mt-8 flex flex-wrap items-center gap-2 border-b pb-4">
          {categories.map((category) => (
            <Button
              key={category}
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className={cn(
                'rounded-full transition-colors',
                selectedCategory === category
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'hover:bg-accent',
              )}
            >
              {category}
            </Button>
          ))}
          {(searchQuery || (selectedCategory && selectedCategory !== 'All')) && (
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1.5 rounded-full text-muted-foreground hover:text-foreground"
              onClick={clearFilters}
            >
              <X className="h-4 w-4" /> Clear
            </Button>
          )}
        </div>

        {/* Content Section */}
        {isLoading ? (
          <BlogSkeletons />
        ) : filteredPosts.length > 0 ? (
          <>
            <div className="mt-12">
              <FeaturedPostCard post={featuredPost} />
            </div>

            {otherPosts.length > 0 && (
              <div className="mt-16 border-t pt-16">
                <h2 className="text-3xl font-bold tracking-tight">
                  More Articles
                </h2>
                <div className="mt-8 grid gap-8 sm:grid-cols-1 lg:grid-cols-2">
                  {otherPosts.map((post) => (
                    <PostCard key={post.slug} post={post} />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <NoResults clearFilters={clearFilters} />
        )}
      </div>
    </div>
  )
}