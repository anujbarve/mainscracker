"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- Icons ---
import {
  IconSearch,
  IconFileText,
  IconExternalLink,
  IconChevronRight,
  IconArrowLeft,
  IconTag,
  IconCalendar,
} from "@tabler/icons-react";

// --- Types ---
export type HelpArticle = {
  id: string;
  topic: string;
  slug: string;
  content: string;
  keywords: string[];
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  faq: boolean;
};

// --- Help Articles Component ---
export default function HelpArticles() {
  const router = useRouter();
  const { user, profile, loading: authLoading, fetchUser } = useAuthStore();
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFaqOnly, setShowFaqOnly] = useState(false);
  const [filteredArticles, setFilteredArticles] = useState<HelpArticle[]>([]);

  // Get base path based on user role
  const getBasePath = () => {
    if (profile?.role === "faculty") return "/faculty";
    if (profile?.role === "admin") return "/admin";
    return "/student";
  };

  // Initialize auth and fetch data on component mount
  useEffect(() => {
    // First, try to fetch user if not already loaded
    if (!user && !authLoading) {
      fetchUser();
      return;
    }
    
    // Only redirect if we're sure there's no user (not just loading)
    if (user === null && !authLoading) {
      router.replace("/login");
      return;
    }
    if (user) {
      fetchHelpArticles();
    }
  }, [user, authLoading, router, fetchUser]);

  // Filter articles when search query, category, or FAQ filter changes
  useEffect(() => {
    let filtered = helpArticles;

    // Filter by FAQ status
    if (showFaqOnly) {
      filtered = filtered.filter(article => article.faq === true);
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article => 
        article.topic.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
    }

    setFilteredArticles(filtered);
  }, [helpArticles, searchQuery, selectedCategory, showFaqOnly]);

  const fetchHelpArticles = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("help_content")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setHelpArticles(data || []);
    } catch (error) {
      console.error("Error fetching help articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const categories = ["all", ...new Set(helpArticles.map(article => article.category))];

  if (loading || authLoading) {
    return <HelpArticlesSkeleton />;
  }

  const basePath = getBasePath();

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Knowledge Base</h1>
            <p className="text-muted-foreground">
              Browse all help articles and find answers to your questions
            </p>
          </div>
        </div>

        {/* Search and Filter */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="flex-1">
                <Input
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <div className="w-full md:w-48">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category === "all" ? "All Categories" : category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  variant={showFaqOnly ? "default" : "outline"}
                  onClick={() => setShowFaqOnly(!showFaqOnly)}
                  className="whitespace-nowrap"
                >
                  FAQ Only
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {filteredArticles.length} article{filteredArticles.length !== 1 ? 's' : ''} found
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== "all" && ` in ${selectedCategory}`}
            {showFaqOnly && ` (FAQ only)`}
          </p>
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <IconFileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Articles Found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery 
                  ? `No articles found matching "${searchQuery}". Try a different search term.`
                  : "No articles available in this category."
                }
              </p>
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                  setShowFaqOnly(false);
                }}
              >
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredArticles.map((article) => (
              <Card 
                key={article.id} 
                className="cursor-pointer hover:bg-accent transition-colors group"
                onClick={() => router.push(`${basePath}/help/article/${article.slug}`)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{article.category}</Badge>
                    <IconExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg line-clamp-2">{article.topic}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {article.content.substring(0, 150)}...
                  </p>
                  
                  {article.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {article.keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          <IconTag className="h-3 w-3 mr-1" />
                          {keyword}
                        </Badge>
                      ))}
                      {article.keywords.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{article.keywords.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <IconCalendar className="h-3 w-3" />
                    Updated {formatDate(article.updated_at)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Back to Help Center */}
        <div className="text-center">
          <Button 
            variant="outline" 
            onClick={() => router.push(`${basePath}/help`)}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>
        </div>
      </div>
    </main>
  );
}

// --- Skeleton Component ---
function HelpArticlesSkeleton() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-48" />
            </div>
          </CardContent>
        </Card>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-4 w-4" />
                </div>
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="flex gap-1 mb-3">
                  <Skeleton className="h-5 w-12" />
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
