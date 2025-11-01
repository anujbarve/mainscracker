// Blog Adapter - Transforms help_content database records to blog Post format

import { BlogPost, HelpContentWithAuthor, DEFAULT_BLOG_IMAGE, DEFAULT_AUTHOR_NAME, DEFAULT_AUTHOR_AVATAR } from './blog-types';

/**
 * Converts a help_content database record to a blog Post
 * Handles missing fields with defaults
 */
export function adaptHelpContentToBlogPost(
  record: HelpContentWithAuthor
): BlogPost {
  // Format date from published_at or created_at
  const date = record.published_at 
    ? new Date(record.published_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : new Date(record.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

  // Get author info from profile or use defaults
  const authorName = record.author_profile?.full_name || DEFAULT_AUTHOR_NAME;
  const authorAvatar = DEFAULT_AUTHOR_AVATAR;

  return {
    id: record.id,
    slug: record.slug,
    title: record.topic,
    description: record.description || extractDescriptionFromContent(record.content),
    category: record.category,
    imageUrl: record.image_url || DEFAULT_BLOG_IMAGE,
    date,
    author: {
      name: authorName,
      avatarUrl: authorAvatar,
    },
    tags: record.keywords || [],
    content: record.content,
    is_active: record.is_active,
    sort_order: record.sort_order,
    created_at: record.created_at,
    updated_at: record.updated_at,
    published_at: record.published_at,
    faq: record.faq,
  };
}

/**
 * Extracts a description from content HTML if description is not provided
 * Returns first 150 characters of text content
 */
function extractDescriptionFromContent(content: string): string {
  // Remove HTML tags and get plain text
  const textContent = content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
    .replace(/&amp;/g, '&') // Replace &amp; with &
    .replace(/&lt;/g, '<') // Replace &lt; with <
    .replace(/&gt;/g, '>') // Replace &gt; with >
    .trim();

  // Return first 150 characters
  if (textContent.length <= 150) {
    return textContent;
  }

  // Find last space before 150 chars to avoid cutting words
  const truncated = textContent.substring(0, 150);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > 100) {
    return truncated.substring(0, lastSpace) + '...';
  }

  return truncated + '...';
}

/**
 * Converts multiple help_content records to blog posts
 */
export function adaptHelpContentArrayToBlogPosts(
  records: HelpContentWithAuthor[]
): BlogPost[] {
  return records.map(adaptHelpContentToBlogPost);
}

/**
 * Validates a blog post slug is URL-friendly
 */
export function isValidSlug(slug: string): boolean {
  // Only lowercase letters, numbers, and hyphens
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generates a slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

