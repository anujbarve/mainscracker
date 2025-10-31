"use client";

import * as React from "react";
import { useForm, useFieldArray, useFormContext, Control } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import Image from "next/image";

import { useAdminStore } from "@/stores/admin";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, useFormField } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2, Loader2, UploadCloud, File as FileIcon } from "lucide-react";

// IMPORTANT: Adjust this path if your client creation utility is located elsewhere
import { createClient } from "@/utils/client";

//=============================================================================
// 1. TYPE DEFINITIONS & ZOD SCHEMAS (=== UPDATED ===)
//=============================================================================

// Hero Slides
const heroSlideSchema = z.object({
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  // === UPDATED: Replaced imageSrc with imageLight and imageDark ===
  imageLight: z.string().min(1, "Light mode image is required."),
  imageDark: z.string().min(1, "Dark mode image is required."),
  // ===============================================================
  imageAlt: z.string().min(3, "Image alt text is required."),
  layout: z.enum(["imageRight", "imageLeft"]),
});
const heroSlidesFormSchema = z.object({
  settings_data: z.array(heroSlideSchema),
});
type HeroSlidesFormValues = z.infer<typeof heroSlidesFormSchema>;

// Features
const featureSchema = z.object({
  id: z.string().min(2, "ID is required."),
  title: z.string().min(3, "Title is required."),
  description: z.string().min(10, "Description is required."),
  // === UPDATED: Replaced image with imageLight and imageDark ===
  imageLight: z.string().min(1, "Light mode image is required."),
  imageDark: z.string().min(1, "Dark mode image is required."),
  // ============================================================
  alt: z.string().min(3, "Image alt text is required."),
  icon: z.string().optional(),
});
const featuresFormSchema = z.object({
  settings_data: z.array(featureSchema),
});
type FeaturesFormValues = z.infer<typeof featuresFormSchema>;

// Sample Papers
const samplePaperSchema = z.object({
    id: z.string().min(2, "ID is required."),
    title: z.string().min(3, "Title is required."),
    description: z.string().min(10, "Description is required."),
    link: z.string().min(1, "File link is required."),
    // === UPDATED: Replaced previewImage with light/dark variants ===
    previewImageLight: z.string().min(1, "Light preview image is required."),
    previewImageDark: z.string().min(1, "Dark preview image is required."),
    // ==============================================================
});
const samplePapersFormSchema = z.object({
    settings_data: z.array(samplePaperSchema),
});
type SamplePapersFormValues = z.infer<typeof samplePapersFormSchema>;

// Testimonials
const testimonialSchema = z.object({
  name: z.string().min(2, "Name is required."),
  role: z.string().min(3, "Role is required."),
  quote: z.string().min(15, "Quote must be at least 15 characters."),
  // Back to a single image field
  image: z.string().min(1, "Image is required."),
});
const testimonialsFormSchema = z.object({
  settings_data: z.array(testimonialSchema),
});
type TestimonialsFormValues = z.infer<typeof testimonialsFormSchema>;

//=============================================================================
// 2. NEW UPLOAD COMPONENTS (=== UPDATED ===)
//=============================================================================

const STORAGE_BUCKET = "homepage-assets"; // The public bucket you created

/**
 * A reusable component for uploading images to Supabase Storage
 * and integrating with react-hook-form.
 * * === UPDATED: Now deletes the old file from storage upon successful replacement ===
 */
interface ImageUploadFieldProps {
  control: Control<any>;
  name: string;
  label: string;
}

