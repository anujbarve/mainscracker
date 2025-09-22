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
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- Icons ---
import {
  IconBug,
  IconClock,
  IconCheck,
  IconX,
  IconAlertTriangle,
  IconPlus,
  IconMessage,
  IconCalendar,
  IconUser,
  IconChevronRight,
  IconArrowLeft,
  IconFileText,
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
};

// --- Report Problem Component ---
export default function ReportProblem() {
  const router = useRouter();
  const { user, profile, loading: authLoading, fetchUser } = useAuthStore();
  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tickets");

  // Form states for new ticket
  const [newTicketSubject, setNewTicketSubject] = useState("");
  const [newTicketDescription, setNewTicketDescription] = useState("");
  const [newTicketPriority, setNewTicketPriority] = useState<"low" | "medium" | "high" | "urgent">("medium");
  const [newTicketType, setNewTicketType] = useState<"bug" | "question" | "feature_request" | "billing" | "technical" | "other">("question");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

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
      fetchSupportTickets();
    }
  }, [user, authLoading, router, fetchUser]);

  const fetchSupportTickets = async () => {
    setLoading(true);
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setSupportTickets(data || []);
    } catch (error) {
      console.error("Error fetching support tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      // Check file type (images only)
      if (!file.type.startsWith('image/')) {
        alert(`File ${file.name} is not an image. Only image files are allowed.`);
        return false;
      }
      return true;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const uploadAttachments = async (ticketId: string) => {
    if (attachments.length === 0) return [];

    setUploadingFiles(true);
    const uploadedUrls: string[] = [];

    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();

      for (const file of attachments) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${ticketId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('reports')
          .upload(fileName, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('reports')
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }
    } catch (error) {
      console.error("Error uploading attachments:", error);
      throw error;
    } finally {
      setUploadingFiles(false);
    }

    return uploadedUrls;
  };

  const handleSubmitTicket = async () => {
    if (!newTicketSubject.trim() || !newTicketDescription.trim()) {
      return;
    }

    setIsSubmittingTicket(true);
    try {
      const { createClient } = await import("@/utils/client");
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc("create_support_ticket", {
        p_subject: newTicketSubject,
        p_description: newTicketDescription,
        p_priority: newTicketPriority,
        p_type: newTicketType,
      });

      if (error) throw error;

      // Upload attachments if any
      if (attachments.length > 0 && data) {
        try {
          const attachmentUrls = await uploadAttachments(data);
          
          // Store attachment URLs in the ticket (you might need to update your schema)
          if (attachmentUrls.length > 0) {
            await supabase
              .from("support_tickets")
              .update({ 
                description: `${newTicketDescription}\n\nAttachments: ${attachmentUrls.join(', ')}` 
              })
              .eq("id", data);
          }
        } catch (uploadError) {
          console.error("Error uploading attachments:", uploadError);
          // Don't fail the ticket creation if attachments fail
        }
      }

      // Reset form
      setNewTicketSubject("");
      setNewTicketDescription("");
      setNewTicketPriority("medium");
      setNewTicketType("question");
      setAttachments([]);

      // Refresh tickets
      fetchSupportTickets();
      
      // Switch to tickets tab
      setActiveTab("tickets");
    } catch (error) {
      console.error("Error submitting ticket:", error);
    } finally {
      setIsSubmittingTicket(false);
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
      month: 'short',
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
    return <ReportProblemSkeleton />;
  }

  const basePath = getBasePath();

  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
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
            <h1 className="text-2xl font-bold">Report a Problem</h1>
            <p className="text-muted-foreground">
              Submit support tickets and track their progress
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <IconMessage className="h-4 w-4" />
              My Tickets ({supportTickets.length})
            </TabsTrigger>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <IconPlus className="h-4 w-4" />
              New Ticket
            </TabsTrigger>
          </TabsList>

          {/* My Tickets Tab */}
          <TabsContent value="tickets" className="space-y-6">
            {supportTickets.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <IconMessage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Support Tickets</h3>
                  <p className="text-muted-foreground mb-4">
                    You haven't submitted any support tickets yet.
                  </p>
                  <Button onClick={() => setActiveTab("new")}>
                    <IconPlus className="h-4 w-4 mr-2" />
                    Submit Your First Ticket
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {supportTickets.map((ticket) => {
                  const StatusIcon = getStatusIcon(ticket.status);
                  return (
                    <Card key={ticket.id} className="cursor-pointer hover:bg-accent transition-colors" onClick={() => router.push(`${basePath}/help/tickets/${ticket.id}`)}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <StatusIcon className="h-5 w-5" />
                              <h3 className="font-semibold">{ticket.subject}</h3>
                              <Badge variant={getPriorityColor(ticket.priority)}>
                                {ticket.priority}
                              </Badge>
                              <Badge variant={getStatusColor(ticket.status)}>
                                {getStatusText(ticket.status)}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                              {ticket.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <IconCalendar className="h-3 w-3" />
                                Created {formatDate(ticket.created_at)}
                              </div>
                              <div className="flex items-center gap-1">
                                <IconMessage className="h-3 w-3" />
                                Last updated {formatDate(ticket.last_reply_at)}
                              </div>
                            </div>
                          </div>
                          <IconChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* New Ticket Tab */}
          <TabsContent value="new" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <IconBug className="h-5 w-5" />
                  Submit New Support Ticket
                </CardTitle>
                <CardDescription>
                  Provide detailed information about your issue to help us assist you better.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium mb-2 block">Subject *</label>
                  <Input
                    placeholder="Brief description of your issue"
                    value={newTicketSubject}
                    onChange={(e) => setNewTicketSubject(e.target.value)}
                    className="w-full"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Priority *</label>
                    <Select value={newTicketPriority} onValueChange={(value: any) => setNewTicketPriority(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - General question</SelectItem>
                        <SelectItem value="medium">Medium - Minor issue</SelectItem>
                        <SelectItem value="high">High - Important issue</SelectItem>
                        <SelectItem value="urgent">Urgent - Critical issue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Type *</label>
                    <Select value={newTicketType} onValueChange={(value: any) => setNewTicketType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="bug">Bug Report</SelectItem>
                        <SelectItem value="feature_request">Feature Request</SelectItem>
                        <SelectItem value="technical">Technical Issue</SelectItem>
                        <SelectItem value="billing">Billing Issue</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-2 block">Description *</label>
                  <Textarea
                    placeholder="Please provide detailed information about your issue. Include steps to reproduce if it's a bug, or specific questions if it's a question."
                    value={newTicketDescription}
                    onChange={(e) => setNewTicketDescription(e.target.value)}
                    rows={6}
                    className="w-full"
                  />
                </div>

                {/* File Upload Section */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Attachments (Optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex items-center gap-2 px-3 py-2 border border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
                      >
                        <IconPlus className="h-4 w-4" />
                        Add Images
                      </label>
                      <span className="text-xs text-muted-foreground">
                        Max 10MB per file, images only
                      </span>
                    </div>
                    
                    {attachments.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Selected Files:</p>
                        {attachments.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                            <div className="flex items-center gap-2">
                              <IconFileText className="h-4 w-4" />
                              <span className="text-sm">{file.name}</span>
                              <span className="text-xs text-muted-foreground">
                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeAttachment(index)}
                              className="h-6 w-6 p-0"
                            >
                              <IconX className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={handleSubmitTicket}
                    disabled={!newTicketSubject.trim() || !newTicketDescription.trim() || isSubmittingTicket || uploadingFiles}
                    className="flex-1"
                  >
                    <IconPlus className="h-4 w-4 mr-2" />
                    {isSubmittingTicket || uploadingFiles ? "Submitting..." : "Submit Ticket"}
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => setActiveTab("tickets")}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

// --- Skeleton Component ---
function ReportProblemSkeleton() {
  return (
    <main className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
