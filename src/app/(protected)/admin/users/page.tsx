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
import { format } from 'date-fns';
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


export default function ManageUsersPage() {
  const { students, faculty, fetchStudents, fetchFaculty } = useAdminStore();

  React.useEffect(() => {
    fetchStudents();
    fetchFaculty();
  }, [fetchStudents, fetchFaculty]);

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