function ImageUploadField({ control, name, label }: ImageUploadFieldProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const form = useFormContext(); // Get the form instance

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // === UPDATED: Get the old URL before uploading ===
    const oldUrl = form.getValues(name) as string | undefined;
    // ================================================

    setIsUploading(true);
    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/${fileName}`; // Path inside your bucket

    try {
      // 1. Upload new file
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get new public URL
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) {
          throw new Error("Could not get public URL.");
      }

      // 3. Update form
      form.setValue(name, publicUrlData.publicUrl, { shouldValidate: true, shouldDirty: true });
      toast.success("Image uploaded successfully!");

      // 4. === UPDATED: Delete old file (if it exists) ===
      if (oldUrl && oldUrl !== publicUrlData.publicUrl) {
        const oldFilePath = oldUrl.split(`/${STORAGE_BUCKET}/`)[1];
        if (oldFilePath) {
          try {
            await supabase.storage.from(STORAGE_BUCKET).remove([oldFilePath]);
            console.log("Successfully deleted old image:", oldFilePath);
          } catch (deleteError) {
            console.warn("Failed to delete old image:", deleteError);
            toast.warning("New image saved, but failed to remove old one.");
          }
        }
      }
      // ===================================================

    } catch (error: any) {
      console.error("Error uploading image:", error);
      toast.error(error.message || "Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              {field.value ? (
                <Image
                  src={field.value}
                  alt="Preview"
                  width={80}
                  height={80}
                  className="rounded-lg object-cover aspect-square"
                />
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <UploadCloud className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <Input
                type="file"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleFileUpload}
                disabled={isUploading}
                className="flex-1"
              />
              {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/**
 * A reusable component for uploading general files (like PDFs) to Supabase Storage.
 *
 * === UPDATED: Now deletes the old file from storage upon successful replacement ===
 */
interface FileUploadFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  accept?: string;
}

function FileUploadField({ control, name, label, accept = "application/pdf" }: FileUploadFieldProps) {
  const [isUploading, setIsUploading] = React.useState(false);
  const form = useFormContext();
  useFormField(); // Get field state

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // === UPDATED: Get the old URL before uploading ===
    const oldUrl = form.getValues(name) as string | undefined;
    // ================================================

    setIsUploading(true);
    const supabase = createClient();
    const fileName = `${Date.now()}-${file.name}`;
    const filePath = `public/files/${fileName}`; // Different subfolder for organization

    try {
      // 1. Upload new file
      const { error: uploadError } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get new public URL
      const { data: publicUrlData } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);
        
      if (!publicUrlData.publicUrl) {
          throw new Error("Could not get public URL.");
      }

      // 3. Update form
      form.setValue(name, publicUrlData.publicUrl, { shouldValidate: true, shouldDirty: true });
      toast.success("File uploaded successfully!");

      // 4. === UPDATED: Delete old file (if it exists) ===
      if (oldUrl && oldUrl !== publicUrlData.publicUrl) {
        const oldFilePath = oldUrl.split(`/${STORAGE_BUCKET}/`)[1];
        if (oldFilePath) {
          try {
            await supabase.storage.from(STORAGE_BUCKET).remove([oldFilePath]);
            console.log("Successfully deleted old file:", oldFilePath);
          } catch (deleteError) {
            console.warn("Failed to delete old file:", deleteError);
            toast.warning("New file saved, but failed to remove old one.");
          }
        }
      }
      // ===================================================

    } catch (error: any) {
      console.error("Error uploading file:", error);
      toast.error(error.message || "Failed to upload file.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="flex items-center gap-4">
              <Input
                type="file"
                accept={accept}
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              {isUploading && <Loader2 className="w-5 h-5 animate-spin" />}
            </div>
          </FormControl>
           {field.value && (
            <p className="text-sm text-muted-foreground">
              Current file: <a href={field.value} target="_blank" rel="noopener noreferrer" className="text-primary underline">{field.value.split('/').pop()}</a>
            </p>
          )}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

//=============================================================================
// 3. LIVE PREVIEW COMPONENTS (=== UPDATED ===)
//=============================================================================

// === UPDATED: Previews will now just show the "Light Mode" image for simplicity ===
// The form itself is the source of truth for both light/dark images.

function HeroSlidesPreview({ slides }: { slides: z.infer<typeof heroSlideSchema>[] }) {
  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle>Live Preview: Hero Section</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {(slides || []).map((slide, index) => (
          <div key={index} className={`flex gap-4 p-4 border rounded-lg ${slide.layout === 'imageRight' ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className="flex-1 space-y-2">
              <h3 className="font-bold text-lg">{slide.title || "[Title]"}</h3>
              <p className="text-sm text-muted-foreground">{slide.description || "[Description]"}</p>
            </div>
            <div className="flex-1 relative aspect-video w-full bg-slate-200 rounded">
              {/* === UPDATED: Show light image === */}
              {slide.imageLight && <Image src={slide.imageLight} alt={slide.imageAlt || 'preview'} layout="fill" objectFit="cover" className="rounded" />}
            </div>
          </div>
        ))}
        {(!slides || slides.length === 0) && <p className="text-center text-muted-foreground py-8">Add a slide for a preview.</p>}
      </CardContent>
    </Card>
  );
}

