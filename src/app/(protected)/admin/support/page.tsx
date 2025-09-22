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
import { useAdminStore, SupportTicketWithDetails, SupportTicketStatus } from "@/stores/admin";
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
import { ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, BarChart } from "recharts";

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

// Status Badge for Tickets
const TicketStatusBadge = ({ status }: { status: string }) => {
  const statusStyles: Record<string, string> = {
    open: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    in_progress: "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/50 dark:text-purple-300 dark:border-purple-800",
    resolved: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    closed: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800/50 dark:text-gray-300 dark:border-gray-700",
  };
  return <Badge variant="outline" className={`capitalize ${statusStyles[status]}`}>{status.replace(/_/g, ' ')}</Badge>;
};

// Priority Badge for Tickets
const TicketPriorityBadge = ({ priority }: { priority: string }) => {
  const priorityStyles: Record<string, string> = {
    low: "bg-gray-100 text-gray-800 border-gray-200",
    medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    high: "bg-orange-100 text-orange-800 border-orange-200",
    urgent: "bg-red-100 text-red-800 border-red-200",
  };
  return <Badge variant="outline" className={`capitalize ${priorityStyles[priority]}`}>{priority}</Badge>;
};

// Component to assign a ticket to a staff member (re-using faculty list)
const TicketAssigner = ({ ticket }: { ticket: SupportTicketWithDetails }) => {
    const { faculty, updateSupportTicket, loading } = useAdminStore();
    
    if (ticket.assignee) {
        return <span>{ticket.assignee.full_name}</span>;
    }

    const handleAssign = (assigneeId: string) => {
        updateSupportTicket(ticket.id, { assigned_to: assigneeId, status: 'in_progress' });
    };

    return (
        <Select onValueChange={handleAssign} disabled={loading[`ticket_${ticket.id}`]}>
             <SelectTrigger className="w-40 h-8">
                <SelectValue placeholder="Assign" />
             </SelectTrigger>
             <SelectContent>
                {/* For this example, we assume admins/faculty can be assignees */}
                {faculty?.map((f) => (
                    <SelectItem key={f.id} value={f.id}>{f.full_name}</SelectItem>
                ))}
             </SelectContent>
        </Select>
    );
};


// =============================================================================
// 2. TABLE COLUMN DEFINITIONS
// =============================================================================

const columns: ColumnDef<SupportTicketWithDetails>[] = [
  {
    accessorKey: "subject",
    header: "Subject",
    cell: ({ row }) => (
      <Link href={`/admin/support/${row.original.id}`} className="font-medium text-primary underline-offset-4 hover:underline block max-w-xs truncate">
          {row.original.subject}
      </Link>
    ),
  },
  {
    accessorKey: "user.full_name",
    header: "User",
    cell: ({ row }) => row.original.user?.full_name || "N/A",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "priority",
    header: "Priority",
    cell: ({ row }) => <TicketPriorityBadge priority={row.original.priority} />,
  },
  {
    accessorKey: "assignee.full_name",
    header: "Assignee",
    cell: ({ row }) => <TicketAssigner ticket={row.original} />,
  },
  {
    accessorKey: "last_reply_at",
    header: "Last Reply",
    cell: ({ row }) => formatDate(row.original.last_reply_at),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <Link href={`/admin/support/${row.original.id}`}><DropdownMenuItem>View Details</DropdownMenuItem></Link>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];

// ✅ NEW: Chart Component that accepts data as a prop
const TicketStatsChart = ({ data }: { data: { name: string; count: number; fill: string; }[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-[250px] w-full items-center justify-center">
                <p className="text-muted-foreground">No ticket data available to display chart.</p>
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data}>
                <XAxis dataKey="name"  fontSize={12} tickLine={false} axisLine={false} />
                <YAxis  fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                <Tooltip
                    contentStyle={{
                        background: "var(--card)",
                        borderColor: "var(--border)",
                        borderRadius: "var(--radius)"
                    }}
                    cursor={{ fill: 'var(--accent)' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};


// =============================================================================
// 3. MAIN PAGE COMPONENT
// =============================================================================

export default function SupportTicketsPage() {
  const { supportTickets, fetchSupportTickets, fetchFaculty, loading } = useAdminStore();
  const [activeTab, setActiveTab] = React.useState<string>("open");

  // Fetch faculty/admins to populate the assignee dropdown
  React.useEffect(() => { fetchFaculty(); }, [fetchFaculty]);

  // Fetch tickets when the active tab changes
  React.useEffect(() => {
    const status = activeTab === 'all' ? undefined : activeTab;
    fetchSupportTickets(status as SupportTicketStatus);
  }, [activeTab, fetchSupportTickets]);

  // ✅ NEW: Calculate chart data client-side whenever the ticket list changes
  const chartData = React.useMemo(() => {
    if (!supportTickets) return [];

    const stats: Record<string, number> = {
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0,
    };

    for (const ticket of supportTickets) {
        if (stats[ticket.status] !== undefined) {
            stats[ticket.status]++;
        }
    }
    
    const statusColors: Record<string, string> = {
        open: "var(--primary)",
        in_progress: "#8b5cf6",
        resolved: "#22c55e",
        closed: "#6b7280",
    };

    return Object.entries(stats).map(([status, count]) => ({
        name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        count,
        fill: statusColors[status] || "#8884d8",
    }));
  }, [supportTickets]);

   return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
      </div>

      {/* ✅ ADDED: The new chart card, which gets its data from the calculation above */}
      <Card>
        <CardHeader>
          <CardTitle>Ticket Overview</CardTitle>
          <CardDescription>A summary of the tickets currently displayed in the table below.</CardDescription>
        </CardHeader>
        <CardContent>
          {loading.supportTickets ? <Skeleton className="h-[250px] w-full" /> : <TicketStatsChart data={chartData} />}
        </CardContent>
      </Card>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="in_progress">In Progress</TabsTrigger>
          <TabsTrigger value="resolved">Resolved</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="mt-4">
            <DataTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// 4. DATA TABLE COMPONENT
// =============================================================================

function DataTable() {
  const { supportTickets, loading } = useAdminStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: supportTickets || [],
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
        <CardTitle>Manage Tickets</CardTitle>
        <CardDescription>Assign, track, and resolve user support tickets.</CardDescription>
        <div className="flex items-center justify-between pt-4">
          <div className="relative w-full max-w-sm">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                placeholder="Filter by user name..."
                value={(table.getColumn("user_full_name")?.getFilterValue() as string) ?? ""}
                onChange={(event) => table.getColumn("user_full_name")?.setFilterValue(event.target.value)}
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
              {loading.supportTickets ? (
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