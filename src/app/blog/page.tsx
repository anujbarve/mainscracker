'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { posts, Post } from './data' // Assuming this is your data source
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button' // <-- ADDED
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Search, X } from 'lucide-react' // <-- ADDED X icon
import { Skeleton } from '@/components/ui/skeleton' // <-- ADDED for loading state

// ++ IMPROVEMENT: Debounce hook for efficient searching
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

// ++ IMPROVEMENT: Extracted component for the featured post
const FeaturedPostCard = ({ post }: { post: Post }) => (
  <Link href={`/blog/${post.slug}`}>
    <Card className="grid overflow-hidden transition-all hover:shadow-xl md:grid-cols-2">
      <div className="relative h-64 w-full md:h-auto">
        <Image
          src={post.imageUrl}
          alt={post.title}
          fill
          className="object-cover"
        />
      </div>
      <div className="flex flex-col justify-between p-6 sm:p-8">
        <div>
          <Badge className="mb-4">{post.category}</Badge>
          <CardTitle className="text-3xl font-bold leading-tight">
            {post.title}
          </CardTitle>
          <CardDescription className="mt-4 text-base">
            {post.description}
          </CardDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} variant="outline">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
        <CardFooter className="mt-6 flex items-center gap-4 p-0">
          <Avatar>
            <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
            <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">{post.author.name}</p>
            <p className="text-sm text-muted-foreground">{post.date}</p>
          </div>
        </CardFooter>
      </div>
    </Card>
  </Link>
)

// ++ IMPROVEMENT: Extracted component for grid posts
const PostCard = ({ post }: { post: Post }) => (
  <Link href={`/blog/${post.slug}`} className="flex">
    <Card className="flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="relative h-48 w-full">
          <Image
            src={post.imageUrl}
            alt={post.title}
            fill
            className="object-cover"
          />
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-6">
        <Badge variant="secondary" className="w-fit">
          {post.category}
        </Badge>
        <CardTitle className="mt-4 text-xl font-semibold">{post.title}</CardTitle>
        {/* ++ IMPROVEMENT: Added truncated description for more context */}
        <CardDescription className="mt-2 line-clamp-2 text-sm">
            {post.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="mt-auto flex items-center gap-3 p-6 pt-0">
        <Avatar className="h-8 w-8">
          <AvatarImage src={post.author.avatarUrl} alt={post.author.name} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{post.author.name}</p>
          <p className="text-xs text-muted-foreground">{post.date}</p>
        </div>
      </CardFooter>
    </Card>
  </Link>
)

// ++ IMPROVEMENT: Extracted component for "No Results" state
const NoResults = ({ clearSearch }: { clearSearch: () => void }) => (
  <div className="mt-16 text-center">
    <h2 className="text-2xl font-semibold">No posts found</h2>
    <p className="mt-2 text-muted-foreground">
      Try adjusting your search query or clear the search to see all posts.
    </p>
    <Button onClick={clearSearch} variant="outline" className="mt-4">
      Clear Search
    </Button>
  </div>
)

// ++ IMPROVEMENT: Skeleton component for better loading UX
const BlogSkeletons = () => (
    <>
        {/* Featured Post Skeleton */}
        <div className="mt-16">
            <Card className="grid overflow-hidden md:grid-cols-2">
                <Skeleton className="h-64 w-full md:h-[450px]" />
                <div className="flex flex-col justify-between p-6 sm:p-8">
                    <div>
                        <Skeleton className="mb-4 h-6 w-24" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="mt-2 h-8 w-3/4" />
                        <Skeleton className="mt-4 h-5 w-full" />
                        <Skeleton className="mt-2 h-5 w-5/6" />
                    </div>
                    <div className="mt-6 flex items-center gap-4 p-0">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="w-full space-y-2">
                           <Skeleton className="h-4 w-1/3" />
                           <Skeleton className="h-4 w-1/4" />
                        </div>
                    </div>
                </div>
            </Card>
        </div>
        {/* Grid Skeletons */}
        <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
                <Card key={i} className="flex h-full flex-col">
                    <Skeleton className="h-48 w-full" />
                    <CardContent className="flex flex-1 flex-col p-6">
                        <Skeleton className="h-6 w-20" />
                        <Skeleton className="mt-4 h-6 w-full" />
                         <Skeleton className="mt-2 h-4 w-full" />
                         <Skeleton className="mt-1 h-4 w-2/3" />
                    </CardContent>
                    <CardFooter className="flex items-center gap-3 p-6 pt-0">
                        <Skeleton className="h-8 w-8 rounded-full" />
                         <div className="w-full space-y-2">
                           <Skeleton className="h-4 w-1/2" />
                           <Skeleton className="h-3 w-1/3" />
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    </>
)

export default function BlogListPage() {
  const [isLoading, setIsLoading] = useState(true); // <-- ADDED for loading state
  const [searchQuery, setSearchQuery] = useState('')
  const [filteredPosts, setFilteredPosts] = useState<Post[]>(posts)
  const debouncedSearchQuery = useDebounce(searchQuery, 300) // Debounce with 300ms delay

  // Effect to filter posts based on debounced search query
  useEffect(() => {
    // Simulate API loading time on initial load
    const timer = setTimeout(() => setIsLoading(false), 750); 
    
    const lowercasedQuery = debouncedSearchQuery.toLowerCase().trim()
    if (!lowercasedQuery) {
      setFilteredPosts(posts)
      return () => clearTimeout(timer);
    }

    const filtered = posts.filter((post) => {
      const titleMatch = post.title.toLowerCase().includes(lowercasedQuery)
      const descriptionMatch = post.description.toLowerCase().includes(lowercasedQuery)
      const tagsMatch = post.tags.some((tag) => tag.toLowerCase().includes(lowercasedQuery))
      return titleMatch || descriptionMatch || tagsMatch
    })
    
    setFilteredPosts(filtered)
    return () => clearTimeout(timer); // Cleanup timer
  }, [debouncedSearchQuery])

  const featuredPost = filteredPosts[0]
  const otherPosts = filteredPosts.slice(1)

  return (
    <div className="container mx-auto max-w-6xl px-6 py-24 sm:py-32">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          From the Blog
        </h1>
        <p className="mt-6 text-lg leading-8 text-muted-foreground">
          Insights, tutorials, and updates from our team.
        </p>
      </div>

      <div className="relative mx-auto mt-12 max-w-lg">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search articles..."
          className="w-full rounded-full pl-12 pr-10 h-12" // Increased padding and height
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full"
            onClick={() => setSearchQuery('')}
          >
             <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {isLoading ? (
        <BlogSkeletons />
      ) : filteredPosts.length > 0 ? (
        <>
          <div className="mt-16">
            <FeaturedPostCard post={featuredPost} />
          </div>

          {/* ++ IMPROVEMENT: Added a heading for better section separation */}
          {otherPosts.length > 0 && (
             <h2 className="mt-16 text-3xl font-bold tracking-tight">
                More Articles
             </h2>
          )}
          <div className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {otherPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </>
      ) : (
        <NoResults clearSearch={() => setSearchQuery('')} />
      )}
    </div>
  )
}