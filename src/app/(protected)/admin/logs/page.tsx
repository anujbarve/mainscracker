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
import { useAdminStore, AuditLog } from "@/stores/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
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
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, Search } from "lucide-react";

// =============================================================================
// 1. HELPER COMPONENTS & FUNCTIONS
// =============================================================================

const formatDate = (dateString?: string | null) => {
  if (!dateString) return "N/A";
  return format(parseISO(dateString), "dd MMM, yyyy 'at' hh:mm a");
};

const ActionBadge = ({ action }: { action: string }) => {
  const actionStyles: Record<string, string> = {
    INSERT: "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/50 dark:text-green-300 dark:border-green-800",
    UPDATE: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:border-blue-800",
    DELETE: "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/50 dark:text-red-300 dark:border-red-800",
  };
  return <Badge variant="outline" className={`font-mono text-xs ${actionStyles[action]}`}>{action}</Badge>;
};

type AuditLogWithActor = AuditLog & { actor: { full_name: string } | null };

const columns: ColumnDef<AuditLogWithActor>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => formatDate(row.original.timestamp),
  },
  {
    accessorKey: "actor.full_name",
    header: "Actor",
    cell: ({ row }) => row.original.actor?.full_name || <span className="text-muted-foreground">System</span>,
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => <ActionBadge action={row.original.action} />,
  },
  {
    accessorKey: "target_table",
    header: "Entity",
    cell: ({ row }) => <span className="capitalize">{row.original.target_table?.replace(/_/g, ' ')}</span>,
  },
  {
    id: "details",
    cell: ({ row }) => (
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/logs/${row.original.id}`}>View Details</Link>
      </Button>
    ),
  },
];

// =============================================================================
// 2. MAIN PAGE COMPONENT
// =============================================================================

export default function AuditLogsPage() {
  const { fetchLogs } = useAdminStore();

  React.useEffect(() => {
    fetchLogs({ force: true });
  }, [fetchLogs]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Audit Logs</h2>
      </div>
      <DataTable />
    </div>
  );
}

// =============================================================================
// 3. DATA TABLE COMPONENT
// =============================================================================

function DataTable() {
  const { logs, loading } = useAdminStore();
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});

  const table = useReactTable({
    data: (logs as AuditLogWithActor[]) || [],
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
        <CardTitle>System Activity</CardTitle>
        <CardDescription>Search, filter, and review all recorded system events.</CardDescription>
        <div className="flex items-center justify-between pt-4">
          <div className="relative w-full max-w-sm">
             <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
                placeholder="Filter by actor name..."
                value={(table.getColumn("actor_full_name")?.getFilterValue() as string) ?? ""}
                // ✅ CORRECTED: Changed "actor.full_name" to "actor_full_name"
                onChange={(event) => table.getColumn("actor_full_name")?.setFilterValue(event.target.value)}
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
                    <TableHead key={header.id}>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading.logs ? (
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