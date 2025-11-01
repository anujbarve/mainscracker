"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminStore } from '@/stores/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, X } from 'lucide-react';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { generateSlug } from '@/lib/blog-adapter';

const blogPostFormSchema = z.object({
  topic: z.string().min(3, "Title must be at least 3 characters."),
  slug: z.string().min(3, "Slug must be at least 3 characters.").regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase letters, numbers, and hyphens only."),
  description: z.string().min(10, "Description must be at least 10 characters.").optional(),
  content: z.string().min(50, "Content must be at least 50 characters."),
  category: z.string().min(1, "Category is required."),
  image_url: z.string().url("Must be a valid URL.").optional().or(z.literal("")),
  keywords: z.array(z.string()).default([]),
  is_active: z.boolean(),
  sort_order: z.number().int().default(0),
  published_at: z.string().optional().nullable(),
  faq: z.boolean().default(false),
});

type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isCreateMode = id === 'new';

  const { currentBlogPost, fetchBlogPostById, clearCurrentBlogPost, createBlogPost, updateBlogPost, loading } = useAdminStore();
  const [tagInput, setTagInput] = React.useState("");

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      topic: "",
      slug: "",
      description: "",
      content: "",
      category: "General",
      image_url: "",
      keywords: [],
      is_active: true,
      sort_order: 0,
      published_at: null,
      faq: false,
    },
  });

  // Watch topic to auto-generate slug
  const watchedTopic = form.watch("topic");

  React.useEffect(() => {
    if (!isCreateMode) {
      fetchBlogPostById(id);
    }
    return () => { clearCurrentBlogPost(); };
  }, [id, isCreateMode, fetchBlogPostById, clearCurrentBlogPost]);

  React.useEffect(() => {
    if (currentBlogPost && !isCreateMode) {
      form.reset({
        topic: currentBlogPost.title,
        slug: currentBlogPost.slug,
        description: currentBlogPost.description || "",
        content: currentBlogPost.content,
        category: currentBlogPost.category,
        image_url: currentBlogPost.imageUrl || "",
        keywords: currentBlogPost.tags || [],
        is_active: currentBlogPost.is_active,
        sort_order: currentBlogPost.sort_order,
        published_at: currentBlogPost.published_at,
        faq: currentBlogPost.faq || false,
      });
    }
  }, [currentBlogPost, isCreateMode, form]);

  // Auto-generate slug from title
  React.useEffect(() => {
    if (isCreateMode && watchedTopic && !form.getValues("slug")) {
      const generatedSlug = generateSlug(watchedTopic);
      form.setValue("slug", generatedSlug, { shouldValidate: false });
    }
  }, [watchedTopic, isCreateMode, form]);

  const addTag = () => {
    if (!tagInput.trim()) return;
    const currentTags = form.getValues("keywords") || [];
    if (!currentTags.includes(tagInput.trim())) {
      form.setValue("keywords", [...currentTags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    const currentTags = form.getValues("keywords") || [];
    form.setValue("keywords", currentTags.filter(t => t !== tag));
  };

  async function onSubmit(data: BlogPostFormData) {
    let success;
    if (isCreateMode) {
      success = await createBlogPost({
        ...data,
        published_at: data.published_at || new Date().toISOString(),
      });
    } else {
      success = await updateBlogPost(id, data);
    }

    if (success) {
      toast.success(`Blog post ${isCreateMode ? 'created' : 'updated'} successfully!`);
      router.push("/admin/blog");
    }
  }

  if (loading.blogPost && !isCreateMode) {
    return (
      <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/admin/blog">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">
          {isCreateMode ? 'Create New Blog Post' : 'Edit Blog Post'}
        </h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Post Details</CardTitle>
              <CardDescription>Basic information about your blog post</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter post title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Slug *</FormLabel>
                    <FormControl>
                      <Input placeholder="url-friendly-slug" {...field} />
                    </FormControl>
                    <FormDescription>
                      URL-friendly identifier. Auto-generated from title if left empty.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Getting Started">Getting Started</SelectItem>
                          <SelectItem value="Platform Guide">Platform Guide</SelectItem>
                          <SelectItem value="Answer Writing">Answer Writing</SelectItem>
                          <SelectItem value="UPSC Strategy">UPSC Strategy</SelectItem>
                          <SelectItem value="Mentorship">Mentorship</SelectItem>
                          <SelectItem value="Ethics">Ethics</SelectItem>
                          <SelectItem value="General">General</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sort_order"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sort Order</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
                        />
                      </FormControl>
                      <FormDescription>Lower numbers appear first</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description of the post (will be auto-extracted from content if left empty)"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Short excerpt shown in blog listings
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="image_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input
                        type="url"
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      URL to the cover image for this post
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="keywords"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag and press Enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              addTag();
                            }
                          }}
                        />
                        <Button type="button" onClick={addTag}>
                          Add
                        </Button>
                      </div>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 rounded-full hover:bg-destructive/20"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
              <CardDescription>Main content of your blog post (HTML supported)</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        placeholder="Enter your blog post content (HTML supported)..."
                        rows={20}
                        className="font-mono text-sm"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      You can use HTML tags for formatting
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Publish Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Publish Post</FormLabel>
                      <FormDescription>
                        Active posts will be visible on the blog
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="faq"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Mark as FAQ</FormLabel>
                      <FormDescription>
                        FAQ posts may appear in special sections
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {isCreateMode ? 'Create Post' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/admin/blog")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

