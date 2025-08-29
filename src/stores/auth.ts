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
};

type AuthState = {
  user: any | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  // Actions
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (newPassword: string) => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      loading: false,
      error: null,

      // ✅ Fetch current session user + profile
      fetchUser: async () => {
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

            set({ user, profile, loading: false });
          } else {
            set({ user: null, profile: null, loading: false });
          }
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },

      // ✅ Update the user's profile
      updateProfile: async (updates: Partial<Profile>) => {
        const supabase = await createClient();
        const { user } = get();
        if (!user) {
          const errorMessage = "No user logged in";
          set({ error: errorMessage });
          toast.error(errorMessage);
          return;
        }

        set({ loading: true, error: null });
        try {
          const { data, error } = await supabase
            .from("profiles")
            .update({
              ...updates,
              updated_at: new Date().toISOString(),
            })
            .eq("id", user.id)
            .select()
            .single();

          if (error) throw error;

          set({ profile: data });
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

          await get().fetchUser();
          const role = get().profile?.role ?? "student";

          // Redirect based on role
          if (role === "admin") window.location.href = "/admin";
          else if (role === "faculty") window.location.href = "/faculty";
          else window.location.href = "/student";

          toast.success("Login successful!");
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
        set({ user: null, profile: null });
        window.location.href = "/login";
        toast.info("You have been logged out.");
      },

      // ✅ Refresh profile only
      refreshProfile: async () => {
        const supabase = await createClient();
        const { user } = get();
        if (!user) return;

        try {
          const { data: profile, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (error) throw error;
          set({ profile });
        } catch (err: any) {
          set({ error: err.message });
          toast.error("Could not refresh profile.");
        }
      },

      // ✅ Send password reset email
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

      // in useAuthStore
      resetPassword: async (password: string) => {
        const supabase = await createClient();
        set({ loading: true, error: null });

        try {
          // 🔑 ensure session from token_hash if missing
          let {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session) {
            const params = new URLSearchParams(window.location.search);
            const token_hash = params.get("token_hash");
            const type = params.get("type");

            if (type === "recovery" && token_hash) {
              const { error } = await supabase.auth.exchangeCodeForSession(
                token_hash
              );
              if (error) throw error;

              // refresh session after exchange
              const res = await supabase.auth.getSession();
              session = res.data.session;
            }
          }

          if (!session) {
            throw new Error("No valid session. Reset link may be expired.");
          }

          // ✅ now update the password
          const { data, error } = await supabase.auth.updateUser({ password });
          if (error) throw error;

          set({ user: data.user, loading: false });
        } catch (err: any) {
          set({ error: err.message, loading: false });
        }
      },
    }),
    {
      name: "auth-store", // persists in localStorage
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
      }),
    }
  )
);
