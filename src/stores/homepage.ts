"use client";

import { create } from "zustand";
import { toast } from "sonner";
import { createClient } from "@/utils/client";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HeroSlide = {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  layout: "imageRight" | "imageLeft";
};

export type Feature = {
  id: string;
  title: string;
  description: string;
  icon: string; // Storing icon name (e.g., 'Clock') to be mapped to component
  image: string;
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

export type HomepageData = {
  heroSlides: HeroSlide[];
  features: Feature[];
  samplePapers: SamplePaper[];
  testimonials: Testimonial[];
};

type FetchOptions = {
  force?: boolean;
};

const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 minutes cache for homepage data

// ============================================================================
// ZUSTAND STORE DEFINITION
// ============================================================================

/**
 * Defines the state and actions for fetching dynamic homepage content.
 */
type HomepageState = {
  // --- STATE PROPERTIES ---
  data: HomepageData | null;
  loading: boolean;
  lastFetched: number | null;
  error: string | null;

  // --- ACTIONS ---
  /** Fetches all dynamic content for the homepage from the database. */
  fetchHomepageData: (options?: FetchOptions) => Promise<void>;
};

export const useHomepageStore = create<HomepageState>((set, get) => ({
  // --- INITIAL STATE ---
  data: null,
  loading: false,
  lastFetched: null,
  error: null,

  // ============================================================================
  // ACTION IMPLEMENTATIONS
  // ============================================================================
  fetchHomepageData: async (options) => {
    const { data, lastFetched } = get();

    // Return cached data if available and not forced
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
      // This RPC function fetches all settings in one go
      const { data: homepageData, error } = await supabase.rpc(
        "get_homepage_data",
      );

      if (error) throw error;

      set({
        data: homepageData,
        lastFetched: Date.now(),
      });
    } catch (err: any) {
      const errorMessage = "Failed to load homepage content.";
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));