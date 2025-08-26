// src/stores/studentStore.ts

"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client"; // Your Supabase client
import { useAuthStore } from "./auth"; // To get the logged-in user's ID
import {
  Plan,
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
  category: 'gs' | 'specialized';
};

// ✅ 1. Define and export the specific AnswerStatus type your component needs.
// This should match the ENUM in your database.
export type AnswerStatus =
  | 'pending_assignment'
  | 'in_evaluation'
  | 'completed'
  | 'cancelled'; // Added based on your component's statusConfig

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
    full_name: string
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
      set({ plans: data });
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
        .select(`
          *,
          subjects(*),
          assigned_faculty:assigned_faculty_id(full_name)
        `)
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

    set({ loading: true, error: null });
    try {
      const supabase = await createClient();
      const { data: planData, error: planError } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();
      
      if (planError || !planData) throw new Error("Plan not found.");

      const { error: orderError } = await supabase.from("orders").insert({
        user_id: user.id,
        plan_id: planId,
        status: "completed",
        amount_paid: planData.price,
        currency: planData.currency,
      });

      if (orderError) throw orderError;
      
      toast.success(`Successfully purchased ${planData.name}!`);
      get().fetchUserOrders();
      refreshProfile();
    } catch (err: any) {
      toast.error(err.message);
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },

  submitAnswerSheet: async (data: AnswerSubmission) => {
    const { refreshProfile } = useAuthStore.getState();
    
    set({ loading: true, error: null });
    try {
      const supabase = await createClient();

      const { error } = await supabase.rpc('submit_answer', {
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
    } catch (err: any)      {
      toast.error("Failed to cancel subscription.");
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));