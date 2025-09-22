"use client";

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import { format, parseISO, subDays } from 'date-fns';
import { useAdminStore } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Search } from "lucide-react";
import { Area, AreaChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

// Simplified type for our view
type UserView = {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'faculty' | 'admin';
  is_active: boolean;
  created_at: string;
};

const columns: ColumnDef<UserView>[] = [
  {
    accessorKey: "full_name",
    header: "Name",
    cell: ({ row }) => (
      <Link href={`/admin/users/${row.original.id}`} className="font-medium text-primary hover:underline">
          {row.original.full_name}
      </Link>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      row.original.is_active 
        ? <Badge variant="outline" className="text-green-700 border-green-300">Active</Badge> 
        : <Badge variant="secondary">Inactive</Badge>
    ),
  },
  {
    accessorKey: "created_at",
    header: "Joined On",
    cell: ({ row }) => format(new Date(row.original.created_at), "dd MMM, yyyy"),
  },
];

const UserSignupChart = ({ data }: { data: any[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No user sign-up data available to display chart.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "var(--card)",
            borderColor: "var(--border)",
            borderRadius: "var(--radius)"
          }}
        />
        <Legend />
        <Area type="monotone" dataKey="student_count" name="Students" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
        <Area type="monotone" dataKey="faculty_count" name="Faculty" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
      </AreaChart>
    </ResponsiveContainer>
  );
};


export default function ManageUsersPage() {
  const { students, faculty, fetchStudents, fetchFaculty, loading } = useAdminStore();

  React.useEffect(() => {
    fetchStudents();
    fetchFaculty();
  }, [fetchStudents, fetchFaculty]);

  // ✅ NEW: Calculate chart data client-side from existing students and faculty lists
  const chartData = React.useMemo(() => {
    if (!students || !faculty) return [];

    const allUsers = [...students, ...faculty];
    const signupDataByDate: Record<string, { student_count: number; faculty_count: number }> = {};

    // Aggregate signups from the fetched user data
    allUsers.forEach(user => {
      const date = format(parseISO(user.created_at), 'yyyy-MM-dd');
      if (!signupDataByDate[date]) {
        signupDataByDate[date] = { student_count: 0, faculty_count: 0 };
      }
      if (user.role === 'student') {
        signupDataByDate[date].student_count++;
      } else if (user.role === 'faculty') {
        signupDataByDate[date].faculty_count++;
      }
    });

    // Generate data for the last 30 days, filling in gaps with zeros
    const trendData = [];
    for (let i = 29; i >= 0; i--) {
      const day = subDays(new Date(), i);
      const dateString = format(day, 'yyyy-MM-dd');
      const dataForDay = signupDataByDate[dateString] || { student_count: 0, faculty_count: 0 };
      
      trendData.push({
        date: format(day, "MMM d"),
        student_count: dataForDay.student_count,
        faculty_count: dataForDay.faculty_count,
      });
    }

    return trendData;
  }, [students, faculty]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Users</h2>
          <p className="text-muted-foreground">Manage student and faculty accounts.</p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <PlusCircle className="mr-2 h-4 w-4" /> Add User
          </Link>
        </Button>
      </div>

      {/* ✅ ADDED: The new chart card, which gets its data from the calculation above */}
      <Card>
        <CardHeader>
          <CardTitle>User Signup Trends</CardTitle>
          <CardDescription>New students and faculty who joined in the last 30 days.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.students || loading.faculty ? <Skeleton className="h-[300px] w-full" /> : <UserSignupChart data={chartData} />}
        </CardContent>
      </Card>

      <Tabs defaultValue="students">
        <TabsList>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
        </TabsList>
        <TabsContent value="students">
          <UserTable data={students || []} />
        </TabsContent>
        <TabsContent value="faculty">
          <UserTable data={faculty || []} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UserTable({ data }: { data: UserView[] }) {
  const { loading } = useAdminStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>User List</CardTitle>
                <CardDescription>A list of all users in this category.</CardDescription>
            </div>
            <div className="relative w-full max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search by name or email..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-8"/>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>{flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading.students || loading.faculty ? (
                Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{columns.map((col, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}</TableRow>)
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>{row.getVisibleCells().map((cell) => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No users found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}