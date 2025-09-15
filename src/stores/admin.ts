"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client"; // Your Supabase client

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
  status: AnswerStatus;
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

type Subject = {
  id: string;
  name: string;
  category: "gs" | "specialized";
};

export type QuestionPaper = {
  id: string;
  subject_id: string;
  name: string;
  file_url: string;
  created_at: string;
  subjects: { name: string }; // Joined data
};

// NEW: For Notifications module
export type NotificationTemplate = {
  id: string;
  name: string;
  title: string;
  message_body: string;
};

export type UserSubscription = {
  id: string;
  status: string;
  current_period_end: string;
  plans: { name: string; price: number }[]; // ✅ Changed to an array
};

// A more detailed profile view for admins
export type AdminProfile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  role: "student" | "faculty" | "admin";
  is_active: boolean;
  is_available: boolean;
  gs_credit_balance: number;
  specialized_credit_balance: number;
  mentorship_credit_balance: number;
  total_answers_submitted: number;
  total_answers_evaluated: number;
  created_at: string;
  last_activity_at: string | null;
};

// A detailed answer view for admins, joining student and faculty info
export type AdminAnswerView = AnswerWithDetails & {
  student: {
    full_name: string | null;
  } | null;
};

// Represents the data from the faculty_workload view
export type FacultyWorkload = {
  id: string;
  full_name: string | null;
  is_available: boolean;
  subjects_count: number;
  total_current_evaluations: number;
  total_capacity: number;
  capacity_utilization_percent: number;
};

// Represents a record from the credit_transactions table
export type CreditTransaction = {
  id: string;
  user_id: string;
  credit_type: "gs" | "specialized" | "mentorship";
  amount: number;
  balance_after: number;
  transaction_type:
    | "purchase"
    | "consumption"
    | "refund"
    | "admin_adjustment"
    | "bonus";
  reference_id: string | null;
  notes: string | null;
  created_at: string;
  user: {
    full_name: string | null;
  };
};

// Summary stats for the admin dashboard
export type AdminDashboardStats = {
  total_students: number;
  total_faculty: number;
  pending_answers: number;
  active_subscriptions: number;
  total_revenue_last_30d: number;
};

// Define the shape for creating/updating users
export type ProfileUpsertData = {
  full_name: string;
  phone_number?: string;
  role: "student" | "faculty";
  is_active?: boolean;
  is_available?: boolean;
};

// NEW: Type for a mentorship session with student/mentor names
export type MentorshipSessionWithDetails = {
  id: string;
  student_id: string;
  mentor_id: string | null;
  status: MentorshipStatus;
  student_notes: string | null;
  mentor_notes: string | null;
  scheduled_at: string | null;
  duration_minutes: number | null;
  meeting_url: string | null;
  requested_at: string;
  completed_at: string | null;
  updated_at: string;
  student: {
    full_name: string | null;
  };
  mentor: {
    full_name: string | null;
  } | null;
};

export type MentorshipStatus =
  | "requested"
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "student_absent"
  | "mentor_absent";

