"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth";

// --- UI Components ---
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// --- Icons ---
import {
  IconFileText,
  IconMessage,
  IconExternalLink,
} from "@tabler/icons-react";

// --- Types ---
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
  const [loading, setLoading] = useState(false);

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
  }, [user, authLoading, router, fetchUser]);

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
            Get help from our support team or browse our knowledge base for answers to common questions.
          </p>
        </div>

        {/* Knowledge Base Card */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconFileText className="h-5 w-5" />
              Knowledge Base & Blog
            </CardTitle>
            <CardDescription>
              Browse our comprehensive knowledge base with articles, guides, and frequently asked questions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex-1">
                <p className="text-sm text-muted-foreground mb-4">
                  Explore our blog and knowledge base to find detailed articles, tutorials, and answers to common questions. 
                  Search through categorized content and stay updated with the latest information.
                </p>
                <Button 
                  onClick={() => router.push('/blog')} 
                  className="w-full sm:w-auto"
                  size="lg"
                >
                  <IconExternalLink className="h-4 w-4 mr-2" />
                  Go to Blog & Knowledge Base
                </Button>
              </div>
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
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-24 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
