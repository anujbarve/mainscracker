// app/sitemap.ts
import { MetadataRoute } from "next";

async function getBlogPosts() {
  // Example fetching logic
  const posts = [
    { slug: "getting-started-with-mainscracker", updatedAt: new Date() },
    { slug: "credit-system-explained", updatedAt: new Date() },
    { slug: "how-to-submit-answer-sheets", updatedAt: new Date() },
    { slug: "unlocking-potential-with-mentorship", updatedAt: new Date() },
    { slug: "anatomy-of-a-high-scoring-answer", updatedAt: new Date() },
    { slug: "analyzing-feedback-on-evaluated-sheets", updatedAt: new Date() },
    { slug: "mastering-the-upsc-essay", updatedAt: new Date() },
    { slug: "decoding-gs-paper-4-ethics-case-studies", updatedAt: new Date() },
  ];
  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://mainscracker.com";

  // Get all blog posts
  const posts = await getBlogPosts();

  const blogPostUrls = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly" as const, // Or 'monthly' if they don't change often
    priority: 0.8,
  }));

  const staticUrls = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/register`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/forgot-password`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/legal/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/legal/terms-and-conditions`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.3,
    },
  ];

  return [...staticUrls, ...blogPostUrls];
}