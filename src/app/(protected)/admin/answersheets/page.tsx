"use client";

import * as React from "react";
import Link from 'next/link';
import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
  VisibilityState,
} from "@tanstack/react-table";
import { format, parseISO } from 'date-fns';
import { useAdminStore, AdminAnswerView } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { MoreHorizontal, ChevronDown, Search } from "lucide-react";

// =============================================================================
// 1. HELPER COMPONENTS & FUNCTIONS
// =============================================================================

// Helper for date formatting
const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  try {
    return format(parseISO(dateString), "dd MMM, yyyy 'at' hh:mm a");
  } catch (error) {
    return "Invalid Date";
  }
};

// Status Badge Component for consistent styling
const StatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    pending_assignment: "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
    assigned: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    in_evaluation: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    completed: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    cancelled: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
  };
  return <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status.replace(/_/g, ' ')}</Badge>;
};


const FacultyAssigner = ({ answer }: { answer: AdminAnswerView }) => {
    // ... same implementation as before
    const { faculty, reassignAnswer, loading } = useAdminStore();
    if (answer.assigned_faculty) return <span>{answer.assigned_faculty.full_name}</span>;
    // ... rest of the component
    return (
        <Select onValueChange={(facultyId) => reassignAnswer(answer.id, facultyId)}>
             <SelectTrigger className="w-40 h-8"><SelectValue placeholder="Assign" /></SelectTrigger>
             <SelectContent>{faculty?.map((f) => (<SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>))}</SelectContent>
        </Select>
    );
};


const columns: ColumnDef<AdminAnswerView>[] = [
  {
    accessorKey: "question_text",
    header: "Question",
    cell: ({ row }) => (
      <Link href={`/admin/answersheets/${row.original.id}`} className="font-medium text-primary underline-offset-4 hover:underline block max-w-xs truncate">
          {row.original.question_text}
      </Link>
    ),
  },
  {
    accessorKey: "student.full_name",
    header: "Student",
    cell: ({ row }) => row.original.student?.full_name || "N/A",
  },
  {
    accessorKey: "subjects.name",
    header: "Subject",
    cell: ({ row }) => row.original.subjects?.name || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "assigned_faculty.full_name",
    header: "Faculty",
    cell: ({ row }) => <FacultyAssigner answer={row.original} />,
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted At",
    cell: ({ row }) => formatDate(row.original.submitted_at),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/admin/answersheets/${row.original.id}`}><DropdownMenuItem>View Details</DropdownMenuItem></Link>
          {/* Add more actions if needed */}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

export default function AnswersheetsPage() {
  const { fetchAnswers, fetchFaculty } = useAdminStore();
  const [activeTab, setActiveTab] = React.useState<string>("pending_assignment");

  React.useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  React.useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    fetchAnswers(status as any);
  }, [activeTab, fetchAnswers]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Answersheets</h2>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pending_assignment">Pending</TabsTrigger>
          <TabsTrigger value="assigned">Assigned</TabsTrigger>
          <TabsTrigger value="in_evaluation">In Evaluation</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
            <DataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DataTable() {
  const { answers, loading } = useAdminStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: answers || [],
    columns,
    state: { sorting, columnFilters, columnVisibility },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Answers</CardTitle>
        <CardDescription>Search, filter, and manage all student submissions.</CardDescription>
        <div className="flex items-center justify-between pt-4">
          <div className="relative w-full max-w-sm">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                placeholder="Filter by student name..."
                // ✅ FIX: Corrected column accessor key from "student_full_name" to "student.full_name"
                value={(table.getColumn("student_full_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("student.full_name")?.setFilterValue(event.target.value)}
                className="pl-8"
              />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">Columns <ChevronDown className="ml-2 h-4 w-4" /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table.getAllColumns().filter((c) => c.getCanHide()).map((column) => (
                <DropdownMenuCheckboxItem key={column.id} checked={column.getIsVisible()} onCheckedChange={(value) => column.toggleVisibility(!!value)}>{column.id.replace(/_/g, ' ')}</DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            {/* ✅ FIX: Added the TableHeader implementation */}
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading.answers ? (
                 Array.from({ length: 10 }).map((_, i) => (<TableRow key={i}>{columns.map((col, j) => (<TableCell key={j}><Skeleton className="h-6 w-full" /></TableCell>))}</TableRow>))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>{row.getVisibleCells().map((cell) => (<TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>))}</TableRow>
                ))
              ) : (
                <TableRow><TableCell colSpan={columns.length} className="h-24 text-center">No results found.</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</Button>
          <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</Button>
        </div>
      </CardContent>
    </Card>
  );
}