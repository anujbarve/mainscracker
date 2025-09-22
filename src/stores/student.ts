// src/stores/studentStore.ts

"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client"; // Your Supabase client
import { useAuthStore } from "./auth"; // To get the logged-in user's ID
import {
  SubscriptionWithPlan,
  OrderWithPlan,
  MentorshipSessionWithMentor,
} from "./types"; // Import types from the file above

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

// Define the shape of data for creating new records
type AnswerSubmission = {
  subject_id_in: string;
  question_text_in: string;
  answer_file_url_in: string;
  answer_file_size_in: number; // must be passed
  word_count_in: number; // must be passed
};

type MentorshipRequest = {
  student_notes: string;
  duration_minutes: number;
};

type Subject = {
  id: string;
  name: string;
  category: "gs" | "specialized";
};

type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  gs_credits_granted: number;
  specialized_credits_granted: number;
  mentorship_credits_granted: number;
};

// ✅ 1. Define and export the specific AnswerStatus type your component needs.
// This should match the ENUM in your database.
export type AnswerStatus =
  | "pending_assignment"
  | "in_evaluation"
  | "completed"
  | "cancelled";

export type AnswerWithDetails = {
  id: string;
  student_id: string;
  subject_id: string;
  assigned_faculty_id: string | null;
  status: AnswerStatus; // ✅ 2. Use the new AnswerStatus type for better type safety
  question_text: string;
  answer_file_url: string;
  submitted_at: string;
  faculty_remarks: string | null;
  marks_awarded: number | null;
  evaluated_file_url: string | null;
  evaluated_at: string | null;
  updated_at: string;
  // Joined and aliased data
  subjects: Subject | null;
  assigned_faculty: {
    full_name: string;
  } | null;
};

type FetchOptions = {
  force?: boolean; // Set to true to bypass the cache
};

export type NotificationType =
  | "answer_assigned"
  | "answer_evaluated"
  | "mentorship_scheduled"
  | "credit_low"
  | "subscription_expiring"
  | "purchase_successful"
  | "admin_credit_adjustment";

export type NotificationData =
  | { order_id: string }
  | { answer_id: string }
  | { subscription_id: string; plan_name: string }
  | { credit_type: "gs" | "specialized" | "mentorship"; amount: number }
  | { adjusted_by: string; amount: number; reason: string }
  | null;

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: NotificationData | null;
  is_read: boolean;
  read_at: string | null;
  expires_at: string | null;
  created_at: string;
};

export type MentorProfile = {
  id: string;
  full_name: string | null;
};

// Define the state and actions for the store
type StudentState = {
  // State
  plans: Plan[] | null;
  subscriptions: SubscriptionWithPlan[] | null;
  orders: OrderWithPlan[] | null;
  answers: AnswerWithDetails[] | null;
  mentorshipSessions: MentorshipSessionWithMentor[] | null;
  loading: boolean;
  error: string | null;
  subjects: Subject[] | null;
  notifications: Notification[] | null;
  unreadNotificationCount: number;
  mentors: MentorProfile[] | null;

  // ✅ 1. Add state to track fetch timestamps
  lastFetched: {
    plans: number | null;
    subscriptions: number | null;
    orders: number | null;
    answers: number | null;
    mentorshipSessions: number | null;
    subjects: number | null;
    notifications: number | null; // Add notifications here
    mentors: number | null; // Add mentors here
  };

  // Actions
  fetchPlans: (options?: FetchOptions) => Promise<void>;
  fetchUserSubscriptions: (options?: FetchOptions) => Promise<void>;
  fetchUserOrders: (options?: FetchOptions) => Promise<void>;
  fetchUserAnswers: (options?: FetchOptions) => Promise<void>;
  fetchUserMentorshipSessions: (options?: FetchOptions) => Promise<void>;
  fetchSubjects: (options?: FetchOptions) => Promise<void>;
  purchasePlan: (planId: string) => Promise<void>;
  submitAnswerSheet: (data: AnswerSubmission) => Promise<string | null>;
  requestMentorshipSession: (data: MentorshipRequest) => Promise< string | null>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
  fetchUserNotifications: (options?: FetchOptions) => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  fetchMentors: (options?: FetchOptions) => Promise<void>;
  // Help & Support actions
  fetchHelpArticles: (options?: FetchOptions) => Promise<HelpArticle[]>;
  searchHelpArticles: (query: string) => Promise<HelpArticle[]>;
  createSupportTicket: (subject: string, description: string, priority: string, type: string) => Promise<string | null>;
  fetchSupportTickets: (options?: FetchOptions) => Promise<SupportTicket[]>;
};

const CACHE_DURATION_MS = 2 * 60 * 1000;

