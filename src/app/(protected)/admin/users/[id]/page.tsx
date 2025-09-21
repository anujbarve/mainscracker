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
import { ChevronLeft, Trash2, Activity, BarChart, CreditCard, Calendar, Info, Briefcase } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import { Progress } from "@/components/ui/progress";

// ✅ EXPANDED SCHEMA: Added new editable fields
const profileFormSchema = z.object({
  full_name: z.string().min(2, "Name is required."),
  phone_number: z.string().optional(),
  role: z.enum(["student", "faculty", "admin"]),
  is_active: z.boolean(),
  is_available: z.boolean(),
});

export default function UserDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const { 
    currentUser, 
    facultyWorkload, // Get workload data
    loading, 
    fetchUserById, 
    clearCurrentUser, 
    updateProfile,
    deleteUser,
    fetchFacultyWorkloadById, // Get the new function
  } = useAdminStore();

  const form = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    // ✅ FIX: Provide default values to prevent uncontrolled input warning
    defaultValues: {
      full_name: "",
      phone_number: "",
      role: "student",
      is_active: true,
      is_available: true,
    },
  });

  React.useEffect(() => {
    if (id) fetchUserById(id);
    return () => { clearCurrentUser(); };
  }, [id, fetchUserById, clearCurrentUser]);

  React.useEffect(() => {
    // This now safely updates the already-controlled form fields
    if (currentUser) {
      form.reset({
        full_name: currentUser.full_name || "",
        phone_number: currentUser.phone_number || "",
        role: currentUser.role,
        is_active: currentUser.is_active,
        is_available: currentUser.is_available,
      });

      // ✅ If the user is a faculty member, fetch their specific workload
      if (currentUser.role === 'faculty') {
        fetchFacultyWorkloadById(id);
      }
    }
  }, [currentUser, form,fetchFacultyWorkloadById, id]);

  async function onSubmit(data: z.infer<typeof profileFormSchema>) {
    const success = await updateProfile(id, data);
    if (success) {
      toast.success("Profile updated!");
      fetchUserById(id); // Re-fetch to get latest data
    }
  }
  
  async function handleDelete() {
    const success = await deleteUser(id);
    if (success) {
        toast.success("User deleted permanently.");
        router.push("/admin/users");
    }
  }

  if (loading.currentUser || !currentUser) {
    // Show a comprehensive skeleton layout
    return <UserDetailSkeleton />;
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild><Link href="/admin/users"><ChevronLeft className="h-4 w-4" /></Link></Button>
         <div>
            <h2 className="text-2xl font-bold tracking-tight">{currentUser.full_name}</h2>
            <p className="text-muted-foreground text-sm">ID: {currentUser.id}</p>
         </div>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Edit Form */}
        <div className="lg:col-span-2">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <Card>
                  <CardHeader><CardTitle>Edit Profile</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <FormField control={form.control} name="full_name" render={({ field }) => (
                      <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="phone_number" render={({ field }) => (
                      <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )}/>
                    <FormField control={form.control} name="role" render={({ field }) => (
                      <FormItem><FormLabel>Role</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue/></SelectTrigger></FormControl><SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="faculty">Faculty</SelectItem></SelectContent></Select><FormMessage /></FormItem>
                    )}/>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField control={form.control} name="is_active" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Account Active</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )}/>
                        <FormField control={form.control} name="is_available" render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm"><div className="space-y-0.5"><FormLabel>Available</FormLabel></div><FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl></FormItem>
                        )}/>
                    </div>
                  </CardContent>
                </Card>
                <Button type="submit" disabled={form.formState.isSubmitting}>Save Changes</Button>
              </form>
            </Form>
        </div>

        {/* Right Column: Stats & Info */}
        <div className="lg:col-span-1 space-y-6">
            {/* ✅ CONDITIONAL CARD: Show only for Students */}
            {currentUser.role === 'student' && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2"><CreditCard className="w-5 h-5 text-muted-foreground"/><CardTitle>Credit Balance</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                       <div className="flex justify-between"><span>GS Credits:</span><span className="font-bold">{currentUser.gs_credit_balance}</span></div>
                       <div className="flex justify-between"><span>Specialized Credits:</span><span className="font-bold">{currentUser.specialized_credit_balance}</span></div>
                       <div className="flex justify-between"><span>Mentorship Credits:</span><span className="font-bold">{currentUser.mentorship_credit_balance}</span></div>
                    </CardContent>
                </Card>
            )}

            {/* ✅ CONDITIONAL CARD: Show only for Faculty */}
            {currentUser.role === 'faculty' && (
                <Card>
                    <CardHeader className="flex flex-row items-center gap-2"><Briefcase className="w-5 h-5 text-muted-foreground"/><CardTitle>Workload & Capacity</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm">
                        {loading.facultyWorkload || !facultyWorkload ? <Skeleton className="h-20 w-full" /> : (
                            <>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <span>Current Evaluations</span>
                                        <span className="font-bold">{facultyWorkload.total_current_evaluations} / {facultyWorkload.total_capacity}</span>
                                    </div>
                                    <Progress value={facultyWorkload.capacity_utilization_percent} />
                                </div>
                                <div className="flex justify-between border-t pt-3">
                                    <span>Subjects Covered:</span>
                                    <span className="font-bold">{facultyWorkload.subjects_count}</span>
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>
            )}
            
            <Card>
                <CardHeader className="flex flex-row items-center gap-2"><BarChart className="w-5 h-5 text-muted-foreground"/><CardTitle>Activity Stats</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <div className="flex justify-between"><span>Answers Submitted:</span><span className="font-bold">{currentUser.total_answers_submitted}</span></div>
                   <div className="flex justify-between"><span>Answers Evaluated:</span><span className="font-bold">{currentUser.total_answers_evaluated}</span></div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-2"><Info className="w-5 h-5 text-muted-foreground"/><CardTitle>Account Info</CardTitle></CardHeader>
                <CardContent className="space-y-2 text-sm">
                   <div className="flex justify-between"><span>Joined:</span><span className="font-bold">{format(new Date(currentUser.created_at), "dd MMM yyyy")}</span></div>
                   <div className="flex justify-between"><span>Last Activity:</span><span className="font-bold">{currentUser.last_activity_at ? format(new Date(currentUser.last_activity_at), "dd MMM yyyy") : 'N/A'}</span></div>
                </CardContent>
            </Card>
             <Card>
                <CardHeader><CardTitle className="text-destructive">Danger Zone</CardTitle></CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Deleting a user is permanent and cannot be undone.</p>
                    <Button variant="destructive" onClick={handleDelete} className="w-full"><Trash2 className="mr-2 h-4 w-4"/> Delete User</Button>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}

// A dedicated skeleton component for the detail page
function UserDetailSkeleton() {
    return (
        <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10" />
                <div className="space-y-2">
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-64" />
                </div>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-8">
                    <Skeleton className="h-64 w-full" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <div className="lg:col-span-1 space-y-6">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-24 w-full" />
                    <Skeleton className="h-32 w-full" />
                </div>
            </div>
        </div>
    )
}