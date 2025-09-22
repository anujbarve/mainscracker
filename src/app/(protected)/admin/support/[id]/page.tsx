"use client";

import * as React from "react";
import Link from "next/link";
import { useAdminStore, SupportTicketWithDetails, SupportTicketMessage, SupportTicketStatus } from "@/stores/admin";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format, parseISO } from "date-fns";
import { ArrowLeft, Paperclip, Send } from "lucide-react";
import { useParams } from "next/navigation";

// =============================================================================
// 1. HELPER FUNCTIONS & SUB-COMPONENTS
// =============================================================================

const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
        return format(parseISO(dateString), "dd MMM yyyy, hh:mm a");
    } catch (error) {
        return "Invalid Date";
    }
};

const TicketStatusBadge = ({ status }: { status: string }) => {
    const statusStyles: Record<string, string> = {
        open: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
        in_progress: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
        resolved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
        closed: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
    };
    return <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status.replace(/_/g, ' ')}</Badge>;
};

const MessageBubble = ({ message, isUser }: { message: SupportTicketMessage, isUser: boolean }) => {
    const senderName = message.sender?.full_name || "Unknown";
    const initial = senderName.charAt(0).toUpperCase();

    return (
        <div className={`flex items-start gap-4 ${isUser ? "" : "justify-end"}`}>
            {isUser && <Avatar className="h-8 w-8"><AvatarFallback>{initial}</AvatarFallback></Avatar>}
            <div className={`max-w-xl rounded-lg p-3 ${isUser ? "bg-gray-100 dark:bg-gray-800" : "bg-primary text-primary-foreground"}`}>
                <p className="text-sm font-medium">{senderName}</p>
                <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                <p className={`mt-2 text-xs opacity-70 text-right ${isUser ? '' : 'text-primary-foreground/80'}`}>{formatDate(message.sent_at)}</p>
            </div>
            {!isUser && <Avatar className="h-8 w-8"><AvatarFallback>A</AvatarFallback></Avatar>}
        </div>
    );
};

const ReplyForm = ({ ticketId }: { ticketId: string }) => {
    const { addSupportTicketMessage, loading } = useAdminStore();
    const [reply, setReply] = React.useState("");
    const isLoading = loading[`ticket_messages_${ticketId}`];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reply.trim() || isLoading) return;
        const success = await addSupportTicketMessage(ticketId, reply);
        if (success) setReply("");
    };

    return (
        <form onSubmit={handleSubmit} className="mt-auto flex items-start gap-4 border-t p-4">
            <Textarea
                placeholder="Type your reply here..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                className="min-h-[80px] flex-1 resize-none"
                disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={!reply.trim() || isLoading}>
                <Send className="h-4 w-4" />
            </Button>
        </form>
    );
};


// =============================================================================
// 2. MAIN PAGE COMPONENT
// =============================================================================

