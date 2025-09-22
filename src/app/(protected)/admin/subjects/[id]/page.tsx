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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from 'lucide-react';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const subjectFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
  category: z.enum(['gs', 'specialized']),
  sort_order: z.number().int(),
  is_active: z.boolean(),
});

type SubjectFormData = z.infer<typeof subjectFormSchema>;

export default function SubjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isCreateMode = id === 'new';

  const { subjects, fetchSubjects, createSubject, updateSubject, loading } = useAdminStore();
  
  const form = useForm<SubjectFormData>({
    resolver: zodResolver(subjectFormSchema),
    defaultValues: {
      name: "",
      description: "",
      category: 'gs',
      sort_order: 0,
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (!subjects) {
      fetchSubjects();
    }
  }, [subjects, fetchSubjects]);

  React.useEffect(() => {
    if (!isCreateMode && subjects) {
      const subjectToEdit = subjects.find(s => s.id === id);
      if (subjectToEdit) {
        form.reset({
          name: subjectToEdit.name,
          description: subjectToEdit.description || "",
          category: subjectToEdit.category,
          sort_order: subjectToEdit.sort_order,
          is_active: subjectToEdit.is_active,
        });
      }
    }
  }, [id, isCreateMode, subjects, form]);

  async function onSubmit(data: SubjectFormData) {
    let success;
    if (isCreateMode) {
      // ✅ FIX: Add the missing property before creating
      const newSubjectData = {
        ...data,
        description: data.description || null,
        total_answers_submitted: 0, // Set initial submission count to 0
      };
      success = await createSubject(newSubjectData);
    } else {
      // The update function doesn't require all fields, so no change is needed here
      success = await updateSubject(id, data);
    }
    
    if (success) {
      toast.success(`Subject ${isCreateMode ? 'created' : 'updated'} successfully!`);
      router.push("/admin/subjects");
    }
  }
  
  if (loading.subjects && !isCreateMode) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild><Link href="/admin/subjects"><ChevronLeft className="h-4 w-4" /></Link></Button>
         <h2 className="text-3xl font-bold tracking-tight">{isCreateMode ? 'Create New Subject' : 'Edit Subject'}</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Subject Details</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Subject Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="category" render={({ field }) => (
                <FormItem><FormLabel>Category</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="gs">General Studies (GS)</SelectItem><SelectItem value="specialized">Specialized</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                 <FormItem className="md:col-span-2"><FormLabel>Description (Optional)</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="sort_order" render={({ field }) => (
                <FormItem><FormLabel>Sort Order</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)}/></FormControl><FormMessage /></FormItem>
              )}/>
               <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-auto">
                    <div className="space-y-0.5"><FormLabel>Activate Subject</FormLabel><CardDescription>Inactive subjects won't be visible to students.</CardDescription></div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}/>
            </CardContent>
          </Card>
          <Button type="submit" disabled={form.formState.isSubmitting}>{isCreateMode ? 'Create Subject' : 'Save Changes'}</Button>
        </form>
      </Form>
    </div>
  );
}