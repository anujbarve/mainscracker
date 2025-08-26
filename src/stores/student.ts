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

// Define the shape of data for creating new records
type AnswerSubmission = {
  subject_id: string;
  question_text: string;
  answer_file_url: string;
};

type MentorshipRequest = {
  mentor_id?: string;
  student_notes: string;
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
  | "cancelled"; // Added based on your component's statusConfig

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

  // Actions
  fetchPlans: () => Promise<void>;
  fetchUserSubscriptions: () => Promise<void>;
  fetchUserOrders: () => Promise<void>;
  fetchUserAnswers: () => Promise<void>;
  fetchUserMentorshipSessions: () => Promise<void>;
  fetchSubjects: () => Promise<void>;
  purchasePlan: (planId: string) => Promise<void>;
  submitAnswerSheet: (data: AnswerSubmission) => Promise<void>;
  requestMentorshipSession: (data: MentorshipRequest) => Promise<void>;
  cancelSubscription: (subscriptionId: string) => Promise<void>;
};

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

  // --- FETCH ACTIONS ---

  fetchPlans: async () => {
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });

      if (error) throw error;
      set({ plans: data as Plan[] });
    } catch (err: any) {
      toast.error("Failed to fetch plans.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserSubscriptions: async () => {
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
      set({ subscriptions: data as SubscriptionWithPlan[] });
    } catch (err: any) {
      toast.error("Failed to fetch subscriptions.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserOrders: async () => {
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
      set({ orders: data as OrderWithPlan[] });
    } catch (err: any) {
      toast.error("Failed to fetch order history.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserAnswers: async () => {
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

      set({ answers: data as AnswerWithDetails[] });
    } catch (err: any) {
      console.error("Error fetching answer sheets:", err);
      toast.error("Failed to fetch your answer sheets.");
      set({ error: err.message || "An unknown error occurred." });
    } finally {
      set({ loading: false });
    }
  },

  fetchUserMentorshipSessions: async () => {
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
      set({ mentorshipSessions: data as any });
    } catch (err: any) {
      toast.error("Failed to fetch mentorship sessions.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  fetchSubjects: async () => {
    if (get().subjects) return;
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("id, name, category")
        .order("name", { ascending: true });

      if (error) throw error;
      set({ subjects: data });
    } catch (err: any) {
      toast.error("Failed to load subjects.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  // --- MUTATION ACTIONS ---

  purchasePlan: async (planId: string) => {
    const { user, refreshProfile } = useAuthStore.getState();
    if (!user) return;

    // We don't need to set the global loading state if we handle it per-button,
    // but we can keep it for a global spinner if desired.
    // For this example, we'll assume the button will show its own loading state.

    try {
      const supabase = await createClient();

      // In a real application, you would get the payment_charge_id from your
      // payment provider (e.g., Stripe) after the user completes the checkout flow.
      // For this simplified example, we'll simulate a successful payment.
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
      get().fetchUserOrders(); // Refresh the order history
      refreshProfile(); // Refresh the profile to get the new credit balance
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

      const { error } = await supabase.rpc("submit_answer", {
        subject_id_in: data.subject_id,
        question_text_in: data.question_text,
        answer_file_url_in: data.answer_file_url,
      });

      if (error) throw error;

      toast.success("Answer sheet submitted successfully!");
      await refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  requestMentorshipSession: async (data: MentorshipRequest) => {
    const { user, profile } = useAuthStore.getState();
    if (!user || !profile) return;

    if (profile.mentorship_credit_balance < 1) {
      toast.error("Insufficient credits to book a session.");
      return;
    }

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { error } = await supabase.from("mentorship_sessions").insert({
        student_id: user.id,
        ...data,
      });
      if (error) throw error;

      toast.success("Mentorship session requested!");
      get().fetchUserMentorshipSessions();
    } catch (err: any) {
      toast.error("Failed to request session.");
      set({ error: err.message });
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
      get().fetchUserSubscriptions();
    } catch (err: any) {
      toast.error("Failed to cancel subscription.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
