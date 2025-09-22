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

export type Subject = {
  id: string;
  name: string;
  description: string | null;
  category: "gs" | "specialized";
  is_active: boolean;
  sort_order: number;
  total_answers_submitted: number; // Add this line
};

export type QuestionPaper = {
  id: string;
  subject_id: string;
  name: string;
  file_url: string;
  created_at: string;
  subjects: { name: string };
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
  email: string;
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

type AuditActionType = "INSERT" | "UPDATE" | "DELETE";

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

// --- Add these new types for the Support System ---

export type SupportTicketStatus =
  | "open"
  | "in_progress"
  | "resolved"
  | "closed";
export type TicketPriority = "low" | "medium" | "high" | "urgent";

export type SupportTicketWithDetails = {
  attachments: never[];
  id: string;
  user_id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: SupportTicketStatus;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
  last_reply_at: string | null;
  user: {
    full_name: string | null;
  };
  assignee: {
    full_name: string | null;
  } | null;
};

export type SupportTicketMessage = {
  id: string;
  ticket_id: string;
  sender_id: string;
  message: string;
  sent_at: string;
  sender: {
    full_name: string | null;
  };
};

export type SupportTicketAttachment = {
  id: string;
  ticket_id: string;
  file_url: string;
  file_name: string;
  uploaded_at: string;
};

// This type will hold the complete view of a single ticket
export type CurrentSupportTicket = {
  ticket: SupportTicketWithDetails;
  messages: SupportTicketMessage[];
  attachments: SupportTicketAttachment[];
};

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  type: "one_time" | "recurring";
  gs_credits_granted: number;
  specialized_credits_granted: number;
  mentorship_credits_granted: number;
  is_active: boolean;
};

export type PlanPurchaseStat = {
  plan_name: string;
  purchase_count: number;
};

export type OrderWithDetails = {
  id: string;
  user_id: string;
  status: "pending" | "succeeded" | "failed" | "refunded";
  amount_paid: number;
  currency: string;
  created_at: string;
  user: { full_name: string | null };
  plan: { name: string | null };
};

export type CreditTransactionWithDetails = {
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
  notes: string | null;
  created_at: string;
  user: { full_name: string | null };
};

export type PaginatedData<T> = {
  data: T[];
  count: number;
};

export type CreditEconomyTrend = {
  period: string;
  purchased: number;
  consumed: number;
};

export type OrderWithAllDetails = OrderWithDetails & {
  credit_transactions: CreditTransaction[];
};

