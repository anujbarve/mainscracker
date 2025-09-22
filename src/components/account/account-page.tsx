"use client";

import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuthStore } from "@/stores/auth";

// Shadcn UI & Icons
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Loader2,
  User,
  CreditCard,
  CalendarDays,
  Sparkles,
  BookOpen,
} from "lucide-react";

// --- Schema and Types (Unchanged) ---
const accountFormSchema = z.object({
  full_name: z
    .string()
    .max(80, "Name must not exceed 80 characters.")
    .refine((val) => val.length === 0 || val.length >= 2, {
      message: "Name must be at least 2 characters.",
    }),
  phone_number: z
    .string()
    .max(20, "Phone number must not exceed 20 characters.")
    .refine((val) => val.length === 0 || val.length >= 10, {
      message: "Please enter a valid phone number.",
    }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// --- Main Component ---
export default function AccountPage() {
  const { user, profile, loading, updateProfile } = useAuthStore();

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: { full_name: "", phone_number: "" },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        full_name: profile.full_name ?? "",
        phone_number: profile.phone_number ?? "",
      });
    }
  }, [profile, form.reset]);

  const onSubmit: SubmitHandler<AccountFormValues> = async (data) => {
    const dataForUpdate = {
      full_name: data.full_name === "" ? null : data.full_name,
      phone_number: data.phone_number === "" ? null : data.phone_number,
    };
    await updateProfile(dataForUpdate);
    form.reset(data);
  };

  const handleAvailabilityChange = async (isChecked: boolean) => {
    await updateProfile({ is_available: isChecked });
  };

  if (!profile) {
    return <AccountPageSkeleton />;
  }

  return (
    <main className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Form and Settings */}
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Details Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Details</CardTitle>
              <CardDescription>
                Update your personal information here.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your full name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone_number"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input placeholder="(123) 456-7890" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CardFooter className="flex justify-end px-0 pt-4">
                    <Button
                      type="submit"
                      disabled={loading || !form.formState.isDirty}
                    >
                      {loading && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {loading ? "Saving..." : "Save Changes"}
                    </Button>
                  </CardFooter>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* ✅ Availability Card is now conditionally rendered */}
          {profile.role === "faculty" && (
            <Card>
              <CardHeader>
                <CardTitle>Availability Status</CardTitle>
                <CardDescription>
                  Set whether you are available for new mentorship or tasks.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">
                      Available for opportunities
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Your profile will be shown to students seeking mentors.
                    </p>
                  </div>
                  <Switch
                    checked={profile.is_available}
                    onCheckedChange={handleAvailabilityChange}
                    disabled={loading}
                    aria-readonly
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Account Status and Credits */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Account Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatCard
                icon={User}
                label="Role"
                value={
                  <Badge variant="outline" className="capitalize text-base">
                    {profile.role}
                  </Badge>
                }
              />
              <StatCard
                icon={CalendarDays}
                label="Member Since"
                value={new Date(profile.created_at).toLocaleDateString()}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit Balance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatCard
                icon={CreditCard}
                label="General Credits"
                value={profile.gs_credit_balance}
              />
              <StatCard
                icon={Sparkles}
                label="Specialized Credits"
                value={profile.specialized_credit_balance}
              />
              <StatCard
                icon={BookOpen}
                label="Mentorship Credits"
                value={profile.mentorship_credit_balance}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}

// --- Helper & Skeleton Components (Unchanged) ---

const StatCard = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: React.ReactNode;
}) => (
  <div className="flex items-center">
    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
      <Icon className="h-5 w-5 text-muted-foreground" />
    </div>
    <div className="ml-4">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg font-semibold">{value}</p>
    </div>
  </div>
);

function AccountPageSkeleton() {
  return (
    <div className="w-full min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/2" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}