type AdminState = {
  // --- STATE ---
  dashboardStats: any | null;
  students: any[] | null;
  faculty: any[] | null;
  answers: any[] | null;
  facultyWorkload: FacultyWorkload | null;
  creditLogs: any[] | null;
  plans: any[] | null;
  // NEW State properties
  questionPapers: QuestionPaper[] | null;
  notificationTemplates: NotificationTemplate[] | null;
  userSubscriptions: UserSubscription[] | null;
  currentAnswer: AdminAnswerView | null; // <-- ADD THIS NEW STATE
  currentUser: AdminProfile | null; // <-- ADD THIS

  mentorshipSessions: MentorshipSessionWithDetails[] | null;
  currentMentorshipSession: MentorshipSessionWithDetails | null;

  loading: Record<string, boolean>;
  error: string | null;
  setLoading: (key: string, value: boolean) => void;

  // --- ACTIONS ---

  // Dashboard
  fetchDashboardStats: () => Promise<void>;

  // Student & Faculty Management
  fetchStudents: () => Promise<void>;
  fetchFaculty: () => Promise<void>;
  updateProfile: (userId: string, data: Partial<any>) => Promise<boolean>;
  // NEW Actions for Users
  createUser: (
    email: string,
    password: string,
    profileData: any
  ) => Promise<string | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  fetchUserSubscriptions: (userId: string) => Promise<void>;

  // Answersheets Management
  fetchAnswers: (statusFilter?: AnswerStatus) => Promise<void>;
  reassignAnswer: (answerId: string, facultyId: string) => Promise<boolean>;

  // Faculty Workload
  fetchFacultyWorkloadById: (id: string) => Promise<void>;

  // Billing & Plans
  fetchPlans: (includeInactive?: boolean) => Promise<void>;
  updatePlan: (planId: string, data: Partial<any>) => Promise<boolean>;
  createPlan: (data: any) => Promise<boolean>;

  // Reports & Logs
  fetchCreditLogs: (limit?: number) => Promise<void>;
  // NEW Report functions
  fetchOverdueAnswers: () => Promise<void>; // For Deadline Report

  // Notifications (NEW MODULE)
  sendNotification: (
    userId: string,
    title: string,
    message: string
  ) => Promise<boolean>;
  fetchNotificationTemplates: () => Promise<void>;
  saveNotificationTemplate: (
    template: Partial<NotificationTemplate>
  ) => Promise<boolean>;
  deleteNotificationTemplate: (templateId: string) => Promise<boolean>;

  // System Tools
  adjustUserCredits: (
    userId: string,
    creditType: string,
    amount: number,
    reason: string
  ) => Promise<boolean>;

  fetchMentorshipSessions: () => Promise<void>;
  fetchMentorshipSessionById: (sessionId: string) => Promise<void>;
  updateMentorshipSession: (
    sessionId: string,
    data: Partial<MentorshipSessionWithDetails>
  ) => Promise<boolean>;
  cancelMentorshipSession: (
    sessionId: string,
    reason: string
  ) => Promise<boolean>;
  clearCurrentMentorshipSession: () => void;

  fetchAnswerById: (id: string) => Promise<void>; // <-- ADD THIS NEW ACTION
  clearCurrentAnswer: () => void; // <-- ADD A HELPER TO CLEAN UP

  fetchUserById: (id: string) => Promise<void>; // <-- ADD THIS
  clearCurrentUser: () => void; // <-- ADD THIS
};

