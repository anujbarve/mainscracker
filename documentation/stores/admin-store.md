## **Zustand Admin Store Documentation**

This document provides a comprehensive overview of the `useAdminStore`, a Zustand state management store designed for the admin panel of an educational platform. It handles fetching, caching, and managing all administrative data, including users, answer sheets, financial reports, system settings, and more.

### Overview

The `useAdminStore` serves as a centralized client-side cache and state manager for the admin dashboard. It is responsible for:

* **Data Fetching:** Interacting with a Supabase backend to fetch various data entities.
* **State Management:** Holding application-wide state for users, answers, reports, etc.
* **Action Handling:** Exposing functions to create, update, and delete data.
* **UI State:** Managing loading and error states for asynchronous operations.
* **Caching:** Implementing a time-based caching mechanism to reduce redundant network requests and improve performance.

---

### Core Concepts

#### Caching Strategy

To optimize performance, the store implements a simple time-based caching mechanism.

* **Duration:** Data is cached for **2 minutes** (`CACHE_DURATION_MS`).
* **Mechanism:** When a fetch action is called, it first checks the `lastFetched` state record. If the data was fetched within the cache duration, the store returns the existing data without making a new API call.
* **Force Refresh:** Every cached fetch action accepts an optional `options` object with a `force` property (e.g., `{ force: true }`). Passing this will bypass the cache and force a new data fetch.
* **Cache Invalidation:** Actions that modify data on the server (e.g., `updateProfile`, `createPlan`, `reassignAnswer`) automatically invalidate the relevant cache by calling the corresponding fetch action with `{ force: true }` upon successful completion.
* **Uncached Data:** Actions that fetch a single item for a detail view (e.g., `fetchAnswerById`, `fetchUserById`) do **not** use caching to ensure the view always displays the most current data.

---

### State Shape (`AdminState`)

The store's state is defined by the `AdminState` type. Below is a description of each property.

#### Data Properties

* `dashboardStats: AdminDashboardStats | null`
    * Holds key metrics for the main dashboard, such as total student count, pending answers, and recent revenue.
* `students: AdminProfile[] | null`
    * An array of all user profiles with the `role` of "student".
* `faculty: AdminProfile[] | null`
    * An array of all user profiles with the `role` of "faculty".
* `answers: AdminAnswerView[] | null`
    * An array of submitted answer sheets, joined with student, subject, and faculty details.
* `facultyWorkload: FacultyWorkload | null`
    * Detailed workload statistics for a single, specific faculty member.
* `creditLogs: CreditTransaction[] | null`
    * A list of recent credit transactions across all users.
* `plans: any[] | null`
    * An array of all available subscription/purchase plans.
* `notificationTemplates: NotificationTemplate[] | null`
    * A list of pre-written notification templates that can be sent to users.
* `userSubscriptions: UserSubscription[] | null`
    * A list of subscriptions for a single, specific user.
* `mentorshipSessions: MentorshipSessionWithDetails[] | null`
    * An array of all mentorship sessions, joined with student and mentor details.
* `logs: AuditLog[] | null`
    * An array containing audit trail records for tracking changes in the system.

#### Report Data Properties

* `revenueData: RevenueDataPoint[]`
    * Time-series data for charting revenue, broken down by one-time and recurring payments.
* `planPerformanceData: PlanPerformanceDataPoint[]`
    * Aggregated data showing the performance (revenue, purchase count) of each plan.
* `creditEconomyData: CreditEconomyDataPoint[]`
    * Time-series data tracking the number of credits purchased versus consumed over time.

#### Transient/View-Specific State

* `currentAnswer: AdminAnswerView | null`
    * Holds the details of a single answer sheet, typically for a detail view.
* `currentUser: AdminProfile | null`
    * Holds the complete profile of a single user, typically for a detail/edit view.
* `currentMentorshipSession: MentorshipSessionWithDetails | null`
    * Holds the details of a single mentorship session for a detail view.

#### Utility State

* `loading: Record<string, boolean>`
    * A key-value map to track the loading status of various asynchronous actions. The key is typically the name of the state slice being loaded (e.g., `loading['students']`).
* `error: string | null`
    * Stores an error message if an action fails. Currently, errors are handled via `sonner` toasts and this state is not actively used.
* `lastFetched: Record<string, number | null>`
    * A key-value map storing the `Date.now()` timestamp of when a data slice was last successfully fetched. This is central to the caching mechanism.

---

### Actions

Actions are functions that can be called to interact with the store and the backend.

#### Data Fetching Actions (Cached)

These actions fetch lists of data and apply the caching strategy.

* `fetchDashboardStats(options?: FetchOptions)`
    * Fetches the main statistics for the admin dashboard.
