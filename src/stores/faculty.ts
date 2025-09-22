"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client";
import { useAuthStore } from "./auth";

// Import HelpArticle type
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

// Types for faculty-specific data
export type FacultyAnswer = {
  id: string;
  student_id: string;
  subject_id: string;
  assigned_faculty_id: string;
  status: "assigned" | "in_evaluation" | "completed" | "cancelled";
  question_text: string;
  answer_file_url: string;
  submitted_at: string;
  assigned_at: string | null;
  evaluation_started_at: string | null;
  faculty_remarks: string | null;
  marks_awarded: number | null;
  max_marks: number | null;
  evaluated_file_url: string | null;
  evaluated_at: string | null;
  expected_completion_at: string | null;
  actual_completion_at: string | null;
  evaluation_duration_minutes: number | null;
  student_rating: number | null;
  student_feedback: string | null;
  updated_at: string;
  // Joined data
  subjects: {
    id: string;
    name: string;
    category: "gs" | "specialized";
  } | null;
  student: {
    id: string;
    full_name: string;
  } | null;
};

// Notification types for faculty
export type FacultyNotificationType =
  | "answer_assigned"
  | "answer_evaluated"
  | "mentorship_scheduled"
  | "admin_credit_adjustment";

export type FacultyNotification = {
  id: string;
  user_id: string;
  type: FacultyNotificationType;
  title: string;
  message: string;
  data: any;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type FacultyMentorshipSession = {
  id: string;
  student_id: string;
  mentor_id: string;
  status: "requested" | "assigned" | "scheduled" | "in_progress" | "completed" | "cancelled" | "no_show";
  student_notes: string | null;
  mentor_notes: string | null;
  scheduled_at: string | null;
  duration_minutes: number;
  meeting_url: string | null;
  meeting_platform: string;
  requested_at: string;
  started_at: string | null;
  completed_at: string | null;
  student_rating: number | null;
  student_feedback: string | null;
  mentor_rating: number | null;
  mentor_feedback: string | null;
  updated_at: string;
  // Joined data
  student: {
    id: string;
    full_name: string;
  } | null;
};

type FetchOptions = {
  force?: boolean;
};

type FacultyState = {
  // State
  assignedAnswers: FacultyAnswer[] | null;
  mentorshipSessions: FacultyMentorshipSession[] | null;
  dashboardData: any | null;
  notifications: FacultyNotification[] | null;
  unreadNotificationCount: number;
  loading: boolean;
  error: string | null;
  
  // Cache timestamps
  lastFetched: {
    assignedAnswers: number | null;
    mentorshipSessions: number | null;
    dashboardData: number | null;
    notifications: number | null;
  };

  // Actions
  fetchAssignedAnswers: (options?: FetchOptions) => Promise<void>;
  fetchMentorshipSessions: (options?: FetchOptions) => Promise<void>;
  fetchDashboardData: (options?: FetchOptions) => Promise<void>;
  fetchUserNotifications: (options?: FetchOptions) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  evaluateAnswer: (answerId: string, marks: number, maxMarks: number, remarks: string, status: string, studentRating?: number, evaluatedFileUrl?: string) => Promise<boolean>;
  updateMentorshipSession: (sessionId: string, updates: Partial<FacultyMentorshipSession>) => Promise<boolean>;
  // Help & Support actions
  fetchHelpArticles: (options?: FetchOptions) => Promise<HelpArticle[]>;
  searchHelpArticles: (query: string) => Promise<HelpArticle[]>;
  createSupportTicket: (subject: string, description: string, priority: string, type: string) => Promise<string | null>;
  fetchSupportTickets: (options?: FetchOptions) => Promise<SupportTicket[]>;
};

const CACHE_DURATION_MS = 2 * 60 * 1000;

export const useFacultyStore = create<FacultyState>((set, get) => ({
  // Initial State
  assignedAnswers: null,
  mentorshipSessions: null,
  dashboardData: null,
  notifications: null,
  unreadNotificationCount: 0,
  loading: false,
  error: null,
  lastFetched: {
    assignedAnswers: null,
    mentorshipSessions: null,
    dashboardData: null,
    notifications: null,
  },

  // Fetch assigned answers for the faculty
  fetchAssignedAnswers: async (options) => {
    const { assignedAnswers, lastFetched } = get();
    if (
      !options?.force &&
      assignedAnswers &&
      lastFetched.assignedAnswers &&
      Date.now() - lastFetched.assignedAnswers < CACHE_DURATION_MS
    ) {
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("answers")
        .select(`
          *,
          subjects(id, name, category),
          student:profiles!student_id(id, full_name)
        `)
        .eq("assigned_faculty_id", user.id)
        .order("submitted_at", { ascending: false });

      if (error) throw error;

      set({
        assignedAnswers: data as FacultyAnswer[],
        lastFetched: { ...get().lastFetched, assignedAnswers: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch assigned answers.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch dashboard data using RPC function
  fetchDashboardData: async (options) => {
    const { dashboardData, lastFetched } = get();
    if (
      !options?.force &&
      dashboardData &&
      lastFetched.dashboardData &&
      Date.now() - lastFetched.dashboardData < CACHE_DURATION_MS
    ) {
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("get_user_dashboard");

      if (error) throw error;

      set({
        dashboardData: data,
        lastFetched: { ...get().lastFetched, dashboardData: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch dashboard data.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Fetch mentorship sessions for the faculty
  fetchMentorshipSessions: async (options) => {
    const { mentorshipSessions, lastFetched } = get();
    if (
      !options?.force &&
      mentorshipSessions &&
      lastFetched.mentorshipSessions &&
      Date.now() - lastFetched.mentorshipSessions < CACHE_DURATION_MS
    ) {
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("mentorship_sessions")
        .select(`
          *,
          student:profiles!student_id(id, full_name)
        `)
        .eq("mentor_id", user.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;

      set({
        mentorshipSessions: data as FacultyMentorshipSession[],
        lastFetched: { ...get().lastFetched, mentorshipSessions: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch mentorship sessions.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // Evaluate an answer
  evaluateAnswer: async (answerId, marks, maxMarks, remarks, status, studentRating, evaluatedFileUrl) => {
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      
      const { error } = await supabase.rpc("evaluate_answer", {
        answer_id_in: answerId,
        marks_awarded_in: marks,
        max_marks_in: maxMarks,
        faculty_remarks_in: remarks,
        status_in: status,
        student_rating_in: studentRating || null,
        evaluated_file_url_in: evaluatedFileUrl || null,
      });

      if (error) throw error;

      toast.success("Answer evaluated successfully!");
      
      // Refresh the assigned answers list
      get().fetchAssignedAnswers({ force: true });
      
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to evaluate answer.");
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Update mentorship session
  updateMentorshipSession: async (sessionId, updates) => {
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      
      const { error } = await supabase
        .from("mentorship_sessions")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Mentorship session updated successfully!");
      
      // Refresh the mentorship sessions list
      get().fetchMentorshipSessions({ force: true });
      
      return true;
    } catch (err: any) {
      toast.error("Failed to update mentorship session.");
      set({ error: err.message });
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Fetch user notifications
  fetchUserNotifications: async (options) => {
    const { notifications, lastFetched } = get();
    if (
      !options?.force &&
      notifications &&
      lastFetched.notifications &&
      Date.now() - lastFetched.notifications < CACHE_DURATION_MS
    ) {
      return; // Use cached data
    }

    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const unreadCount = data.filter((n) => !n.is_read).length;

      set({
        notifications: data as FacultyNotification[],
        unreadNotificationCount: unreadCount,
        lastFetched: { ...get().lastFetched, notifications: Date.now() },
      });
    } catch (err: any) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to fetch notifications.");
      set({ error: err.message || "An unknown error occurred." });
    } finally {
      set({ loading: false });
    }
  },

  // Mark a single notification as read
  markNotificationAsRead: async (notificationId) => {
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;

      // Update local state
      const { notifications } = get();
      if (notifications) {
        const updatedNotifications = notifications.map((n) =>
          n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
        );
        const unreadCount = updatedNotifications.filter((n) => !n.is_read).length;
        
        set({
          notifications: updatedNotifications,
          unreadNotificationCount: unreadCount,
        });
      }
    } catch (err: any) {
      console.error("Error marking notification as read:", err);
      toast.error("Failed to mark notification as read.");
    }
  },

  // Mark all notifications as read
  markAllNotificationsAsRead: async () => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return;

      const supabase = await createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false);

      if (error) throw error;

      // Update local state
      const { notifications } = get();
      if (notifications) {
        const updatedNotifications = notifications.map((n) => ({
          ...n,
          is_read: true,
          read_at: new Date().toISOString(),
        }));
        
        set({
          notifications: updatedNotifications,
          unreadNotificationCount: 0,
        });
      }

      toast.success("All notifications marked as read.");
    } catch (err: any) {
      console.error("Error marking all notifications as read:", err);
      toast.error("Failed to mark all notifications as read.");
    }
  },

  // Help & Support functionality
  fetchHelpArticles: async (options) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("help_content")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error fetching help articles:", err);
      toast.error("Failed to fetch help articles.");
      return [];
    }
  },

  searchHelpArticles: async (query) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("help_content")
        .select("*")
        .eq("is_active", true)
        .or(`topic.ilike.%${query}%,content.ilike.%${query}%`);

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error searching help articles:", err);
      toast.error("Failed to search help articles.");
      return [];
    }
  },

  createSupportTicket: async (subject, description, priority, type) => {
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.rpc("create_support_ticket", {
        p_subject: subject,
        p_description: description,
        p_priority: priority,
        p_type: type,
      });

      if (error) throw error;
      toast.success("Support ticket created successfully!");
      return data;
    } catch (err: any) {
      console.error("Error creating support ticket:", err);
      toast.error("Failed to create support ticket.");
      return null;
    }
  },

  fetchSupportTickets: async (options) => {
    try {
      const { user } = useAuthStore.getState();
      if (!user) return [];

      const supabase = await createClient();
      const { data, error } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err: any) {
      console.error("Error fetching support tickets:", err);
      toast.error("Failed to fetch support tickets.");
      return [];
    }
  },
}));
