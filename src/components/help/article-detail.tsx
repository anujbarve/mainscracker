"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";
import { cn } from "@/lib/utils";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

// --- Icons ---
import {
  IconArrowLeft,
  IconCalendar,
  IconTag,
  IconFileText,
  IconChevronLeft,
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

type ArticleDetailProps = {
  slug: string;
};

// --- Article Detail Component ---
export default function ArticleDetail({ slug }: ArticleDetailProps) {
  const router = useRouter();
  const { user, profile, loading: authLoading, fetchUser } = useAuthStore();
  const [article, setArticle] = useState<HelpArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<HelpArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get base path based on user role
  const getBasePath = () => {
    if (profile?.role === "faculty") return "/faculty";
    if (profile?.role === "admin") return "/admin";
    return "/student";
  };

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
      fetchArticle();
    }
  }, [slug, user, authLoading, router, fetchUser]);

  const fetchArticle = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      // Fetch the specific article
      const { data: articleData, error: articleError } = await supabase
        .from("help_content")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (articleError) {
        if (articleError.code === 'PGRST116') {
          setError("Article not found");
        } else {
          throw articleError;
        }
        return;
      }

      setArticle(articleData);

      // Fetch related articles (same category, excluding current article)
      const { data: relatedData, error: relatedError } = await supabase
        .from("help_content")
        .select("*")
        .eq("category", articleData.category)
        .eq("is_active", true)
        .neq("id", articleData.id)
        .order("sort_order", { ascending: true })
        .limit(3);

      if (!relatedError) {
        setRelatedArticles(relatedData || []);
      }
    } catch (err: any) {
      console.error("Error fetching article:", err);
      setError(err.message || "Failed to load article");
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

  if (loading || authLoading) {
    return <ArticleDetailSkeleton />;
  }

  if (error || !article) {
    const basePath = getBasePath();
    return (
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Article Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The article you're looking for doesn't exist or has been removed.
              </p>
              <Button onClick={() => router.push(`${basePath}/help`)}>
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Help Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  const basePath = getBasePath();

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <IconChevronLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Article Header */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline">{article.category}</Badge>
              <span className="text-sm text-muted-foreground">•</span>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <IconCalendar className="h-4 w-4" />
                {formatDate(article.updated_at)}
              </div>
            </div>
            <CardTitle className="text-2xl">{article.topic}</CardTitle>
            {article.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {article.keywords.map((keyword, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    <IconTag className="h-3 w-3 mr-1" />
                    {keyword}
                  </Badge>
                ))}
              </div>
            )}
          </CardHeader>
        </Card>

        {/* Article Content */}
        <Card>
          <CardContent className="p-6">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {article.content}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="h-5 w-5" />
                Related Articles
              </CardTitle>
              <CardDescription>
                More articles in the {article.category} category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {relatedArticles.map((relatedArticle) => (
                  <Card 
                    key={relatedArticle.id} 
                    className="cursor-pointer hover:bg-accent transition-colors"
                    onClick={() => router.push(`${basePath}/help/article/${relatedArticle.slug}`)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{relatedArticle.topic}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {relatedArticle.content.substring(0, 120)}...
                          </p>
                        </div>
                        <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push(`${basePath}/help`)}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Help Center
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push(`${basePath}/help/tickets`)}
          >
            Still need help?
            <IconChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </main>
  );
}

// --- Skeleton Component ---
function ArticleDetailSkeleton() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Skeleton className="h-10 w-24" />
        
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-8 w-3/4" />
            <div className="flex gap-2 mt-2">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-14" />
            </div>
          </CardHeader>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
