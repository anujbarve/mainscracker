"use client";

import * as React from "react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { format, parseISO } from "date-fns";
import {
  MentorshipSessionWithDetails,
  MentorshipStatus,
  useAdminStore,
} from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ExternalLink } from "lucide-react";

// =============================================================================
// HELPERS
// =============================================================================

const formatDate = (date?: string | null) => {
  if (!date) return "N/A";
  try {
    return format(parseISO(date), "dd MMM yyyy, hh:mm a");
  } catch {
    return "Invalid Date";
  }
};

const StatusBadge = ({ status }: { status: MentorshipStatus }) => {
  const statusStyles: Record<MentorshipStatus, string> = {
    requested:
      "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    pending_confirmation:
      "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/50 dark:text-yellow-300 dark:border-yellow-800",
    confirmed:
      "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    completed:
      "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    cancelled:
      "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
    student_absent:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
    mentor_absent:
      "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  };

  return (
    <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
};

// =============================================================================
// COLUMNS
// =============================================================================

const columns: ColumnDef<MentorshipSessionWithDetails>[] = [
  {
    accessorKey: "student.full_name",
    header: "Student",
    cell: ({ row }) => row.original.student?.full_name || "N/A",
  },
  {
    accessorKey: "mentor.full_name",
    header: "Mentor",
    cell: ({ row }) => row.original.mentor?.full_name || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "scheduled_at",
    header: "Scheduled At",
    cell: ({ row }) => formatDate(row.original.scheduled_at),
  },
  {
    accessorKey: "duration_minutes",
    header: "Duration",
    cell: ({ row }) =>
      row.original.duration_minutes
        ? `${row.original.duration_minutes} mins`
        : "N/A",
  },
  {
    accessorKey: "meeting_url",
    header: "Meeting",
    cell: ({ row }) =>
      row.original.meeting_url ? (
        <a
          href={row.original.meeting_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary flex items-center gap-1 hover:underline"
        >
          <ExternalLink size={14} /> Join
        </a>
      ) : (
        "N/A"
      ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/admin/mentorships/${row.original.id}`}>
            <DropdownMenuItem>View Details</DropdownMenuItem>
          </Link>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function MentorshipSessionsPage() {
  const { fetchMentorshipSessions, mentorshipSessions, loading } = useAdminStore();
  const [activeTab, setActiveTab] = React.useState<string>("requested");

  React.useEffect(() => {
    fetchMentorshipSessions(); // fetch all at once
  }, [fetchMentorshipSessions]);

  // Apply client-side filtering
  const filteredSessions =
    activeTab === "all"
      ? mentorshipSessions
      : mentorshipSessions?.filter((s) => s.status === activeTab);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Mentorship Sessions
        </h2>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="requested">Requested</TabsTrigger>
          <TabsTrigger value="pending_confirmation">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          <TabsTrigger value="student_absent">Student Absent</TabsTrigger>
          <TabsTrigger value="mentor_absent">Mentor Absent</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
          <DataTable data={filteredSessions || []} loading={loading.mentorshipSessions} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


// =============================================================================
// DATATABLE
// =============================================================================

function DataTable({
  data,
  loading,
}: {
  data: MentorshipSessionWithDetails[];
  loading: boolean;
}) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Sessions</CardTitle>
        <CardDescription>
          View, filter, and manage all mentorship sessions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {columns.map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-6 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No sessions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
