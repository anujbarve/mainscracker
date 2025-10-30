"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminStore } from '@/stores/admin'; // Make sure this path is correct
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from 'lucide-react';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// 1. Updated schema with recurring fields and validation
const planFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative."),
  type: z.enum(['one_time', 'recurring']),
  
  // Added interval fields
  interval: z.enum(['daily', 'weekly', 'monthly','quarterly', 'yearly']).optional(),
  interval_count: z.number().int().min(1, "Count must be at least 1").optional(),

  gs_credits_granted: z.number().int().min(0),
  specialized_credits_granted: z.number().int().min(0),
  mentorship_credits_granted: z.number().int().min(0),
  is_active: z.boolean(),
})
.superRefine((data, ctx) => {
  // Matches the database constraint
  if (data.type === 'recurring') {
    if (!data.interval) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Interval is required for recurring plans.",
        path: ['interval'],
      });
    }
    if (!data.interval_count) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Interval count is required for recurring plans.",
        path: ['interval_count'],
      });
    }
  }
});

// Export the type so the store can use it
export type PlanFormData = z.infer<typeof planFormSchema>;

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isCreateMode = id === 'new';

  const { currentPlan, fetchPlanById, clearCurrentPlan, createPlan, updatePlan, loading } = useAdminStore();

  const form = useForm<PlanFormData>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: 'one_time',
      interval: undefined, // Default to undefined
      interval_count: 1, // Default to 1
      gs_credits_granted: 0,
      specialized_credits_granted: 0,
      mentorship_credits_granted: 0,
      is_active: true,
    },
  });

  // Watch the 'type' field to conditionally show inputs
  const planType = form.watch('type');

  React.useEffect(() => {
    if (!isCreateMode) {
      fetchPlanById(id);
    }
    return () => { clearCurrentPlan(); };
  }, [id, isCreateMode, fetchPlanById, clearCurrentPlan]);

  React.useEffect(() => {
    if (currentPlan && !isCreateMode) {
      form.reset({
        ...currentPlan,
        description: currentPlan.description ?? "",
        // Handle potential null values from the database
        interval: currentPlan.interval ?? undefined,
        interval_count: currentPlan.interval_count ?? 1,
      });
    }
  }, [currentPlan, isCreateMode, form]);

  async function onSubmit(data: PlanFormData) {
    // Cast to any to satisfy the store's expected parameter type (Partial<Plan>)
    const payload = data as unknown as any;
    const success = isCreateMode
      ? await createPlan(payload)
      : await updatePlan(id, payload);
    
    if (success) {
      toast.success(`Plan ${isCreateMode ? 'created' : 'updated'} successfully!`);
      router.push("/admin/plans");
    }
  }
  
  if (loading.currentPlan && !isCreateMode) {
    return <Skeleton className="h-96 w-full" />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
       <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild><Link href="/admin/plans"><ChevronLeft className="h-4 w-4" /></Link></Button>
         <h2 className="text-3xl font-bold tracking-tight">{isCreateMode ? 'Create New Plan' : 'Edit Plan'}</h2>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader><CardTitle>Plan Details</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Plan Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (INR)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="description" render={({ field }) => (
                 <FormItem className="md:col-span-2"><FormLabel>Description</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>

              <FormField control={form.control} name="type" render={({ field }) => (
                <FormItem><FormLabel>Plan Type</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="one_time">One-Time</SelectItem><SelectItem value="recurring">Recurring</SelectItem></SelectContent></Select><FormMessage /></FormItem>
              )}/>

              {/* Conditional inputs for recurring plans */}
              {planType === 'recurring' && (
                <>
                  <FormField control={form.control} name="interval" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Select interval" /></SelectTrigger></FormControl>
                        <SelectContent>
                          <SelectItem value="day">Day</SelectItem>
                          <SelectItem value="week">Week</SelectItem>
                          <SelectItem value="month">Month</SelectItem>
                          <SelectItem value="year">Year</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}/>
                  <FormField control={form.control} name="interval_count" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interval Count</FormLabel>
                      <FormControl>
                        <Input type="number" min="1" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 1)} />
                      </FormControl>
                      <FormDescription>
                        e.g., for "1 month", set Interval to "Month" and Count to "1".
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}/>
                </>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle>Credits Granted</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <FormField control={form.control} name="gs_credits_granted" render={({ field }) => (
                <FormItem>
                  <FormLabel>GS Credits</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="specialized_credits_granted" render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialized Credits</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="mentorship_credits_granted" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentorship Credits</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
            </CardContent>
          </Card>
           <Card>
            <CardHeader><CardTitle>Status</CardTitle></CardHeader>
            <CardContent>
               <FormField control={form.control} name="is_active" render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5"><FormLabel>Activate Plan</FormLabel><FormDescription>Inactive plans cannot be purchased.</FormDescription></div>
                  <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                </FormItem>
              )}/>
            </CardContent>
          </Card>
          <Button type="submit" disabled={form.formState.isSubmitting}>{isCreateMode ? 'Create Plan' : 'Save Changes'}</Button>
        </form>
      </Form>
    </div>
  );
}