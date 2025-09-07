"use client";

import * as React from "react";
import { useStudentStore } from "@/stores/student";
import { AnswerWithDetails, AnswerStatus } from "@/stores/types"; 

// TanStack Table
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
} from "@tanstack/react-table";

// Shadcn UI & Icons
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"; // Added DropdownMenuSeparator
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IconDotsVertical,
  IconFileDownload,
  IconHourglass,
  IconCircleCheck,
  IconFileSearch,
  IconBan,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconEye, // ✅ 1. Import the new icon
} from "@tabler/icons-react";
import Link from "next/link";

const StatusBadge = ({ status }: { status: AnswerStatus }) => {
  const statusConfig = {
    pending_assignment: {
      label: "Pending",
      icon: <IconHourglass className="h-3 w-3" />,
      color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
    },
    in_evaluation: {
      label: "In Evaluation",
      icon: <IconFileSearch className="h-3 w-3" />,
      color: "bg-blue-400/20 text-blue-600 border-blue-400/30",
    },
    completed: {
      label: "Completed",
      icon: <IconCircleCheck className="h-3 w-3" />,
      color: "bg-green-400/20 text-green-600 border-green-400/30",
    },
    cancelled: {
      label: "Cancelled",
      icon: <IconBan className="h-3 w-3" />,
      color: "bg-red-400/20 text-red-600 border-red-400/30",
    },
  }[status] || {
    label: "Unknown",
    icon: <IconHourglass className="h-3 w-3" />,
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  };

  return (
    <Badge variant="outline" className={`gap-x-1.5 ${statusConfig.color}`}>
      {statusConfig.icon}
      {statusConfig.label}
    </Badge>
  );
};

// --- Column Definitions ---
const columns: ColumnDef<AnswerWithDetails>[] = [
  {
    id: "subject",
    accessorFn: (row) => row.subjects?.name,
    header: "Subject",
    cell: ({ row }) => <div className="font-medium">{row.original.subjects?.name || "N/A"}</div>,
  },
  {
    accessorKey: "question_text",
    header: "Question",
    cell: ({ row }) => (
      <TooltipProvider delayDuration={100}>
        <Tooltip>
          <TooltipTrigger className="max-w-[300px] truncate text-left">
            {row.original.question_text}
          </TooltipTrigger>
          <TooltipContent className="max-w-xs text-wrap">
            {row.original.question_text}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    ),
  },
  {
    accessorKey: "submitted_at",
    header: "Submitted On",
    cell: ({ row }) => new Date(row.original.submitted_at).toLocaleDateString() + " " + new Date(row.original.submitted_at).toLocaleTimeString(),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "evaluator",
    accessorFn: (row) => row.assigned_faculty?.full_name,
    header: "Evaluator",
    cell: ({ row }) => row.original.assigned_faculty?.full_name || <span className="text-muted-foreground">Not Assigned</span>,
  },
  {
    accessorKey: "marks_awarded",
    header: () => <div className="text-right">Marks</div>,
    cell: ({ row }) => (
      <div className="text-right font-semibold">
        {row.original.marks_awarded !== null ? row.original.marks_awarded : "N/A"}
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <div className="flex justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><IconDotsVertical className="h-4 w-4" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* ✅ 2. ADD THIS MENU ITEM FOR THE DETAIL PAGE LINK */}
            <DropdownMenuItem asChild>
              <Link href={`/student/answers-list/${row.original.id}`}>
                <IconEye className="mr-2 h-4 w-4" /> View Details
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {/* END OF ADDED CODE */}

            <DropdownMenuItem asChild>
              <Link href={row.original.answer_file_url} target="_blank" rel="noopener noreferrer">
                <IconFileDownload className="mr-2 h-4 w-4" /> Download Submission
              </Link>
            </DropdownMenuItem>
            {row.original.evaluated_file_url && (
              <DropdownMenuItem asChild>
                <Link href={row.original.evaluated_file_url} target="_blank" rel="noopener noreferrer">
                  <IconFileDownload className="mr-2 h-4 w-4" /> Download Evaluation
                </Link>
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
];

// --- Main Table Component (No changes needed below) ---
export function AnswerSubmissionsTable() {
  const { answers, fetchUserAnswers, loading } = useStudentStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    fetchUserAnswers();
  }, [fetchUserAnswers]);

  const table = useReactTable({
    data: answers || [],
    columns,
    state: { sorting, columnFilters },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <main className="w-full min-h-[calc(100vh-theme(spacing.16))] p-4 sm:p-6 lg:p-8">
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>My Submissions</CardTitle>
          <CardDescription>
            A history of all your submitted answer sheets and their evaluation status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by question..."
                value={(table.getColumn("question_text")?.getFilterValue() as string) ?? ""}
                onChange={(event) =>
                  table.getColumn("question_text")?.setFilterValue(event.target.value)
                }
                className="pl-9"
              />
            </div>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={columns.length}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
                      No submissions found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
              <IconChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
              Next <IconChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}