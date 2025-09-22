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
import { Textarea } from "@/components/ui/textarea";

// --- Icons ---
import {
  IconArrowLeft,
  IconClock,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconMessage,
  IconCalendar,
  IconUser,
  IconSend,
  IconFileText,
  IconPaperclip,
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

export type SupportTicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  sent_at: string;
  sender_name?: string;
  is_admin?: boolean;
};

type TicketDetailProps = {
  ticketId: string;
};

// --- Ticket Detail Component ---
export default function TicketDetail({ ticketId }: TicketDetailProps) {
  const router = useRouter();
  const { user, profile, loading: authLoading, fetchUser } = useAuthStore();
  const [ticket, setTicket] = useState<SupportTicket | null>(null);
  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);

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
      fetchTicketData();
    }
  }, [ticketId, user, authLoading, router, fetchUser]);

  const fetchTicketData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      // Fetch the specific ticket
      const { data: ticketData, error: ticketError } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("id", ticketId)
        .eq("user_id", user.id)
        .single();

      if (ticketError) {
        if (ticketError.code === 'PGRST116') {
          setError("Ticket not found");
        } else {
          throw ticketError;
        }
        return;
      }

      setTicket(ticketData);

      // Fetch ticket messages
      const { data: messagesData, error: messagesError } = await supabase
        .from("support_ticket_messages")
        .select(`
          *,
          profiles:profiles!support_ticket_messages_sender_id_fkey(full_name)
        `)
        .eq("ticket_id", ticketId)
        .order("sent_at", { ascending: true });

      if (!messagesError) {
        const formattedMessages = messagesData?.map(msg => ({
          ...msg,
          sender_name: msg.profiles?.full_name || "Unknown",
          is_admin: msg.sender_id !== user.id
        })) || [];
        setMessages(formattedMessages);
      }
    } catch (err: any) {
      console.error("Error fetching ticket data:", err);
      setError(err.message || "Failed to load ticket");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitMessage = async () => {
    if (!newMessage.trim()) return;

    setIsSubmittingMessage(true);
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc("reply_to_ticket", {
        p_ticket_id: ticketId,
        p_message: newMessage.trim()
      });

      if (error) throw error;

      // Reset message input
      setNewMessage("");
      
      // Refresh messages
      fetchTicketData();
    } catch (err: any) {
      console.error("Error submitting message:", err);
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "destructive";
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open": return "default";
      case "in_progress": return "secondary";
      case "resolved": return "default";
      case "closed": return "outline";
      default: return "default";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return IconClock;
      case "in_progress": return IconAlertTriangle;
      case "resolved": return IconCheck;
      case "closed": return IconX;
      default: return IconClock;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "open": return "Open";
      case "in_progress": return "In Progress";
      case "resolved": return "Resolved";
      case "closed": return "Closed";
      default: return status;
    }
  };

  if (loading || authLoading) {
    return <TicketDetailSkeleton />;
  }

  if (error || !ticket) {
    const basePath = getBasePath();
    return (
      <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <Card>
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold mb-4">Ticket Not Found</h1>
              <p className="text-muted-foreground mb-6">
                The ticket you're looking for doesn't exist or you don't have permission to view it.
              </p>
              <Button onClick={() => router.push(`${basePath}/help/tickets`)}>
                <IconArrowLeft className="h-4 w-4 mr-2" />
                Back to Tickets
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
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => router.back()}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{ticket.subject}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={getPriorityColor(ticket.priority)}>
                {ticket.priority}
              </Badge>
              <Badge variant={getStatusColor(ticket.status)}>
                {getStatusText(ticket.status)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Created {formatDate(ticket.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMessage className="h-5 w-5" />
              Ticket Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Type:</span> {ticket.type}
              </div>
              <div>
                <span className="font-medium">Priority:</span> {ticket.priority}
              </div>
              <div>
                <span className="font-medium">Status:</span> {getStatusText(ticket.status)}
              </div>
              <div>
                <span className="font-medium">Last Updated:</span> {formatDate(ticket.updated_at)}
              </div>
            </div>

            {ticket.resolution_notes && (
              <div>
                <h3 className="font-semibold mb-2">Resolution Notes</h3>
                <p className="text-sm whitespace-pre-wrap bg-green-50 p-3 rounded-md">
                  {ticket.resolution_notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Messages */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconMessage className="h-5 w-5" />
              Conversation ({messages.length} messages)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <div className="text-center py-8 text-gray-600">
                <IconMessage className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No messages yet. Start the conversation below.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={cn(
                      "flex gap-3 p-4 rounded-lg",
                      message.is_admin 
                        ? "bg-blue-50 border-l-4 border-blue-500 text-gray-900" 
                        : "bg-gray-100 text-gray-900"
                    )}
                  >
                    <div className="flex-shrink-0">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium",
                        message.is_admin ? "bg-blue-500" : "bg-gray-500"
                      )}>
                        {message.sender_name?.charAt(0) || "U"}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-gray-900">
                          {message.is_admin ? "Support Team" : "You"}
                        </span>
                        <span className="text-xs text-gray-600">
                          {formatDate(message.sent_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800 whitespace-pre-wrap">{message.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Reply Form */}
        {ticket.status !== "closed" && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconSend className="h-5 w-5" />
                Reply to Ticket
              </CardTitle>
              <CardDescription>
                Add a message to continue the conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your message here..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  rows={4}
                  className="w-full"
                />
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmitMessage}
                    disabled={!newMessage.trim() || isSubmittingMessage}
                  >
                    <IconSend className="h-4 w-4 mr-2" />
                    {isSubmittingMessage ? "Sending..." : "Send Message"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => router.push(`${basePath}/help/tickets`)}
          >
            <IconArrowLeft className="h-4 w-4 mr-2" />
            Back to Tickets
          </Button>
          
          <Button 
            variant="outline"
            onClick={() => router.push(`${basePath}/help`)}
          >
            Help Center
          </Button>
        </div>
      </div>
    </main>
  );
}

// --- Skeleton Component ---
function TicketDetailSkeleton() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div className="flex-1">
            <Skeleton className="h-8 w-3/4 mb-2" />
            <div className="flex gap-2">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