export default function SupportTicketDetailPage() {
    const params = useParams();
    const ticketId = params?.id as string;
    const {
        currentSupportTicket,
        fetchSupportTicketById,
        clearCurrentSupportTicket,
        loading,
        faculty,
        fetchFaculty, // Get the fetch function
        updateSupportTicket,
    } = useAdminStore();

    // ✅ FIX: Fetch faculty/staff to populate the assignee dropdown on component load
    React.useEffect(() => {
        fetchFaculty();
    }, [fetchFaculty]);

    React.useEffect(() => {
        if (ticketId) {
            fetchSupportTicketById(ticketId);
        }
        return () => {
            clearCurrentSupportTicket();
        };
    }, [ticketId, fetchSupportTicketById, clearCurrentSupportTicket]);

    const ticket = currentSupportTicket?.ticket;
    const messages = currentSupportTicket?.messages || [];
    const attachments = currentSupportTicket?.attachments || [];
    const isLoading = loading.currentSupportTicket;

    if (isLoading) {
        return <PageSkeleton />;
    }

    if (!ticket) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
                <h2 className="text-2xl font-bold">Ticket Not Found</h2>
                <p className="text-muted-foreground">The ticket you are looking for does not exist.</p>
                <Button asChild className="mt-4">
                    <Link href="/admin/support"><ArrowLeft className="mr-2 h-4 w-4" />Back to Tickets</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center space-x-4">
                 <Button variant="outline" size="icon" asChild>
                    <Link href="/admin/support"><ArrowLeft className="h-4 w-4" /></Link>
                </Button>
                <h2 className="text-3xl font-bold tracking-tight truncate">{ticket.subject}</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Conversation */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Conversation</CardTitle>
                        <CardDescription>
                            Initial query from {ticket.user.full_name || "user"}.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col gap-6 overflow-y-auto p-6">
                        <div className="flex-1 space-y-6">
                            {/* Initial Description */}
                            <div className="flex items-start gap-4">
                                <Avatar className="h-8 w-8"><AvatarFallback>{ticket.user.full_name?.charAt(0)}</AvatarFallback></Avatar>
                                <div className="w-full max-w-xl rounded-lg p-3 bg-gray-100 dark:bg-gray-800">
                                    <p className="text-sm font-medium">{ticket.user.full_name}</p>
                                    <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                                    <p className="mt-2 text-xs opacity-70 text-right">{formatDate(ticket.created_at)}</p>
                                </div>
                            </div>

                            {/* Conversation Messages */}
                            {messages.map((msg) => (
                                <MessageBubble key={msg.id} message={msg} isUser={msg.sender_id === ticket.user_id} />
                            ))}
                        </div>
                    </CardContent>
                    <ReplyForm ticketId={ticket.id} />
                </Card>

                {/* Right Column: Details & Actions */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ticket Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div className="flex justify-between"><span>User:</span> <Link href={`/admin/users/${ticket.user_id}`} className="font-medium text-primary hover:underline">{ticket.user.full_name}</Link></div>
                            <div className="flex justify-between items-center"><span>Status:</span> <TicketStatusBadge status={ticket.status} /></div>
                            <div className="flex justify-between"><span>Priority:</span> <span className="capitalize">{ticket.priority}</span></div>
                            <div className="flex justify-between"><span>Created:</span> <span className="text-muted-foreground">{formatDate(ticket.created_at)}</span></div>
                            <div className="flex justify-between"><span>Last Reply:</span> <span className="text-muted-foreground">{formatDate(ticket.last_reply_at)}</span></div>

                            <div className="space-y-2 pt-4 border-t">
                                <label className="font-medium">Change Status</label>
                                <Select
                                    value={ticket.status}
                                    onValueChange={(status) => updateSupportTicket(ticket.id, { status: status as SupportTicketStatus })}
                                >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                        <SelectItem value="closed">Closed</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="font-medium">Assign To</label>
                                <Select
                                    value={ticket.assigned_to || ""}
                                    onValueChange={(assigneeId) => updateSupportTicket(ticket.id, { assigned_to: assigneeId, status: 'in_progress' })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Unassigned" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {/* This list is now populated by the useEffect hook above */}
                                        {faculty?.map((f) => (
                                            <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>

                    {attachments.length > 0 && (
                        <Card>
                            <CardHeader><CardTitle>Attachments</CardTitle></CardHeader>
                            <CardContent className="space-y-2">
                                {attachments.map(att => (
                                    <a href={att.file_url} target="_blank" rel="noopener noreferrer" key={att.id} className="flex items-center gap-2 text-primary hover:underline text-sm">
                                        <Paperclip className="h-4 w-4" />
                                        <span>{att.file_name}</span>
                                    </a>
                                ))}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}

// Skeleton component for the loading state
function PageSkeleton() {
    return (
        <div className="flex-1 p-4 pt-6 md:p-8 space-y-4">
             <div className="flex items-center space-x-4">
                 <Skeleton className="h-10 w-10" />
                 <Skeleton className="h-8 w-1/2" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                    <CardHeader><Skeleton className="h-8 w-1/4" /></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-start gap-4"><Skeleton className="h-8 w-8 rounded-full" /><Skeleton className="h-20 w-2/3" /></div>
                        <div className="flex items-start gap-4 justify-end"><Skeleton className="h-16 w-1/2" /><Skeleton className="h-8 w-8 rounded-full" /></div>
                    </CardContent>
                </Card>
                <div className="space-y-6">
                    <Card>
                        <CardHeader><Skeleton className="h-8 w-1/2" /></CardHeader>
                        <CardContent className="space-y-4">
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-6 w-full" />
                            <Skeleton className="h-10 w-full mt-4" />
                            <Skeleton className="h-10 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}