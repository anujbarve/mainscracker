"use client";

import * as React from "react";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminStore } from '@/stores/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";
import { ChevronLeft } from 'lucide-react';
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

// ✅ FIX: The schema is simplified to expect numbers directly, removing z.coerce
const planFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
  price: z.number().min(0, "Price cannot be negative."),
  type: z.enum(['one_time', 'recurring']),
  gs_credits_granted: z.number().int().min(0),
  specialized_credits_granted: z.number().int().min(0),
  mentorship_credits_granted: z.number().int().min(0),
  is_active: z.boolean(),
});

export default function PlanDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const isCreateMode = id === 'new';

  const { currentPlan, fetchPlanById, clearCurrentPlan, createPlan, updatePlan, loading } = useAdminStore();

  const form = useForm<z.infer<typeof planFormSchema>>({
    resolver: zodResolver(planFormSchema),
    defaultValues: {
      name: "",
      description: "",
      price: 0,
      type: 'one_time',
      gs_credits_granted: 0,
      specialized_credits_granted: 0,
      mentorship_credits_granted: 0,
      is_active: true,
    },
  });

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
      });
    }
  }, [currentPlan, isCreateMode, form]);

  async function onSubmit(data: z.infer<typeof planFormSchema>) {
    const success = isCreateMode
      ? await createPlan(data)
      : await updatePlan(id, data);
    
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
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Credits Granted</CardTitle></CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <FormField control={form.control} name="gs_credits_granted" render={({ field }) => (
                <FormItem>
                  <FormLabel>GS Credits</FormLabel>
                  <FormControl>
                    {/* ✅ FIX: Convert string to number on change */}
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="specialized_credits_granted" render={({ field }) => (
                <FormItem>
                  <FormLabel>Specialized Credits</FormLabel>
                  <FormControl>
                     {/* ✅ FIX: Convert string to number on change */}
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}/>
              <FormField control={form.control} name="mentorship_credits_granted" render={({ field }) => (
                <FormItem>
                  <FormLabel>Mentorship Credits</FormLabel>
                  <FormControl>
                     {/* ✅ FIX: Convert string to number on change */}
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