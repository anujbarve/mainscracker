"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

// --- Homepage Content Types ---
export type HeroSlide = {
  title: string;
  description: string;
  imageLight: string;
  imageDark : string;
  imageAlt: string;
  layout: "imageRight" | "imageLeft";
};

export type Feature = {
  id: string;
  title:string;
  description: string;
  icon: string;
  imageLight: string;
  imageDark: string;
  alt: string;
};

export type SamplePaper = {
  id: string;
  title: string;
  description: string;
  link: string;
  previewImage: string;
};

export type Testimonial = {
  name: string;
  role: string;
  image: string;
  quote: string;
};

/**
 * Consolidates the main homepage content, excluding plans.
 */
export type HomepageData = {
  heroSlides: HeroSlide[];
  features: Feature[];
  samplePapers: SamplePaper[];
  testimonials: Testimonial[];
};

// --- Plan Types ---
export type PlanType = "one_time" | "recurring";

export type Plan = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  currency: string;
  type: PlanType;
  // Supabase returns snake_case, so we match that directly
  gs_credits_granted: number;
  specialized_credits_granted: number;
  mentorship_credits_granted: number;
  interval: string | null;
  interval_count: number | null;
  is_active: boolean;
};

type FetchOptions = {
  force?: boolean;
};

const CACHE_DURATION_MS = 5 * 60 * 1000;

// ============================================================================
// ZUSTAND STORE DEFINITION
// ============================================================================

type HomepageState = {
  // --- STATE PROPERTIES ---
  data: HomepageData | null;
  loading: boolean;
  lastFetched: number | null;
  error: string | null;

  // State properties specifically for plans
  plans: Plan[];
  plansLoading: boolean;
  plansError: string | null;

  // --- ACTIONS ---
  fetchHomepageData: (options?: FetchOptions) => Promise<void>;
  /** Fetches only the pricing plans from the database. */
  fetchPlans: (options?: FetchOptions) => Promise<void>;
};

export const useHomepageStore = create<HomepageState>((set, get) => ({
  // --- INITIAL STATE ---
  data: null,
  loading: false,
  lastFetched: null,
  error: null,

  plans: [],
  plansLoading: false,
  plansError: null,

  // ============================================================================
  // ACTION IMPLEMENTATIONS
  // ============================================================================
  fetchHomepageData: async (options) => {
    const { data, lastFetched } = get();

    if (
      !options?.force &&
      data &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_DURATION_MS
    ) {
      return;
    }
    set({ loading: true, error: null });
    try {
      const supabase = createClient();
      const { data: homepageData, error } = await supabase.rpc(
        "get_homepage_data", // This RPC should now EXCLUDE plans
      );
      if (error) throw error;
      set({ data: homepageData, lastFetched: Date.now() });
    } catch (err: any) {
      const errorMessage = "Failed to load homepage content.";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  // --- SEPARATE ACTION FOR FETCHING PLANS ---
  fetchPlans: async (options) => {
    // We can use the main `lastFetched` for caching or a separate one
    const { plans, lastFetched } = get();

    if (
      !options?.force &&
      plans.length > 0 &&
      lastFetched &&
      Date.now() - lastFetched < CACHE_DURATION_MS
    ) {
      return;
    }

    set({ plansLoading: true, plansError: null });

    try {
      const supabase = createClient();

      // Direct query to the 'plans' table
      const { data: activePlans, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true }); // Optional: order by price

      if (error) throw error;

      set({ plans: activePlans || [] });
    } catch (err: any) {
      const errorMessage = "Failed to load pricing plans.";
      set({ plansError: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ plansLoading: false });
    }
  },
}));