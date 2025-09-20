"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client"; 

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
  subjects: { name: string };
};

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
  plans: { name: string; price: number }[];
};

export type AdminProfile = {
  id: string;
  full_name: string;
  phone_number: string | null;
  role: "student" | "faculty" | "admin";
  email : string;
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

export type AdminAnswerView = AnswerWithDetails & {
  student: {
    full_name: string | null;
  } | null;
};

export type FacultyWorkload = {
  id: string;
  full_name: string | null;
  is_available: boolean;
  subjects_count: number;
  total_current_evaluations: number;
  total_capacity: number;
  capacity_utilization_percent: number;
};

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

export type AdminDashboardStats = {
  total_students: number;
  total_faculty: number;
  pending_answers: number;
  active_subscriptions: number;
  total_revenue_last_30d: number;
};

export type ProfileUpsertData = {
  full_name: string;
  phone_number?: string;
  role: "student" | "faculty";
  is_active?: boolean;
  is_available?: boolean;
};

export type MentorshipStatus =
  | "requested"
  | "pending_confirmation"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "student_absent"
  | "mentor_absent";

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

interface RevenueDataPoint {
  period_start: string;
  one_time: number;
  recurring: number;
}

interface PlanPerformanceDataPoint {
  plan_name: string;
  total_revenue: number;
  purchase_count: number;
}

interface CreditEconomyDataPoint {
  period_start: string;
  purchased: number;
  consumed: number;
}

type FetchOptions = {
  force?: boolean;
};

type AuditActionType = 'INSERT' | 'UPDATE' | 'DELETE';

export interface AuditLog {
  id: number;
  timestamp: string; // Supabase returns timestamptz as an ISO 8601 string
  actor_id: string | null;
  action: AuditActionType;
  target_table: string;
  target_record_id: string | null;
  old_record: Record<string, any> | null; // JSONB is treated as an object
  new_record: Record<string, any> | null; // JSONB is treated as an object
  notes: string | null;
}

type AuditLogWithActor = AuditLog & { actor: { full_name: string } | null };

// --- ZUSTAND STORE DEFINITION ---

type AdminState = {
  // State
  dashboardStats: AdminDashboardStats | null;
  students: AdminProfile[] | null;
  faculty: AdminProfile[] | null;
  answers: AdminAnswerView[] | null;
  facultyWorkload: FacultyWorkload | null;
  creditLogs: CreditTransaction[] | null;
  plans: any[] | null;
  questionPapers: QuestionPaper[] | null;
  notificationTemplates: NotificationTemplate[] | null;
  userSubscriptions: UserSubscription[] | null;
  currentAnswer: AdminAnswerView | null;
  currentUser: AdminProfile | null;
  mentorshipSessions: MentorshipSessionWithDetails[] | null;
  currentMentorshipSession: MentorshipSessionWithDetails | null;
  revenueData: RevenueDataPoint[];
  planPerformanceData: PlanPerformanceDataPoint[];
  creditEconomyData: CreditEconomyDataPoint[];
  loading: Record<string, boolean>;
  error: string | null;
  lastFetched: Record<string, number | null>;
  logs : AuditLog[] | null;

  // Actions
  setLoading: (key: string, value: boolean) => void;
  fetchDashboardStats: (options?: FetchOptions) => Promise<void>;
  fetchStudents: (options?: FetchOptions) => Promise<void>;
  fetchFaculty: (options?: FetchOptions) => Promise<void>;
  updateProfile: (userId: string, data: Partial<AdminProfile>) => Promise<boolean>;
  createUser: (
    email: string,
    password: string,
    profileData: ProfileUpsertData
  ) => Promise<string | null>;
  deleteUser: (userId: string) => Promise<boolean>;
  fetchUserSubscriptions: (userId: string) => Promise<void>;
  fetchAnswers: (
    statusFilter?: AnswerStatus,
    options?: FetchOptions
  ) => Promise<void>;
  reassignAnswer: (answerId: string, facultyId: string) => Promise<boolean>;
  fetchFacultyWorkloadById: (id: string) => Promise<void>;
  fetchPlans: (includeInactive?: boolean, options?: FetchOptions) => Promise<void>;
  updatePlan: (planId: string, data: Partial<any>) => Promise<boolean>;
  createPlan: (data: any) => Promise<boolean>;
  fetchCreditLogs: (limit?: number, options?: FetchOptions) => Promise<void>;
  fetchOverdueAnswers: (options?: FetchOptions) => Promise<void>;
  sendNotification: (
    userId: string,
    title: string,
    message: string
  ) => Promise<boolean>;
  fetchNotificationTemplates: (options?: FetchOptions) => Promise<void>;
  saveNotificationTemplate: (
    template: Partial<NotificationTemplate>
  ) => Promise<boolean>;
  deleteNotificationTemplate: (templateId: string) => Promise<boolean>;
  adjustUserCredits: (
    userId: string,
    creditType: string,
    amount: number,
    reason: string
  ) => Promise<boolean>;
  fetchMentorshipSessions: (options?: FetchOptions) => Promise<void>;
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
  fetchAnswerById: (id: string) => Promise<void>;
  clearCurrentAnswer: () => void;
  fetchUserById: (id: string) => Promise<void>;
  clearCurrentUser: () => void;
  fetchRevenueData: (
    periodType: "daily" | "weekly" | "monthly",
    daysLimit: number,
    options?: FetchOptions
  ) => Promise<void>;
  fetchPlanPerformance: (
    daysLimit: number,
    options?: FetchOptions
  ) => Promise<void>;
  fetchCreditEconomyData: (
    daysLimit: number,
    options?: FetchOptions
  ) => Promise<void>;
  fetchLogs: (options? : FetchOptions) => Promise<void>;
};

const CACHE_DURATION_MS = 2 * 60 * 1000; // 2 minutes

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
  revenueData: [],
  planPerformanceData: [],
  creditEconomyData: [],
  logs : [],
  loading: {},
  error: null,
  lastFetched: {},

  // --- ACTIONS ---

  setLoading: (key, value) =>
    set((state) => ({ loading: { ...state.loading, [key]: value } })),

  fetchDashboardStats: async (options) => {
    const cacheKey = "dashboardStats";
    const { dashboardStats, lastFetched } = get();
    if (
      !options?.force &&
      dashboardStats &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_admin_dashboard_stats");
      if (error) throw error;
      set((state) => ({
        dashboardStats: data,
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch dashboard stats.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchRevenueData: async (periodType = "daily", daysLimit = 90, options) => {
    const cacheKey = `revenueData_${periodType}_${daysLimit}`;
    const { lastFetched } = get();
    // Simplified caching for reports: cache the last requested view.
    if (
      !options?.force &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading("revenueData", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_revenue_over_time", {
        period_type: periodType,
        days_limit: daysLimit,
      });
      if (error) throw error;
      set((state) => ({
        revenueData: data || [],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch revenue data.");
    } finally {
      get().setLoading("revenueData", false);
    }
  },

  fetchPlanPerformance: async (daysLimit = 90, options) => {
    const cacheKey = `planPerformance_${daysLimit}`;
    const { lastFetched } = get();
    if (
      !options?.force &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading("planPerformance", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_plan_performance", {
        days_limit: daysLimit,
      });
      if (error) throw error;
      set((state) => ({
        planPerformanceData: data || [],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch plan performance data.");
    } finally {
      get().setLoading("planPerformance", false);
    }
  },

  fetchCreditEconomyData: async (daysLimit = 90, options) => {
    const cacheKey = `creditEconomy_${daysLimit}`;
    const { lastFetched } = get();
    if (
      !options?.force &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading("creditEconomyData", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_credit_economy_balance", {
        days_limit: daysLimit,
      });
      if (error) throw error;
      set((state) => ({
        creditEconomyData: data || [],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch credit economy data.");
    } finally {
      get().setLoading("creditEconomyData", false);
    }
  },

  fetchStudents: async (options) => {
    const cacheKey = "students";
    const { students, lastFetched } = get();
    if (
      !options?.force &&
      students &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "student")
        .order("created_at", { ascending: false });
      if (error) throw error;
      set((state) => ({
        students: data as AdminProfile[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch students.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchFaculty: async (options) => {
    const cacheKey = "faculty";
    const { faculty, lastFetched } = get();
    if (
      !options?.force &&
      faculty &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "faculty")
        .order("full_name", { ascending: true });
      if (error) throw error;
      set((state) => ({
        faculty: data as AdminProfile[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch faculty.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchAnswers: async (statusFilter, options) => {
    const cacheKey = statusFilter ? `answers_${statusFilter}` : "answers";
    const { answers, lastFetched } = get();
    if (
      !options?.force &&
      answers && // Check general answers state
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
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
      set((state) => ({
        answers: data as AdminAnswerView[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch answersheets.");
    } finally {
      get().setLoading("answers", false);
    }
  },

  fetchPlans: async (includeInactive = true, options) => {
    const cacheKey = `plans_${includeInactive}`;
    const { plans, lastFetched } = get();
    if (
      !options?.force &&
      plans &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading("plans", true);
    try {
      const supabase = createClient();
      let query = supabase.from("plans").select("*");
      if (!includeInactive) {
        query = query.eq("is_active", true);
      }
      const { data, error } = await query.order("price");
      if (error) throw error;
      set((state) => ({
        plans: data,
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch plans.");
    } finally {
      get().setLoading("plans", false);
    }
  },

  fetchCreditLogs: async (limit = 100, options) => {
    const cacheKey = "creditLogs";
    const { creditLogs, lastFetched } = get();
    if (
      !options?.force &&
      creditLogs &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("credit_transactions")
        .select("*, user:profiles(full_name)")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      set((state) => ({
        creditLogs: data as CreditTransaction[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch credit logs.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchNotificationTemplates: async (options) => {
    const cacheKey = "notificationTemplates";
    const { notificationTemplates, lastFetched } = get();
    if (
      !options?.force &&
      notificationTemplates &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*");
      if (error) throw error;
      set((state) => ({
        notificationTemplates: data as NotificationTemplate[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch templates.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchMentorshipSessions: async (options) => {
    const cacheKey = "mentorshipSessions";
    const { mentorshipSessions, lastFetched } = get();
    if (
      !options?.force &&
      mentorshipSessions &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("mentorship_sessions")
        .select(
          `*, student:profiles!student_id(full_name), mentor:profiles!mentor_id(full_name)`
        )
        .order("requested_at", { ascending: false });
      if (error) throw error;
      set((state) => ({
        mentorshipSessions: data as MentorshipSessionWithDetails[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch mentorship sessions.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchLogs: async (options) => {
  const cacheKey = "logs";
  const { logs, lastFetched } = get();

  // Return cached data if available and not forced to refresh
  if (
    !options?.force &&
    logs &&
    lastFetched[cacheKey] &&
    Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
  ) {
    return;
  }

  get().setLoading(cacheKey, true);
  try {
    const supabase = createClient();
    
    // ✅ MODIFIED: The .select() query now joins with the profiles table.
    // It fetches all columns from audit_log (*) and for the 'actor_id',
    // it fetches the 'full_name' from the 'profiles' table, renaming it to 'actor'.
    const { data, error } = await supabase
      .from("audit_log")
      .select("*, actor:profiles(full_name)")
      .order("timestamp", { ascending: false });

    if (error) throw error;

    set((state) => ({
      // Assuming you have a type like AuditLogWithActor that includes the nested actor
      logs: data as AuditLogWithActor[],
      lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
    }));
  } catch (err: any) {
    toast.error("Failed to fetch audit logs.");
  } finally {
    get().setLoading(cacheKey, false);
  }
},

  // --- ACTIONS THAT MODIFY DATA (CACHE INVALIDATION) ---

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
      // Force refresh the relevant lists
      if (data.role === "student" || get().students?.some(s => s.id === userId)) {
        get().fetchStudents({ force: true });
      }
      if (data.role === "faculty" || get().faculty?.some(f => f.id === userId)) {
        get().fetchFaculty({ force: true });
      }
      return true;
    } catch (err: any) {
      toast.error("Failed to update profile.");
      return false;
    } finally {
      get().setLoading(`profile_${userId}`, false);
    }
  },

  createUser: async (email, password, profileData) => {
    get().setLoading("users", true);
    try {
      const supabase = createClient();
      const { data: authData, error: authError } =
        await supabase.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
        });
      if (authError) throw authError;
      if (!authData.user) throw new Error("User creation failed.");
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileData)
        .eq("id", authData.user.id);
      if (profileError) throw profileError;
      toast.success("User created successfully.");
      if (profileData.role === "student") get().fetchStudents({ force: true });
      else get().fetchFaculty({ force: true });
      return authData.user.id;
    } catch (err: any) {
      toast.error(err.message || "Failed to create user.");
      return null;
    } finally {
      get().setLoading("users", false);
    }
  },

  deleteUser: async (userId) => {
    if (!confirm("Are you sure? This action is permanent.")) return false;
    get().setLoading(`user_${userId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.admin.deleteUser(userId);
      if (error) throw error;
      toast.success("User deleted successfully.");
      get().fetchStudents({ force: true });
      get().fetchFaculty({ force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
      return false;
    } finally {
      get().setLoading(`user_${userId}`, false);
    }
  },

  reassignAnswer: async (answerId, facultyId) => {
    get().setLoading(`answer_${answerId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase.rpc("assign_answer_to_faculty", {
        p_answer_id: answerId,
        p_faculty_id: facultyId,
      });
      if (error) throw error;
      toast.success("Answer reassigned successfully.");
      get().fetchAnswers(undefined, { force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to reassign answer.");
      return false;
    } finally {
      get().setLoading(`answer_${answerId}`, false);
    }
  },

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
      get().fetchPlans(true, { force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update plan.");
      return false;
    } finally {
      get().setLoading("plans", false);
    }
  },

  createPlan: async (data) => {
    get().setLoading("plans", true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("plans").insert([data]);
      if (error) throw error;
      toast.success("Plan created successfully.");
      get().fetchPlans(true, { force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to create plan.");
      return false;
    } finally {
      get().setLoading("plans", false);
    }
  },

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
      get().fetchStudents({ force: true });
      get().fetchFaculty({ force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to adjust credits.");
      return false;
    } finally {
      get().setLoading(`credits_${userId}`, false);
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
      get().fetchNotificationTemplates({ force: true });
      return true;
    } catch (err: any) {
      toast.error("Failed to save template.");
      return false;
    } finally {
      get().setLoading("templates", false);
    }
  },
  
  deleteNotificationTemplate: async (templateId) => {
    if (!confirm("Are you sure?")) return false;
    get().setLoading(`template_${templateId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notification_templates")
        .delete()
        .eq("id", templateId);
      if (error) throw error;
      toast.success("Template deleted successfully.");
      get().fetchNotificationTemplates({ force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete template.");
      return false;
    } finally {
      get().setLoading(`template_${templateId}`, false);
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
      toast.success("Mentorship session updated.");
      get().fetchMentorshipSessions({ force: true });
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
      get().fetchMentorshipSessions({ force: true });
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

  // --- NON-CACHED ACTIONS (for specific detail views or simple mutations) ---

  // Caching is intentionally omitted for fetches that populate a singular,
  // transient state like 'currentAnswer' or 'currentUser'.
  fetchAnswerById: async (id) => {
    get().setLoading("currentAnswer", true);
    set({ currentAnswer: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("answers")
        .select(`*, subjects(*), student:profiles!student_id(full_name), assigned_faculty:profiles!assigned_faculty_id(full_name)`)
        .eq("id", id)
        .single();
      if (error) throw error;
      set({ currentAnswer: data as AdminAnswerView });
    } catch (err: any) {
      toast.error("Failed to fetch answer details.");
    } finally {
      get().setLoading("currentAnswer", false);
    }
  },

  fetchUserById: async (id) => {
    get().setLoading("currentUser", true);
    set({ currentUser: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      set({ currentUser: data as AdminProfile });
    } catch (err: any) {
      toast.error("Failed to fetch user details.");
    } finally {
      get().setLoading("currentUser", false);
    }
  },
  
  fetchMentorshipSessionById: async (sessionId) => {
    get().setLoading("currentMentorshipSession", true);
    set({ currentMentorshipSession: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("mentorship_sessions")
        .select(`*, student:profiles!student_id(full_name), mentor:profiles!mentor_id(full_name)`)
        .eq("id", sessionId)
        .single();
      if (error) throw error;
      set({ currentMentorshipSession: data as MentorshipSessionWithDetails });
    } catch (err: any) {
      toast.error("Failed to fetch session details.");
    } finally {
      get().setLoading("currentMentorshipSession", false);
    }
  },

  // Intentionally not cached as it's for a specific detail view
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

  // Intentionally not cached as it's for a specific detail view
  fetchFacultyWorkloadById: async (id) => {
    get().setLoading("facultyWorkload", true);
    set({ facultyWorkload: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("faculty_workload")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      set({ facultyWorkload: data as FacultyWorkload });
    } catch (err: any) {
      if (err.code !== "PGRST116") { // Ignore "0 rows" error
        toast.error("Failed to fetch faculty workload.");
      }
    } finally {
      get().setLoading("facultyWorkload", false);
    }
  },
  
  // A special report; not cached to ensure it's always fresh
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
        .lt("expected_completion_at", new Date().toISOString());
      if (error) throw error;
      set({ answers: data as AdminAnswerView[] });
    } catch (err: any) {
      toast.error("Failed to fetch deadline report.");
    } finally {
      get().setLoading("answers", false);
    }
  },
  
  sendNotification: async (userId, title, message) => {
    get().setLoading("notifications", true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("notifications")
        .insert([{ user_id: userId, title, message, type: "admin_credit_adjustment" }]);
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

  // --- HELPER ACTIONS (no API calls) ---
  clearCurrentAnswer: () => set({ currentAnswer: null }),
  clearCurrentUser: () => set({ currentUser: null }),
  clearCurrentMentorshipSession: () => set({ currentMentorshipSession: null }),
}));