function FeaturesPreview({ features }: { features: z.infer<typeof featureSchema>[] }) {
    return (
        <Card className="bg-muted/30">
            <CardHeader><CardTitle>Live Preview: Features</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(features || []).map((feature, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                            <div className="relative h-24 w-24 bg-slate-200 rounded-lg shrink-0">
                                {/* === UPDATED: Show light image === */}
                                {feature.imageLight && <Image src={feature.imageLight} alt={feature.alt || 'preview'} layout="fill" objectFit="contain" className="rounded p-2" />}
                            </div>
                            <div className="space-y-1">
                                <h4 className="font-semibold">{feature.title || "[Feature Title]"}</h4>
                                <p className="text-sm text-muted-foreground">{feature.description || "[Feature description...]"}</p>
                            </div>
                        </div>
                    ))}
                </div>
                {(!features || features.length === 0) && <p className="text-center text-muted-foreground py-8">Add a feature for a preview.</p>}
            </CardContent>
        </Card>
    );
}

function TestimonialsPreview({ testimonials }: { testimonials: z.infer<typeof testimonialSchema>[] }) {
  return (
    <Card className="bg-muted/30">
      <CardHeader><CardTitle>Live Preview: Testimonials</CardTitle></CardHeader>
      <CardContent className="columns-1 md:columns-2 lg:columns-3 gap-4 space-y-4">
        {(testimonials || []).map((testimonial, index) => (
          <div key={index} className="p-4 border rounded-lg break-inside-avoid">
            <p className="text-muted-foreground mb-4">"{testimonial.quote || "[Quote...]"}"</p>
            <div className="flex items-center gap-3">
              <div className="relative h-10 w-10 bg-slate-200 rounded-full">
                {/* Updated: Pointing back to the single 'image' field */}
                {testimonial.image && <Image src={testimonial.image} alt={testimonial.name || 'avatar'} layout="fill" className="rounded-full" />}
              </div>
              <div>
                <p className="font-semibold text-sm">{testimonial.name || "[Name]"}</p>
                <p className="text-xs text-muted-foreground">{testimonial.role || "[Role]"}</p>
              </div>
            </div>
          </div>
        ))}
        {(!testimonials || testimonials.length === 0) && <p className="text-center text-muted-foreground py-8">Add a testimonial for a preview.</p>}
      </CardContent>
    </Card>
  );
}

function SamplePapersPreview({ papers }: { papers: z.infer<typeof samplePaperSchema>[] }) {
    return (
        <Card className="bg-muted/30">
            <CardHeader><CardTitle>Live Preview: Sample Papers</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                     {(papers || []).map((paper, index) => (
                        <div key={index} className="border rounded-lg overflow-hidden group">
                            <div className="relative aspect-video bg-slate-200">
                                {/* === UPDATED: Show light image === */}
                                {paper.previewImageLight && <Image src={paper.previewImageLight} alt={`Preview for ${paper.title}`} layout="fill" objectFit="cover" />}
                            </div>
                            <div className="p-3">
                                <h4 className="font-semibold truncate">{paper.title || "[Title]"}</h4>
                                <p className="text-sm text-muted-foreground truncate">{paper.description || "[Description]"}</p>
                            </div>
                        </div>
                     ))}
                </div>
                 {(!papers || papers.length === 0) && <p className="text-center text-muted-foreground py-8">Add a sample paper for a preview.</p>}
            </CardContent>
        </Card>
    );
}