export const useAdminStore = create<AdminState>((set, get) => ({
  // --- INITIAL STATE ---
  dashboardStats: null,
  students: null,
  faculty: null,
  answers: null,
  facultyWorkload: null,
  creditLogs: null,
  plans: null,
  questionPapers: null,
  notificationTemplates: null,
  userSubscriptions: null,
  currentAnswer: null,
  currentUser: null,
  mentorshipSessions: null,
  currentMentorshipSession: null,
  loading: {},
  error: null,

  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),

  // --- ACTIONS ---

  // Dashboard
  fetchDashboardStats: async () => {
    get().setLoading("dashboard", true);
    try {
      const supabase = createClient();
      // This assumes you have an RPC function `get_admin_dashboard_stats` for efficiency.
      // If not, you'd perform multiple count queries.
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
      if (error) throw error;
      set({ dashboardStats: data });
    } catch (err: any) {
      toast.error("Failed to fetch dashboard stats.");
      set({ error: err.message });
    } finally {
      get().setLoading("dashboard", false);
    }
  },

  fetchAnswerById: async (id) => {
    get().setLoading("currentAnswer", true);
    set({ currentAnswer: null }); // Clear previous data
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("answers")
        .select(
          `
                *,
                subjects(*),
                student:profiles!student_id(full_name),
                assigned_faculty:profiles!assigned_faculty_id(full_name)
            `
        )
        .eq("id", id)
        .single(); // .single() is crucial for fetching one record

      if (error) throw error;

      set({ currentAnswer: data as AdminAnswerView });
    } catch (err: any) {
      toast.error("Failed to fetch answer details.");
      set({ error: err.message });
    } finally {
      get().setLoading("currentAnswer", false);
    }
  },

  clearCurrentAnswer: () => {
    set({ currentAnswer: null });
  },

  fetchUserById: async (id) => {
    get().setLoading("currentUser", true);
    set({ currentUser: null }); // Clear previous data
    try {
      const supabase = createClient();
      // We query the profiles table directly
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      set({ currentUser: data as AdminProfile });
    } catch (err: any) {
      toast.error("Failed to fetch user details.");
      set({ error: err.message });
    } finally {
      get().setLoading("currentUser", false);
    }
  },

  clearCurrentUser: () => {
    set({ currentUser: null });
  },

  // Student & Faculty Management
  fetchStudents: async () => {
    get().setLoading("students", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set({ students: data as AdminProfile[] });
    } catch (err: any) {
      toast.error("Failed to fetch students.");
      set({ error: err.message });
    } finally {
      get().setLoading("students", false);
    }
  },

  fetchFaculty: async () => {
    get().setLoading("faculty", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "faculty")
        .order("full_name", { ascending: true });
      if (error) throw error;
      set({ faculty: data as AdminProfile[] });
    } catch (err: any) {
      toast.error("Failed to fetch faculty.");
      set({ error: err.message });
    } finally {
      get().setLoading("faculty", false);
    }
  },

  createUser: async (email, password, profileData) => {
    get().setLoading("users", true);
    try {
      const supabase = createClient();
      // Step 1: Create the user in auth.users
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true, // Auto-confirm user
        });
      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed.");

      // Step 2: Create the corresponding public profile
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          full_name: profileData.full_name,
          role: profileData.role,
        })
        .eq("id", authData.user.id);

      if (profileError) throw profileError;

      toast.success("User created successfully.");
      if (profileData.role === "student") get().fetchStudents();
      else get().fetchFaculty();

      return authData.user.id;
    } catch (err: any) {
      toast.error(err.message || "Failed to create user.");
      return null;
    } finally {
      get().setLoading("users", false);
    }
  },

  deleteUser: async (userId) => {
    if (
      !confirm(
        "Are you sure you want to permanently delete this user and all their data? This cannot be undone."
      )
    ) {
      return false;
    }
    get().setLoading(`user_${userId}`, true);
    try {
      const supabase = createClient();
      // This single call will delete from auth.users. The CASCADE DELETE on the
      // profiles table will handle deleting the profile automatically.
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;

      toast.success("User deleted successfully.");
      // Refresh both lists as we might not know the role
      get().fetchStudents();
      get().fetchFaculty();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
      return false;
    } finally {
      get().setLoading(`user_${userId}`, false);
    }
  },

  fetchUserSubscriptions: async (userId) => {
    get().setLoading("userSubscriptions", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subscriptions")
        .select("id, status, current_period_end, plans(name, price)")
        .eq("user_id", userId);
      if (error) throw error;
      set({ userSubscriptions: data as UserSubscription[] });
    } catch (err: any) {
      toast.error("Failed to fetch user subscriptions.");
    } finally {
      get().setLoading("userSubscriptions", false);
    }
  },

  fetchOverdueAnswers: async () => {
    get().setLoading("answers", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("answers")
        .select(
          `*, student:profiles!student_id(full_name), assigned_faculty:profiles!assigned_faculty_id(full_name)`
        )
        .in("status", ["assigned", "in_evaluation"])
        .lt("expected_completion_at", new Date().toISOString()); // Less than now
      if (error) throw error;
      set({ answers: data as any[] }); // Re-use the answers state for the report
    } catch (err: any) {
      toast.error("Failed to fetch deadline report.");
    } finally {
      get().setLoading("answers", false);
    }
  },

  updateProfile: async (userId, data) => {
    get().setLoading(`profile_${userId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", userId);
      if (error) throw error;
      toast.success("Profile updated successfully.");
      // Refresh relevant list
      const profile =
        get().students?.find((s) => s.id === userId) ||
        get().faculty?.find((f) => f.id === userId);
      if (profile?.role === "student") get().fetchStudents();
      if (profile?.role === "faculty") get().fetchFaculty();
      return true;
    } catch (err: any) {
      toast.error("Failed to update profile.");
      set({ error: err.message });
      return false;
    } finally {
      get().setLoading(`profile_${userId}`, false);
    }
  },

  // Answersheet Management
  fetchAnswers: async (statusFilter) => {
    get().setLoading("answers", true);
    try {
      const supabase = createClient();
      let query = supabase.from("answers").select(`
        *,
        subjects(*),
        student:profiles!student_id(full_name),
        assigned_faculty:profiles!assigned_faculty_id(full_name)
      `);
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query.order("submitted_at", {
        ascending: false,
      });
      if (error) throw error;
      set({ answers: data as any[] });
    } catch (err: any) {
      toast.error("Failed to fetch answersheets.");
      set({ error: err.message });
    } finally {
      get().setLoading("answers", false);
    }
  },

  reassignAnswer: async (answerId, facultyId) => {
    get().setLoading(`answer_${answerId}`, true);
    try {
      const supabase = createClient();
      // Uses the RPC function for safe, transactional assignment
      const { error } = await supabase.rpc("assign_answer_to_faculty", {
        p_answer_id: answerId,
        p_faculty_id: facultyId,
      });
      if (error) throw error;
      toast.success("Answer reassigned successfully.");
      get().fetchAnswers(); // Refresh the list
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to reassign answer.");
      return false;
    } finally {
      get().setLoading(`answer_${answerId}`, false);
    }
  },

  // Faculty Workload
  fetchFacultyWorkloadById: async (id) => {
    get().setLoading("facultyWorkload", true);
    set({ facultyWorkload: null }); // Clear previous data
    try {
      const supabase = createClient();
      // Fetch a single record from the view
      const { data, error } = await supabase
        .from("faculty_workload")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      set({ facultyWorkload: data as FacultyWorkload });
    } catch (err: any) {
      // Don't show an error toast if not found, it's expected for students
      if (err.code !== "PGRST116") {
        // PGRST116 = "The result contains 0 rows"
        toast.error("Failed to fetch faculty workload.");
      }
      set({ error: err.message });
    } finally {
      get().setLoading("facultyWorkload", false);
    }
  },

  fetchPlans: async (includeInactive = true) => {
    get().setLoading("plans", true);
    try {
      const supabase = createClient();
      let query = supabase.from("plans").select("*");
      if (!includeInactive) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query.order("price");
      if (error) throw error;
      set({ plans: data });
    } catch (err: any) {
      toast.error("Failed to fetch plans.");
      set({ error: err.message });
    } finally {
      get().setLoading("plans", false);
    }
  },

  // ✅ COMPLETED: Implementation for updating a plan
  updatePlan: async (planId, data) => {
    get().setLoading("plans", true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("plans")
        .update(data)
        .eq("id", planId);
      if (error) throw error;
      toast.success("Plan updated successfully.");
      get().fetchPlans(true); // Refresh the list of plans
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan.");
      set({ error: err.message });
      return false;
    } finally {
      get().setLoading("plans", false);
    }
  },

  // ✅ COMPLETED: Implementation for creating a plan
  createPlan: async (data) => {
    get().setLoading("plans", true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("plans").insert([data]);
      if (error) throw error;
      toast.success("Plan created successfully.");
      get().fetchPlans(true); // Refresh the list of plans
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create plan.");
      set({ error: err.message });
      return false;
    } finally {
      get().setLoading("plans", false);
    }
  },

  // Reports & Logs
  fetchCreditLogs: async (limit = 100) => {
    get().setLoading("creditLogs", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*, user:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      set({ creditLogs: data as any[] });
    } catch (err: any) {
      toast.error("Failed to fetch credit logs.");
      set({ error: err.message });
    } finally {
      get().setLoading("creditLogs", false);
    }
  },

  // System Tools
  adjustUserCredits: async (userId, creditType, amount, reason) => {
    get().setLoading(`credits_${userId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("adjust_user_credits", {
        user_id_in: userId,
        credit_type_in: creditType,
        amount_in: amount,
        reason_in: reason,
      });
      if (error) throw error;
      toast.success("Credits adjusted successfully.");
      // Refresh the specific user's data or the whole list
      get().fetchStudents();
      get().fetchFaculty();
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust credits.");
      return false;
    } finally {
      get().setLoading(`credits_${userId}`, false);
    }
  },

  // --- Notifications ---
  sendNotification: async (userId, title, message) => {
    get().setLoading("notifications", true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .insert([
          { user_id: userId, title, message, type: "admin_credit_adjustment" },
        ]); // Using a generic type
      if (error) throw error;
      toast.success("Notification sent.");
      return true;
    } catch (err: any) {
      toast.error("Failed to send notification.");
      return false;
    } finally {
      get().setLoading("notifications", false);
    }
  },

  fetchNotificationTemplates: async () => {
    get().setLoading("templates", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*");
      if (error) throw error;
      set({ notificationTemplates: data as NotificationTemplate[] });
    } catch (err: any) {
      toast.error("Failed to fetch templates.");
    } finally {
      get().setLoading("templates", false);
    }
  },

  saveNotificationTemplate: async (template) => {
    get().setLoading("templates", true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notification_templates")
        .upsert(template);
      if (error) throw error;
      toast.success("Template saved.");
      get().fetchNotificationTemplates();
      return true;
    } catch (err: any) {
      toast.error("Failed to save template.");
      return false;
    } finally {
      get().setLoading("templates", false);
    }
  },

  deleteNotificationTemplate: async (templateId) => {
    if (
      !confirm("Are you sure you want to delete this template permanently?")
    ) {
      return false;
    }

    get().setLoading(`template_${templateId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", templateId);

      if (error) throw error;

      toast.success("Template deleted successfully.");
      get().fetchNotificationTemplates(); // Refresh the list in the store
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template.");
      return false;
    } finally {
      get().setLoading(`template_${templateId}`, false);
    }
  },

  // --- MENTORSHIP MANAGEMENT (NEW) ---
  fetchMentorshipSessions: async () => {
    get().setLoading("mentorshipSessions", true);
    try {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("mentorship_sessions")
        .select(
          `
        id,
        student_id,
        mentor_id,
        status,
        student_notes,
        mentor_notes,
        scheduled_at,
        duration_minutes,
        meeting_url,
        requested_at,
        completed_at,
        updated_at,
        student:profiles!student_id(full_name),
        mentor:profiles!mentor_id(full_name)
      `
        )
        .order("requested_at", { ascending: false });

      if (error) throw error;

      // Normalize arrays from Supabase joins
      const fixedData = (data as any[]).map((item) => ({
        ...item,
        student: Array.isArray(item.student) ? item.student[0] : item.student,
        mentor: Array.isArray(item.mentor) ? item.mentor[0] : item.mentor,
      }));

      set({ mentorshipSessions: fixedData as MentorshipSessionWithDetails[] });
    } catch (err: any) {
      toast.error("Failed to fetch mentorship sessions.");
      set({ error: err.message });
    } finally {
      get().setLoading("mentorshipSessions", false);
    }
  },

  fetchMentorshipSessionById: async (sessionId) => {
    get().setLoading("currentMentorshipSession", true);
    set({ currentMentorshipSession: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("mentorship_sessions")
        .select(
          `
          *,
          student:profiles!student_id(full_name),
          mentor:profiles!mentor_id(full_name)
        `
        )
        .eq("id", sessionId)
        .single();

      if (error) throw error;
      set({ currentMentorshipSession: data as MentorshipSessionWithDetails });
    } catch (err: any) {
      toast.error("Failed to fetch session details.");
      set({ error: err.message });
    } finally {
      get().setLoading("currentMentorshipSession", false);
    }
  },

  updateMentorshipSession: async (sessionId, updateData) => {
    get().setLoading(`session_${sessionId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("mentorship_sessions")
        .update(updateData)
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Mentorship session updated successfully.");
      // Refresh the main list and the detailed view if it's the current one
      get().fetchMentorshipSessions();
      if (get().currentMentorshipSession?.id === sessionId) {
        get().fetchMentorshipSessionById(sessionId);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update session.");
      return false;
    } finally {
      get().setLoading(`session_${sessionId}`, false);
    }
  },

  cancelMentorshipSession: async (sessionId, reason) => {
    get().setLoading(`session_${sessionId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("mentorship_sessions")
        .update({
          status: "cancelled",
          mentor_notes: `Session cancelled by admin. Reason: ${reason}`,
        })
        .eq("id", sessionId);

      if (error) throw error;

      toast.success("Session cancelled.");
      get().fetchMentorshipSessions();
      if (get().currentMentorshipSession?.id === sessionId) {
        get().fetchMentorshipSessionById(sessionId);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel session.");
      return false;
    } finally {
      get().setLoading(`session_${sessionId}`, false);
    }
  },

  clearCurrentMentorshipSession: () => {
    set({ currentMentorshipSession: null });
  },
}));
