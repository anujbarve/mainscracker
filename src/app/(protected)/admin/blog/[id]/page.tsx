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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ChevronLeft, X, Plus, Trash2 } from 'lucide-react';
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
  keywords: z.array(z.string()),
  is_active: z.boolean(),
  sort_order: z.number().int().min(-1, "Sort order must be -1 or between 0-9").max(9, "Sort order cannot exceed 9"),
  published_at: z.string().nullable().optional(),
  faq: z.boolean(),
});

type BlogPostFormData = z.infer<typeof blogPostFormSchema>;

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isCreateMode = id === 'new';

  const { currentBlogPost, fetchBlogPostById, clearCurrentBlogPost, createBlogPost, updateBlogPost, loading } = useAdminStore();
  const [tagInput, setTagInput] = React.useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = React.useState(false);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = React.useState(false);
  const [newCategoryName, setNewCategoryName] = React.useState("");
  const [loadingCategories, setLoadingCategories] = React.useState(false);
  const [categoryToDelete, setCategoryToDelete] = React.useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = React.useState(false);

  const form = useForm<BlogPostFormData>({
    resolver: zodResolver(blogPostFormSchema),
    defaultValues: {
      topic: "",
      slug: "",
      description: "",
      content: "",
      category: "General",
      image_url: "",
      keywords: [] as string[],
      is_active: true,
      sort_order: -1,
      published_at: null,
      faq: false,
    },
  });

  // Fetch categories from API
  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch('/api/admin/blog/categories');
        const data = await response.json();
        if (data.categories) {
          setCategories(data.categories);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback to default categories
        setCategories([
          'Getting Started',
          'Platform Guide',
          'Answer Writing',
          'UPSC Strategy',
          'Mentorship',
          'Ethics',
          'General'
        ]);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  React.useEffect(() => {
    if (!isCreateMode) {
      fetchBlogPostById(id);
    } else {
      setSlugManuallyEdited(false); // Reset flag for new posts
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
        keywords: currentBlogPost.tags ?? [],
        is_active: currentBlogPost.is_active ?? true,
        sort_order: currentBlogPost.sort_order ?? -1,
        published_at: currentBlogPost.published_at ?? null,
        faq: currentBlogPost.faq ?? false,
      });
      setSlugManuallyEdited(true); // Don't auto-generate for existing posts
    }
  }, [currentBlogPost, isCreateMode, form]);

  // Auto-generate slug from title when title field loses focus
  const handleTitleBlur = () => {
    if (isCreateMode && !slugManuallyEdited) {
      const title = form.getValues("topic");
      const currentSlug = form.getValues("slug");
      if (title && !currentSlug) {
        const generatedSlug = generateSlug(title);
        form.setValue("slug", generatedSlug, { shouldValidate: false });
      }
    }
  };

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

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Category name cannot be empty");
      return;
    }

    const categoryName = newCategoryName.trim();

    try {
      const response = await fetch('/api/admin/blog/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: categoryName }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Add the new category to the list
        if (!categories.includes(categoryName)) {
          setCategories([...categories, categoryName].sort());
        }
        
        // Set the form value to the new category
        form.setValue("category", categoryName);
        
        // Reset the input
        setNewCategoryName("");
        setShowNewCategoryInput(false);
        
        toast.success(data.message || "Category created successfully!");
      } else {
        toast.error(data.error || "Failed to create category");
      }
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error("Failed to create category");
    }
  };

  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeletingCategory(true);
    try {
      const response = await fetch('/api/admin/blog/categories', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: categoryToDelete }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Remove category from the list
        const updatedCategories = categories.filter(cat => cat !== categoryToDelete);
        setCategories(updatedCategories);

        // If the deleted category was selected, reset to first available or empty
        if (form.getValues("category") === categoryToDelete) {
          form.setValue("category", updatedCategories.length > 0 ? updatedCategories[0] : "");
        }

        toast.success(data.message || "Category removed successfully!");
        setCategoryToDelete(null);
      } else {
        toast.error(data.error || "Failed to delete category");
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error("Failed to delete category");
    } finally {
      setDeletingCategory(false);
    }
  };

  async function onSubmit(data: BlogPostFormData) {
    let success;
    if (isCreateMode) {
      success = await createBlogPost({
        ...data,
        description: data.description || "",
        image_url: data.image_url || "",
        published_at: data.published_at || new Date().toISOString(),
      });
    } else {
      success = await updateBlogPost(id, {
        ...data,
        description: data.description || "",
        image_url: data.image_url || "",
      });
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
                      <Input 
                        placeholder="Enter post title" 
                        {...field}
                        onBlur={(e) => {
                          field.onBlur();
                          handleTitleBlur();
                        }}
                      />
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
                      <Input 
                        placeholder="url-friendly-slug" 
                        value={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.value);
                          setSlugManuallyEdited(true);
                        }}
                        onBlur={field.onBlur}
                        name={field.name}
                        ref={field.ref}
                      />
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
                      <div className="space-y-2">
                        <Select 
                          onValueChange={(value) => {
                            if (value === "__create_new__") {
                              setShowNewCategoryInput(true);
                              // Reset select to previous value
                              setTimeout(() => {
                                const prevValue = form.getValues("category");
                                if (prevValue) {
                                  field.onChange(prevValue);
                                }
                              }, 0);
                            } else {
                              field.onChange(value);
                            }
                          }} 
                          value={field.value === "__create_new__" ? undefined : field.value}
                          disabled={loadingCategories}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder={loadingCategories ? "Loading categories..." : "Select category"} />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <div
                                key={category}
                                className="flex items-center group"
                                onMouseDown={(e) => {
                                  // Prevent select from closing when clicking delete button
                                  if ((e.target as HTMLElement).closest('.delete-category-btn')) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }
                                }}
                              >
                                <SelectItem 
                                  value={category}
                                  className="flex-1"
                                >
                                  {category}
                                </SelectItem>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <button
                                      type="button"
                                      className="delete-category-btn flex items-center justify-center w-6 h-6 mr-2 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setCategoryToDelete(category);
                                      }}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete the category "{category}"? 
                                        This action cannot be undone. If this category is used in any blog posts, deletion will be prevented.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel onClick={() => setCategoryToDelete(null)}>
                                        Cancel
                                      </AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={handleDeleteCategory}
                                        disabled={deletingCategory}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        {deletingCategory ? "Deleting..." : "Delete"}
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            ))}
                            <SelectItem 
                              value="__create_new__"
                              className="font-semibold text-primary"
                            >
                              <div className="flex items-center gap-2">
                                <Plus className="h-4 w-4" />
                                Create New Category
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {showNewCategoryInput && (
                          <div className="flex gap-2">
                            <Input
                              placeholder="Enter new category name"
                              value={newCategoryName}
                              onChange={(e) => setNewCategoryName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  handleCreateCategory();
                                }
                                if (e.key === 'Escape') {
                                  setShowNewCategoryInput(false);
                                  setNewCategoryName("");
                                }
                              }}
                              autoFocus
                            />
                            <Button
                              type="button"
                              size="sm"
                              onClick={handleCreateCategory}
                            >
                              Add
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setShowNewCategoryInput(false);
                                setNewCategoryName("");
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
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
                          min="-1"
                          max="9"
                          {...field}
                          value={field.value ?? -1}
                          onChange={(e) => {
                            const value = parseInt(e.target.value, 10);
                            // Validate: must be -1 or between 0-9
                            let validValue: number;
                            if (isNaN(value)) {
                              validValue = -1;
                            } else if (value < -1) {
                              validValue = -1;
                            } else if (value > 9) {
                              validValue = 9;
                            } else {
                              validValue = value;
                            }
                            field.onChange(validValue);
                          }}
                          placeholder="-1"
                        />
                      </FormControl>
                      <FormDescription>
                        Enter 0-9 for a numbered position (top 10), or -1 for non-numbered (sorted by update time). Posts are automatically reordered.
                      </FormDescription>
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