* `fetchStudents(options?: FetchOptions)`
    * Fetches all profiles with the "student" role.
* `fetchFaculty(options?: FetchOptions)`
    * Fetches all profiles with the "faculty" role.
* `fetchAnswers(statusFilter?: AnswerStatus, options?: FetchOptions)`
    * Fetches all answer sheets. Can be optionally filtered by status (e.g., `pending_assignment`).
* `fetchPlans(includeInactive?: boolean, options?: FetchOptions)`
    * Fetches all plans. Can optionally include inactive plans.
* `fetchCreditLogs(limit?: number, options?: FetchOptions)`
    * Fetches a list of the most recent credit transactions.
* `fetchMentorshipSessions(options?: FetchOptions)`
    * Fetches all mentorship sessions.
* `fetchLogs(options?: FetchOptions)`
    * Fetches all audit log entries, joining actor information from profiles.

#### Report Fetching Actions (Cached)

These actions fetch data for analytical reports and charts.

* `fetchRevenueData(periodType: "daily" | "weekly" | "monthly", daysLimit: number, options?: FetchOptions)`
    * Fetches time-series revenue data.
* `fetchPlanPerformance(daysLimit: number, options?: FetchOptions)`
    * Fetches aggregated performance data for subscription plans.
* `fetchCreditEconomyData(daysLimit: number, options?: FetchOptions)`
    * Fetches time-series data comparing credits purchased vs. consumed.

#### Data Modification Actions (Cache Invalidating)

These actions modify data on the server and then trigger a forced refresh of the relevant cached data. They typically return a `Promise<boolean>` indicating success or failure.

* `updateProfile(userId: string, data: Partial<AdminProfile>)`
    * Updates a user's profile. Refreshes either the `students` or `faculty` list.
* `createUser(email: string, password: string, profileData: ProfileUpsertData)`
    * Creates a new user in Supabase Auth and updates their profile. Returns the new user's ID or `null` on failure.
* `deleteUser(userId: string)`
    * Deletes a user. **This is a permanent action.** Refreshes both student and faculty lists.
* `reassignAnswer(answerId: string, facultyId: string)`
    * Reassigns a pending answer sheet to a different faculty member. Refreshes the `answers` list.
* `updatePlan(planId: string, data: Partial<any>)`
    * Updates the details of an existing plan. Refreshes the `plans` list.
* `createPlan(data: any)`
    * Creates a new plan. Refreshes the `plans` list.
* `adjustUserCredits(userId: string, creditType: string, amount: number, reason: string)`
    * Manually adds or removes credits from a user's balance.
* `saveNotificationTemplate(template: Partial<NotificationTemplate>)`
    * Creates or updates a notification template. Refreshes the `notificationTemplates` list.
* `deleteNotificationTemplate(templateId: string)`
    * Deletes a notification template. Refreshes the `notificationTemplates` list.
* `updateMentorshipSession(sessionId: string, data: Partial<MentorshipSessionWithDetails>)`
    * Updates the details of a mentorship session (e.g., assigns a mentor, sets a time). Refreshes the `mentorshipSessions` list.
* `cancelMentorshipSession(sessionId: string, reason: string)`
    * Cancels a mentorship session and refunds credits. Refreshes the `mentorshipSessions` list.

#### Uncached "Get By ID" Actions

These actions fetch a single, specific data entity for a detail view and do not use the caching mechanism.

* `fetchAnswerById(id: string)`
    * Fetches a single answer sheet and stores it in `currentAnswer`.
* `fetchUserById(id: string)`
    * Fetches a single user profile and stores it in `currentUser`.
* `fetchMentorshipSessionById(sessionId: string)`
    * Fetches a single mentorship session and stores it in `currentMentorshipSession`.
* `fetchUserSubscriptions(userId: string)`
    * Fetches all subscriptions for a specific user.
* `fetchFacultyWorkloadById(id: string)`
    * Fetches the workload for a specific faculty member.

#### Special & Utility Actions

* `fetchOverdueAnswers()`
    * A special report that fetches all answers that are past their expected completion date. This is **not cached** to ensure the report is always live.
* `sendNotification(userId: string, title: string, message: string)`
    * Sends a direct, one-off notification to a specific user.
* `setLoading(key: string, value: boolean)`
    * An internal action to set the loading state for a specific operation.
* `clearCurrentAnswer()`
    * Clears the `currentAnswer` state, typically used when a user navigates away from a detail view.
* `clearCurrentUser()`
    * Clears the `currentUser` state.
* `clearCurrentMentorshipSession()`
    * Clears the `currentMentorshipSession` state.