// Blog Post Types - Unified interface for blog functionality
// Maps help_content table structure to blog Post format

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  date: string;
  author: {
    name: string;
    avatarUrl: string;
  };
  tags: string[];
  content: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  faq?: boolean;
}

// Database record type (from help_content table)
export interface HelpContentRecord {
  id: string;
  topic: string;
  slug: string;
  content: string;
  keywords: string[];
  category: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  published_at: string | null;
  faq: boolean;
  image_url?: string | null;
  description?: string | null;
  created_by?: string | null;
}

// Author profile type (from profiles table join)
export interface AuthorProfile {
  id: string;
  full_name: string | null;
}

// Combined type with author info
export interface HelpContentWithAuthor extends HelpContentRecord {
  author_profile?: AuthorProfile | null;
}

// Blog Post creation/update input type (for admin forms)
export interface BlogPostInput {
  topic: string; // maps to title
  slug: string;
  description: string;
  content: string;
  keywords: string[]; // maps to tags
  category: string;
  image_url: string;
  is_active: boolean;
  sort_order: number;
  published_at?: string | null;
  faq?: boolean;
}

// Default values for missing fields
export const DEFAULT_BLOG_IMAGE = 'https://images.unsplash.com/photo-1455390582262-044cdead277a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1673&q=80';
export const DEFAULT_AUTHOR_NAME = 'The mainscracker Team';
export const DEFAULT_AUTHOR_AVATAR = 'https://i.pinimg.com/originals/fb/6c/1f/fb6c1f3561169051c01cfb74d73d93b7.jpg';