export const useStudentStore = create<StudentState>((set, get) => ({
  // Initial State
  plans: null,
  subscriptions: null,
  orders: null,
  answers: null,
  mentorshipSessions: null,
  loading: false,
  error: null,
  subjects: null,
  notifications: null,
  unreadNotificationCount: 0,
  mentors: null, // Initialize here
  // ✅ 3. Initialize lastFetched timestamps
  lastFetched: {
    plans: null,
    subscriptions: null,
    orders: null,
    answers: null,
    mentorshipSessions: null,
    subjects: null,
    notifications: null, // Initialize here
    mentors: null,
  },

  // --- FETCH ACTIONS ---

  fetchPlans: async (options) => {
    const { plans, lastFetched } = get();
    if (
      !options?.force &&
      plans &&
      lastFetched.plans &&
      Date.now() - lastFetched.plans < CACHE_DURATION_MS
    ) {
      console.info("Using cached data");
      return; // Use cached data
    }

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      set({
        plans: data as Plan[],
        lastFetched: { ...get().lastFetched, plans: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch plans.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserSubscriptions: async (options) => {
    const { subscriptions, lastFetched } = get();
    if (
      !options?.force &&
      subscriptions &&
      lastFetched.subscriptions &&
      Date.now() - lastFetched.subscriptions < CACHE_DURATION_MS
    ) {
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("subscriptions")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({
        subscriptions: data as SubscriptionWithPlan[],
        lastFetched: { ...get().lastFetched, subscriptions: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch subscriptions.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserOrders: async (options) => {
    const { orders, lastFetched } = get();
    if (
      !options?.force &&
      orders &&
      lastFetched.orders &&
      Date.now() - lastFetched.orders < CACHE_DURATION_MS
    ) {
      return;
    }

    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("orders")
        .select("*, plans(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      set({
        orders: data as OrderWithPlan[],
        lastFetched: { ...get().lastFetched, orders: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch order history.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserAnswers: async (options) => {
    const { answers, lastFetched } = get();
    if (
      !options?.force &&
      answers &&
      lastFetched.answers &&
      Date.now() - lastFetched.answers < CACHE_DURATION_MS
    ) {
      return;
    }
    const { user } = useAuthStore.getState();
    if (!user) return;

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("answers")
        .select(
          `
          *,
          subjects(*),
          assigned_faculty:assigned_faculty_id(full_name)
        `
        )
        .eq("student_id", user.id)
        .order("submitted_at", { ascending: false });

      console.log(data);

      if (error) throw error;

      set({
        answers: data as AnswerWithDetails[],
        lastFetched: { ...get().lastFetched, answers: Date.now() },
      });
    } catch (err: any) {
      console.error("Error fetching answer sheets:", err);
      toast.error("Failed to fetch your answer sheets.");
      set({ error: err.message || "An unknown error occurred." });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserMentorshipSessions: async (options) => {
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
        .select("*, mentor:profiles!mentor_id(full_name, is_available)")
        .eq("student_id", user.id)
        .order("requested_at", { ascending: false });

      if (error) throw error;
      set({
        mentorshipSessions: data as any,
        lastFetched: { ...get().lastFetched, mentorshipSessions: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to fetch mentorship sessions.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubjects: async (options) => {
    const { subjects, lastFetched } = get();
    if (
      !options?.force &&
      subjects &&
      lastFetched.subjects &&
      Date.now() - lastFetched.subjects < CACHE_DURATION_MS
    ) {
      return;
    }
    if (get().subjects) return;
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, category")
        .order("name", { ascending: true });

      if (error) throw error;
      set({
        subjects: data,
        lastFetched: { ...get().lastFetched, subjects: Date.now() },
      });
    } catch (err: any) {
      toast.error("Failed to load subjects.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

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
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const unreadCount = data.filter((n) => !n.is_read).length;

      set({
        notifications: data as Notification[],
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

  fetchMentors: async (options) => {
    const { mentors, lastFetched } = get();
    if (
      !options?.force &&
      mentors &&
      lastFetched.mentors &&
      Date.now() - lastFetched.mentors < CACHE_DURATION_MS
    ) {
      return; // Use cached data
    }

    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name")
        .eq("role", "faculty") // Filter for users who are faculty/mentors
        .eq("is_available_for_mentorship", true) // Ensure they are available
        .order("full_name", { ascending: true });

      if (error) throw error;

      set({
        mentors: data as MentorProfile[],
        lastFetched: { ...get().lastFetched, mentors: Date.now() },
      });
    } catch (err: any) {
      console.error("Error fetching mentors:", err);
      toast.error("Failed to load available mentors.");
      set({ error: err.message || "An unknown error occurred." });
    } finally {
      set({ loading: false });
    }
  },

  // --- MUTATION ACTIONS ---

  purchasePlan: async (planId: string) => {
    const { user, refreshProfile } = useAuthStore.getState();
    if (!user) return;

    try {
      const supabase = await createClient();

      const simulatedPaymentChargeId = `sim_${new Date().getTime()}`;

      // Call the RPC function instead of multiple separate queries
      const { data: newOrderId, error } = await supabase.rpc("purchase_plan", {
        plan_id_in: planId,
        order_status_in: "succeeded", // Simulate a successful payment
        payment_charge_id_in: simulatedPaymentChargeId,
      });

      if (error) {
        // The error message from `RAISE EXCEPTION` will be in error.message
        throw error;
      }

      toast.success("Plan purchased successfully!");

      // Refresh the user's data to reflect the changes made by the function
      get().fetchUserOrders({ force: true }); // Refresh the order history
      refreshProfile({ force: true }); // Refresh the profile to get the new credit balance
    } catch (err: any) {
      // Display the specific error message from the database function
      toast.error(
        err.message || "An unexpected error occurred during purchase."
      );
      // Optionally re-throw or handle the error further
      throw err; // Re-throwing allows the calling component to handle it
    }
  },

  submitAnswerSheet: async (data: AnswerSubmission) => {
    const { refreshProfile } = useAuthStore.getState();

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();

      // Call the Postgres function via RPC
      const { data: newAnswerId, error } = await supabase.rpc("submit_answer", {
        subject_id_in: data.subject_id_in,
        question_text_in: data.question_text_in,
        answer_file_url_in: data.answer_file_url_in,
        answer_file_size_in: Number(data.answer_file_size_in), // must be passed
        word_count_in: Number(data.word_count_in), // must be passed
      });

      if (error) throw error;

      // refresh profile to update balances, credits, etc.
      get().fetchUserAnswers({ force: true });
      await refreshProfile({ force: true });

      return newAnswerId;
    } catch (err: any) {
      toast.error(err.message);
      set({ error: err.message });
      return null;
    } finally {
      set({ loading: false });
    }
  },

  requestMentorshipSession: async (data: MentorshipRequest) => {
    const { refreshProfile } = useAuthStore.getState();

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();

      // Call the Postgres function via RPC
      const { data: newSessionId, error } = await supabase.rpc(
        "request_mentorship", // IMPORTANT: Ensure this is the correct name of your function in SQL
        {
          student_notes_in: data.student_notes,
          preferred_duration_in: data.duration_minutes,
        }
      );

      // The RPC function handles all checks (auth, balance, etc.)
      // If there's an error, it will be in the `error` object.
      if (error) {
        throw error;
      }

      // The RPC function created the notification, so we don't need to show a toast here,
      // but a confirmation is still good UX.
      toast.success("Mentorship request submitted successfully!");

      // Refresh client-side state that was changed by the function
      get().fetchUserMentorshipSessions({ force: true });
      get().fetchUserNotifications({ force: true }); // Also refresh notifications
      await refreshProfile({ force: true }); // Refreshes credit balance

      return newSessionId as string; // Return the new ID on success
    } catch (err: any) {
      // This will display the exact error message from your `RAISE EXCEPTION` calls
      toast.error(err.message || "Failed to request session.");
      set({ error: err.message });
      return null; // Return null on failure
    } finally {
      set({ loading: false });
    }
  },

  cancelSubscription: async (subscriptionId: string) => {
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { error } = await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("id", subscriptionId);

      if (error) throw error;

      toast.success("Subscription has been canceled.");
      get().fetchUserSubscriptions({ force: true });
    } catch (err: any) {
      toast.error("Failed to cancel subscription.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  markNotificationAsRead: async (notificationId: string) => {
    const currentNotifications = get().notifications;
    // Optimistically update the UI first for a better user experience
    const updatedNotifications =
      currentNotifications?.map((n) =>
        n.id === notificationId ? { ...n, is_read: true } : n
      ) ?? null;

    if (updatedNotifications) {
      set({
        notifications: updatedNotifications,
        unreadNotificationCount: get().unreadNotificationCount - 1,
      });
    }

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("id", notificationId);

      if (error) throw error;
    } catch (err: any) {
      toast.error("Failed to mark notification as read.");
      // Revert the optimistic update on error
      set({
        notifications: currentNotifications,
        unreadNotificationCount: get().unreadNotificationCount + 1,
      });
    }
  },

  markAllNotificationsAsRead: async () => {
    const { user } = useAuthStore.getState();
    if (!user) return;

    const currentNotifications = get().notifications;

    // Optimistic update
    const updatedNotifications =
      currentNotifications?.map((n) => ({ ...n, is_read: true })) ?? null;

    set({ notifications: updatedNotifications, unreadNotificationCount: 0 });

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq("user_id", user.id)
        .eq("is_read", false); // Only update those that are unread

      if (error) throw error;
    } catch (err: any) {
      toast.error("Failed to mark all notifications as read.");
      // Revert on error
      const originalUnreadCount =
        currentNotifications?.filter((n) => !n.is_read).length ?? 0;
      set({
        notifications: currentNotifications,
        unreadNotificationCount: originalUnreadCount,
      });
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
