"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { useFacultyStore } from "@/stores/faculty";
import { FacultyMentorshipSession } from "@/stores/faculty";
import { toast } from "sonner";
import { IconCalendar, IconClock, IconUser, IconMessageCircle, IconDeviceFloppy } from "@tabler/icons-react";

// Form validation schema
const sessionUpdateSchema = z.object({
  status: z.enum(["requested", "assigned", "scheduled", "in_progress", "completed", "cancelled", "no_show"]),
  mentor_notes: z.string().optional(),
  meeting_url: z.string().url().optional().or(z.literal("")),
  scheduled_at: z.string().optional(),
  duration_minutes: z.number().min(15, "Duration must be at least 15 minutes").max(480, "Duration cannot exceed 8 hours").optional(),
  student_rating: z.number().min(1, "Student rating must be at least 1").max(5, "Student rating cannot exceed 5").optional(),
  student_feedback: z.string().optional(),
});

type SessionUpdateFormData = z.infer<typeof sessionUpdateSchema>;

type FacultyMentorshipDetailsModalProps = {
  session: FacultyMentorshipSession;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
};

const statusVariantMap: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
  requested: "outline",
  assigned: "secondary",
  scheduled: "default",
  in_progress: "default",
  completed: "outline",
  cancelled: "destructive",
  no_show: "destructive",
};

const formatStatus = (status: string) => {
  return status.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Not scheduled";
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes: number) => {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours} hours ${remainingMinutes} minutes` : `${hours} hours`;
};

export function FacultyMentorshipDetailsModal({
  session,
  isOpen,
  onClose,
  onUpdate
}: FacultyMentorshipDetailsModalProps) {
  const { updateMentorshipSession } = useFacultyStore();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<SessionUpdateFormData>({
    resolver: zodResolver(sessionUpdateSchema),
    defaultValues: {
      status: session.status,
      mentor_notes: session.mentor_notes || "",
      meeting_url: session.meeting_url || "",
      scheduled_at: session.scheduled_at ? new Date(session.scheduled_at).toISOString().slice(0, 16) : "",
      duration_minutes: session.duration_minutes,
      student_rating: session.student_rating || undefined,
      student_feedback: session.student_feedback || "",
    },
  });

  const onSubmit = async (data: SessionUpdateFormData) => {
    setIsSubmitting(true);

    try {
      const updateData: Partial<FacultyMentorshipSession> = {
        status: data.status,
        mentor_notes: data.mentor_notes || null,
        meeting_url: data.meeting_url || null,
        duration_minutes: data.duration_minutes || session.duration_minutes,
        student_rating: data.student_rating || null,
        student_feedback: data.student_feedback || null,
      };

      // Handle scheduled_at if provided
      if (data.scheduled_at) {
        updateData.scheduled_at = new Date(data.scheduled_at).toISOString();
      }

      // Set timestamps based on status
      if (data.status === "in_progress" && session.status !== "in_progress") {
        updateData.started_at = new Date().toISOString();
      }
      
      if (data.status === "completed" && session.status !== "completed") {
        updateData.completed_at = new Date().toISOString();
      }

      const success = await updateMentorshipSession(session.id, updateData);

      if (success) {
        toast.success("Session updated successfully!");
        onUpdate();
      } else {
        toast.error("Failed to update session");
      }
    } catch (error: any) {
      console.error("Error updating session:", error);
      toast.error(error.message || "Failed to update session");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconUser className="size-5" />
            Mentorship Session Details
          </DialogTitle>
          <DialogDescription>
            Session with {session.student?.full_name || "Unknown Student"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Session Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconUser className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Student</span>
              </div>
              <p className="font-semibold">{session.student?.full_name || "Unknown Student"}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Scheduled</span>
              </div>
              <p className="font-semibold">{formatDate(session.scheduled_at)}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconClock className="size-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Duration</span>
              </div>
              <p className="font-semibold">{formatDuration(session.duration_minutes)}</p>
            </div>
            
            <div className="space-y-2">
              <span className="text-sm text-muted-foreground">Status</span>
              <Badge variant={statusVariantMap[session.status] || "secondary"}>
                {formatStatus(session.status)}
              </Badge>
            </div>
          </div>

          {/* Student Notes */}
          {session.student_notes && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <IconMessageCircle className="size-4 text-muted-foreground" />
                <Label>Student Notes</Label>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg">
                <p className="text-sm">{session.student_notes}</p>
              </div>
            </div>
          )}

          {/* Update Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="requested">Requested</SelectItem>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="no_show">No Show</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Duration */}
                <FormField
                  control={form.control}
                  name="duration_minutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration (minutes)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="60"
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Scheduled At */}
              <FormField
                control={form.control}
                name="scheduled_at"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scheduled Date & Time</FormLabel>
                    <FormControl>
                      <Input
                        type="datetime-local"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Meeting URL */}
              <FormField
                control={form.control}
                name="meeting_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Meeting URL (Optional)</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://meet.google.com/..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Mentor Notes */}
              <FormField
                control={form.control}
                name="mentor_notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add your notes about this session..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Student Rating and Feedback Section */}
              <div className="space-y-4 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">Student Evaluation</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Student Rating */}
                  <FormField
                    control={form.control}
                    name="student_rating"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Rating (1-5)</FormLabel>
                        <FormControl>
                          <Select 
                            onValueChange={(value) => field.onChange(value === "none" ? undefined : Number(value))} 
                            value={field.value?.toString() || "none"}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Rate student performance" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No rating</SelectItem>
                              {Array.from({ length: 5 }, (_, i) => i + 1).map((rating) => (
                                <SelectItem key={rating} value={rating.toString()}>
                                  {rating} - {rating === 1 ? "Poor" : rating === 2 ? "Fair" : rating === 3 ? "Good" : rating === 4 ? "Very Good" : "Excellent"}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Student Feedback */}
                  <FormField
                    control={form.control}
                    name="student_feedback"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student Feedback</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Provide feedback for the student..."
                            className="min-h-[80px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  <IconDeviceFloppy className="size-4 mr-2" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
