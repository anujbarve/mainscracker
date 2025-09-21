// src/stores/types.ts (or directly in the store file)

// Enums from your database schema (assuming these exist)
export type SubscriptionStatus = "active" | "canceled" | "past_due" | "unpaid";
export type PlanType = "subscription" | "one_time";
export type OrderStatus = "succeeded" | "pending" | "failed";
export type AnswerStatus = "pending_assignment" | "in_evaluation" | "completed" | "cancelled" | "assigned" | "revision_requested";
export type MentorshipStatus = "requested" | "assigned" |"scheduled" | "in_progress"  | "completed" | "cancelled" | "no_show";

// Base table types
export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  type: PlanType;
  gs_credits_granted: number;
  specialized_credits_granted: number;
  mentorship_credits_granted: number;
  interval : string | null;
  interval_count :  number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Subscription = {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
};

export type Order = {
  id: string;
  user_id: string;
  plan_id: string;
  status: OrderStatus;
  amount_paid: number;
  currency: string;
  created_at: string;
  payment_gateway_charge_id: string | null;
};

export type Answer = {
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
};

export type MentorshipSession = {
  id: string;
  student_id: string;
  mentor_id: string | null;
  status: MentorshipStatus;
  student_notes: string | null;
  mentor_notes: string | null;
  scheduled_at: string | null;
  meeting_url: string | null;
  requested_at: string;
  completed_at: string | null;
  updated_at: string;
};

// Types for data with joined relations (for easier UI rendering)
export type SubscriptionWithPlan = Subscription & { plans: Plan | null };
export type OrderWithPlan = Order & { plans: Plan | null };
export type AnswerWithDetails = Answer & {
  subjects: { name: string } | null;
  assigned_faculty: { full_name: string } | null;
};
export type MentorshipSessionWithMentor = MentorshipSession & {
  mentor: { full_name: string; is_available: boolean } | null;
};