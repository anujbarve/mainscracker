"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAdminStore } from '@/stores/admin';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ChevronLeft } from 'lucide-react';
import { toast } from "sonner";

const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
  full_name: z.string().min(2, { message: "Full name is required." }),
  role: z.enum(["student", "faculty"]),
});

export default function AddUserPage() {
  const router = useRouter();
  const { createUser, loading } = useAdminStore();
  
  const form = useForm<z.infer<typeof userFormSchema>>({
    resolver: zodResolver(userFormSchema),
    defaultValues: { email: "", password: "", full_name: "", role: "student" },
  });

  async function onSubmit(data: z.infer<typeof userFormSchema>) {
    const newUserId = await createUser(data.email, data.password, {
      full_name: data.full_name,
      role: data.role,
    });

    if (newUserId) {
      toast.success("User created successfully!");
      router.push('/admin/users');
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center gap-4">
         <Button variant="outline" size="icon" asChild><Link href="/admin/users"><ChevronLeft className="h-4 w-4" /></Link></Button>
         <div>
            <h2 className="text-2xl font-bold tracking-tight">Add New User</h2>
            <p className="text-muted-foreground text-sm">Create a new student or faculty account.</p>
         </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader><CardTitle>User Information</CardTitle></CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField control={form.control} name="full_name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem><FormLabel>Password</FormLabel><FormControl><Input type="password" {...field} /></FormControl><FormMessage /></FormItem>
              )}/>
              <FormField control={form.control} name="role" render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl><SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger></FormControl>
                    <SelectContent><SelectItem value="student">Student</SelectItem><SelectItem value="faculty">Faculty</SelectItem></SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )}/>
              <Button type="submit" disabled={loading.users}>Create User</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}