//=============================================================================
// 4. DEDICATED MANAGER COMPONENTS (=== UPDATED ===)
//=============================================================================

//--- Hero Slides Manager ---//
function HeroSlidesManager() {
  const settingId = 'homepage_hero_slides';
  const { systemSettings, fetchSystemSettings, updateSystemSetting, loading } = useAdminStore();
  const setting = React.useMemo(() => systemSettings?.find(s => s.id === settingId), [systemSettings]);

  const form = useForm<HeroSlidesFormValues>({
    resolver: zodResolver(heroSlidesFormSchema),
    defaultValues: { settings_data: [] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "settings_data" });
  const watchedData = form.watch("settings_data");

  React.useEffect(() => {
    if (setting) form.reset({ settings_data: setting.settings_data || [] });
  }, [setting, form]);

  async function onSubmit(data: HeroSlidesFormValues) {
    const success = await updateSystemSetting(settingId, { settings_data: data.settings_data });
    if (success) toast.success("Hero Slides updated successfully!");
  }

  if (loading.systemSettings && !setting) return <Skeleton className="w-full h-96" />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Hero Slides</CardTitle>
              <CardDescription>Manage the rotating slides in the main hero section.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <h4 className="font-semibold">Slide {index + 1}</h4>
                  <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                  
                  <FormField control={form.control} name={`settings_data.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                  
                  <FormField control={form.control} name={`settings_data.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />
                  
                  {/* === UPDATED: Added fields for light and dark images === */}
                  <ImageUploadField 
                    control={form.control}
                    name={`settings_data.${index}.imageLight`}
                    label="Hero Image (Light Mode)"
                  />
                  <ImageUploadField 
                    control={form.control}
                    name={`settings_data.${index}.imageDark`}
                    label="Hero Image (Dark Mode)"
                  />
                  {/* ======================================================= */}

                  <FormField control={form.control} name={`settings_data.${index}.imageAlt`} render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />

                  <FormField control={form.control} name={`settings_data.${index}.layout`} render={({ field }) => (<FormItem><FormLabel>Layout</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl><SelectContent><SelectItem value="imageRight">Image on Right</SelectItem><SelectItem value="imageLeft">Image on Left</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                </div>
              ))}
              {/* === UPDATED: `append` now includes light/dark fields === */}
              <Button type="button" variant="outline" onClick={() => append({ title: "", description: "", imageLight: "", imageDark: "", imageAlt: "", layout: "imageRight" })} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Slide
              </Button>
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>Save Changes</Button>
            </CardFooter>
          </Card>
          <HeroSlidesPreview slides={watchedData} />
        </div>
      </form>
    </Form>
  );
}