export type Report = {
  id: string;
  name: string;
  status: "generating" | "completed" | "failed";
  parameters: {
    startDate: string;
    endDate: string;
    modules: string[];
  };
  data: any; // The generated JSON data
  generated_at: string;
};

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
  supportTickets: SupportTicketWithDetails[] | null;
  currentSupportTicket: CurrentSupportTicket | null;
  planPurchaseStats: PlanPurchaseStat[] | null;
  currentPlan: Plan | null;
  subjects: Subject[] | null;
  paginatedOrders: PaginatedData<OrderWithDetails> | null;
  paginatedCreditTxs: PaginatedData<CreditTransactionWithDetails> | null;
  creditEconomyTrends: CreditEconomyTrend[] | null;
  currentOrder: OrderWithAllDetails | null;
  reports: Report[] | null;
  currentReport: Report | null;
  logs: AuditLog[] | null;

  // Actions
  setLoading: (key: string, value: boolean) => void;
  fetchDashboardStats: (options?: FetchOptions) => Promise<void>;
  fetchStudents: (options?: FetchOptions) => Promise<void>;
  fetchFaculty: (options?: FetchOptions) => Promise<void>;
  updateProfile: (
    userId: string,
    data: Partial<AdminProfile>
  ) => Promise<boolean>;
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
  fetchPlans: (
    includeInactive?: boolean,
    options?: FetchOptions
  ) => Promise<void>;
  updatePlan: (planId: string, data: Partial<any>) => Promise<boolean>;
  createPlan: (data: any) => Promise<boolean>;
  fetchCreditLogs: (limit?: number, options?: FetchOptions) => Promise<void>;
  fetchOverdueAnswers: (options?: FetchOptions) => Promise<void>;
  sendNotification: (
    userId: string,
    title: string,
    message: string
  ) => Promise<boolean>;
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
  fetchLogs: (options?: FetchOptions) => Promise<void>;
  fetchSupportTickets: (
    statusFilter?: SupportTicketStatus,
    options?: FetchOptions
  ) => Promise<void>;
  fetchSupportTicketById: (ticketId: string) => Promise<void>;
  updateSupportTicket: (
    ticketId: string,
    data: Partial<SupportTicketWithDetails>
  ) => Promise<boolean>;
  addSupportTicketMessage: (
    ticketId: string,
    message: string
  ) => Promise<boolean>;
  clearCurrentSupportTicket: () => void;

  fetchPlanPurchaseStats: (options?: FetchOptions) => Promise<void>;
  fetchPlanById: (planId: string) => Promise<void>;
  clearCurrentPlan: () => void;
  deletePlan: (planId: string) => Promise<boolean>;
  fetchSubjects: (options?: FetchOptions) => Promise<void>;
  createSubject: (data: Omit<Subject, "id">) => Promise<boolean>;
  updateSubject: (
    subjectId: string,
    data: Partial<Subject>
  ) => Promise<boolean>;
  deleteSubject: (subjectId: string) => Promise<boolean>;
  fetchPaginatedOrders: (
    page: number,
    pageSize: number,
    filters: { status?: string }
  ) => Promise<void>;
  fetchPaginatedCreditTxs: (
    page: number,
    pageSize: number,
    filters: { type?: string }
  ) => Promise<void>;
  fetchCreditEconomyTrends: (options?: FetchOptions) => Promise<void>;
  fetchOrderById: (orderId: string) => Promise<void>;
  fetchReports: () => Promise<void>;
  fetchReportById: (reportId: string) => Promise<void>;
  generateReport: (
    name: string,
    parameters: Report["parameters"]
  ) => Promise<Report | null>;
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
  supportTickets: null,
  currentSupportTicket: null,
  planPurchaseStats: null,
  currentPlan: null,
  subjects: null,
  paginatedOrders: null,
  paginatedCreditTxs: null,
  creditEconomyTrends: null,
  currentOrder: null,
  reports: null,
  currentReport: null,

  logs: [],
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
      if (
        data.role === "student" ||
        get().students?.some((s) => s.id === userId)
      ) {
        get().fetchStudents({ force: true });
      }
      if (
        data.role === "faculty" ||
        get().faculty?.some((f) => f.id === userId)
      ) {
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
        .select(
          `*, subjects(*), student:profiles!student_id(full_name), assigned_faculty:profiles!assigned_faculty_id(full_name)`
        )
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
        .select(
          `*, student:profiles!student_id(full_name), mentor:profiles!mentor_id(full_name)`
        )
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
      if (err.code !== "PGRST116") {
        // Ignore "0 rows" error
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
        .insert([
          { user_id: userId, title, message, type: "admin_credit_adjustment" },
        ]);
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
  fetchSupportTickets: async (statusFilter, options) => {
    const cacheKey = statusFilter
      ? `supportTickets_${statusFilter}`
      : "supportTickets";
    const { supportTickets, lastFetched } = get();
    if (
      !options?.force &&
      supportTickets &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      let query = supabase.from("support_tickets").select(`
        *,
        user:profiles!user_id(full_name),
        assignee:profiles!assigned_to(full_name)
      `);
      if (statusFilter) {
        query = query.eq("status", statusFilter);
      }
      const { data, error } = await query.order("last_reply_at", {
        ascending: false,
        nullsFirst: false,
      });
      if (error) throw error;
      set((state) => ({
        supportTickets: data as SupportTicketWithDetails[],
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch support tickets.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchSupportTicketById: async (ticketId) => {
    get().setLoading("currentSupportTicket", true);
    set({ currentSupportTicket: null });
    try {
      const supabase = createClient();
      // Fetch ticket, messages, and attachments in parallel
      const [ticketRes, messagesRes, attachmentsRes] = await Promise.all([
        supabase
          .from("support_tickets")
          .select(
            "*, user:profiles!user_id(full_name), assignee:profiles!assigned_to(full_name)"
          )
          .eq("id", ticketId)
          .single(),
        supabase
          .from("support_ticket_messages")
          .select("*, sender:profiles!sender_id(full_name)")
          .eq("ticket_id", ticketId)
          .order("sent_at", { ascending: true }),
        supabase
          .from("support_ticket_attachments")
          .select("*")
          .eq("ticket_id", ticketId),
      ]);

      if (ticketRes.error) throw ticketRes.error;
      if (messagesRes.error) throw messagesRes.error;
      if (attachmentsRes.error) throw attachmentsRes.error;

      set({
        currentSupportTicket: {
          ticket: ticketRes.data as SupportTicketWithDetails,
          messages: messagesRes.data as SupportTicketMessage[],
          attachments: attachmentsRes.data as SupportTicketAttachment[],
        },
      });
    } catch (err: any) {
      toast.error("Failed to fetch ticket details.");
    } finally {
      get().setLoading("currentSupportTicket", false);
    }
  },

  updateSupportTicket: async (ticketId, updateData) => {
    get().setLoading(`ticket_${ticketId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("support_tickets")
        .update(updateData)
        .eq("id", ticketId);
      if (error) throw error;
      toast.success("Ticket updated successfully.");
      // Invalidate cache and refetch
      get().fetchSupportTickets(undefined, { force: true });
      // If we are viewing this ticket, refresh its data
      if (get().currentSupportTicket?.ticket.id === ticketId) {
        get().fetchSupportTicketById(ticketId);
      }
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to update ticket.");
      return false;
    } finally {
      get().setLoading(`ticket_${ticketId}`, false);
    }
  },

  addSupportTicketMessage: async (ticketId, message) => {
    get().setLoading(`ticket_messages_${ticketId}`, true);
    try {
      const supabase = createClient();
      // Get the current admin's user ID
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("You must be logged in to reply.");

      const { error } = await supabase
        .from("support_ticket_messages")
        .insert([{ ticket_id: ticketId, sender_id: user.id, message }]);
      if (error) throw error;

      toast.success("Reply sent.");
      // Refresh the current ticket view to show the new message
      get().fetchSupportTicketById(ticketId);
      // Refresh the main list as last_reply_at has changed
      get().fetchSupportTickets(undefined, { force: true });
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to send reply.");
      return false;
    } finally {
      get().setLoading(`ticket_messages_${ticketId}`, false);
    }
  },
  // Add new functions
  fetchPlanPurchaseStats: async (options) => {
    const cacheKey = "planPurchaseStats";
    // ... caching logic ...
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_plan_purchase_stats");
      if (error) throw error;
      set((state) => ({
        planPurchaseStats: data,
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch plan purchase stats.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchPlanById: async (planId) => {
    get().setLoading("currentPlan", true);
    set({ currentPlan: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("id", planId)
        .single();
      if (error) throw error;
      set({ currentPlan: data as Plan });
    } catch (err: any) {
      toast.error("Failed to fetch plan details.");
    } finally {
      get().setLoading("currentPlan", false);
    }
  },

  deletePlan: async (planId) => {
    if (
      !confirm(
        "Are you sure you want to delete this plan? This action cannot be undone."
      )
    )
      return false;
    get().setLoading(`plan_${planId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("plans").delete().eq("id", planId);
      if (error) throw error;
      toast.success("Plan deleted successfully.");
      get().fetchPlans(true, { force: true }); // Force refresh the list
      get().fetchPlanPurchaseStats({ force: true }); // Force refresh the chart
      return true;
    } catch (err: any) {
      toast.error(err.message || "Failed to delete plan.");
      return false;
    } finally {
      get().setLoading(`plan_${planId}`, false);
    }
  },

  fetchSubjects: async (options) => {
    const cacheKey = "subjects";
    const { subjects, lastFetched } = get();
    if (
      !options?.force &&
      subjects &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .order("sort_order");

      if (error) throw error;
      set((state) => ({
        subjects: data,
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err) {
      toast.error("Failed to fetch subjects.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  createSubject: async (data) => {
    get().setLoading("subjects", true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("subjects").insert([data]);
      if (error) throw error;
      toast.success("Subject created successfully.");
      get().fetchSubjects({ force: true }); // Refresh list
      return true;
    } catch (err) {
      toast.error("Failed to create subject.");
      return false;
    } finally {
      get().setLoading("subjects", false);
    }
  },

  updateSubject: async (subjectId, data) => {
    get().setLoading(`subject_${subjectId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subjects")
        .update(data)
        .eq("id", subjectId);

      if (error) throw error;
      toast.success("Subject updated successfully.");
      get().fetchSubjects({ force: true }); // Refresh list
      return true;
    } catch (err) {
      toast.error("Failed to update subject.");
      return false;
    } finally {
      get().setLoading(`subject_${subjectId}`, false);
    }
  },

  deleteSubject: async (subjectId) => {
    if (!confirm("Are you sure you want to delete this subject?")) {
      return false;
    }
    get().setLoading(`subject_${subjectId}`, true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", subjectId);

      if (error) throw error;
      toast.success("Subject deleted successfully.");
      get().fetchSubjects({ force: true }); // Refresh list
      return true;
    } catch (err) {
      toast.error("Failed to delete subject. It may be in use.");
      return false;
    } finally {
      get().setLoading(`subject_${subjectId}`, false);
    }
  },

  fetchCreditEconomyTrends: async (options) => {
    const cacheKey = "creditEconomyTrends";
    const { creditEconomyTrends, lastFetched } = get();
    if (
      !options?.force &&
      creditEconomyTrends &&
      lastFetched[cacheKey] &&
      Date.now() - lastFetched[cacheKey]! < CACHE_DURATION_MS
    ) {
      return;
    }
    get().setLoading(cacheKey, true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_credit_economy_trends");
      if (error) throw error;
      set((state) => ({
        creditEconomyTrends: data,
        lastFetched: { ...state.lastFetched, [cacheKey]: Date.now() },
      }));
    } catch (err: any) {
      toast.error("Failed to fetch credit economy trends.");
    } finally {
      get().setLoading(cacheKey, false);
    }
  },

  fetchPaginatedOrders: async (page, pageSize, filters) => {
    get().setLoading("paginatedOrders", true);
    try {
      const supabase = createClient();
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("orders")
        .select("*, user:profiles(full_name), plan:plans(name)", {
          count: "exact",
        })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (filters.status) {
        query = query.eq("status", filters.status);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      set({
        paginatedOrders: {
          data: data as OrderWithDetails[],
          count: count || 0,
        },
      });
    } catch (err: any) {
      toast.error("Failed to fetch orders.");
      set({ paginatedOrders: { data: [], count: 0 } }); // Clear on error
    } finally {
      get().setLoading("paginatedOrders", false);
    }
  },

  fetchPaginatedCreditTxs: async (page, pageSize, filters) => {
    get().setLoading("paginatedCreditTxs", true);
    try {
      const supabase = createClient();
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let query = supabase
        .from("credit_transactions")
        .select("*, user:profiles(full_name)", { count: "exact" })
        .range(from, to)
        .order("created_at", { ascending: false });

      if (filters.type) {
        query = query.eq("transaction_type", filters.type);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      set({
        paginatedCreditTxs: {
          data: data as CreditTransactionWithDetails[],
          count: count || 0,
        },
      });
    } catch (err: any) {
      toast.error("Failed to fetch credit transactions.");
      set({ paginatedCreditTxs: { data: [], count: 0 } });
    } finally {
      get().setLoading("paginatedCreditTxs", false);
    }
  },

  fetchOrderById: async (orderId) => {
    get().setLoading("currentOrder", true);
    set({ currentOrder: null });
    try {
      const supabase = createClient();

      // We will run two queries in parallel for performance
      const [orderPromise, transactionsPromise] = await Promise.all([
        // Query 1: Get the main order details
        supabase
          .from("orders")
          .select("*, user:profiles(full_name), plan:plans(name)")
          .eq("id", orderId)
          .single(),

        // Query 2: Get all credit transactions that reference this order
        supabase
          .from("credit_transactions")
          .select("*")
          .eq("reference_id", orderId)
          .eq("reference_type", "order"),
      ]);

      // Check for errors in both queries
      if (orderPromise.error) throw orderPromise.error;
      if (transactionsPromise.error) throw transactionsPromise.error;

      // Combine the results into a single object
      const combinedData = {
        ...orderPromise.data,
        credit_transactions: transactionsPromise.data,
      };

      set({ currentOrder: combinedData as OrderWithAllDetails });
    } catch (err: any) {
      console.error("Error fetching order details:", err);
      toast.error("Failed to fetch order details.");
    } finally {
      get().setLoading("currentOrder", false);
    }
  },
  fetchReports: async () => {
    get().setLoading("reports", true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("generated_at", { ascending: false });
      if (error) throw error;
      set({ reports: data });
    } catch (err) {
      toast.error("Failed to fetch reports.");
    } finally {
      get().setLoading("reports", false);
    }
  },

  fetchReportById: async (reportId) => {
    get().setLoading("currentReport", true);
    set({ currentReport: null });
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("id", reportId)
        .single();
      if (error) throw error;
      set({ currentReport: data });
    } catch (err) {
      toast.error("Failed to fetch report.");
    } finally {
      get().setLoading("currentReport", false);
    }
  },

  generateReport: async (name, parameters) => {
    get().setLoading("reports", true);
    try {
      const supabase = createClient();
      // 1. Generate the data using the RPC function
      const { data: reportData, error: rpcError } = await supabase.rpc(
        "generate_report_data",
        { params: parameters }
      );
      if (rpcError) throw rpcError;

      // 2. Insert the new report with the generated data
      const { data: newReport, error: insertError } = await supabase
        .from("reports")
        .insert({
          name,
          parameters,
          data: reportData,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      toast.success("Report generated successfully!");
      get().fetchReports(); // Refresh the list
      return newReport;
    } catch (err: any) {
      toast.error(err.message || "Failed to generate report.");
      return null;
    } finally {
      get().setLoading("reports", false);
    }
  },

  clearCurrentPlan: () => set({ currentPlan: null }),

  // --- HELPER ACTIONS (no API calls) ---
  clearCurrentAnswer: () => set({ currentAnswer: null }),
  clearCurrentUser: () => set({ currentUser: null }),
  clearCurrentMentorshipSession: () => set({ currentMentorshipSession: null }),
  clearCurrentSupportTicket: () => set({ currentSupportTicket: null }),
}));
