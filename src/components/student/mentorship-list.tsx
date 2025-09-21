"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useStudentStore } from "@/stores/student";
import { MentorshipSessionWithMentor, MentorshipStatus } from "@/stores/types"; // Assuming types are in this file

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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  IconDotsVertical,
  IconSearch,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconCircleCheck,
  IconHourglass,
  IconBan,
  IconUser,
  IconMessagePlus,
  IconUserCheck,
  IconCalendarEvent,
  IconClockHour4,
  IconUserOff,
} from "@tabler/icons-react";
import Link from "next/link";

// --- Status Badge ---
const StatusBadge = ({ status }: { status: MentorshipStatus }) => {
  const statusConfig: Record<
    MentorshipStatus,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    requested: {
      label: "Requested",
      icon: <IconHourglass className="h-3 w-3" />,
      color: "bg-yellow-400/20 text-yellow-600 border-yellow-400/30",
    },
    assigned: {
      label: "Assigned",
      icon: <IconUserCheck className="h-3 w-3" />,
      color: "bg-purple-400/20 text-purple-600 border-purple-400/30",
    },
    scheduled: {
      label: "Scheduled",
      icon: <IconCalendarEvent className="h-3 w-3" />,
      color: "bg-blue-400/20 text-blue-600 border-blue-400/30",
    },
    in_progress: {
      label: "In Progress",
      icon: <IconClockHour4 className="h-3 w-3" />,
      color: "bg-orange-400/20 text-orange-600 border-orange-400/30",
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
    no_show: {
      label: "No Show",
      icon: <IconUserOff className="h-3 w-3" />,
      color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
    },
  };

  const current = statusConfig[status] || {
    label: "Unknown",
    icon: <IconHourglass className="h-3 w-3" />,
    color: "bg-gray-400/20 text-gray-600 border-gray-400/30",
  };

  return (
    <Badge variant="outline" className={`gap-x-1.5 ${current.color}`}>
      {current.icon}
      {current.label}
    </Badge>
  );
};

// --- Column Definitions ---
const columns: ColumnDef<MentorshipSessionWithMentor>[] = [
  {
    accessorKey: "requested_at",
    header: "Requested On",
    cell: ({ row }) =>
      new Date(row.original.requested_at).toLocaleDateString(),
  },
  {
    id: "mentor",
    accessorFn: (row) => row.mentor?.full_name,
    header: "Mentor",
    cell: ({ row }) =>
      row.original.mentor ? (
        <div className="flex items-center gap-2">
          <IconUser className="h-4 w-4 text-muted-foreground" />
          {row.original.mentor.full_name}
        </div>
      ) : (
        <span className="text-muted-foreground">Not Assigned</span>
      ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const session = row.original;
      return (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()} // Prevent row click
              >
                <span className="sr-only">Open menu</span>
                <IconDotsVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/student/mentorship-list/${session.id}`}>
                  <IconEye className="mr-2 h-4 w-4" /> View Details
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

// --- Main Table Component ---
export function MentorshipSessionsTable() {
  const router = useRouter();
  const { mentorshipSessions, fetchUserMentorshipSessions, loading } =
    useStudentStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] =
    React.useState<ColumnFiltersState>([]);

  React.useEffect(() => {
    if (!mentorshipSessions) {
      fetchUserMentorshipSessions();
    }
  }, [fetchUserMentorshipSessions, mentorshipSessions]);

  const table = useReactTable({
    data: mentorshipSessions || [],
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
          <CardTitle>My Mentorship Sessions</CardTitle>
          <CardDescription>
            A history of all your mentorship requests and their status.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Filter by mentor..."
                value={
                  (table.getColumn("mentor")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("mentor")?.setFilterValue(event.target.value)
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
                {loading && !mentorshipSessions ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell colSpan={columns.length}>
                        <Skeleton className="h-8 w-full" />
                      </TableCell>
                    </TableRow>
                  ))
                ) : table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() =>
                        router.push(`/student/mentorship-list/${row.original.id}`)
                      }
                    >
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
                      No mentorship sessions found.
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
              <IconChevronLeft className="h-4 w-4 mr-1" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next <IconChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}