//--- Features Manager ---//
function FeaturesManager() {
  const settingId = 'homepage_features';
  const { systemSettings, updateSystemSetting, loading } = useAdminStore();
  const setting = React.useMemo(() => systemSettings?.find(s => s.id === settingId), [systemSettings]);

  const form = useForm<FeaturesFormValues>({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: { settings_data: [] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "settings_data" });
  const watchedData = form.watch("settings_data");

  React.useEffect(() => {
    if (setting) form.reset({ settings_data: setting.settings_data || [] });
  }, [setting, form]);

  async function onSubmit(data: FeaturesFormValues) {
    const success = await updateSystemSetting(settingId, { settings_data: data.settings_data });
    if (success) toast.success("Features updated successfully!");
  }

  if (loading.systemSettings && !setting) return <Skeleton className="w-full h-96" />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Features</CardTitle>
              <CardDescription>Highlight the key features of your platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <h4 className="font-semibold">Feature {index + 1}</h4>
                   <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                   
                   <FormField control={form.control} name={`settings_data.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   
                   <FormField control={form.control} name={`settings_data.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>)} />

                   {/* === UPDATED: Added fields for light and dark images === */}
                    <ImageUploadField
                      control={form.control}
                      name={`settings_data.${index}.imageLight`}
                      label="Feature Icon/Image (Light Mode)"
                    />
                    <ImageUploadField
                      control={form.control}
                      name={`settings_data.${index}.imageDark`}
                      label="Feature Icon/Image (Dark Mode)"
                    />
                   {/* ======================================================= */}
                  
                  <FormField control={form.control} name={`settings_data.${index}.alt`} render={({ field }) => (<FormItem><FormLabel>Image Alt Text</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   
                   <FormField control={form.control} name={`settings_data.${index}.id`} render={({ field }) => (<FormItem><FormLabel>Unique ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              ))}
              {/* === UPDATED: `append` now includes light/dark fields === */}
               <Button type="button" variant="outline" onClick={() => append({ id: "new-feature", title: "", description: "", imageLight: "", imageDark: "", alt: "", icon: "UserCheck" })} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Feature
              </Button>
            </CardContent>
             <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>Save Changes</Button>
            </CardFooter>
          </Card>
           <FeaturesPreview features={watchedData} />
        </div>
      </form>
    </Form>
  );
}

//--- Testimonials Manager ---//

