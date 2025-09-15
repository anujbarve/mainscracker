"use client";

import { createClient } from "@/utils/client";
import { toast } from "sonner";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type UserRole = "student" | "faculty" | "admin";

export type Profile = {
  id: string;
  full_name: string | null;
  phone_number: string | null;
  role: UserRole;
  is_available: boolean;
  gs_credit_balance: number;
  specialized_credit_balance: number;
  mentorship_credit_balance: number;
  created_at: string;
  updated_at: string;
  total_answers_evaluated: number;
  total_mentorship_sessions: number;
};

// Options for fetch actions
type FetchOptions = {
  force?: boolean; // Set to true to bypass the cache
};

type AuthState = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  // ✅ 1. Add state to track fetch timestamps
  lastFetched: {
    profile: number | null;
  };
  // Actions
  fetchUser: (options?: FetchOptions) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: (options?: FetchOptions) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
};

// ✅ 2. Define cache duration (2 minutes in milliseconds)
const CACHE_DURATION_MS = 2 * 60 * 1000;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      error: null,
      // ✅ 3. Initialize lastFetched timestamp
      lastFetched: {
        profile: null,
      },

      // ✅ Fetch current session user + profile with caching
      fetchUser: async (options) => {
        // ✅ 4. Caching logic
        const { profile, lastFetched } = get();
        if (
          !options?.force &&
          profile &&
          lastFetched.profile &&
          Date.now() - lastFetched.profile < CACHE_DURATION_MS
        ) {
          return; // Use cached data
        }

        const supabase = await createClient();
        set({ loading: true, error: null });
        try {
          const {
            data: { user },
            error,
          } = await supabase.auth.getUser();
          if (error) throw error;

          if (user) {
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            if (profileError) throw profileError;

            set({
              user,
              profile,
              // ✅ 5. Update timestamp on successful fetch
              lastFetched: { ...get().lastFetched, profile: Date.now() },
            });
          } else {
            set({ user: null, profile: null, lastFetched: { profile: null } });
          }
        } catch (err: any) {
          set({ error: err.message });
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Update the user's profile and reset cache timestamp
      updateProfile: async (updates: Partial<Profile>) => {
        const supabase = await createClient();
        const { user } = get();
        if (!user) return; // Simplified error handling

        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq("id", user.id)
            .select()
            .single();
          if (error) throw error;

          set({
            profile: data,
            // ✅ 5. Update timestamp on successful update
            lastFetched: { ...get().lastFetched, profile: Date.now() },
          });
          toast.success("Profile updated successfully!");
        } catch (err: any) {
          set({ error: err.message });
          toast.error(err.message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Login with role-based redirect
      login: async (email, password) => {
        const supabase = await createClient();
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;

          // ✅ 6. Force a refresh after logging in to bypass any old cache
          await get().fetchUser({ force: true });

          const role = get().profile?.role ?? "student";
          // Redirect based on role
          if (role === "admin") window.location.href = "/admin/dashboard";
          else if (role === "faculty")
            window.location.href = "/faculty/dashboard";
          else window.location.href = "/student/dashboard";
          toast.success("Login successful!");
        } catch (err: any) {
          set({ error: err.message });
          toast.error(err.message);
        } finally {
          set({ loading: false });
        }
      },

      // ... (signInWithGoogle and signup remain the same)
      // ✅ Google Sign In
      signInWithGoogle: async () => {
        const supabase = await createClient();
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: `${window.location.origin}/auth/callback`,
            },
          });

          if (error) throw error;
        } catch (err: any) {
          set({ error: err.message });
          toast.error(err.message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Signup and redirect to login page
      signup: async (email, password) => {
        const supabase = await createClient();
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.signUp({
            email,
            password,
          });
          if (error) throw error;

          toast.success(
            "Signup successful! Please check your email to verify and then log in."
          );
          window.location.href = "/login";
        } catch (err: any) {
          set({ error: err.message });
          toast.error(err.message);
        } finally {
          set({ loading: false });
        }
      },

      // ✅ Logout
      logout: async () => {
        const supabase = await createClient();
        await supabase.auth.signOut();
        // Clear all state including the cache timestamp
        set({ user: null, profile: null, lastFetched: { profile: null } });
        window.location.href = "/login";
        toast.info("You have been logged out.");
      },

      // ✅ Refresh profile only, with caching
      refreshProfile: async (options) => {
        // ✅ 4. Caching logic
        const { profile, lastFetched, user } = get();
        if (
          !options?.force &&
          profile &&
          lastFetched.profile &&
          Date.now() - lastFetched.profile < CACHE_DURATION_MS
        ) {
          return;
        }

        if (!user) return;
        const supabase = await createClient();
        try {
          const { data: refreshedProfile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (error) throw error;
          set({
            profile: refreshedProfile,
            // ✅ 5. Update timestamp on successful refresh
            lastFetched: { ...get().lastFetched, profile: Date.now() },
          });
        } catch (err: any) {
          set({ error: err.message });
          toast.error("Could not refresh profile.");
        }
      },

      forgotPassword: async (email) => {
         const supabase = await createClient();
        set({ loading: true, error: null });
        try {
          const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password`,
          });
          if (error) throw error;
          toast.success("Password reset link sent! Check your email.");
        } catch (err: any) {
          set({ error: err.message });
          toast.error(err.message);
        } finally {
          set({ loading: false });
        }
      },
      resetPassword: async (newPassword) => {
        const supabase = await createClient();
        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase.auth.updateUser({
            password: newPassword,
          });
          if (error) throw error;

          set({ user: data.user });
          toast.success("Password updated successfully! You can now log in.");
          window.location.href = "/login";
        } catch (err: any) {
          set({ error: err.message });
          toast.error(err.message);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: "auth-store", // persists in localStorage
      // We only persist the user and profile, not the cache timestamp or loading state
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
