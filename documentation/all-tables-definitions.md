create table public.answers (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  subject_id uuid not null,
  assigned_faculty_id uuid null,
  status public.answer_status not null default 'pending_assignment'::answer_status,
  question_text text not null,
  answer_file_url text not null,
  answer_file_size bigint null,
  word_count integer null,
  submitted_at timestamp with time zone not null default now(),
  assigned_at timestamp with time zone null,
  evaluation_started_at timestamp with time zone null,
  faculty_remarks text null,
  marks_awarded numeric(5, 2) null,
  max_marks numeric(5, 2) null,
  evaluated_file_url text null,
  evaluated_at timestamp with time zone null,
  revision_count integer not null default 0,
  is_priority boolean not null default false,
  expected_completion_at timestamp with time zone null,
  actual_completion_at timestamp with time zone null,
  evaluation_duration_minutes integer null,
  student_rating integer null,
  student_feedback text null,
  updated_at timestamp with time zone not null default now(),
  constraint answers_pkey primary key (id),
  constraint answers_student_id_fkey foreign KEY (student_id) references profiles (id) on delete CASCADE,
  constraint answers_subject_id_fkey foreign KEY (subject_id) references subjects (id),
  constraint answers_assigned_faculty_id_fkey foreign KEY (assigned_faculty_id) references profiles (id),
  constraint logical_timestamps check (
    (
      (
        (assigned_at is null)
        or (assigned_at >= submitted_at)
      )
      and (
        (evaluation_started_at is null)
        or (evaluation_started_at >= assigned_at)
      )
      and (
        (evaluated_at is null)
        or (evaluated_at >= evaluation_started_at)
      )
    )
  ),
  constraint answers_answer_file_size_check check ((answer_file_size > 0)),
  constraint completion_requirements check (
    (
      (status <> 'completed'::answer_status)
      or (
        (status = 'completed'::answer_status)
        and (marks_awarded is not null)
        and (evaluated_at is not null)
      )
    )
  ),
  constraint faculty_assignment_logic check (
    (
      (
        (status = 'pending_assignment'::answer_status)
        and (assigned_faculty_id is null)
      )
      or (
        (status <> 'pending_assignment'::answer_status)
        and (assigned_faculty_id is not null)
      )
    )
  ),
  constraint answers_marks_awarded_check check ((marks_awarded >= (0)::numeric)),
  constraint answers_max_marks_check check ((max_marks > (0)::numeric)),
  constraint answers_student_rating_check check (
    (
      (student_rating >= 1)
      and (student_rating <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_answers_student_id on public.answers using btree (student_id, status) TABLESPACE pg_default;

create index IF not exists idx_answers_assigned_faculty_id on public.answers using btree (assigned_faculty_id, status) TABLESPACE pg_default
where
  (assigned_faculty_id is not null);

create index IF not exists idx_answers_status_priority on public.answers using btree (status, is_priority, submitted_at) TABLESPACE pg_default;

create index IF not exists idx_answers_subject_status on public.answers using btree (subject_id, status) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on answers for EACH row
execute FUNCTION handle_updated_at ();

create trigger update_faculty_workload_trigger
after
update on answers for EACH row
execute FUNCTION update_faculty_workload ();

create trigger update_profile_stats_answers
after INSERT
or
update on answers for EACH row
execute FUNCTION update_profile_stats ();

create table public.credit_transactions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  credit_type text not null,
  amount integer not null,
  balance_after integer not null,
  transaction_type text not null,
  reference_id uuid null,
  reference_type text null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  created_by uuid null,
  constraint credit_transactions_pkey primary key (id),
  constraint credit_transactions_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint credit_transactions_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint credit_transactions_credit_type_check check (
    (
      credit_type = any (
        array[
          'gs'::text,
          'specialized'::text,
          'mentorship'::text
        ]
      )
    )
  ),
  constraint credit_transactions_reference_type_check check (
    (
      reference_type = any (
        array[
          'order'::text,
          'answer'::text,
          'mentorship'::text,
          'manual'::text
        ]
      )
    )
  ),
  constraint credit_transactions_balance_after_check check ((balance_after >= 0)),
  constraint credit_transactions_transaction_type_check check (
    (
      transaction_type = any (
        array[
          'purchase'::text,
          'consumption'::text,
          'refund'::text,
          'admin_adjustment'::text,
          'bonus'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_credit_transactions_user on public.credit_transactions using btree (user_id, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_credit_transactions_reference on public.credit_transactions using btree (reference_type, reference_id) TABLESPACE pg_default
where
  (reference_id is not null);

  create table public.faculty_subjects (
  faculty_id uuid not null,
  subject_id uuid not null,
  max_concurrent_evaluations integer not null default 10,
  current_evaluations integer not null default 0,
  expertise_level integer not null default 1,
  is_accepting_assignments boolean not null default true,
  last_assigned_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint faculty_subjects_pkey primary key (faculty_id, subject_id),
  constraint faculty_subjects_faculty_id_fkey foreign KEY (faculty_id) references profiles (id) on delete CASCADE,
  constraint faculty_subjects_subject_id_fkey foreign KEY (subject_id) references subjects (id) on delete CASCADE,
  constraint faculty_subjects_expertise_level_check check (
    (
      (expertise_level >= 1)
      and (expertise_level <= 5)
    )
  ),
  constraint valid_evaluation_count check (
    (
      (current_evaluations <= max_concurrent_evaluations)
      and (current_evaluations >= 0)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_faculty_subjects_available on public.faculty_subjects using btree (subject_id, is_accepting_assignments) TABLESPACE pg_default
where
  (is_accepting_assignments = true);

  create view public.faculty_workload as
select
  p.id,
  p.full_name,
  p.is_available,
  count(distinct fs.subject_id) as subjects_count,
  COALESCE(sum(fs.current_evaluations), 0::bigint) as total_current_evaluations,
  COALESCE(sum(fs.max_concurrent_evaluations), 0::bigint) as total_capacity,
  case
    when COALESCE(sum(fs.max_concurrent_evaluations), 0::bigint) = 0 then 0::numeric
    else COALESCE(sum(fs.current_evaluations), 0::bigint)::numeric / sum(fs.max_concurrent_evaluations)::numeric * 100::numeric
  end as capacity_utilization_percent
from
  profiles p
  left join faculty_subjects fs on p.id = fs.faculty_id
where
  p.role = 'faculty'::user_role
  and p.is_active = true
group by
  p.id,
  p.full_name,
  p.is_available
order by
  (
    case
      when COALESCE(sum(fs.max_concurrent_evaluations), 0::bigint) = 0 then 0::numeric
      else COALESCE(sum(fs.current_evaluations), 0::bigint)::numeric / sum(fs.max_concurrent_evaluations)::numeric * 100::numeric
    end
  );

  create table public.mentorship_sessions (
  id uuid not null default gen_random_uuid (),
  student_id uuid not null,
  mentor_id uuid null,
  status public.mentorship_status not null default 'requested'::mentorship_status,
  student_notes text null,
  mentor_notes text null,
  scheduled_at timestamp with time zone null,
  duration_minutes integer null default 30,
  meeting_url text null,
  meeting_platform text null default 'zoom'::text,
  reminder_sent_at timestamp with time zone null,
  requested_at timestamp with time zone not null default now(),
  started_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  student_rating integer null,
  student_feedback text null,
  mentor_rating integer null,
  mentor_feedback text null,
  is_rescheduled boolean not null default false,
  reschedule_reason text null,
  updated_at timestamp with time zone not null default now(),
  constraint mentorship_sessions_pkey primary key (id),
  constraint mentorship_sessions_student_id_fkey foreign KEY (student_id) references profiles (id) on delete CASCADE,
  constraint mentorship_sessions_mentor_id_fkey foreign KEY (mentor_id) references profiles (id),
  constraint mentorship_sessions_duration_minutes_check check ((duration_minutes > 0)),
  constraint session_timestamps check (
    (
      (
        (started_at is null)
        or (started_at >= scheduled_at)
      )
      and (
        (completed_at is null)
        or (completed_at >= started_at)
      )
    )
  ),
  constraint mentorship_sessions_student_rating_check check (
    (
      (student_rating >= 1)
      and (student_rating <= 5)
    )
  ),
  constraint mentorship_sessions_mentor_rating_check check (
    (
      (mentor_rating >= 1)
      and (mentor_rating <= 5)
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_mentorship_sessions_student_id on public.mentorship_sessions using btree (student_id, status) TABLESPACE pg_default;

create index IF not exists idx_mentorship_sessions_mentor_id on public.mentorship_sessions using btree (mentor_id, status) TABLESPACE pg_default
where
  (mentor_id is not null);

create index IF not exists idx_mentorship_sessions_scheduled on public.mentorship_sessions using btree (scheduled_at, status) TABLESPACE pg_default
where
  (scheduled_at is not null);

create trigger handle_updated_at BEFORE
update on mentorship_sessions for EACH row
execute FUNCTION handle_updated_at ();

create trigger update_profile_stats_mentorship
after
update on mentorship_sessions for EACH row
execute FUNCTION update_profile_stats ();

create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  type public.notification_type not null,
  title text not null,
  message text not null,
  data jsonb null,
  is_read boolean not null default false,
  read_at timestamp with time zone null,
  expires_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_unread on public.notifications using btree (user_id, is_read, created_at desc) TABLESPACE pg_default;

create index IF not exists idx_notifications_expiry on public.notifications using btree (expires_at) TABLESPACE pg_default
where
  (expires_at is not null);


  create table public.orders (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  plan_id uuid not null,
  status public.order_status not null,
  amount_paid numeric(10, 2) not null,
  currency text not null,
  payment_gateway_charge_id text null,
  payment_method text null,
  failure_reason text null,
  refund_amount numeric(10, 2) null default 0,
  refunded_at timestamp with time zone null,
  credits_granted_at timestamp with time zone null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_payment_gateway_charge_id_key unique (payment_gateway_charge_id),
  constraint orders_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint orders_plan_id_fkey foreign KEY (plan_id) references plans (id),
  constraint orders_amount_paid_check check ((amount_paid >= (0)::numeric)),
  constraint orders_refund_amount_check check ((refund_amount >= (0)::numeric))
) TABLESPACE pg_default;

create index IF not exists idx_orders_user_status on public.orders using btree (user_id, status) TABLESPACE pg_default;

create index IF not exists idx_orders_payment_gateway on public.orders using btree (payment_gateway_charge_id) TABLESPACE pg_default
where
  (payment_gateway_charge_id is not null);

  create table public.plans (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  price numeric(10, 2) not null,
  currency text not null default 'INR'::text,
  type public.plan_type not null,
  gs_credits_granted integer not null default 0,
  specialized_credits_granted integer not null default 0,
  mentorship_credits_granted integer not null default 0,
  interval text null,
  interval_count integer null,
  payment_gateway_plan_id text null,
  is_active boolean not null default true,
  valid_from timestamp with time zone not null default now(),
  valid_until timestamp with time zone null,
  max_purchases_per_user integer null,
  total_purchases integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  created_by uuid null,
  constraint plans_pkey primary key (id),
  constraint plans_name_key unique (name),
  constraint plans_payment_gateway_plan_id_key unique (payment_gateway_plan_id),
  constraint plans_created_by_fkey foreign KEY (created_by) references auth.users (id),
  constraint plans_interval_count_check check ((interval_count > 0)),
  constraint plans_price_check check ((price >= (0)::numeric)),
  constraint recurring_plan_has_interval check (
    (
      (type = 'one_time'::plan_type)
      or (
        (type = 'recurring'::plan_type)
        and ("interval" is not null)
        and (interval_count is not null)
      )
    )
  ),
  constraint plans_gs_credits_granted_check check ((gs_credits_granted >= 0)),
  constraint plans_specialized_credits_granted_check check ((specialized_credits_granted >= 0)),
  constraint plans_mentorship_credits_granted_check check ((mentorship_credits_granted >= 0))
) TABLESPACE pg_default;

create index IF not exists idx_plans_active on public.plans using btree (is_active, valid_from, valid_until) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on plans for EACH row
execute FUNCTION handle_updated_at ();

create table public.profiles (
  id uuid not null,
  full_name text null,
  phone_number text null,
  role public.user_role not null default 'student'::user_role,
  is_available boolean not null default true,
  is_active boolean not null default true,
  gs_credit_balance integer not null default 0,
  specialized_credit_balance integer not null default 0,
  mentorship_credit_balance integer not null default 0,
  total_answers_submitted integer not null default 0,
  total_answers_evaluated integer not null default 0,
  total_mentorship_sessions integer not null default 0,
  profile_completion_percentage integer not null default 0,
  last_activity_at timestamp with time zone null default now(),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  updated_by uuid null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_updated_by_fkey foreign KEY (updated_by) references auth.users (id),
  constraint profiles_gs_credit_balance_check check ((gs_credit_balance >= 0)),
  constraint profiles_profile_completion_percentage_check check (
    (
      (profile_completion_percentage >= 0)
      and (profile_completion_percentage <= 100)
    )
  ),
  constraint profiles_specialized_credit_balance_check check ((specialized_credit_balance >= 0)),
  constraint profiles_mentorship_credit_balance_check check ((mentorship_credit_balance >= 0))
) TABLESPACE pg_default;

create index IF not exists idx_profiles_role on public.profiles using btree (role) TABLESPACE pg_default
where
  (is_active = true);

create index IF not exists idx_profiles_available_faculty on public.profiles using btree (is_available) TABLESPACE pg_default
where
  (
    (role = 'faculty'::user_role)
    and (is_active = true)
  );

create index IF not exists idx_profiles_last_activity on public.profiles using btree (last_activity_at) TABLESPACE pg_default
where
  (is_active = true);

create trigger handle_updated_at BEFORE
update on profiles for EACH row
execute FUNCTION handle_updated_at ();

create table public.subjects (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  category public.subject_category not null,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  total_answers_submitted integer not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint subjects_pkey primary key (id),
  constraint subjects_name_key unique (name)
) TABLESPACE pg_default;

create index IF not exists idx_subjects_category_active on public.subjects using btree (category, is_active, sort_order) TABLESPACE pg_default;


create table public.subscriptions (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  plan_id uuid not null,
  status public.subscription_status not null,
  current_period_start timestamp with time zone not null,
  current_period_end timestamp with time zone not null,
  payment_gateway_subscription_id text null,
  trial_end timestamp with time zone null,
  cancel_at timestamp with time zone null,
  canceled_at timestamp with time zone null,
  pause_collection boolean not null default false,
  credits_granted_this_period boolean not null default false,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint subscriptions_pkey primary key (id),
  constraint subscriptions_payment_gateway_subscription_id_key unique (payment_gateway_subscription_id),
  constraint subscriptions_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint subscriptions_plan_id_fkey foreign KEY (plan_id) references plans (id),
  constraint valid_period check ((current_period_end > current_period_start))
) TABLESPACE pg_default;

create index IF not exists idx_subscriptions_user_active on public.subscriptions using btree (user_id, status) TABLESPACE pg_default
where
  (status = 'active'::subscription_status);

create index IF not exists idx_subscriptions_renewal on public.subscriptions using btree (current_period_end, status) TABLESPACE pg_default
where
  (status = 'active'::subscription_status);

create trigger handle_updated_at BEFORE
update on subscriptions for EACH row
execute FUNCTION handle_updated_at ();

create table public.audit_log (
  id bigserial not null,
  timestamp timestamp with time zone not null default now(),
  actor_id uuid null,
  action public.audit_action_type not null,
  target_table text not null,
  target_record_id uuid null,
  old_record jsonb null,
  new_record jsonb null,
  notes text null,
  constraint audit_log_pkey primary key (id),
  constraint audit_log_actor_id_fkey foreign KEY (actor_id) references profiles (id)
) TABLESPACE pg_default;

create index IF not exists idx_audit_log_target on public.audit_log using btree (target_table, target_record_id) TABLESPACE pg_default;

create index IF not exists idx_audit_log_actor on public.audit_log using btree (actor_id) TABLESPACE pg_default;

create index IF not exists idx_audit_log_timestamp on public.audit_log using btree ("timestamp" desc) TABLESPACE pg_default;

create table public.support_ticket_attachments (
  id uuid not null default gen_random_uuid (),
  ticket_id uuid not null,
  file_url text not null,
  file_name text not null,
  uploaded_at timestamp with time zone not null default now(),
  constraint support_ticket_attachments_pkey primary key (id),
  constraint support_ticket_attachments_ticket_id_fkey foreign KEY (ticket_id) references support_tickets (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_support_ticket_attachments_ticket on public.support_ticket_attachments using btree (ticket_id) TABLESPACE pg_default;

create table public.support_ticket_messages (
  id uuid not null default gen_random_uuid (),
  ticket_id uuid not null,
  sender_id uuid not null,
  message text not null,
  sent_at timestamp with time zone not null default now(),
  constraint support_ticket_messages_pkey primary key (id),
  constraint support_ticket_messages_sender_id_fkey foreign KEY (sender_id) references profiles (id) on delete CASCADE,
  constraint support_ticket_messages_ticket_id_fkey foreign KEY (ticket_id) references support_tickets (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_support_ticket_messages_ticket on public.support_ticket_messages using btree (ticket_id, sent_at) TABLESPACE pg_default;

create trigger update_ticket_last_reply_trigger
after INSERT on support_ticket_messages for EACH row
execute FUNCTION update_ticket_last_reply ();

create table public.support_tickets (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  subject text not null,
  description text not null,
  priority public.ticket_priority not null default 'medium'::ticket_priority,
  type public.ticket_type not null default 'question'::ticket_type,
  status public.support_ticket_status not null default 'open'::support_ticket_status,
  assigned_to uuid null,
  resolution_notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  last_reply_at timestamp with time zone null default now(),
  constraint support_tickets_pkey primary key (id),
  constraint support_tickets_user_id_fkey foreign KEY (user_id) references profiles (id) on delete CASCADE,
  constraint support_tickets_assigned_to_fkey foreign KEY (assigned_to) references profiles (id) on delete set null
) TABLESPACE pg_default;

create index IF not exists idx_support_tickets_user_status on public.support_tickets using btree (user_id, status) TABLESPACE pg_default;

create index IF not exists idx_support_tickets_assigned on public.support_tickets using btree (assigned_to) TABLESPACE pg_default;

create trigger handle_updated_at BEFORE
update on support_tickets for EACH row
execute FUNCTION handle_updated_at ();