function TestimonialsManager() {
  const settingId = 'homepage_testimonials';
  const { systemSettings, updateSystemSetting, loading } = useAdminStore();
  const setting = React.useMemo(() => systemSettings?.find(s => s.id === settingId), [systemSettings]);

  const form = useForm<TestimonialsFormValues>({
    resolver: zodResolver(testimonialsFormSchema),
    defaultValues: { settings_data: [] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "settings_data" });
  const watchedData = form.watch("settings_data");

  React.useEffect(() => {
    if (setting) form.reset({ settings_data: setting.settings_data || [] });
  }, [setting, form]);

  async function onSubmit(data: TestimonialsFormValues) {
    const success = await updateSystemSetting(settingId, { settings_data: data.settings_data });
    if (success) toast.success("Testimonials updated successfully!");
  }

  if (loading.systemSettings && !setting) return <Skeleton className="w-full h-96" />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Testimonials</CardTitle>
              <CardDescription>Showcase quotes from happy users and partners.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <h4 className="font-semibold">Testimonial {index + 1}</h4>
                   <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                   <FormField control={form.control} name={`settings_data.${index}.quote`} render={({ field }) => (<FormItem><FormLabel>Quote</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl><FormMessage /></FormItem>)} />
                   <div className="grid grid-cols-2 gap-4">
                    <FormField control={form.control} name={`settings_data.${index}.name`} render={({ field }) => (<FormItem><FormLabel>Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                    <FormField control={form.control} name={`settings_data.${index}.role`} render={({ field }) => (<FormItem><FormLabel>Role / Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   </div>
                   
                   {/* === UPDATED: Back to a single ImageUploadField === */}
                    <ImageUploadField
                      control={form.control}
                      name={`settings_data.${index}.image`}
                      label="Avatar Image"
                    />
                   {/* ================================================ */}
                </div>
              ))}
               {/* === UPDATED: `append` now uses single 'image' field === */}
               <Button type="button" variant="outline" onClick={() => append({ name: "", role: "", quote: "", image: "" })} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Testimonial
              </Button>
            </CardContent>
             <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>Save Changes</Button>
            </CardFooter>
          </Card>
           <TestimonialsPreview testimonials={watchedData} />
        </div>
      </form>
    </Form>
  );
}

// === END OF SECTION 3 ===

//--- Sample Papers Manager ---//
function SamplePapersManager() {
  const settingId = 'homepage_sample_papers';
  const { systemSettings, updateSystemSetting, loading } = useAdminStore();
  const setting = React.useMemo(() => systemSettings?.find(s => s.id === settingId), [systemSettings]);

  const form = useForm<SamplePapersFormValues>({
    resolver: zodResolver(samplePapersFormSchema),
    defaultValues: { settings_data: [] },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control, name: "settings_data" });
  const watchedData = form.watch("settings_data");

  React.useEffect(() => {
    if (setting) form.reset({ settings_data: setting.settings_data || [] });
  }, [setting, form]);

  async function onSubmit(data: SamplePapersFormValues) {
    const success = await updateSystemSetting(settingId, { settings_data: data.settings_data });
    if (success) toast.success("Sample Papers updated successfully!");
  }

  if (loading.systemSettings && !setting) return <Skeleton className="w-full h-96" />;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Edit Sample Papers</CardTitle>
              <CardDescription>Provide links to sample evaluated papers for download.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="border rounded-lg p-4 space-y-4 relative">
                  <h4 className="font-semibold">Sample Paper {index + 1}</h4>
                   <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
                   <FormField control={form.control} name={`settings_data.${index}.title`} render={({ field }) => (<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   <FormField control={form.control} name={`settings_data.${index}.description`} render={({ field }) => (<FormItem><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                   
                   {/* === UPDATED: This remains FileUploadField === */}
                   <FileUploadField
                      control={form.control}
                      name={`settings_data.${index}.link`}
                      label="PDF File Upload"
                      accept="application/pdf"
                   />
                   {/* ============================================= */}
                   
                   {/* === UPDATED: Added fields for light and dark PREVIEW images === */}
                   <ImageUploadField
                      control={form.control}
                      name={`settings_data.${index}.previewImageLight`}
                      label="Preview Image (Light Mode)"
                   />
                   <ImageUploadField
                      control={form.control}
                      name={`settings_data.${index}.previewImageDark`}
                      label="Preview Image (Dark Mode)"
                   />
                   {/* =============================================================== */}

                   <FormField control={form.control} name={`settings_data.${index}.id`} render={({ field }) => (<FormItem><FormLabel>Unique ID</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                </div>
              ))}
              {/* === UPDATED: `append` now includes light/dark PREVIEW fields === */}
               <Button type="button" variant="outline" onClick={() => append({ id: "new-paper", title: "", description: "", link: "", previewImageLight: "", previewImageDark: "" })} className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Sample Paper
              </Button>
            </CardContent>
             <CardFooter>
              <Button type="submit" disabled={form.formState.isSubmitting || !form.formState.isDirty}>Save Changes</Button>
            </CardFooter>
          </Card>
           <SamplePapersPreview papers={watchedData} />
        </div>
      </form>
    </Form>
  );
}


//=============================================================================
// 5. MAIN PAGE COMPONENT (Unchanged)
//=============================================================================

export default function HomepageSettingsPage() {
    const { fetchSystemSettings } = useAdminStore();

    // Fetch all settings once when the page loads
    React.useEffect(() => {
        fetchSystemSettings({});
    }, [fetchSystemSettings]);

    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="space-y-1">
                <h2 className="text-3xl font-bold tracking-tight">Homepage Content</h2>
                <p className="text-muted-foreground">
                    Manage the dynamic content displayed on your public landing page. Changes are saved per section.
                </p>
            </div>
            
            <Tabs defaultValue="hero_slides" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="hero_slides">Hero Slides</TabsTrigger>
                    <TabsTrigger value="features">Features</TabsTrigger>
                    <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
                    <TabsTrigger value="sample_papers">Sample Papers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hero_slides">
                    <HeroSlidesManager />
                </TabsContent>
                <TabsContent value="features">
                    <FeaturesManager />
                </TabsContent>
                <TabsContent value="testimonials">
                    <TestimonialsManager />
                </TabsContent>
                <TabsContent value="sample_papers">
                    <SamplePapersManager />
                </TabsContent>
            </Tabs>
        </div>
    );
}