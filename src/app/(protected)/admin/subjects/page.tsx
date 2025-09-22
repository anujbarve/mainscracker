"use client";

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useAdminStore, Subject } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, PlusCircle, Trash2 } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';

// ✅ NEW: Chart Component
const MostActiveSubjectsChart = ({ data, loading }: { data: { name: string, submissions: number }[], loading: boolean }) => {
  if (loading) {
    return <Skeleton className="h-[300px] w-full" />;
  }
  if (!data || data.length === 0) {
    return (
      <div className="flex h-[300px] w-full items-center justify-center">
        <p className="text-muted-foreground">No submission data available.</p>
      </div>
    );
  }
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <XAxis type="number" stroke="#888888" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="name" stroke="#888888" fontSize={12} width={120} />
        <Tooltip
            contentStyle={{ background: "var(--card)", borderColor: "var(--border)" }}
            cursor={{ fill: 'var(--accent)' }}
        />
        <Bar dataKey="submissions" name="Total Submissions" fill="var(--primary)" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default function SubjectsPage() {
  const { subjects, fetchSubjects, loading } = useAdminStore();

  React.useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  // ✅ Client-side calculation for the chart data
  const chartData = React.useMemo(() => {
    if (!subjects) return [];
    // Filter for subjects with submissions, sort, and take the top 10
    return subjects
      .filter(s => s.total_answers_submitted > 0)
      .sort((a, b) => b.total_answers_submitted - a.total_answers_submitted)
      .slice(0, 10)
      .map(s => ({ name: s.name, submissions: s.total_answers_submitted }));
  }, [subjects]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Manage Subjects</h2>
        <Button asChild>
          <Link href="/admin/subjects/new"><PlusCircle className="mr-2 h-4 w-4" /> Create Subject</Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Most Active Subjects</CardTitle>
          <CardDescription>Top subjects based on total answers submitted.</CardDescription>
        </CardHeader>
        <CardContent>
          <MostActiveSubjectsChart data={chartData} loading={loading.subjects} />
        </CardContent>
      </Card>
      <SubjectsTable />
    </div>
  );
}

// Data Table Component for Subjects
function SubjectsTable() {
  const { subjects, loading, deleteSubject } = useAdminStore();
  
  const columns: ColumnDef<Subject>[] = [
    { accessorKey: "name", header: "Name", cell: ({ row }) => (
        <Link href={`/admin/subjects/${row.original.id}`} className="font-medium text-primary hover:underline">{row.original.name}</Link>
      ),
    },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <Badge variant="secondary" className="capitalize">{row.original.category}</Badge> },
    { accessorKey: "total_answers_submitted", header: "Submissions" },
    { accessorKey: "is_active", header: "Status", cell: ({ row }) => row.original.is_active ? <Badge>Active</Badge> : <Badge variant="outline">Inactive</Badge> },
    { id: "actions", cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild><Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Link href={`/admin/subjects/${row.original.id}`}><DropdownMenuItem>Edit</DropdownMenuItem></Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => deleteSubject(row.original.id)}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const table = useReactTable({
    data: subjects || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <Card>
      <CardHeader><CardTitle>All Subjects</CardTitle></CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>{table.getHeaderGroups().map(hg => <TableRow key={hg.id}>{hg.headers.map(h => <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>)}</TableRow>)}</TableHeader>
            <TableBody>
              {loading.subjects ? (
                 Array.from({ length: 5 }).map((_, i) => <TableRow key={i}>{columns.map((c, j) => <TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>)}</TableRow>)
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => <TableRow key={row.id}>{row.getVisibleCells().map(cell => <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>)}</TableRow>)
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No subjects found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}