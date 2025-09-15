"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client";
import { useAuthStore } from "./auth";

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
  loading: boolean;
  error: string | null;
  
  // Cache timestamps
  lastFetched: {
    assignedAnswers: number | null;
    mentorshipSessions: number | null;
    dashboardData: number | null;
  };

  // Actions
  fetchAssignedAnswers: (options?: FetchOptions) => Promise<void>;
  fetchMentorshipSessions: (options?: FetchOptions) => Promise<void>;
  fetchDashboardData: (options?: FetchOptions) => Promise<void>;
  evaluateAnswer: (answerId: string, marks: number, maxMarks: number, remarks: string, status: string, studentRating?: number, evaluatedFileUrl?: string) => Promise<boolean>;
  updateMentorshipSession: (sessionId: string, updates: Partial<FacultyMentorshipSession>) => Promise<boolean>;
};

const CACHE_DURATION_MS = 2 * 60 * 1000;

export const useFacultyStore = create<FacultyState>((set, get) => ({
  // Initial State
  assignedAnswers: null,
  mentorshipSessions: null,
  dashboardData: null,
  loading: false,
  error: null,
  lastFetched: {
    assignedAnswers: null,
    mentorshipSessions: null,
    dashboardData: null,
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
}));
