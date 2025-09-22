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
  IconHelp,
  IconFileText,
  IconMessage,
  IconExternalLink,
  IconChevronRight,
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

export type SupportTicket = {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  priority: "low" | "medium" | "high" | "urgent";
  type: "bug" | "question" | "feature_request" | "billing" | "technical" | "other";
  status: "open" | "in_progress" | "resolved" | "closed";
  assigned_to: string | null;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
  last_reply_at: string;
};

// --- Main Help Page Component ---
export default function HelpPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading, fetchUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [helpArticles, setHelpArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<HelpArticle[]>([]);
  const [isSearching, setIsSearching] = useState(false);

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
      fetchHelpData();
    }
  }, [user, authLoading, router, fetchUser]);

  const fetchHelpData = async () => {
    setLoading(true);
    try {
      // Fetch help articles
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      const { data: articles, error: articlesError } = await supabase
        .from("help_content")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (articlesError) throw articlesError;

      setHelpArticles(articles || []);
    } catch (error) {
      console.error("Error fetching help data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      // Use ilike for case-insensitive search across multiple columns
      const { data, error } = await supabase
        .from("help_content")
        .select("*")
        .eq("is_active", true)
        .or(`topic.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`);

      if (error) throw error;
      setSearchResults(data || []);
    } catch (error) {
      console.error("Error searching articles:", error);
      // Fallback to client-side search if database search fails
      const query = searchQuery.toLowerCase();
      const filtered = helpArticles.filter(article => 
        article.topic.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.keywords.some(keyword => keyword.toLowerCase().includes(query))
      );
      setSearchResults(filtered);
    } finally {
      setIsSearching(false);
    }
  };


  const filteredArticles = helpArticles.filter(article => 
    selectedCategory === "all" || article.category === selectedCategory
  );

  const categories = ["all", ...new Set(helpArticles.map(article => article.category))];
  const basePath = getBasePath();

  if (loading || authLoading) {
    return <HelpPageSkeleton />;
  }

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions, browse our knowledge base, or get help from our support team.
          </p>
        </div>

        {/* Search Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconSearch className="h-5 w-5" />
              Search Knowledge Base
            </CardTitle>
            <CardDescription>
              Search through our help articles using keywords
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="Search for help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                <IconSearch className="h-4 w-4 mr-2" />
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>
            
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <h3 className="font-semibold">Search Results</h3>
                {searchResults.map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`${basePath}/help/article/${article.slug}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{article.topic}</h4>
                          <p className="text-sm text-muted-foreground">{article.category}</p>
                        </div>
                        <IconChevronRight className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconHelp className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              Quick answers to common questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {helpArticles
                .filter(article => article.faq === true)
                .slice(0, 6)
                .map((article) => (
                  <Card key={article.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`${basePath}/help/article/${article.slug}`)}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">{article.topic}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {article.content.substring(0, 100)}...
                          </p>
                        </div>
                        <IconExternalLink className="h-4 w-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
            <div className="mt-4 text-center">
              <Button variant="outline" onClick={() => router.push(`${basePath}/help/articles`)}>
                View All Articles
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* All Articles Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Knowledge Base
            </CardTitle>
            <CardDescription>
              Browse all help articles by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select category" />
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
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredArticles.map((article) => (
                <Card key={article.id} className="cursor-pointer hover:bg-accent" onClick={() => router.push(`${basePath}/help/article/${article.slug}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{article.category}</Badge>
                      <IconExternalLink className="h-4 w-4" />
                    </div>
                    <h4 className="font-medium mb-2">{article.topic}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {article.content.substring(0, 150)}...
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>


        {/* Support Tickets Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMessage className="h-5 w-5" />
              Support Tickets
            </CardTitle>
            <CardDescription>
              Manage your support requests and track their progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-semibold">Need More Help?</h3>
                <p className="text-sm text-muted-foreground">
                  Submit a support ticket for personalized assistance
                </p>
              </div>
              <Button 
                onClick={() => router.push(`${basePath}/help/tickets`)}
                className="w-full sm:w-auto"
              >
                <IconMessage className="h-4 w-4 mr-2" />
                View Support Tickets
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

// --- Skeleton Component ---
function HelpPageSkeleton() {
  return (
    <div className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
